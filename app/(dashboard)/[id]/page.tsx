"use client"

import VideoCard from "@/components/ui/videoCard";
import { useParams } from "next/navigation";

export default function SharedVideo(){

  const params = useParams<{id: string}>();

  return (

    <main>
      ID: {params.id}
    </main>

  )

}