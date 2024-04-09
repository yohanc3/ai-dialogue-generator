"use client"

import { Session } from "next-auth"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { signIn } from "@/auth"
import SignInOutButton from "./sign-out-button"

export default function ButtonLink({children, href, className}: {children: React.ReactNode, href: string, className?: string}){

  return (
      <Link href={href} className={`${className ?? className} inline-flex items-center whitespace-nowrap rounded-md text-md font-medium transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50 h-9 px-4 py-2 hover:bg-white hover:text-black`}>
        {children}
      </Link>
  )

}