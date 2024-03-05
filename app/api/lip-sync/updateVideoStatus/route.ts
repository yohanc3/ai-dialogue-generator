import { updateVideoStatus, getJobsById } from "@/app/lib/actions/actions";
import { tryOpenAi } from "@/app/lib/actions/actions";

export async function POST(req: Request){

  try {
    const res = await req.json();

    const prompt = res.prompt;

    console.log(prompt)

    const response = await tryOpenAi(prompt)

    const dialogues = response.choices[0].message.content

    // const response = await updateVideoStatus(res.id, res.status, res.url)

    // const jobs = getJobsById(res.id);

    return new Response(JSON.stringify({aiResponse: response}))
  } catch(e){
    console.log(e)
  }

 

}