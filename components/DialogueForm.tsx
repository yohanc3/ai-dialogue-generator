"use client";

import Form from "./Form";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { SafeJobs } from "@/app/lib/actions/definitions";

type addPollingId = (id: string) => void;

export default function DialogueForm({ jobs, userId }: { jobs: SafeJobs; userId: string | undefined }) {
  const router = useRouter();
  const [pollingIds, setPollingIds] = useState<string[]>([]);
  const POLL_INTERVAL = 5000;

  if (!userId) {
    router.push("/");
  }

  function addPollingId(id: string) {
    const newPollingIds = [...pollingIds, id];
    setPollingIds(newPollingIds);
    console.log("POLLING IDS: ", newPollingIds);
  }

  useEffect(() => {
    let interval: NodeJS.Timeout;

    if (pollingIds.length) {
      interval = setInterval(() => {
        router.refresh();
      }, POLL_INTERVAL);
    }
    return () => {
      clearInterval(interval);
    };
  }, [pollingIds, router]);

  useEffect(() => {
    if (Array.isArray(jobs)) {
      setPollingIds((cur) => {
        return cur.filter((id) => {
          let foundJob = jobs.find((job) => job.id === id);
          return jobs.find((job) => job.id === id)?.status === "PENDING";
        });
      });
    }
  }, [jobs]);

  return <main className="flex flex-col justify-center w-full">{userId ? <Form addPollingId={addPollingId} userId={userId} /> : ""}</main>;
}
