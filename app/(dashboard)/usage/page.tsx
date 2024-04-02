import { auth, signIn } from "@/auth"
import { redirect } from "next/navigation";
import { Suspense } from "react";

export default async function Usage(){

  const session = await auth();

  if(!session?.user){
    redirect("/");
  }

  return(
    <Suspense>
      <main>
        hello world
      </main>
    </Suspense>
  )

}