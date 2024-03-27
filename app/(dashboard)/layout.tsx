import { Sidebar } from "@/components/Sidebar";
import { ThemeToggler } from "@/components/ThemeToggler"
import NavBar from "@/components/NavBar";


export default function Layout({children}: {children: React.ReactNode}){

  return (
    <div className="flex w-full h-screen flex-row pb-[300rem]">

      <div className="pl-6 w-full flex-grow"> {children} </div>
      
    </div>
  )

}