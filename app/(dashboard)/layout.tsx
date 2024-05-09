import NavBar from "@/components/NavBar";

export default function Layout({children}: {children: React.ReactNode}){

  return (
    <div>
      <NavBar/>
      <div className="flex w-screen h-auto flex-row pb-[5rem]">
        {children}
      </div>
    </div>
  )

}