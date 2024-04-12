"use server";

import { z } from "zod";
const Creatomate = require("creatomate");

export async function getVideoById(id: string) {
  const parsedData = z.object({ id: z.string() }).safeParse({
    id,
  });

  if (!parsedData.success) {
    return "Text is not valid";
  }

  const options = {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
      "X-API-KEY": process.env.SYNC_LABS_API_KEY!,
    },
  };

  try {
    const result = await fetch(`https://api.synclabs.so/video/${id}`, options);

    const data = await result.json();

    return data;
  } catch (e) {
    console.log("CUSTOM ERROR", e);
  }
}

export async function lipSyncVideo(audioUrl: string, videoUrl: string, webhookUrl: string) {
  try {
    const response = await fetch(`https://api.synclabs.so/lipsync`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "X-API-KEY": process.env.SYNC_LABS_API_KEY!,
      },
      body: JSON.stringify({
        audioUrl: audioUrl,
        model: "wav2lip++",
        synergize: true,
        videoUrl: videoUrl,
        webhookUrl: webhookUrl,
      }),
    });

    // console.log("SYNCED VIDEO RESPONSE: ", response);

    return await response.json();
  } catch (e) {
    console.log(e);
  }
}

export async function concatenateVideosByUrls(urls: (string | null)[]) {
  const apiKey = process.env.CREATOMATE_KEY;

  try {
    const elements = urls.map((url) => {
      return new Creatomate.Video({
        track: 1,
        source: url,
      });
    });

    const client = new Creatomate.Client(apiKey);

    const source = new Creatomate.Source({
      outputFormat: "mp4",
      width: 1280,
      height: 720,
      elements,
    });

    //returns an array
    const video = await client.render({ source });
    console.log(video);

    const videoUrl = video[0].url;

    console.log("FINAL VIDEO URL: ", videoUrl);
    return videoUrl;
  } catch (e) {
    console.log("ERROR AT CONCATENATING VIDEOS", e);
    return null;
  }
}
