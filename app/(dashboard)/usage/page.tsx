import { getDailyCreatedVideosCount } from "@/app/lib/actions/data";
import { auth, signIn } from "@/auth";
import { Button } from "@/components/ui/button";
import { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Usage",
  description: "App usage"
}

export default async function Usage() {
  const session = await auth();

  const dailyCreatedVideos = await getDailyCreatedVideosCount();

  return (
    <main className="flex flex-col gap-y-8 w-screen h-screen -mt-[5rem] items-center justify-center">
      {dailyCreatedVideos && dailyCreatedVideos < 20 ? (
        <h1 className=" text-8xl font-semibold flex justify-center items-center flex-col">
          <div>
            <span className="bg-gradient-to-r from-[#3b628f] to-[#6fd6d4] bg-clip-text text-transparent">{20 - dailyCreatedVideos}</span> video slots left
          </div>
          <p className="font-light text-lg">Only 20 videos can be created per day due to the pre-launch.</p>
        </h1>
      ) : (
        <div className="flex items-center justify-center flex-col gap-y-8">
          <span className="font-semibold text-6xl">Max amount of daily created videos reached</span>
          <span className="font-light text-5xl">Come back tomorrow!</span>
        </div>
      )}
      <div>
        {dailyCreatedVideos &&
          (session?.user ? (
            <Link href="/home">
              <Button>Generate videos</Button>
            </Link>
          ) : (
            <form
              action={async () => {
                "use server";
                await signIn("google");
              }}
            >
              <Button type="submit" className=" px-3 flex items-center justify-center w-[20rem] cursor-pointer bg-black text-white hover:bg-neutral-600 hover:text-white dark:bg-white dark:text-black dark:hover:opacity-80 rounded-lg py-2 text-md font-medium">
                Get started for free
              </Button>
            </form>
          ))}
      </div>
    </main>
  );
}
