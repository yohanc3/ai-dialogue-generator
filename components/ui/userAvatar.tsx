"use client"
import clsx from "clsx";
import type { Session } from "next-auth";
import Image from "next/image";
import { userAgent } from "next/server";
import { useEffect, useRef, useState } from "react";
import { ArrowRightStartOnRectangleIcon } from "@heroicons/react/24/outline";

export default function UserAvatar({session, signOut}: {session: Session | null, signOut: () => void}){

  const [isTabOpen, setIsTabOpen] = useState<boolean>(false);
  const divRef = useRef<HTMLDivElement>(null);
  const imageRef = useRef<HTMLDivElement>(null);

  const isLoggedIn = !!session;
  const avatarUrl = session && session.user?.image ? session.user.image : "https://gravatar.com/avatar/?d=mp"
  const {name, email, image} = session!.user!;

  useEffect(() => {

    const handleClickOutside = (event: Event) => {
      if (divRef.current && !divRef.current.contains(event.target as Node) && imageRef.current && !imageRef.current.contains(event.target as Node)) {
        console.log("clicked");
        setIsTabOpen(false);
      }
    };

    document.addEventListener("mousedown",handleClickOutside)

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [])

    return (
      <main>
        <div ref={imageRef}>
          <Image src={avatarUrl} alt="Avatar" 
            className="rounded-full cursor-pointer" width={30} height={30} 
            onClick={(() => setIsTabOpen(!isTabOpen))}
          />
        </div>
        <div className="flex justify-center items-center">

          <div ref={divRef} className= {clsx(`bg-white absolute rounded-sm top-[55px] right-5 space-y-2 border`, 
              {"hidden" : isTabOpen === false}
          )}>
            <section className=" w-full flex justify-center items-center gap-x-2 px-2 py-4 border-b-[1px] border-neutral-400/60">
              <Image src={avatarUrl} alt="Avatar" className="rounded-full" width={50} height={50} />
              <div className="flex flex-col justify-center items-start">
                <div className="text-black font-semibold">
                  {name}
                </div>
                <div className="text-black text-xs">
                  {email}
                </div>
              </div>
            </section>
            <section className="w-full flex items-center space-x-2 px-2 py-2 pb-4 ">
                <div className="flex items-center text-black font-light text-sm cursor-pointer gap-x-2" onClick={() => signOut()}>
                <ArrowRightStartOnRectangleIcon height={20} color="black" strokeWidth={1}/>
                <p>Logout</p>
                </div>
            </section>
        </div>
      </div>
      </main>

    )
}