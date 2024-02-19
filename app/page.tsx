import { unstable_noStore as noStore } from "next/cache";
import { fetchVideos } from "./lib/data";
import Dashboard from "./ui/Dashboard";
import { Suspense } from "react";

interface Job {
  url: string,
  id: string,
  localid: string,
  userId: string,
  status: string
}

export default async function Home() {
  noStore();

  const userId = 'c20a1304-da40-4211-91b3-59c01b195101';
  const jobs = await fetchVideos(userId);

  console.log("PULLED JOBS: ", jobs);

  if(!jobs){
    console.log("NO JOBS WERE PULLED")
    return;
  }

  return (
    <Suspense fallback={"Loading..."}>
      <Dashboard jobs={jobs}/>
    </Suspense>
  );
}
