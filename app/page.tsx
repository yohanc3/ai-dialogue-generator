import { ThemeToggler } from "@/components/ui/ThemeToggler";
import ButtonLink from "@/components/ui/buttonLink";
import Image from "next/image";
import NavBar from "@/components/NavBar";
import { unstable_noStore as noStore } from "next/cache";
import HomeImage from "@/components/HomeImage";
import { auth, signIn } from "../auth";
import SignInOutButton from "@/components/ui/sign-out-button";


export default async function Home() {

  const session = await auth();

  console.log("SESSION RECEIVED AT HOME ORIGIN: ", session);

  return (
    <div className="w-full">
        <NavBar/>

       <main className="flex px-24 w-full items-center justify-center h-screen flex-col placeholder:w-full text-center space-y-20 pt-[5rem]">

        <div className="flex justify-center items-center flex-col space-y-6 pt-24">
          
          <h1 className="text-[32px] sm:text-5xl md:text-[54px] font-bold md:max-w-3xl md:px-6 text-pretty ">Create Lip-Synced Videos</h1>

          <h2 className="text-sm sm:text-xl text-neutral-500 max-w-xl text-balance dark:text-neutral-400">
            <p>Type a <span className="font-bold">prompt</span> and sit back.</p>
            <p>Accurate voices, faces, and lip movement — with <span className="font-bold">Motion</span>. </p>
          </h2>

          <div>
            {
              session ? 
              <ButtonLink className="bg-black text-white hover:bg-neutral-600 hover:text-white dark:bg-white dark:text-black dark:hover:opacity-80 rounded-lg" href="/home" > Get Started </ButtonLink>
              :
              <SignInOutButton signInOut={async () => {
                "use server";
                await signIn('google', {redirectTo: "/home"})
              }}
                className=" bg-black text-white hover:bg-neutral-600 hover:text-white dark:bg-white dark:text-black dark:hover:opacity-80 inline-flex items-center whitespace-nowrap rounded-md text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50 h-9 px-4 py-2">
                Get Started 
              </SignInOutButton>
            }

          </div>

        </div>

        <HomeImage/>

       </main>

      </div>
  )

}