import { ThemeToggler } from "./ui/ThemeToggler";
import Image from "next/image";
import ButtonLink from "./ui/buttonLink";
import { auth, signOut, signIn } from "@/auth";
import SignInOutButton from "./ui/sign-out-button";
import { redirect } from 'next/navigation'
import UserAvatar from "./ui/userAvatar";
import { Session } from "inspector";
import NavLogo from "./ui/navLogo";

export default async function NavBar(){

  const session = await auth();

  return (

    <header className="sticky top-0 z-50 border-b-[1px] border-neutral-800 dark:bg-black/80 bg-white/80 backdrop-blur px-2 py-3">
      <nav className="w-full flex lg:px-5 justify-between">
          <div className=" flex items-center justify-between gap-x-6 text-neutral-500 dark:text-neutral-400">

            <NavLogo/>

              {
               session ?
                <a href="/usage" className="text-sm font-light dark:hover:text-white hover:text-neutral-900 duration-200">Usage</a> 
                : ""
              }
            <ThemeToggler/>

          </div>

          <div 
          className="flex justify-center items-center gap-x-6 text-neutral-500 duration-200 dark:text-neutral-400 ">
              
            {
              session ? 
              <UserAvatar session={session} signOut={async() => {
                "use server";
                await signOut({redirectTo: "/"});
              }}/>: 
              <SignInOutButton className="text-sm font-light dark:hover:text-white hover:text-neutral-900 duration-200" signInOut={async() => {
                "use server"
                await signIn('google');
              }}> Sign In </SignInOutButton>
            }
          </div>
      </nav>
    </header>

  );
}