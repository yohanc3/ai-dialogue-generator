"use server"

import {z} from "zod";

export async function getVideoById(id: string){

  const parsedData = z.object({id: z.string()}).safeParse({
    id
  })

  if(!parsedData.success){
    return "Text is not valid"
  }

  const options = {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
      "X-API-KEY": process.env.SYNC_LABS_API_KEY!
    },
  }

  try {

    const result = await fetch(`https://api.synclabs.so/video/${id}`, options)

    const data = await result.json();

    return data;

  }catch(e){
    console.log("CUSTOM ERROR", e);
  }

}

export async function postSyncedVideo(audioUrl: string, videoUrl: string, webhookUrl: string){

  try {
    const response = await fetch(`https://api.synclabs.so/video`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-API-KEY': process.env.SYNC_LABS_API_KEY!,
      },
      body: JSON.stringify({
        audioUrl,
        videoUrl,
        synergize: true,
        webhookUrl: webhookUrl,
        model: "sync-1.5.0"
      })
    }); 

    // console.log("SYNCED VIDEO RESPONSE: ", response);

    return await response.json();

  } catch(e){
    console.log(e);
  }

}