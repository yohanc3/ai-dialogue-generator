import { ThemeToggler } from "./ThemeToggler";
import Image from "next/image";
import ButtonLink from "./ui/buttonLink";

export default function NavBar(){

  const isLoggedIn = false;

  return (

    <header className="sticky top-0 z-50 border-b-[1px] border-neutral-800 dark:bg-black/80 bg-white/80 backdrop-blur px-2 py-3">
      <nav className="w-full flex lg:px-5 justify-between">
          <div className=" flex items-center justify-between gap-x-6 text-neutral-500 dark:text-neutral-400">
            <Image 
              src="/motion.svg" 
              alt="logo"
              width={100}
              height={70}
              className="dark:invert"
              />
            <a 
              href={isLoggedIn ? "/home" : "/login"}
              className="text-sm font-light dark:hover:text-white hover:text-neutral-900 duration-200"
              >{isLoggedIn ? "Home" : "Log in"}
            </a>
            <a href="/usage" className="text-sm font-light dark:hover:text-white hover:text-neutral-900 duration-200">Usage</a>
          </div>

          <div 
          className="flex justify-center items-center gap-x-6 text-neutral-500 duration-200 dark:text-neutral-400 ">

            <ThemeToggler/>
          </div>
      </nav>
    </header>

  );
}