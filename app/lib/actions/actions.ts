"use server"

import {S3Client} from '@aws-sdk/client-s3';
import { Upload } from "@aws-sdk/lib-storage";
import { unstable_noStore as noStore} from 'next/cache';
import {customAlphabet} from "nanoid";
import {z} from "zod";
import postgres from "postgres";
import { lipSyncVideo } from './videoActions';
import { generateAudio, uploadAudioToS3 } from './audioActions';
import { parse } from 'path';
import OpenAI from "openai";
const Creatomate = require("creatomate")

const userId = 'c20a1304-da40-4211-91b3-59c01b195101';

interface dialogueData {
  president: string;
  dialogue: string;
  dialogue_number: number;
}

const postgresSql = () => {
  return postgres(process.env.DATABASE_URL!, {ssl: 'require'})
}

const FormSchema = z.object({
  prompt: z.string(),
})

export async function generateId(){
  const alphabet = '0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz';
  const nanoid = await customAlphabet(alphabet, 17);
  return nanoid();
}

export async function handleJobCreation(jobId: string, formData: FormData){

  const parsedData = FormSchema.safeParse({
    prompt: formData.get('prompt')
  })

  if(!parsedData.success){
    console.log("Prompt is invalid");
    return;
  }

  const { prompt } = parsedData.data;

  try {

    const rawDialogues = await generateDialogues(prompt)

    if(!rawDialogues){
      console.log("ERROR RAW DIALOGUEs")
      return "Error";
    } 

    const dialogues = await JSON.parse(rawDialogues).dialogues;

    console.log("DIALOGUES", dialogues)

    const dialoguesCount = dialogues.length;

    console.log("DIALOGUES COUNT", dialoguesCount)

    const jobCreation = await saveJob(jobId, userId, "PENDING")

    dialogues.map((dialogueData: dialogueData) => {
      const dialogue = dialogueData.dialogue;
      const videoNumber = dialogueData.dialogue_number;
      createVideo(jobId, dialogue, videoNumber);
    });

  } catch(e){
    console.log(e);
    console.log("Error at handling job")
  }
 
}

//Not done
export async function saveJob(jobId: string, userId: string, status: string){
  
  const sql = postgresSql();

  try{

    const response = sql`
    INSERT into jobs(id, userId, status)
    VALUES(${jobId}, ${userId}, ${status})
  `
    return response;

  } catch(e){
    console.log("ERROR AT SAVING JOB")
    return e;
  }

}

export async function createVideo(jobId: string, dialogue: string, videoNumber: number){

  // console.log("JOBID:", jobId);
  // console.log(formData);

  // console.log("HANDLE SUBMIT FIRED");
  
  try{

    const audioBody = await generateAudio(dialogue);

    if(!audioBody){
      return "error, Audio response is undefined";
    }

    const audioUrl = await uploadAudioToS3(audioBody);
 
    const bidenVideoURL = "https://texttovideofiles.s3.us-east-2.amazonaws.com/template-videos/obama-template.mp4";
    const webhookUrl = `${process.env.TEMPORAL_URL}/api/lip-sync/updateVideoStatus`;

    console.log("WEBHOOK URL: ", webhookUrl);

    const syncLabsRequest = await lipSyncVideo(audioUrl, bidenVideoURL, webhookUrl);
    const syncLabsVideoId = syncLabsRequest.id;

    console.log("SYNC LABS VIDEO DATA: ", syncLabsRequest);

    if(!jobId){
      console.log("DID NOT GET LOCAL ID");
      return;
    }

    console.log("Job Id: ", jobId);

    const userVideoSql = await storeVideoName(syncLabsVideoId, jobId, userId, "PENDING", videoNumber);
    
  } catch(e){
    console.log("Error at main routine")
    console.log(e);
    return "Error";
  }
}

export async function storeVideoName(id: string, jobId: string, userId: string, status: string, videoNumber: number){

  try {

    const sql = postgresSql();

    const result = await sql`
      INSERT INTO videos(id, jobid, userId, status, video_number)
      VALUES(${id}, ${jobId}, ${userId}, ${status}, ${videoNumber})
    `;

    return result;

  }catch(e){
    console.log(e);
  }
  
}

export async function storeAudioName(id: string, userId: string, url: string){

  const sql = postgresSql();

  try {
    const result = await sql`
      INSERT INTO audios (id, userId, url) VALUES (${id}, ${userId}, ${url})
    `
  }catch(e){
    console.log(e);
    return e;
  }

}

