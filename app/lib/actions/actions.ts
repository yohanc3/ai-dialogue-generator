"use server"

import {S3Client} from '@aws-sdk/client-s3';
import { Upload } from "@aws-sdk/lib-storage";
import { unstable_noStore as noStore} from 'next/cache';
import {customAlphabet} from "nanoid";
import {z} from "zod";
import postgres from "postgres";
import { postSyncedVideo } from './videoActions';
import { textToAudio } from './audioActions';

const userId = 'c20a1304-da40-4211-91b3-59c01b195101';

const postgresSql = () => {
  return postgres(process.env.DATABASE_URL!, {ssl: 'require'})
}

const FormSchema = z.object({
  text: z.string(),
})

export async function generateId(){
  const alphabet = '0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz';
  const nanoid = customAlphabet(alphabet, 16);
  return await nanoid();
}

export async function handleSubmit(localId: string, formData: FormData){

  console.log("HANDLE SUBMIT FIRED");

  const parsedData = FormSchema.safeParse({
    text: formData.get("text")
  })

  if(!parsedData.success){
    return "Text is not valid"
  }

  const {text} = parsedData.data;
  
  try{

    const res = await textToAudio(text);

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

    const bidenVideoURL = "https://texttovideofiles.s3.us-east-2.amazonaws.com/template-videos/10s-edited-biden-audio-template+.mp4";
    const webhookUrl = "https://thirty-sides-listen.loca.lt/api/lip-sync/webhook";

    const syncLabsRequest = await postSyncedVideo(audioUrl, bidenVideoURL, webhookUrl);

    //    Synclabsrequest status is always 'pending', it doesnt refer to the status code sent back to the webhook

    // if(syncLabsRequest.status === 201 || syncLabsRequest.status === "201"){
    //   console.log("sync labs response status: ", syncLabsRequest.status);

    // } else {
    //   console.log("ERROR IN SYNC LABS, RESPONSE STATUS IS NOT 201");
    // }

    const syncLabsVideoId = syncLabsRequest.id;
    const syncLabsVideoUrl = syncLabsRequest.url;

    console.log("SYNC LABS VIDEO DATA: ", syncLabsRequest);

    // const formSchema = z.object({
    //   localId: z.string()
    // })

    // const { localId } = formSchema.parse({
    //   localId: formData.get("localId")
    // })

    if(!localId){
      console.log("DID NOT GET LOCAL ID");
      return;
    }

    console.log("LOCAL ID: ", localId);

    const userVideoSql = await storeVideoName(syncLabsVideoId, localId, userId, syncLabsVideoUrl, "PENDING");
    
  } catch(e){
    console.log("Error at main routine")
    console.log(e);
    return "Error";
  }
}

async function storeVideoName(id: string, localId: string, userId: string, url: string, status: string){

  try {

    const sql = postgresSql();

    const result = await sql`
      INSERT INTO jobs(id, localId, userId, url, status)
      VALUES(${id}, ${localId}, ${userId}, ${url}, ${status})
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

export async function updateJob(jobId: string, status: string, url: string){

  // console.log("jobId", jobId);
  // console.log("status", status);

  const sql = postgresSql();

  try{

    const result = await sql`
    UPDATE jobs 
    SET 
      status = ${status}, 
      url = ${url}
    WHERE id = ${jobId}
    `;

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