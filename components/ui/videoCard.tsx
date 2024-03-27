
"use client"

import { Job } from "@/app/lib/actions/definitions";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "./card";
import { Download, Forward, Dot , Ellipsis, X, Play, TrashIcon} from "lucide-react";
import clsx from "clsx";
import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { deleteVideo } from "@/app/lib/actions/data";

export default function VideoCard({job}: {job: Job}){

  const router = useRouter();

  const [isPlaying, setIsPlaying] = useState(false);
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

  function downloadVideo(url: string){

    try {
      fetch(url)
        .then((response) => response.blob())
        .then((blob) => {
          const url = window.URL.createObjectURL(blob);
          const a = document.createElement('a');
          a.href = url;
          a.download = "video.mp4";
          a.click();
          window.URL.revokeObjectURL(url);
        })
    }catch(e){
      console.log("ERROR AT DOWNLOADING VIDEO", e);
    }

  }

  function handleDeleteVideo(id: string){
    try {
      deleteVideo(id)
        .then((res) => {
          if(res === "SUCCESS"){
            router.refresh();
          }
        })
    } catch(e){
      console.log("ERROR AT DELETING JOB");
    }
  
  }


  return (

    <Card className="w-[calc(100% / 3)]]">
      <CardHeader className="p-4">
        <CardTitle className="flex items-center justify-center text-center text-xl"> {job.title} </CardTitle>
      </CardHeader>

      <section className="border-y dark:border-neutral-800 object-contain p-0 w-full relative cursor-pointer">
        <div className="w-full h-full flex items-center justify-center absolute z-0">
          {
            job.status === "COMPLETED" ?
              <Play color="#FFFFFF" className="z-10" fill="#FFFFFF" stroke="#FFFFFF"/>
            :
            job.status === "PENDING" ?
              <Ellipsis color="#ffbf00" className="z-10" />
            : 
              <X color="#d2222d" className="z-10"/>
          }
        </div>
        {
          job.status === "COMPLETED" ?
            <video loop className="object-contain opacity-70 dark:opacity-35 dark:hover:opacity-90 z-1 hover:opacity-90 duration-200 w-full"
              ref={videoRef}
              onMouseOver={() => playVideo()}
              onMouseLeave={() => pauseVideo()}
              >
                <source src={job.url}/>
            </video> 
          :
            <img src="/design.png" alt={ job.status === "PENDING" ? "pending..." : "job failed"} className="w-full "></img> 
        }
        
      </section>

      <section className="flex items-center justify-center h-16">
        <div className="flex flex-col w-9/12 items-start h-full justify-around py-2 pl-3"> 
          <p className="text-sm font-extralight">{job.date}</p>
          <div className="text-xs flex items-center p-0 font-extralight">
            <div 
            className={clsx(" w-2 h-2 rounded-full mr-1 ",
            { 
              "bg-[#238823]" : job.status === "COMPLETED",
              "bg-[#ffbf00]" : job.status === "PENDING",
              "bg-[#d2222d]" : job.status === "FAILED",
            },
            )}></div>
            {
              job.status === "COMPLETED" ? "Completed"
              : job.status === "PENDING" ? "Pending" :
              "Failed"
            }
          </div>
        </div>
        <div className="border-l dark:border-neutral-800 w-3/12 h-full flex">
          <div className="flex items-center justify-center w-full border-r dark:border-neutral-800 cursor-pointer" onClick={(e) => downloadVideo(job.url)}><Download size={20}/></div>
          <div className="flex flex-col items-center justify-center w-full h-full">
            <div className="flex items-center justify-center border-b dark:border-neutral-800 w-full h-1/2 cursor-pointer" onClick={(e) => {
              router.push(`/${job.id}`)
            }}><Forward size={18}/></div>
            <div className="flex items-center justify-center w-full h-1/2 cursor-pointer" onClick={(e) => handleDeleteVideo(job.id)}><TrashIcon size={16}/></div>
          </div>
        </div>
      </section>

    </Card>

  )
}