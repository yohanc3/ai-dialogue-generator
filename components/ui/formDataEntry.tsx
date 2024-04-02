"use client";

import Image from "next/image";
import { Button } from "@/components/ui/button"
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"

import { useState, useEffect } from "react";
import PersonalizedAvatar from "../PersonalizedAvatar";

import { people } from "@/app/lib/actions/characters";
import useTypewriter from "@/app/hooks/useTypewriter";
import { character } from "@/app/lib/actions/definitions";

const testData = JSON.parse(`{"title":"Beethoven","dialogues":[{"name":"Jonathan Blow","dialogue":"Beethoven's music speaks to the soul, resonating with deep emotions and stirring the heart profoundly.","dialogueNumber":1,"voiceId":"B1QETHXGZ79MlRg5u2bt","templateVideoUrl":"https://texttovideofiles.s3.us-east-2.amazonaws.com/template-videos/blow.mp4"},{"name":"Obama","dialogue":"Beethoven's compositions are a testament to human creativity, transcending time and touching countless souls.","dialogueNumber":2,"voiceId":"UymZwoAxnEVxnbvKNcsY","templateVideoUrl":"https://texttovideofiles.s3.us-east-2.amazonaws.com/template-videos/obama.mp4"},{"name":"Elon Musk","dialogue":"Beethoven's legacy teaches us the power of passion, perseverance, and innovation in shaping our world.","dialogueNumber":3,"voiceId":"wm8rjo1ZjMK9meTYJkAJ","templateVideoUrl":"https://texttovideofiles.s3.us-east-2.amazonaws.com/template-videos/musk.mp4"}]}`)


export default function FormDataEntry({onSubmit}: {onSubmit: (characters: character[], prompt: string) => void,}){

  const LETTER_INTERVAL: number = 70;
  const PHRASE_INTERVAL: number = 2000;
  const words = [
    "top 3 movies of all time",
    "fastest land animal",
    "beethoven",
  ];
  const { text } = useTypewriter(words, PHRASE_INTERVAL, LETTER_INTERVAL);

  const [characters, setCharacters] = useState<character[]>([]);
  const [prompt, setPrompt] = useState<string>("");
  const [isFormInputValid, setIsFormInputValid] = useState<boolean>(true);

  useEffect(() => {
    setIsFormInputValid(true);
  }, [prompt, characters])

  function onClick(){
    if(characters.length > 0 && prompt){
      onSubmit(characters, prompt)
    } else {
      setIsFormInputValid(false);
    }
  }

  function handleAvatarSelection(person: character){
    if(characters.find((character) => character.name === person.name)){
      setCharacters((cur) => {
        return cur.filter((character) => character.name !== person.name)
      })
    }
    else if(characters.length < 3){
      setCharacters((cur) => [...cur, person]);
      console.log("CHARACTERS NAMES: ", [...characters, person])
    } else {
      //handle error here properly later on added
      console.log("3 CHARACTERS HAVE ALRAEDY BEEN SELEECTED: ", characters)
    }
  }

  return (
    <main>
      <CardContent className="w-full">

      <div className="flex flex-col gap-y-12 w-full">

        <div className="w-full flex flex-col space-y-1.5">
          <Label htmlFor="prompt">What should the dialogue be about?</Label>
          <Input id="prompt" name="prompt" placeholder={`eg: ${text}`} onChange={(e) => setPrompt(e.target.value)}/>
        </div>

        <div className="flex w-full items-center">
          <div className="flex flex-col space-y-1.5 gap-y-4 overflow-x-scroll">
            <Label htmlFor="name">Choose up to 3 characters</Label>
            <div className="flex w-full items-center justify-start gap-x-4 overflow-x-scroll scrollbar-none">
              {
                people.map((person) => {
                  return (
                    <div className="" key={person.videoUrl}>
                      <PersonalizedAvatar 
                        handleClick={handleAvatarSelection}
                        isClicked={!!characters.find((char) => char.name === person.name)}
                        person={person}
                        className="border-2 relative z-0"
                      />
                    </div>
                  )
                })
              }
          </div>
        </div>
        </div>
      </div>

      </CardContent>
      <CardFooter className="flex justify-between">
        <Button onClick={(e) => onClick()}>Create</Button>
      </CardFooter>

      <div className="flex flex-col pl-4">
        {
          characters.length === 0 && !isFormInputValid ? 
          <span className="text-red-500/95 text-sm">
            Choose up to 3 characters
          </span> : ""
        }
        {
          prompt.length === 0 && !isFormInputValid ? 
          <span className="text-red-500/95 text-sm">
            Prompt field cannot be empty
          </span> : ""
        }
      </div>

    </main>
    
  )
}