"use server"

import {S3Client} from '@aws-sdk/client-s3';
import { Upload } from "@aws-sdk/lib-storage";
import { unstable_noStore as noStore} from 'next/cache';
import {customAlphabet} from "nanoid";
import {z} from "zod";
import postgres from "postgres";
import { postSyncedVideo } from './videoActions';
import { textToAudio } from './audioActions';
import { parse } from 'path';
import OpenAI from "openai";

const userId = 'c20a1304-da40-4211-91b3-59c01b195101';

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
    return "Prompt is invalid";
  }

  const { prompt } = parsedData.data;

  const openai = new OpenAI({apiKey: process.env.OPENAI_KEY});

  const completion = await openai.chat.completions.create({
    model: "gpt-3.5-turbo",
    messages: [
      {
        "role": "system",
        "content": "You are an assistant that based on the given prompt you\\'ll develop a dialogue between 3 presidents. These presidents are: Barack Obama, Donald Trump, and Joe Biden. Make the conversation interactive, the presidents should be talking to each other as well as the audience. Donald Trump and Obama should occasionally call Joe Biden \"Sleepy Joe\". And Obama should include \"aint that right?\" at least once in his dialogue. Each president must have at least two dialogues. Your job is to make a dialogue between those 3 with the thematic of the given prompt. For the JSON that you will return, use the next format:\n\n{\n \"dialogues\": [\n {\n    \"president\": {insert president name here},\n    \"dialogue\": {insert dialogue here},\n    \"dialogue_number\":  (start it at 1, increase it by 1 each time a new dialogue is created)\n  }\n  ...\n ]\n}\n In the JSON that you return, make sure that the president field is only populated with the last name of the president in lowercase."
      },
      {
        "role": "user",
        "content": "What is calculus?"
      },
    ],
    temperature: 1,
    max_tokens: 256,
    top_p: 1,
    frequency_penalty: 0,
    presence_penalty: 0,
  });

  const dialogues = completion.choices[0]

}

export async function createJob(userId: string){
  
  const jobId = await generateId();

  const sql = postgresSql();

  try{

    const response = sql`
    INSERT into jobs(id, userId)
    VALUES(${jobId}, ${userId})
  `
    return response;

  } catch(e){
    console.log(e)
    return e;
  }

}

export async function createVideo(jobId: string, formData: FormData){

  console.log("JOBID:", jobId);
  console.log(formData);

  console.log("HANDLE SUBMIT FIRED");

  const parsedData = z.object({prompt: z.string()}).safeParse({
    prompt: formData.get("prompt")
  })

  if(!parsedData.success){
    return "Text is not valid"
  }

  const { prompt } = parsedData.data;
  
  try{

    const res = await textToAudio(prompt);

    if(!res){
      return "error, Audio response is undefined";
    }
    const audioStreamReadable = await res.body;
  
    const audioId = await generateId();

    const audioName = "elevenlabs-audios/" + audioId + ".mp3";

    const uploadAudioToS3 = await uploadFileToS3("texttovideofiles", audioName, audioStreamReadable); 

    if(!uploadAudioToS3) return "error at upload time";

    const audioUrl = uploadAudioToS3.Location;

    if(!audioUrl) return "error on audio url"

    // console.log("UPLOADT AUDIO TO S3 BUCKET RESULT", uploadAudioToS3);
    
    if(!uploadAudioToS3){
      return "sad";
    }
    
    const jsonresult = uploadAudioToS3.$metadata.httpStatusCode;
    if(jsonresult !== 200) return "UPLOADING ERROR";
    
    // if an error occurs, audio-url is saved for retries or not having to generate it again
    const queryResult = storeAudioName(audioId, userId, audioUrl);

    const bidenVideoURL = "https://texttovideofiles.s3.us-east-2.amazonaws.com/template-videos/obama-template.mp4";
    const webhookUrl = "https://spicy-tools-live.loca.lt/api/lip-sync/updateJob";

    const syncLabsRequest = await postSyncedVideo(audioUrl, bidenVideoURL, webhookUrl);

    //    Synclabsrequest status is always 'pending', it doesnt refer to the status code sent back to the webhook

    // if(syncLabsRequest.status === 201 || syncLabsRequest.status === "201"){
    //   console.log("sync labs response status: ", syncLabsRequest.status);

    // } else {
    //   console.log("ERROR IN SYNC LABS, RESPONSE STATUS IS NOT 201");
    // }

    const syncLabsVideoId = syncLabsRequest.id;

    console.log("SYNC LABS VIDEO DATA: ", syncLabsRequest);

    // const formSchema = z.object({
    //   localId: z.string()
    // })

    // const { localId } = formSchema.parse({
    //   localId: formData.get("localId")
    // })

    if(!jobId){
      console.log("DID NOT GET LOCAL ID");
      return;
    }

    console.log("Job Id: ", jobId);

    const userVideoSql = await storeVideoName(syncLabsVideoId, jobId, userId, "PENDING");
    
  } catch(e){
    console.log("Error at main routine")
    console.log(e);
    return "Error";
  }
}

