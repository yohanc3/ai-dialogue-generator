import { ThemeToggler } from "./ui/theme-toggler";
import { auth, signIn } from "@/auth";
import NavLogo from "./ui/navbar-logo";
import NavLinks from "./ui/navbar-links";
import { Button } from "./ui/button";
import UserAvatar from "./ui/dropdown-avatar";

export default async function NavBar() {
  const session = await auth();

  return (
    <header className="sticky top-0 z-50 border-b-[1px] border-neutral-800 dark:bg-black/80 bg-white/80 backdrop-blur px-2 py-3">
      <nav className="w-full flex lg:px-5 justify-between">
        <div className=" flex items-center justify-between gap-x-6 text-neutral-500 dark:text-neutral-400">
          <NavLogo />
          <NavLinks />
          <ThemeToggler />
        </div>

        <div className="flex justify-center items-center gap-x-6 text-neutral-500 duration-200 dark:text-neutral-400 ">
          {session ? (
            <UserAvatar session={session} />
          ) : (
            <form
              action={async () => {
                "use server";
                await signIn("google", { redirectTo: "/home" });
              }}
            >
              <Button> Sign In </Button>
            </form>
          )}
        </div>
      </nav>
    </header>
  );
}