export async function updateVideoStatus(videoId: string, status: string, url: string){

  console.log("\njobId: ", videoId);
  console.log("status: ", status);
  console.log("url: ", url, "\n")

  const sql = postgresSql();

  try{

    const result = await sql`
    UPDATE videos 
    SET 
      status = ${status}, 
      url = ${url}
    WHERE id = ${videoId}
    `;

    console.log("VIDEO CORRECTLY UPDATED")

    return result;

  }catch(e){
    console.log("fail at updating")
    console.log("jobId: ", videoId)
    console.log("status: ", status)
    console.log(e);
  }

}

export async function updateJobStatus(jobId: string, status: string, url: string){

  const sql = postgresSql();

  try {

    const queryResult = sql`
    
      UPDATE jobs 
      SET status = ${status}, url = ${url}
      WHERE id = ${jobId}

    `

    return queryResult;

  }catch(e){

  }

}

export async function uploadFileToS3(bucketName: string, keyName: string, Body: any ){

  noStore();

  const awsAccessKey = process.env.AWS_ACCESS_KEY
  const secretAccessKey = process.env.AWS_SECRET_ACCESS_KEY
  const awsRegion = process.env.AWS_DEFAULT_REGION

  const client = new S3Client({
    credentials: {
      accessKeyId: awsAccessKey!,
      secretAccessKey: secretAccessKey!,
    },
    region: awsRegion
  })

  
  try{
    
    const Bucket = bucketName;
    const Key = keyName;

    const parallelUploads3 = new Upload({
      client,
      params: {
        Bucket,
        Key,
        Body,
      },
      queueSize: 4,
      partSize: 1024 * 1024 * 5,
      leavePartsOnError: false,
    });
    
    return await parallelUploads3.done();

  } catch(e){
    console.log(e);
  }
};

export async function getAllJobs(){
  const sql = postgresSql()

  const jobs = await sql`
  SELECT * FROM jobs 
  WHERE status = 'COMPLETED'
  `
  return jobs;
}

export async function getJobIdByVideoId(videoId: string){

  const sql = postgresSql();

  try {

    const job = await sql`
    SELECT jobId FROM videos
    WHERE id = ${videoId}
    `
    const jobId = job[0].jobid;

    if(!jobId) throw new Error("ERROR AT OBTAINING JOBID BY VIDEOID");

    console.log("JOBID: ", jobId);

    return jobId;

  } catch(e) {
    console.log("ERROR AT getJobIdByVideoId", e);
    return e;
  }

}

export async function generateDialogues(prompt: string){

  const openai = new OpenAI({apiKey: process.env.OPENAI_KEY});

  const completion = await openai.chat.completions.create({
    model: "gpt-3.5-turbo",
    response_format: {type: "json_object"},

    //original content: "You are an assistant that based on the given prompt you will develop a dialogue between 3 presidents. These presidents are: Barack Obama, Donald Trump, and Joe Biden. Make the conversation interactive, the presidents should be talking to each other as well as the audience. Donald Trump and Obama should occasionally call Joe Biden 'Sleepy Joe'. And Obama should include 'ain't that right bro?'occasionally as well. Each president must have at least two dialogues. Your job is to make a dialogue between those 3 with the thematic of the given prompt. For the JSON that you will return, use the next format:{'dialogues': [{'president': {insert president name here},    'dialogue': {insert dialogue here}, 'dialogue_number': (start it at 1, increase it by 1 each time a new dialogue is created)}...]} In the JSON that you return, make sure that the president field is only populated with the last name of the president in lowercase."

    messages: [
      {
        "role": "system",
        "content": "You are an assistant that based on the given prompt you will develop a dialogue between Obama playing 3 different roles. Your job is to make a dialogue between those 3 with the thematic of the given prompt, the role of each Obama is up to you, just make sure they mention what role they play. For the JSON that you will return, use the next format:{'dialogues': [{'president': {insert president name here},    'dialogue': {insert dialogue here}, 'dialogue_number': (start it at 1, increase it by 1 each time a new dialogue is created)}...]} In the JSON that you return, make sure that the president field is only populated with the last name of the president in lowercase."
      },
      {
        "role": "user",
        "content": "Provide a dialogue about what calculus is"
      },
      {
        "role": "assistant",

        //original content: "{'dialogues': [{'president': 'obama','dialogue': 'Calculus is a branch of mathematics that involves the study of rates of change and accumulation. Its all about how things change and how to measure and understand those changes, ain't that right?', 'dialogue_number': 1},{'president': 'trump','dialogue': 'Well, let me tell you, Sleepy Joe, calculus is like figuring out how fast your approval ratings are dropping! It is all about those slopes and curves, am I right?', 'dialogue_number': 2},{'president': 'biden','dialogue': 'That is a great explanation, Obama. Calculus helps us understand the world around us by looking at the big picture through the lens of change and motion.', 'dialogue_number': 3}]}"

        "content": "{'dialogues': [{'president': 'obama','dialogue': 'Calculus is a branch of mathematics that involves the study of rates of change and accumulation. Its all about how things change and how to measure and understand those changes, ain't that right?', 'dialogue_number': 1},{'president': 'obama','dialogue': 'Well, let me tell you, calculus is like figuring out how fast your approval ratings are dropping! It is all about those slopes and curves, am I right?', 'dialogue_number': 2},{'president': 'obama','dialogue': 'That is a great explanation, Obama. Calculus helps us understand the world around us by looking at the big picture through the lens of change and motion.', 'dialogue_number': 3}]}"
      },
      {
        "role": "user",
        "content": `Provide a silly, witty, comical dialogue with the thematic being: ${prompt}.`
      },
    ],
    temperature: 1,
    max_tokens: 256,
    top_p: 1,
    frequency_penalty: 0,
    presence_penalty: 0,
  });

  const response = completion.choices[0].message.content;

  return response;

}

