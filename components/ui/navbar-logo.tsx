"use client"

import Link from "next/link"
import Image from "next/image"

export default function NavLogo(){
  
  return (
    <Link href="/">
      <Image 
        src="/motion.svg" 
        alt="logo"
        width={100}
        height={70}
        className="dark:invert"
      />
  </Link>
  )
}