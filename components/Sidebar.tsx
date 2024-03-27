"use client"

import { cn } from "@/app/lib/utils"
import { Button} from "./ui/button"
import ButtonLink from "./ui/buttonLink"
import { ThemeToggler } from "@/components/ThemeToggler"
import Image from "next/image"
import {
  HomeIcon,
  PlusIcon,
  PlayIcon,
  ChartPieIcon
} from "@heroicons/react/24/outline"
import Link from "next/link"
import clsx from "clsx"
import { usePathname } from "next/navigation"

const links = [

  {name: 'Home', icon: HomeIcon, href: "/home"},
  {name: 'Videos', icon: PlayIcon, href: "/videos"},
  {name: 'Usage', icon: ChartPieIcon, href: "/usage"}
  // {name: 'Create', icon: PlusIcon, href: "/create"},

]

export function Sidebar() {

  const pathname = usePathname();

  return (
    <div className={cn("pb-12 divide-x-2")}>
      
      <div className="space-y-4 py-4">
        <div className="px-3 py-2">

          <div className=" w-full pb-8 flex items-center justify-center ">
            <Image
              src="/motion-white.svg"
              width={200}
              height={50}
              className="hidden md:block "
              alt="Motion Logo"
            />
          </div>

          <div className="space-y-6 text-white">
           <>
              {

                links.map((link) => {

                  const LinkIcon = link.icon;
                  return (
                    <ButtonLink 
                    key={link.name}
                    href={link.href}
                    className={clsx("w-full justify-start",
                    {"bg-white text-black" : pathname === link.href})}>

                      <LinkIcon className="h-4 w-4 mr-2"/>
                      {link.name}

                    </ButtonLink>
                  )
                })

              }
              
              {/* <ButtonLink href="/dashboard" className="w-full justify-start">
                <HomeIcon className="h-4 w-4 mr-2"/>
                Home
              </  ButtonLink>
              <ButtonLink href="/create" className="w-full justify-start">
                <PlusIcon className="h-4 w-4 mr-2"/>
                Create
              </ButtonLink>
              <ButtonLink href="/videos" className="w-full justify-start">
                <PlayIcon className="h-4 w-4 mr-2"/>
                Videos
              </ButtonLink>
              <ButtonLink href="/usage" className="w-full justify-start">
                <ChartPieIcon className="h-4 w-4 mr-2"/>
                Usage
              </ButtonLink> */}
            </>
          </div>

        </div>
      </div>
    </div>
  )
}