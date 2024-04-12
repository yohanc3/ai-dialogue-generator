"use client";
import { generateDialogues, createFullVideo } from "@/app/lib/actions/actions";
import { customAlphabet } from "nanoid";

import { Card } from "@/components/ui/card";
import { useEffect, useState } from "react";
import { TimerIcon } from "lucide-react";

import { people } from "@/app/lib/actions/characters";
import { Character, DialogueData } from "@/app/lib/actions/definitions";
import useTypewriter from "@/app/hooks/useTypewriter";
import FormDataEntry from "./ui/formDataEntry";
import FormDataMutation from "./ui/formDataMutation";
import { getUserDailyCreatedVideos } from "@/app/lib/actions/data";
import LimitVideosModal from "./ui/limit-videos-modal";
import { MAX_DAILY_VIDEOS } from "@/app/config";

const testData = JSON.parse(`{"title":"Beethoven","dialogues":[{"name":"Jonathan Blow","dialogue":"Beethoven's music speaks to the soul, resonating with deep emotions and stirring the heart profoundly.","dialogueNumber":1,"voiceId":"B1QETHXGZ79MlRg5u2bt","templateVideoUrl":"https://texttovideofiles.s3.us-east-2.amazonaws.com/template-videos/blow.mp4"},{"name":"Obama","dialogue":"Beethoven's compositions are a testament to human creativity, transcending time and touching countless souls.","dialogueNumber":2,"voiceId":"UymZwoAxnEVxnbvKNcsY","templateVideoUrl":"https://texttovideofiles.s3.us-east-2.amazonaws.com/template-videos/obama.mp4"},{"name":"Elon Musk","dialogue":"Beethoven's legacy teaches us the power of passion, perseverance, and innovation in shaping our world.","dialogueNumber":3,"voiceId":"wm8rjo1ZjMK9meTYJkAJ","templateVideoUrl":"https://texttovideofiles.s3.us-east-2.amazonaws.com/template-videos/musk.mp4"}]}`);

export default function Form({ addPollingId, userId }: { addPollingId: (id: string) => void; userId: string }) {
  function generateId() {
    const alphabet = "0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz";
    const nanoid = customAlphabet(alphabet, 17);
    return nanoid();
  }

  const [localId, setLocalId] = useState(generateId());
  const [dialogueData, setDialogueData] = useState<DialogueData | undefined>();
  const [isEntryForm, setIsEntryForm] = useState<boolean>(true);
  const [error, setError] = useState<string[]>([]);

  const [isMaxVideosAlertOpen, setIsMaxVideosAlertOpen] = useState<boolean>(false);

  async function getDailyVideos() {
    return await getUserDailyCreatedVideos(userId);
  }

  async function handleInitialSubmit(characters: Character[], prompt: string) {
    setDialogueData(testData);
    return;

    const dailyVideos = await getDailyVideos();
    console.log("DAILY VIDEOS: ", dailyVideos);
    if (dailyVideos >= MAX_DAILY_VIDEOS) {
      setIsMaxVideosAlertOpen(true);
      return;
    }

    if (!prompt) {
      setError([...error, "Type a prompt"]);
      return;
    }

    const dialogueData = await generateDialogues(characters, prompt);
    if (!dialogueData) {
      setError([...error, "Error at generation dialogue data, try again later"]);
      return;
    }
    console.log("AI GENERATED DIALOGUE: ", dialogueData);
    setDialogueData(dialogueData);
  }

  function handleLastSubmit(editedDialogueData: DialogueData) {
    console.log("FINAL DIALOGUE DATA: ", editedDialogueData);
    createFullVideo(localId, userId!, editedDialogueData);
    addPollingId(localId);
    setLocalId(generateId());
    setDialogueData(undefined);
  }

  return (
    <>
      <Card className="w-full py-8">
        {isMaxVideosAlertOpen ? <LimitVideosModal isOpen={isMaxVideosAlertOpen} setIsOpen={setIsMaxVideosAlertOpen} /> : ""}

        {!dialogueData ? <FormDataEntry onSubmit={handleInitialSubmit} /> : <FormDataMutation dialogueData={dialogueData} onSubmit={handleLastSubmit} />}
      </Card>
    </>
  );
}