async function storeVideoName(id: string, jobId: string, userId: string, status: string){

  try {

    const sql = postgresSql();

    const result = await sql`
      INSERT INTO jobs(id, jobId, userId, status)
      VALUES(${id}, ${jobId}, ${userId}, ${status})
    `;

    return result;

  }catch(e){
    console.log(e);
  }
  
}

async function storeAudioName(id: string, userId: string, url: string){

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

export async function updateVideoStatus(jobId: string, status: string, url: string){

  console.log("jobId: ", jobId);
  console.log("status: ", status);
  console.log("url: ", url)

  const sql = postgresSql();

  try{

    const result = await sql`
    UPDATE jobs 
    SET 
      status = ${status}, 
      url = ${url}
    WHERE id = ${jobId}
    `;

    console.log("VIDEO CORRECTLY UPDATED")

    return result;

  }catch(e){
    console.log("fail at updating")
    console.log("jobId: ", jobId)
    console.log("status: ", status)
    console.log(e);
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

    parallelUploads3.on("httpUploadProgress", (progress) => {
      console.log(progress);
    })
    
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

export async function getJobsById(jobId: string){

  const sql = postgresSql();

  const jobs = await sql`
    SELECT * FROM jobs
    WHERE id = ${jobId}
  `

  return jobs;

}

export async function tryOpenAi(prompt: string){

  const openai = new OpenAI({apiKey: process.env.OPENAI_KEY});

  const completion = await openai.chat.completions.create({
    model: "gpt-3.5-turbo",
    response_format: {type: "json_object"},
    messages: [
      {
        "role": "system",
        "content": "You are an assistant that based on the given prompt you will develop a dialogue between 3 presidents. These presidents are: Barack Obama, Donald Trump, and Joe Biden. Make the conversation interactive, the presidents should be talking to each other as well as the audience. Donald Trump and Obama should occasionally call Joe Biden 'Sleepy Joe'. And Obama should include 'ain't that right bro?'occasionally as well. Each president must have at least two dialogues. Your job is to make a dialogue between those 3 with the thematic of the given prompt. For the JSON that you will return, use the next format:{'dialogues': [{'president': {insert president name here},    'dialogue': {insert dialogue here}, 'dialogue_number': (start it at 1, increase it by 1 each time a new dialogue is created)}...]} In the JSON that you return, make sure that the president field is only populated with the last name of the president in lowercase."
      },
      {
        "role": "user",
        "content": "Provide a dialogue about what calculus is"
      },
      {
        "role": "assistant",
        "content": "{'dialogues': [{'president': 'obama','dialogue': 'Calculus is a branch of mathematics that involves the study of rates of change and accumulation. Its all about how things change and how to measure and understand those changes, ain't that right?', 'dialogue_number': 1},{'president': 'trump','dialogue': 'Well, let me tell you, Sleepy Joe, calculus is like figuring out how fast your approval ratings are dropping! It is all about those slopes and curves, am I right?', 'dialogue_number': 2},{'president': 'biden','dialogue': 'That is a great explanation, Obama. Calculus helps us understand the world around us by looking at the big picture through the lens of change and motion.', 'dialogue_number': 3}]}"
      },
      {
        "role": "user",
        "content": `Provide a dialogue with the thematic being: ${prompt}`
      },
    ],
    temperature: 1,
    max_tokens: 256,
    top_p: 1,
    frequency_penalty: 0,
    presence_penalty: 0,
  });

  const dialogues = completion;

  console.log(dialogues);
  return dialogues;

}




