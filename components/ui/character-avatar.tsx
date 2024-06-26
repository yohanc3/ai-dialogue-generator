"use client";

import Image from "next/image";
import css from "styled-jsx/css";
import clsx from "clsx";
import { Job, Person } from "@/app/lib/actions/definitions";
import { useState } from "react";
import { Character } from "@/app/lib/actions/definitions";

export default function PersonalizedAvatar({ person, isClicked, className }: { person: Person; isClicked: boolean; className?: string }) {
  return (
    <div className={clsx("flex flex-col items-start border hover:border-black dark:hover:border-white duration-300 rounded-lg cursor-pointer active:scale-95", { "border-black dark:border-white": isClicked }, { "border-neutral-200 dark:border-neutral-800": !isClicked })}>
      <div className="h-[8rem] relative w-[8rem]">
        <Image src={person.iconUrl} alt={person.alt} fill={true} style={{ objectFit: "cover" }} className="rounded-lg" quality={100} />
      </div>
      <div className="pl-2 py-1 text-neutral-600 dark:text-neutral-400 text-sm font-light">{person.name}</div>
    </div>
  );
}
