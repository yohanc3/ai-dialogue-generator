"use client"

import JobsGrid from "./JobsGrid";
import Form from "./Form";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
 
interface Job {
  url: string,
  id: string,
  localid: string,
  userId: string,
  status: string
}

type addPollingId = (id: string) => void;

export default function Dashboard({jobs}: {jobs: Job[]}){
  const userId = 'c20a1304-da40-4211-91b3-59c01b195101';
  const router = useRouter();
  const [pollingIds, setPollingIds] = useState<string[]>([]);
  const POLL_INTERVAL = 10000;

  function addPollingId(id: string){
    console.log("POLLING IDS AFTER NEW ONE ADDED: ", pollingIds);
    const newPollingIds = [...pollingIds, id];
    setPollingIds(newPollingIds);
  }

  useEffect(() => {

    let interval: NodeJS.Timeout;

    if(pollingIds.length){
      console.log("POLLING IDS LENGHT: ", pollingIds)
      interval = setInterval(() => {
        router.refresh();
        console.log("ROUTER REFRESHED");
      }, POLL_INTERVAL);

    } else {
      console.log("POLLING IDS IS 0, ", pollingIds);
    }

    return () => {
      clearInterval(interval);
    }

  }, [pollingIds, router])

  useEffect(() => {
    setPollingIds((cur) => {
      return cur.filter((id) => {
        return jobs.find(job => job.localid === id)?.status === 'PENDING';
      })
    })
    console.log("NEW POLLING IDS: ", pollingIds);
    console.log("JOBS: ", jobs)
  }, [jobs])

  return (
  <main className="flex min-h-screen flex-col items-center justify-between p-24 border">
    <Form addPollingId={addPollingId}/>
    <JobsGrid jobs={jobs}/>
  </main>


  );
}