import { handleVideosCompletion } from "@/app/lib/actions/actions";


interface videosByJobId {
  id: string,
  userid: string,
  url: string | null,
  status: string,
  jobid: string,
  video_number: number
}

export async function POST(req: Request){

  try {
    const res = await req.json();

    const { result } = res;

    console.log("RESULT OF VIDEO HERE BRODA: ", result)

    // const r = handleVideosCompletion(result.id);

    return new Response(JSON.stringify(res));



  } catch(e){
    console.log(e)
    return new Response(JSON.stringify(e));
  }

}