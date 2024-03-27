"use client"

import { ThemeToggler } from "@/components/ThemeToggler";
import ButtonLink from "@/components/ui/buttonLink";
import Image from "next/image";
import NavBar from "@/components/NavBar";
import { unstable_noStore as noStore } from "next/cache";
import { useTheme } from "next-themes";
import { useEffect, useState } from "react";

export default function Home() {

  const isSignedIn = true;
  const { resolvedTheme } = useTheme();

  const [theme, setTheme] = useState("");

  useEffect(() => {
    setTheme(localStorage.theme);
  }, [resolvedTheme])

  return (
      <div className="w-full">

       <main className="flex px-24 w-full items-center justify-center h-screen flex-col placeholder:w-full text-center space-y-20 pt-[5rem]">

        <div className="flex justify-center items-center flex-col space-y-6 pt-24">
          
          <h1 className="text-[32px] sm:text-5xl md:text-[54px] font-bold md:max-w-3xl md:px-6 text-pretty ">Create Lip-Synced Videos</h1>

          <h2 className="text-sm sm:text-xl text-neutral-500 max-w-xl text-balance dark:text-neutral-400">
            <p>Type a <span className="font-bold">prompt</span> and sit back.</p>
            <p>Accurate voices, faces, and lip movement — with <span className="font-bold">Motion</span>. </p>
          </h2>

          <div>
            <ButtonLink href={isSignedIn ? "/home" : "/login"}
              className=" bg-black text-white hover:bg-neutral-600 hover:text-white dark:bg-white dark:text-black dark:hover:opacity-80 py-6 px-8 rounded-lg">
              Get Started 
            </ButtonLink>
          </div>

        </div>

        <div className="max-w-6xl lg:px-8">
          <div className="rounded-xl bg-neutral-900/5 dark:bg-neutral-100/10 -m-2 ring-1 p-2 ring-inset ring-neutral-900/10 lg:-m-4 lg:rounded-2xl lg:p-4 ">
            <Image
              src={theme === "light" ? "/home.png" : theme === "dark" ? "/home:dark.png" : "/home:dark.png"}
              alt="home image"
              width={1000}
              height={636}
              quality={90}
              priority={true}
            />
          </div>
        </div>

       </main>

      </div>
  )

}