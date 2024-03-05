"use server"


export async function textToAudio(text: string){

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