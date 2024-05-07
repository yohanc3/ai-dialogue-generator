import { getJobsByUserId } from "@/app/lib/actions/data";
import DialogueForm from "@/components/DialogueForm";
import JobsGrid from "@/components/JobsGrid";
import { Suspense } from "react";
import { auth } from "@/auth";
import { redirect } from "next/navigation";

export default async function Page() {
  const session = await auth();

  if (!session?.user || !session.user.id) {
    redirect("/");
  }

  let jobs = await getJobsByUserId(session.user.id);

  return (
    <Suspense>
      <main className="py-14 mt-2 px-[15rem] w-full flex flex-col gap-12">
        <div className="flex flex-col justify-center items-center gap-y-4">
          <h1 className="text-5xl font-semibold flex justify-center items-center text-center">
            <p>
              Generate fun & short dialogues with
              <span className="bg-gradient-to-r from-[#3b628f] to-[#6fd6d4] bg-clip-text text-transparent"> AI</span>
            </p>
          </h1>
          <h2 className="text-lg font-light text-neutral-500">Let AI build a fun dialogue for you</h2>

          <section className="flex flex-col w-full">
            <DialogueForm jobs={jobs} userId={session.user.id} />
            <JobsGrid jobs={jobs} />
          </section>
        </div>
      </main>
    </Suspense>
  );
}
