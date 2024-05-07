import { onVideoCompletion } from "@/app/lib/actions/actions";
import { getJobIdByVideoId, getJobStatusById, updateVideoStatus } from "@/app/lib/actions/data";

export async function POST(req: Request) {
  try {
    const res = await req.json();

    const { result } = res;

    console.log("lip sync webhook result: ", result);

    const statusUpdateResult = await updateVideoStatus(result.id, result.status, result.videoUrl);

    console.log("video status update: ", statusUpdateResult);

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
