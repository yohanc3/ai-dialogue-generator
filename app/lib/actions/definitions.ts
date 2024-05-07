import z, { ZodType } from "zod";

export interface User {
  name: string;
  email: string;
  image: string;
  id: string;
}

export const ZodUser = z.object({
  name: z.string(),
  email: z.string(),
  image: z.string(),
  id: z.string(),
}) satisfies ZodType<User>;

export interface Person {
  name: string;
  iconUrl: string;
  alt: string;
  videoUrl: string;
  voiceId: string;
  personality: string;
  slang: string[];
}

export type Character = {
  name: string;
  personality: string;
  slang: string[];
};

export interface PromptFormat {
  topic: string;
  characters: Character[];
}

export interface DialogueData {
  title: string;
  dialogues: Dialogues;
}

export interface Dialogue {
  dialogueNumber: number;
  voiceId: string | undefined;
  templateVideoUrl: string | undefined;
  name: string;
  dialogue: string;
}

export type Dialogues = Dialogue[];

type AIdialogue = {
  name: string;
  dialogue: string;
  dialogueNumber: number;
  voiceId?: string;
};

export interface RawDialogueResponse {
  title: string;
  dialogues: AIdialogue[];
}

export interface Video {
  id: string;
  userid: string;
  url: string | null;
  status: string;
  jobid: string;
  video_number: number;
}

export type Error = {
  message: string;
  problemCause: string;
  originalError: string;
};

export type Job = {
  url: string;
  id: string;
  userId: string;
  status: string;
  date: string;
  title: string;
};

export type RawJob = {
  url: string;
  id: string;
  userId: string;
  status: string;
  date: Date;
  title: string;
};

export type SafeJobs = Job[] | Error;
export type Jobs = Job[];
export type RawJobs = RawJob[];

export const FormSchema = z.object({
  prompt: z.string(),
});
