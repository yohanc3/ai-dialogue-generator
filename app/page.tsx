import NavBar from "@/components/NavBar";
import HomeImage from "@/components/HomeImage";
import { auth, signIn } from "../auth";
import { Button } from "@/components/ui/button";
import { redirect } from "next/navigation";

export default async function Home() {
  const session = await auth();

  console.log("SESSION RECEIVED AT HOME ORIGIN: ", session);

  return (
    <div className="w-full">
      <NavBar />

      <main className="flex px-24 w-full items-center justify-center flex-col placeholder:w-full text-center gap-y-14 ">
        <div className="flex justify-center items-center flex-col space-y-6 pt-16">
          <h1 className="text-[32px] sm:text-5xl md:text-[54px] font-bold md:max-w-3xl md:px-6 text-pretty ">Create Lip-Synced Videos</h1>

          <h2 className="text-sm sm:text-xl text-neutral-500 max-w-xl text-balance dark:text-neutral-400">
            <p>
              Type a <span className="font-bold">prompt</span> and sit back.
            </p>
            <p>
              Accurate voices, faces, and lip movement — with <span className="font-bold">Motion</span>.{" "}
            </p>
          </h2>

          <form
            action={async () => {
              "use server";
              if (session?.user) {
                redirect("/home");
              }
              await signIn("google", { redirectTo: "/home" });
            }}
          >
            <Button type="submit">Get started</Button>
          </form>
        </div>

        <HomeImage />
      </main>
    </div>
  );
}
