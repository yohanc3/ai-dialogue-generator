"use server";

import { customAlphabet } from "nanoid";
import { concatenateVideosByUrls, lipSyncVideo } from "./video-edition";
import { generateAudio, uploadAudioToS3 } from "./audio";
import OpenAI from "openai";
import { getVideosByJobId, storeJob, storeVideoName, updateJobStatus } from "./data";
import { userId, Character, PromptFormat, RawDialogueResponse, DialogueData } from "./definitions";
import { people } from "./characters";
import { AuthError } from "next-auth";

export async function generateDialogues(characters: Character[], prompt: string) {
  const charactersData = characters.map((char) => {
    return { name: char.name, personality: char.personality, slang: char.slang };
  });

  const content: PromptFormat = {
    topic: prompt,
    characters: charactersData,
  };

  try {
    const dialogueData = await generateChatGPTDialogues(content);
    console.log("DIALOGUE DATA AI GENERATED: ", dialogueData);

    if (dialogueData) {
      return dialogueData;
    } else {
      throw new Error("Error at creating dialogues, they are undefined");
    }
  } catch (e) {
    console.log("ERROR AT DIALOGUES GENERATION, ERROR: ", e);
  }
}

export async function createFullVideo(jobId: string, userId: string, dialogueData: DialogueData) {
  if (!userId) throw new AuthError("userId not valid");

  console.log("jobid: ", jobId);
  console.log("AT JOB CREATION, RAW DIALOGUE DATA: ", dialogueData);

  try {
    if (!dialogueData) {
      console.log("ERROR RAW DIALOGUEs");
      return "Error";
    }

    const dialogues = dialogueData.dialogues;

    console.log("TITLE: ", dialogueData.title);
    console.log("DIALOGUES", dialogues);

    const savedJob = await storeJob(jobId, userId, dialogueData.title, "PENDING");

    const areDialoguesValid = dialogues.every((dialogue) => {
      return dialogue.voiceId && dialogue.templateVideoUrl;
    });

    if (areDialoguesValid) {
      dialogues.map((dialogueData) => {
        const dialogue = dialogueData.dialogue;
        const videoNumber = dialogueData.dialogueNumber;
        createIndividualVideo(jobId, dialogue, dialogueData.voiceId ?? "", dialogueData.templateVideoUrl ?? "", videoNumber);
      });
    } else {
      console.log("ERROR AT VALIDATING JOBS, THEY ARE CORRUPTED");
    }
  } catch (e) {
    console.log(e);
    console.log("Error at handling job");
  }
}

//Given a jobId and dialogue, a lip-synced video is created and stored.
export async function createIndividualVideo(jobId: string, dialogue: string, voiceId: string, templateVideoUrl: string, videoNumber: number) {
  // console.log("JOBID:", jobId);
  // console.log(formData);
  // console.log("HANDLE SUBMIT FIRED");

  try {
    const audioBody = await generateAudio(dialogue, voiceId);

    if (!audioBody) {
      return "error, Audio response is undefined";
    }

    const audioUrl = await uploadAudioToS3(audioBody);

    const webhookUrl = `${process.env.TEMPORAL_URL}/api/lip-sync/updateVideoStatus`;

    console.log("WEBHOOK URL: ", webhookUrl);

    const syncLabsRequest = await lipSyncVideo(audioUrl, templateVideoUrl, webhookUrl);
    const syncLabsVideoId = syncLabsRequest.id;

    console.log("SYNC LABS VIDEO DATA: ", syncLabsRequest);

    if (!jobId) {
      console.log("DID NOT GET LOCAL ID");
      return;
    }

    console.log("Job Id: ", jobId);

    const storedVideoQueryResult = await storeVideoName(syncLabsVideoId, jobId, userId, "PENDING", videoNumber);
  } catch (e) {
    console.log("Error at main routine");
    console.log(e);
    return "Error";
  }
}

