import NavBar from "@/components/NavBar";

export default function Layout({children}: {children: React.ReactNode}){

  return (
    <div>
      <NavBar/>
      <div className="flex w-screen h-screen flex-row pb-[300rem]">
        {children}
      </div>
    </div>
  )

}