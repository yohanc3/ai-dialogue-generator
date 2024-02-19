import {updateJob } from "@/app/lib/actions/actions";
import { fetchVideos } from "@/app/lib/data";

export async function POST(req: Request){

  const res = await req.json();

  console.log(res);

  const {result} = res;

  // const videos = await fetchVideos("c20a1304-da40-4211-91b3-59c01b195101");

  // if(!videos) return new Response(JSON.stringify({"error": "videos [] is empty"}));

  // console.log(videos);
  // console.log(videos.length)
  // console.log("is videos empty: ", !Boolean(videos.length));

  // // console.log(result);
  // // console.log(result.url);
  // // console.log(result.id);

  try {

    const response = await updateJob(result.id, result.status, result.url);
  
    // // console.log(response);
  
    return new Response(JSON.stringify(result));

  } catch (e) {
    console.log(e);
  }

} 