"use client";

import { usePathname } from "next/navigation";
import clsx from "clsx";

export default function NavLinks({session}: {session: boolean}){

  const pathname = usePathname();


  return (

    <div className="flex gap-x-4">

      <a href="/" className={clsx("text-sm font-light dark:hover:text-white hover:text-neutral-900 duration-200", 
        {"text-white" : pathname === "/"}
      )}>Intro</a> 
          <a href="/usage" className={clsx("text-sm font-light dark:hover:text-white hover:text-neutral-900 duration-200", 
          {"text-white" : pathname === "/usage"}
        )}>Usage</a> 
      {
        session ?
          <a href="/home" className={clsx("text-sm font-light dark:hover:text-white hover:text-neutral-900 duration-200", 
          {"text-white" : pathname === "/home"}
        )}>Home</a> 
          : ""
      }
    </div>


  
  )

}