"use client";

import Image from "next/image";
import { useTheme } from "next-themes";
import { useState, useEffect } from "react";

export default function HomeImage(){

  const { resolvedTheme } = useTheme();

  const [theme, setTheme] = useState("");

  useEffect(() => {
    setTheme(localStorage.theme);
  }, [resolvedTheme])

  return (
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
  )

}