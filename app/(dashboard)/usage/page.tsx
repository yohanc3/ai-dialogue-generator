import { getDailyCreatedVideosCount, getUserDailyCreatedVideos } from "@/app/lib/actions/data";
import { auth, signIn } from "@/auth"
import { Suspense } from "react";
import { unstable_noStore as noStore } from "next/cache";
import { redirect } from "next/navigation";
import SignInOutButton from "@/components/ui/sign-out-button";
import ButtonLink from "@/components/ui/buttonLink";

export default async function Usage(){

  noStore();

  const session = await auth();

  let userDailyCreatedVideos: string | number = "You must be logged in to find how many videos you've created today."

  const dailyCreatedVideos = await getDailyCreatedVideosCount();

  if(session?.user?.id){
    userDailyCreatedVideos = await getUserDailyCreatedVideos(session?.user?.id);
  }

  console.log("DAILY CREATED VIDEOS: ", dailyCreatedVideos)

  return(
    <Suspense>
      <main className="flex w-screen h-screen items-center justify-center text-md font-md ">
        <section className="flex flex-col items-center justify-center gap-y-8 ">
          <div className="flex flex-col items-center w-full">
            { dailyCreatedVideos ? 
                (dailyCreatedVideos < 20) ? <h1 className="text-6xl font-semibold">            
                <span className="bg-gradient-to-r from-[#3b628f] to-[#6fd6d4] bg-clip-text text-transparent">
                  {20 - dailyCreatedVideos}  
                </span>  video slots left</h1>
                : <div className="flex items-center justify-center flex-col">
                    <span className="font-semibold text-5xl text-[#ffbf00]">Max amount of daily created videos reached</span>
                    <span className="font-semibold text-5xl text-[#ffbf00]">Come back tomorrow!</span>
                  </div>
              : <span className="font-normal text-xl text-red-500">Error at retrieving today's created videos, try again later.</span>
            }
          </div>
          <div>
            <p className="font-normal text-xl">Only 20 videos can be created per day due to the pre-launch</p>
          </div>
          <div>
          {
            session?.user ? <ButtonLink className="flex items-center justify-center w-full mt-4 cursor-pointer bg-black text-white hover:bg-neutral-600 hover:text-white dark:bg-white dark:text-black dark:hover:opacity-80 rounded-lg" href="/home">Generate videos</ButtonLink>
            : 
            <SignInOutButton signInOut={async () => {
              "use server";
              await signIn('google', { redirectTo: "/home" })
            }}
              className=" px-3 flex items-center justify-center w-full mt-4 cursor-pointer bg-black text-white hover:bg-neutral-600 hover:text-white dark:bg-white dark:text-black dark:hover:opacity-80 rounded-lg py-2 text-md font-medium">
              Get started for free
            </SignInOutButton>
          }
          </div>
        </section>
      </main>
    </Suspense>
  )

}