export async function getJobStatusById(jobId: string){

  const sql = postgresSql();

  try {

    const queryResult = await sql`
    SELECT * FROM videos 
    WHERE jobid = ${jobId}
    `

    const areJobVideosCompleted = queryResult.every((video) => {
      return video.status === "COMPLETED";
    })

    console.log("ARE ALL VIDEOS COMPLETED?, ", areJobVideosCompleted);

    return areJobVideosCompleted ? "COMPLETED" : "PENDING";

  } catch(e){
    console.log("ERROR AT PULLING JOB STATUS");
    return null;
  }


}

interface videosByJobId {
  id: string,
  userid: string,
  url: string | null,
  status: string,
  jobid: string,
  video_number: number
}

export async function getVideosByJobId(jobId: string){
  const sql = postgresSql();

  try {
    const queryResult = await sql<[videosByJobId]>`
    SELECT * FROM videos 
    WHERE jobid = ${jobId}
  `
    const results = queryResult.map((video) => video);

    return results;

  } catch(e) {
    console.log("Error at pulling videos by job id")
    return null;
  }


}

export async function concatenateVideosByUrls(urls: (string | null)[]){

  const apiKey = process.env.CREATOMATE_KEY;

  try {

    const elements = urls.map((url) => {
      return new Creatomate.Video({
        track: 1,
        source: url
      })
    })

    const client = new Creatomate.Client(apiKey);

    const source = new Creatomate.Source({
      outputFormat: "mp4",
      width: 1280,
      height: 720,
      elements
    })
  
    //returns an array
    const video = await client.render({source});
    console.log(video);
  
    const videoUrl = video[0].url;

    console.log("FINAL VIDEO URL: ", videoUrl)
    return videoUrl;

  } catch (e) {
    console.log("ERROR AT CONCATENATING VIDEOS", e);
    return null;
  }
}

export async function handleVideosCompletion(jobId: string){

  try {

    const videosData = await getVideosByJobId(jobId);
    if(!videosData){
      throw new Error("Error at pulling videos by job id")
    }

    const videosUrls = videosData
      .sort((a, b) => a.video_number - b.video_number)
      .map((videoData) => {
        console.log("VIDEO DATA: ", videoData);
        console.log("VIDEO URL: ", videoData.url)
        return videoData.url
      })
    const isVideoUrlsValid = videosUrls.every(url => typeof url === "string");
    if(!isVideoUrlsValid){
     throw new Error("VIDEO URL CONTAINED A NULL");
    }

    console.log("VIDEOS URLS", videosUrls);

    const concatenatedVideoUrl = await concatenateVideosByUrls(videosUrls)
    if(!concatenatedVideoUrl){
      throw new Error("Error at concatenating videos")
    }

    const updatedJobs = await updateJobStatus(jobId, "COMPLETED", concatenatedVideoUrl)
    console.log("SUCCESS", updatedJobs);

  } catch(e){
    console.log(e)
    return e;
  }

}