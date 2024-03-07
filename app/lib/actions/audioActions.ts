"use server"

import { generateId, storeAudioName, uploadFileToS3 } from "./actions";

const userId = 'c20a1304-da40-4211-91b3-59c01b195101';

export async function generateAudio(text: string){

  const apiUrl = 'https://api.elevenlabs.io/v1/text-to-speech/UymZwoAxnEVxnbvKNcsY/stream?output_format=mp3_22050_32';
  const options = {
    method: 'POST',
    headers: {
      'xi-api-key': process.env.ELEVENLABS_API_KEY!,
      'Content-Type': 'application/json'
    },
    body: `{"text":"${text}","voice_settings":{"similarity_boost":1,"stability":1},"pronunciation_dictionary_locators":[]}`
  };
  
  try {

    const fetchedAudio = await fetch(apiUrl, options)

    if(fetchedAudio.ok){

        return fetchedAudio;

    } else{
      console.log("Something went wrong");
    }

  } catch(e){
    console.log(e);
  }
}

export async function uploadAudioToS3(audioBody: Response){

  const audioStreamReadable = await audioBody.body;

  const audioId = await generateId();
  const audioName = "elevenlabs-audios/" + audioId + ".mp3";

  const uploadAudioToS3 = await uploadFileToS3("texttovideofiles", audioName, audioStreamReadable); 
  if(!uploadAudioToS3) return "error at upload time";

  const audioUrl = uploadAudioToS3.Location;
  if(!audioUrl) return "error on audio url"

  if(!uploadAudioToS3){
    return "sad";
  }
  
  const audioUploadResult = uploadAudioToS3.$metadata.httpStatusCode;
  if(audioUploadResult !== 200) throw new Error("UPLOADING ERROR");
  
  // if an error occurs, audio-url is saved for retries or not having to generate it again
  const queryResult = storeAudioName(audioId, userId, audioUrl);

  return audioUrl;

}