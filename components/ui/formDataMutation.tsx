"use client";

import { ChevronUpIcon, ChevronDownIcon, ExclamationTriangleIcon } from "@heroicons/react/24/outline";
import { Character, Dialogue, DialogueData, Dialogues } from "@/app/lib/actions/definitions";
import { Label } from "./label";
import { Input } from "./input";
import { useEffect, useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import PersonalizedAvatar from "./character-avatar";
import { people } from "@/app/lib/actions/characters";
import { Trash2Icon } from "lucide-react";

export default function FormDataMutation({ dialogueData, onSubmit }: { dialogueData: DialogueData; onSubmit: (dialogueData: DialogueData) => void }) {
  const [title, setTitle] = useState<string>(`${dialogueData.title}`);
  const [dialogues, setDialogues] = useState<Dialogues>([...dialogueData.dialogues]);
  const [finalDialogueData, setFinalDialogueData] = useState<DialogueData>(dialogueData);
  const [isFinalDialogueDataEmpty, setIsFinalDialogueDataEmpty] = useState<boolean>(false);

  const [areDialoguesLimitReached, setAreDialoguesLimitReached] = useState<boolean>(false);
  const [newDialogueField, setNewDialogueField] = useState<string>();
  const [newCharacterField, setNewCharacterField] = useState<Character>();
  const [isNewDialogueValid, setIsNewDialogueValid] = useState<boolean>(true);

  const [isNewDialogueTooLong, setIsNewDialogueTooLong] = useState<boolean>(false);
  const MAX_CHARACTERS = 65 as const;
  const MAX_DIALOGUES = 4;

  useEffect(() => {
    const newFinalDialogues = { title, dialogues };
    setFinalDialogueData(newFinalDialogues);
    console.log("FINAL DIALOGUE DATA CHANGED: ", newFinalDialogues);
  }, [title, dialogues]);

  useEffect(() => {
    setIsNewDialogueValid(true);
  }, [newDialogueField, newCharacterField]);

  return (
    <main className="flex justify-center flex-col px-8 py-6 gap-y-10">
      <div className="flex justify-center items-center w-full text-6xl font-semibold">Final edit & review</div>
      <div className="w-full flex flex-col space-y-2 justify-center items-center">
        <Label htmlFor="title" className="text-2xl flex justify-center">
          Title
        </Label>
        <Input className="w-1/2" id="title" name="title" placeholder={title} value={title} onChange={(e) => setTitle(e.target.value)} />
      </div>

      <div className="flex flex-col justify-between gap-y-4">
        <div className="flex justify-between w-full gap-x-4">
          <section className="flex flex-col w-1/2 gap-y-4">
            <Label htmlFor="title" className="text-2xl flex justify-center">
              Dialogues
            </Label>
            <Card>
              <div className="flex flex-col h-[24rem] overflow-y-scroll scrollbar-none">
                {dialogues.map((dialogue, index) => {
                  return (
                    <div className="p-4 flex justify-center flex-col" key={dialogue.dialogueNumber}>
                      <div className="text-sm flex ">
                        <div className="">
                          {dialogue.dialogueNumber}.- <span className="font-semibold">{dialogue.name}</span>
                        </div>
                        <div className="flex items-center justify-center text-xs mb-1 ml-8 w-5 h-5 font-semibold text-white">
                          <button onClick={() => deleteDialogue(dialogue)}>
                            <Trash2Icon width={17} />
                          </button>
                        </div>
                      </div>
                      <div className="flex flex-row items-center gap-x-2">
                        <Textarea
                          name="new dialogue"
                          value={dialogue.dialogue}
                          className=""
                          onChange={(e) => {
                            editDialogue(e.target.value, index);
                          }}
                        />
                        <div className="flex flex-col h-20 justify-between py-2">
                          {dialogue.dialogueNumber > 1 ? (
                            <div className="border border-neutral-700 flex justify-around items-center rounded-md cursor-pointer duration-100 active:scale-95" onClick={() => moveDialogueUp(dialogue)}>
                              <ChevronUpIcon height={23} strokeWidth={2} />
                            </div>
                          ) : (
                            ""
                          )}
                          {dialogue.dialogueNumber < dialogues.length ? (
                            <div className="border border-neutral-700 flex justify-center items-center rounded-md cursor-pointer duration-100 active:scale-95" onClick={() => moveDialogueDown(dialogue)}>
                              <ChevronDownIcon height={23} strokeWidth={2} />
                            </div>
                          ) : (
                            ""
                          )}
                        </div>
                      </div>
                      {dialogue.dialogue.length > MAX_CHARACTERS ? (
                        <span className="text-red-500/95 text-sm p-0 m-0 flex gap-x-2">
                          {" "}
                          {<ExclamationTriangleIcon width={20} />} {MAX_CHARACTERS} characters maximum per dialogue
                        </span>
                      ) : (
                        ""
                      )}
                    </div>
                  );
                })}
              </div>
            </Card>
            <div className="flex flex-col w-full"></div>
          </section>

          <section className="flex flex-col w-1/2 gap-y-4">
            <Label className="text-2xl flex justify-center">Add dialogue</Label>
            <Card className="p-4 gap-y-6">
              <div className="flex flex-col gap-y-4">
                <Textarea className="max-h-60" placeholder="Type your new dialogue here" onChange={(e) => setNewDialogueField(e.target.value)} />
                <div className="flex w-full items-center justify-start gap-x-4 overflow-x-scroll scrollbar-none">
                  {people.map((person) => {
                    return (
                      <div className="" key={person.videoUrl} onClick={() => setNewCharacterField(person)}>
                        <PersonalizedAvatar isClicked={newCharacterField?.name === person.name} person={person} className="border-2 relative z-0" />
                      </div>
                    );
                  })}
                </div>
                <Button
                  variant="defaultNoBgDashed"
                  className="border bg-black border-dashed w-full"
                  onClick={() => {
                    addDialogue();
                  }}
                >
                  Add dialogue
                </Button>
                <div className="flex flex-col ">
                  {!isNewDialogueValid && newDialogueField?.length === 0 ? <span className="text-[#ffbf00]/95 text-sm p-0 m-0 flex gap-x-2">{<ExclamationTriangleIcon width={20} />}Type a dialogue</span> : ""}
                  {!isNewDialogueValid && !newCharacterField ? <span className="text-[#ffbf00] text-sm p-0 m-0 flex gap-x-2">{<ExclamationTriangleIcon width={20} />}Choose a character</span> : ""}
                </div>
              </div>
            </Card>
          </section>
        </div>
        {isFinalDialogueDataEmpty ? <span className="text-red-500/95 text-sm p-0 m-0 flex gap-x-2"> {<ExclamationTriangleIcon width={20} />} You must have at least 1 dialogue</span> : ""}
        {isNewDialogueTooLong ? (
          <span className="text-red-500/95 text-sm p-0 m-0 flex gap-x-2">
            {" "}
            {<ExclamationTriangleIcon width={20} />} Some dialogues exceed the {MAX_CHARACTERS} character threshold
          </span>
        ) : (
          ""
        )}
        {areDialoguesLimitReached ? <span className="text-red-500/95 text-sm p-0 m-0 flex gap-x-2"> {<ExclamationTriangleIcon width={20} />} You can only have up to 4 dialogues</span> : ""}
        <div className="flex w-full">
          <Button className="flex w-full" onClick={() => handleSubmit()}>
            Create
          </Button>
        </div>
      </div>
    </main>
  );

  function handleSubmit() {
    const isDialogueInvalid = dialogues.some((dialogue) => {
      return dialogue.dialogue.length >= MAX_CHARACTERS;
    });

    setIsNewDialogueTooLong(isDialogueInvalid);

    if (dialogues.length <= 0) {
      setIsFinalDialogueDataEmpty(true);
      return;
    }

    if (isDialogueInvalid) return;

    return;
    onSubmit(finalDialogueData);
  }

  function moveDialogueUp(dialogue: Dialogue) {
    const dialoguesCopy = [...dialogues];
    dialoguesCopy.splice(dialogue.dialogueNumber - 1, 1);
    dialoguesCopy.splice(dialogue.dialogueNumber - 2, 0, dialogue);

    const newDialogues = dialoguesCopy.map((dialogue, index) => {
      return { ...dialogue, dialogueNumber: index + 1 };
    });

    setDialogues(newDialogues);
  }

  function moveDialogueDown(dialogue: Dialogue) {
    const dialoguesCopy = [...dialogues];
    dialoguesCopy.splice(dialogue.dialogueNumber - 1, 1);
    dialoguesCopy.splice(dialogue.dialogueNumber, 0, dialogue);

    const newDialogues = dialoguesCopy.map((dialogue, index) => {
      return { ...dialogue, dialogueNumber: index + 1 };
    });

    setDialogues(newDialogues);
  }

  function addDialogue() {
    if (dialogues.length >= MAX_DIALOGUES) {
      setAreDialoguesLimitReached(true);
      return;
    }

    if (!newCharacterField || !newDialogueField) {
      setIsNewDialogueValid(false);
      return;
    }

    const person = people.find((char) => char.name === newCharacterField.name);

    const dialogue: Dialogue = {
      name: person!.name,
      dialogue: newDialogueField,
      dialogueNumber: dialogues.length + 1,
      voiceId: person?.voiceId,
      templateVideoUrl: person?.videoUrl,
    };

    const newDialogues = [...dialogues];
    newDialogues.push(dialogue);
    setDialogues(newDialogues);

    setNewCharacterField(undefined);
    setNewDialogueField(undefined);
  }

  function deleteDialogue(dialogue: Dialogue) {
    if (dialogues.length <= MAX_DIALOGUES) {
      setAreDialoguesLimitReached(false);
    }

    const newDialogues = [...dialogues];
    newDialogues.splice(dialogue.dialogueNumber - 1, 1);
    const sortedNewDialogues = newDialogues.map((dialogue, index) => {
      return { ...dialogue, dialogueNumber: index + 1 };
    });
    console.log("NEW DIALOGUES: ", sortedNewDialogues);
    setDialogues(sortedNewDialogues);
  }

  function editDialogue(text: string, index: number) {
    const newDialogues = [...dialogues];
    newDialogues[index].dialogue = text;
    setDialogues(newDialogues);
  }
}
