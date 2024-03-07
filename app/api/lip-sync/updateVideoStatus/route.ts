import { updateVideoStatus, getJobIdByVideoId, getJobStatusById, updateJobStatus, handleVideosCompletion } from "@/app/lib/actions/actions";
import { generateDialogues } from "@/app/lib/actions/actions";

export async function POST(req: Request){

  try {
    const res = await req.json();

    const { result } = res;

    const statusUpdateResult = await updateVideoStatus(result.id, result.status, result.url);

    console.log("VIDEO STATUS UPDATE", statusUpdateResult)

    const jobId = await getJobIdByVideoId(result.id)

    const areJobVideosCompleted = await getJobStatusById(jobId);

    if(areJobVideosCompleted === "COMPLETED"){

      console.log("ALL VIDEOS ARE COMPLETED");

      handleVideosCompletion(jobId);
      
    }

    return new Response(JSON.stringify(statusUpdateResult));

  } catch(e){
    console.log(e)
  }

}