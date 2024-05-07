import { getVideosByJobId, updateJobStatus } from "@/app/lib/actions/data";
import { concatenateVideosByUrls } from "@/app/lib/actions/video-edition";

export async function POST(req: Request) {
  const res = await req.json();

  console.log(res);

  try {
    const jobId = res.id;

    const videosData = await getVideosByJobId(jobId);

    if (!videosData) {
      throw new Error("Error at pulling videos by job id");
    }

    const videosUrls = videosData
      .sort((a, b) => a.video_number - b.video_number)
      .map((videoData) => {
        return videoData.url;
      });

    const videosUrlsContainsNulls = videosUrls.every((url) => typeof url === "string");

    if (videosUrlsContainsNulls) {
      return new Response(JSON.stringify("VIDEO URL CONTAINED A NULL"));
    }

    const concatenatedVideoUrl = await concatenateVideosByUrls(videosUrls);

    if (!concatenatedVideoUrl) {
      throw new Error("Error at concatenating videos");
    }

    console.log("VIDEOS URLS", videosUrls);

    const updatedJobs = await updateJobStatus(jobId, "COMPLETED", concatenatedVideoUrl);
    console.log(updatedJobs);

    return new Response(JSON.stringify(concatenatedVideoUrl));
  } catch (e) {
    console.log(e);
    return new Response(JSON.stringify(e));
  }
}
