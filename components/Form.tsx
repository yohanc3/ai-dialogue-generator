"use client"
import { handleJobCreation } from "@/app/lib/actions/actions";
import { customAlphabet } from "nanoid";

type addPollingId = (id: string) => void;

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

import { useState } from "react";
// import useTypewriter from "typewriter-hook";
import PersonalizedAvatar from "./PersonalizedAvatar";

import { people } from "@/app/lib/actions/characters";
import { character } from "@/app/lib/actions/definitions";

export default function Form({addPollingId}: {addPollingId: addPollingId}){
  
  const [characters, setCharacters] = useState<character[]>([]);
  const [localId, setLocalId] = useState(generateId());
  
  const submitFormWithJobId = handleJobCreation.bind(null, localId, characters)

  function generateId(){
    const alphabet = '0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz';
    const nanoid = customAlphabet(alphabet, 16);
    return nanoid(); 
  }

  function handleAddPollingId(){
    addPollingId(localId);
    console.log("TIMEOUT HAPPENS IN 2S!!!!!")
    setTimeout(() => {
      setLocalId(generateId());
      console.log("TIMEOUT RAN")
    }, 2000)
  }

  const LETTER_INTERVAL: number = 70;
  const PHRASE_INTERVAL: number = 2000;
  const examples = [
    "top 3 movies of all time",
    "fastest land animal",
    "beethoven",
  ];

  // const [ text ] = useTypewriter(examples, PHRASE_INTERVAL, LETTER_INTERVAL);

  function handleClick(person: character){
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

  return <>
    <form action={submitFormWithJobId} className="">
      <Card className="w-full py-8">

        <CardContent className="w-full">

            <div className="flex flex-col gap-y-12 w-full">

              <div className="w-full flex flex-col space-y-1.5">
                <Label htmlFor="prompt">What should the dialogue be about?</Label>
                <Input id="prompt" name="prompt" placeholder={`eg: ${ "Calculus"}`} />
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
                              handleClick={handleClick}
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
          <Button onClick={(e) => handleAddPollingId()}>Create</Button>
        </CardFooter>

      </Card>
    </form>
    </>
}