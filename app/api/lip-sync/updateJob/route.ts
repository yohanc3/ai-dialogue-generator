
//ENDPOINT: "https://{url}/lip-sync/updateJob"

import { updateVideoStatus } from "@/app/lib/actions/actions";

export async function POST(req: Request){

  const res = await req.json();

  console.log(res);

  const { result } = res;

  try {

    const response = await updateVideoStatus(result.id, result.status, result.url);
  
    console.log("FINAL RESPONSE: ", result);
  
    return new Response(JSON.stringify(res));

  } catch (e) {
    console.log(e);
  }

} 