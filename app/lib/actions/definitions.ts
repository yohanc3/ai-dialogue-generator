
import z from "zod";

export const userId = 'c20a1304-da40-4211-91b3-59c01b195101';

export type User = {
  id: string;
  name: string;
  email: string;
  password: string;
};

export interface person {
  name: string;
  iconUrl: string;
  alt: string;
  videoUrl: string;
  voiceId: string;
  personality: string;
  slang: string[];
}

export type character = {
  name: string,
  personality: string, 
  slang: string[]
}

export interface promptFormat {
  topic: string,
  characters: character[]
}

// {'title': --topic belongs here--,'dialogues':[{'name':--insert name here--, 'dialogue': --insert character\'s personality here--}, {'name':--insert name here--, 'dialogue': --insert character\'s personality here--}, ...]}

type AIdialogue = {
  name: string,
  dialogue: string
  dialogueNumber: number;
  voiceId? : string
}

export interface dialogueResponse {
  title: string;
  dialogues: AIdialogue[]
}

export interface Video {
  id: string,
  userid: string,
  url: string | null,
  status: string,
  jobid: string,
  video_number: number
}

export type Error = {
  message: string,
  problemCause: string
}

export type Job = {
  url: string,
  id: string,
  userId: string,
  status: string,
  date: string,
  title: string
}

export type RawJob = {
  url: string,
  id: string,
  userId: string,
  status: string,
  date: Date
  title: string
}

export type SafeJobs = Job[] | Error;
export type Jobs = Job[]
export type RawJobs = RawJob[];

export const FormSchema = z.object({
  prompt: z.string(),
})
