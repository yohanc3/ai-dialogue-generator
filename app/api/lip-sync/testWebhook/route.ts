import { concatenateVideosByUrls, getJobIdByVideoId, getJobStatusById, handleVideosCompletion, storeVideoName, updateJobStatus} from "@/app/lib/actions/actions";
import { getVideosByJobId } from "@/app/lib/actions/actions";

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

    const r = handleVideosCompletion(result.id);

    return new Response(JSON.stringify(result));



  } catch(e){
    console.log(e)
    return new Response(JSON.stringify(e));
  }

}