export async function generateChatGPTDialogues(content: PromptFormat) {
  const stringifiedContent = JSON.stringify(content);

  console.log(stringifiedContent);

  try {
    const openai = new OpenAI({ apiKey: process.env.OPENAI_KEY });

    const completion = await openai.chat.completions.create({
      model: "gpt-3.5-turbo",
      response_format: { type: "json_object" },

      messages: [
        {
          role: "system",
          content: "You are a script writer that given a json object where you will find a topic, an array of human characters with their names, personalities, and maybe some slang. There are 6 rules you MUST follow sternly, here they are. 1: You shall write a silly, funny and amusing dialogue which will revolve around the given topic in the json object. 2: To write the dialogue, you will use the given personalities of each character to make up their dialogues, each character should talk to each other like it is a regular conversation between a group of friends. 3: Each dialogue length should add up to a total of 20 words maximum. 4: If you find 'putin' between the characters, return his dialogues in russian, not english, if you found 'putin' the person speaking after Putin should say 'I have no clue what you just said dawg, not gonna lie' If there's 1 dialogue per person already, add one more dialogue of someone speaking english saying it, make sure you place their name in the right slot as well as the dialogue. 5: You will return a title that synthesizes in 4-5 words the topic that was passed in to you, place the title in the 'title' key of the json you return. 6: Your response will be a json object in the next format: {'title': --topic belongs here--,'dialogues':[{'name':--insert name here--, 'dialogue': --insert character's personality here--}, {'name':--insert name here--, 'dialogue': --insert character's personality here--}, ...]}.",
        },
        {
          role: "user",
          content: '{"topic": "What is Calculus?","characters":[{"name":"Elon Musk", "personality":"Beneath the surface of Musk’s success lies his thinking style, which is characterized by analytical and strategic thought processes. These traits have undoubtedly played a pivotal role in his ability to navigate complex challenges and propel his ventures forward. Elon Musk, the visionary entrepreneur behind companies like Tesla and SpaceX, is renowned for his exceptional thinking style that sets him apart in the business world. His approach to problem-solving and strategic planning has not only revolutionized industries but also inspired a new generation of innovators. Musk’s analytical thinking allows him to meticulously dissect problems, identify underlying causes, and devise creative solutions. His unwavering attention to detail and ability to see things from multiple perspectives have contributed to the exceptional performance of his companies.","slang":[]},{"name":"Jonathan Blow","personality":"He tends to speak with a direct and analytical manner, often delving into complex topics related to game design and philosophy. He will usually extrapolate any definition, question, or matter to a philosophical point","slang":["Well think about this, ... "]},{"name":"Theo","personality":"The individual\'s speaking style is characterized by a mixture of passion, frustration, and conviction. They articulate their thoughts with clarity and assertiveness, conveying their emotions and viewpoints with intensity. There\'s a sense of urgency in their words, as they address issues they perceive as significant and in need of attention. They speak with a resolute tone, unafraid to express their opinions and challenge the status quo. Despite the underlying disappointment and disillusionment, their speech is marked by determination and a drive to effect change. They communicate with a sense of purpose, aiming to convey their message effectively and make an impact on their audience.","slang":[]}]}',
        },
        {
          role: "assistant",
          content: `{'title': 'Calculus', 'dialogues': [{'name': 'Elon Musk', 'dialogue': 'I believe calculus is the key to unlocking the mysteries of the universe. It\'s all about those derivatives, man.'}, {'name': 'Jonathan Blow', 'dialogue': 'Well think about this, the beauty of calculus lies in its ability to model real-world phenomena with precision.'}, {'name': 'Theo', 'dialogue': 'You're damn right dawg, calculus is like a rollercoaster of functions, twisting and turning through the mathematical landscape.'}]}`,
        },
        {
          role: "user",
          content: stringifiedContent,
        },
      ],
      temperature: 1,
      max_tokens: 256,
      top_p: 1,
      frequency_penalty: 0,
      presence_penalty: 0,
    });

    const response = completion.choices[0].message.content;

    if (!response) return;

    const gptResponse: RawDialogueResponse = JSON.parse(response);

    const dialogues = gptResponse.dialogues.map((dialogue, index) => {
      const character = people.find((char) => char.name === dialogue.name);

      return {
        ...dialogue,
        dialogueNumber: index + 1,
        voiceId: character?.voiceId,
        templateVideoUrl: character?.videoUrl,
      };
    });

    const finalResponse: DialogueData = { title: gptResponse.title, dialogues };

    return finalResponse;
  } catch (e) {
    console.log("ERROR AT CREATING AI: ", e);
  }
}

//When all videos from a job are completed, the videos get concatenated.
export async function onVideoCompletion(jobId: string) {
  try {
    const videosData = await getVideosByJobId(jobId);
    if (!videosData) {
      throw new Error("Error at pulling videos by job id");
    }

    const videosUrls = videosData
      .sort((a, b) => a.video_number - b.video_number)
      .map((videoData) => {
        console.log("VIDEO DATA: ", videoData);
        console.log("VIDEO URL: ", videoData.url);
        return videoData.url;
      });
    const isVideoUrlsValid = videosUrls.every((url) => typeof url === "string");
    if (!isVideoUrlsValid) {
      throw new Error("VIDEO URL CONTAINED A NULL");
    }

    console.log("VIDEOS URLS", videosUrls);

    const concatenatedVideoUrl = await concatenateVideosByUrls(videosUrls);
    if (!concatenatedVideoUrl) {
      throw new Error("Error at concatenating videos");
    }

    const updatedJobs = await updateJobStatus(jobId, "COMPLETED", concatenatedVideoUrl);
    console.log("SUCCESS", updatedJobs);
  } catch (e) {
    console.log(e);
    return e;
  }
}

export async function milisecondsToTime(timeInMiliseconds: number) {
  const seconds = timeInMiliseconds / 1000;

  const minutes = seconds / 60;
  const hours = minutes / 60;
  const days = hours / 24;
  const months = days / 30;

  if (seconds < 60) return `${seconds.toFixed(0)} seconds ago.`;
  else if (minutes < 60) return `${minutes.toFixed(0)} minutes ago.`;
  else if (hours < 24) return `${hours.toFixed(0)} hours ago.`;
  else if (days < 30) return `${days.toFixed(0)} days ago.`;
  else return `${months.toFixed(0)} months ago.`;
}
