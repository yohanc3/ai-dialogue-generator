import { getVideoUrlById } from "@/app/lib/actions/data";
import { Button } from "@/components/ui/button";
import Image from "next/image";
import { signIn } from "@/auth";
import { auth } from "@/auth";
import Link from "next/link";
import { redirect } from "next/navigation";
import { unstable_noStore as no_store } from "next/cache";

export default async function SharedVideo({
  params,
}: {
  params: { id: string };
}) {
  no_store();

  const session = await auth();

  const videoData = await getVideoUrlById(params.id);
  const videoUrl = videoData[0].url;
  const videoDate = new Date(videoData[0].date).toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });

  return (
    <main className="flex w-screen h-screen flex-col">
      <div className="flex flex-col justify-center items-center w-full h-full">
        <div className="flex w-full justify-center items-center gap-x-4 pb-4">
          <Image src="/motion-white.svg" alt="Motion" width={200} height={40} />
        </div>
        <div className="w-1/2">
          <div className="w-full flex flex-col justify-center items-center border border-neutral-700 rounded-lg">
            <div className="w-full flex items-center justify-center border-b border-neutral-700 text-xl py-4">
              {videoData[0].title}
            </div>
            <>
              <video controls loop className="">
                <source src={videoUrl} />
              </video>
            </>
            <div className="flex w-full border-t border-neutral-700 justify-center items-center py-4">
              Created by {videoData[0].name} on {videoDate}
            </div>
          </div>
          <form
            action={async () => {
              "use server";
              if (session?.user) {
                redirect("/home");
              }
              await signIn("google", { redirectTo: "/home" });
            }}
          >
            <Button type="submit" className="w-full mt-2">
              {session?.user ? "Generate Videos" : "Get Started"}
            </Button>
          </form>
        </div>
      </div>
    </main>
  );
}
