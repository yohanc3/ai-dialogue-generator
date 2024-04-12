import { onVideoCompletion } from "@/app/lib/actions/actions";
import { getJobIdByVideoId, getJobStatusById, updateVideoStatus } from "@/app/lib/actions/data";

export async function POST(req: Request) {
  try {
    const res = await req.json();

    const { result } = res;

    console.log("GOT RESULT IN LIP SYNC WEBHOOK", result);

    const statusUpdateResult = await updateVideoStatus(result.id, result.status, result.url);

    console.log("VIDEO STATUS UPDATE", statusUpdateResult);

    const jobId = await getJobIdByVideoId(result.id);

    const jobStatus = await getJobStatusById(jobId);

    if (jobStatus === "COMPLETED") {
      console.log("ALL VIDEOS ARE COMPLETED");

      onVideoCompletion(jobId);
    }

    return new Response(JSON.stringify(statusUpdateResult));
  } catch (e) {
    console.log(e);
  }
}
