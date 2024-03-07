"use client"

import { useState } from "react";
import { useFormState, useFormStatus } from "react-dom"
import { handleJobCreation, createVideo } from "../lib/actions/actions";
import { customAlphabet } from "nanoid";

type addPollingId = (id: string) => void;

export default function Form({addPollingId}: {addPollingId: addPollingId}){

  const [localId, setLocalId] = useState(generateId());

  const submitFormWithJobId = handleJobCreation.bind(null, localId)

  function generateId(){
    const alphabet = '0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz';
    const nanoid = customAlphabet(alphabet, 16);
    return nanoid();
  }

  function handleAddPollingId(){
    console.log("LOCALID: asdasdasd ", localId)
    addPollingId(localId);
    setLocalId(generateId());
  }

  return (
    <form action={submitFormWithJobId}>
      <label htmlFor="prompt">
        Text
      </label>
      <input type="text" id="text" placeholder="Customized text"
      className="block text-black mt-4" name="prompt"
      />
      <button type="submit" className="bg-indigo-600 text-white mt-4 p-2" onClick={(e) => {
        handleAddPollingId();
      }}>
        Send
      </button>
    </form>
  )
}