
import { getVideoUrlById } from "@/app/lib/actions/data";
import { Button } from "@/components/ui/button";
import VideoCard from "@/components/ui/videoCard";
import { useParams } from "next/navigation";
import Image from "next/image";
import ButtonLink from "@/components/ui/buttonLink";
import { signIn } from "@/auth";
import { auth } from "@/auth";
import SignInOutButton from "@/components/ui/sign-out-button";

export default async function SharedVideo({params}: {params: {id: string}}){

  const session = await auth();

  const videoData = await getVideoUrlById(params.id);
  const videoUrl = videoData[0].url;
  const videoDate = (new Date(videoData[0].date).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  }));

  console.log(videoData[0]);

  return (
    <main className="flex w-screen h-screen flex-col">
      <div className="flex flex-col justify-center items-center w-full h-full">
      <div className="flex w-full justify-center items-center gap-x-4 pb-4">
        <Image src="/motion-white.svg" alt="Motion" width={200} height={40}/>
      </div>
        <div className="w-1/2">
          <div className="w-full flex flex-col justify-center items-center border border-neutral-700 rounded-lg">
          <div className="w-full flex items-center justify-center border-b border-neutral-700 text-xl py-4">
            {videoData[0].title}
          </div>
          <div>
            <video controls loop className=""
              >
                <source src={videoUrl}/>
            </video> 
          </div>
          <div className="flex w-full border-t border-neutral-700 justify-center items-center py-4"> 
            Created by {videoData[0].name} on {videoDate}
          </div>
          </div>
          {
            session?.user ? <ButtonLink className="flex items-center justify-center w-full mt-4 cursor-pointer bg-black text-white hover:bg-neutral-600 hover:text-white dark:bg-white dark:text-black dark:hover:opacity-80 rounded-lg" href="/home">Generate videos</ButtonLink>
            : 
            <SignInOutButton signInOut={async () => {
              "use server";
              await signIn('google', {redirectTo: "/home"})
            }}
              className="flex items-center justify-center w-full mt-4 cursor-pointer bg-black text-white hover:bg-neutral-600 hover:text-white dark:bg-white dark:text-black dark:hover:opacity-80 rounded-lg py-2 text-md font-medium">
              Get started for free
            </SignInOutButton>
          }
        </div>
      </div>
      
    </main>

  )

}