"use client";

import { Job } from "@/app/lib/actions/definitions";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "./card";
import { Download, Forward, Dot, Ellipsis, X, Play, TrashIcon } from "lucide-react";
import clsx from "clsx";
import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { deleteVideo } from "@/app/lib/actions/data";
import toast, { Toaster } from "react-hot-toast";
import DeleteVideoModal from "./delete-video-modal";
import VideoLinkModal from "./video-link-modal";
import Image from "next/image";

export default function VideoCard({ job }: { job: Job }) {
  const router = useRouter();

  function deleteVideoToast() {
    toast.promise(
      handleDeleteVideo(),
      {
        loading: "Loading...",
        success: "Video successfully deleted",
        error: "Error when deleting video",
      },
      {
        success: {
          duration: 3000,
        },
        position: "bottom-center",
      }
    );
  }

  function downloadVideoToast() {
    toast("Downloading video...", {
      duration: 600,
      position: "bottom-center",
    });
    downloadVideo();
  }

  async function copyVideoLink() {
    const link = `http://localhost:3000/shared/${job.id}`;

    try {
      await navigator.clipboard.writeText(link);
    } catch (e) {
      throw new Error(`${e}`);
    }
  }

  function copyLinkToast() {
    toast.promise(
      copyVideoLink(),
      {
        loading: "Loading...⏳",
        success: "Url copied to clipboard 📋",
        error: "Error when copying url",
      },
      {
        success: {
          duration: 3000,
        },
        position: "bottom-center",
      }
    );
  }

  const [isPlaying, setIsPlaying] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState<boolean>(false);
  const [isShareModalOpen, setIsShareModalOpen] = useState<boolean>(false);
  const videoRef = useRef<any>(null);

  function playVideo() {
    const nextIsPlaying = true;
    setIsPlaying(nextIsPlaying);

    if (nextIsPlaying) {
      videoRef.current.play();
    }
  }

  function pauseVideo() {
    const nextIsPlaying = false;
    setIsPlaying(nextIsPlaying);
    videoRef.current.pause();
  }

  function downloadVideo() {
    const url = job.url;

    try {
      fetch(url)
        .then((response) => response.blob())
        .then((blob) => {
          const url = window.URL.createObjectURL(blob);
          const a = document.createElement("a");
          a.href = url;
          a.download = "video.mp4";
          a.click();
          window.URL.revokeObjectURL(url);
        })
        .then((res) => res);
    } catch (e) {
    }
  }

  async function handleDeleteVideo(): Promise<Error | "success"> {
    setIsDeleteModalOpen(false);
    try {
      const deleteQuery = await deleteVideo(job.id);
      if (deleteQuery !== "SUCCESS") {
        throw new Error("Error when deleting job");
      }

      router.refresh();
      return "success";
    } catch (e) {
      throw new Error(`${e}`);
    }
  }

  return (
    <Card className="w-[calc(100% / 3)]]">
      <DeleteVideoModal isOpen={isDeleteModalOpen} setIsOpen={setIsDeleteModalOpen} onSubmit={deleteVideoToast} />
      <VideoLinkModal isOpen={isShareModalOpen} setIsOpen={setIsShareModalOpen} onSubmit={copyLinkToast} />

      <CardHeader className="p-4">
        <CardTitle className="flex items-center justify-center text-center text-xl"> {job.title} </CardTitle>
      </CardHeader>

      <section className="border-y dark:border-neutral-800 object-contain p-0 w-full relative cursor-pointer">
        <div className="w-full h-full flex items-center justify-center absolute z-0">{job.status === "COMPLETED" ? <Play color="#FFFFFF" className="z-10" fill="#FFFFFF" stroke="#FFFFFF" /> : job.status === "PENDING" ? <Ellipsis color="#ffbf00" className="z-10" /> : <X color="#d2222d" className="z-10" />}</div>
        {job.status === "COMPLETED" ? (
          <video loop className="object-contain opacity-70 dark:opacity-35 dark:hover:opacity-90 z-1 hover:opacity-90 duration-200 w-full" ref={videoRef} onMouseOver={() => playVideo()} onMouseLeave={() => pauseVideo()}>
            <source src={job.url} />
          </video>
        ) : (
          <img src="/design.png" alt={job.status === "PENDING" ? "pending..." : "job failed"} className="w-full "></img>
        )}
      </section>

      <section className="flex items-center justify-center h-16">
        <div className="flex flex-col w-9/12 items-start h-full justify-around py-2 pl-3">
          <p className="text-sm font-extralight">{job.date}</p>
          <div className="text-xs flex items-center p-0 font-extralight">
            <div
              className={clsx(" w-2 h-2 rounded-full mr-1 ", {
                "bg-[#238823]": job.status === "COMPLETED",
                "bg-[#ffbf00]": job.status === "PENDING",
                "bg-[#d2222d]": job.status === "FAILED",
              })}
            ></div>
            {job.status === "COMPLETED" ? "Completed" : job.status === "PENDING" ? "Pending" : "Failed"}
          </div>
        </div>
        <div className="border-l dark:border-neutral-800 w-3/12 h-full flex">
          <div className="flex items-center justify-center w-full border-r dark:border-neutral-800 cursor-pointer active:scale-90 duration-150 " onClick={(e) => downloadVideoToast()}>
            <Download size={20} />
          </div>

          <div className="flex flex-col items-center justify-center w-full h-full">
            <div className=" active:scale-90 duration-150  flex items-center justify-center border-b dark:border-neutral-800 w-full h-1/2 cursor-pointer" onClick={(e) => setIsShareModalOpen(true)}>
              <Forward size={18} />
            </div>
            <div className="active:scale-90 duration-150 flex items-center justify-center w-full h-1/2 cursor-pointer" onClick={(e) => setIsDeleteModalOpen(true)}>
              <TrashIcon size={16} />
            </div>
          </div>
        </div>
      </section>
      <Toaster />
    </Card>
  );
}
