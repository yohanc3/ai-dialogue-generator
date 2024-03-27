import { getJobsByUserId } from '@/app/lib/actions/data';
import { SafeJobs } from '@/app/lib/actions/definitions';
import {unstable_noStore as noStore} from "next/cache";
import VideoCard from './ui/videoCard';


export default async function JobsGrid({jobs}: {jobs: SafeJobs}){

  noStore();

  const userId = 'c20a1304-da40-4211-91b3-59c01b195101';
  console.log("RECEIVED JOBS: ", jobs);
  const isArray = Array.isArray(jobs);

  const jobsLength = Array.isArray(jobs) ? jobs.length : null;

  console.log("JOBS LENGTH: ", jobsLength)

  return(

    <main className='w-full flex flex-col items-center justify-center pt-6 gap-y-6'>

    <div className=''>
      <h1 className='text-5xl font-semibold flex justify-center items-center text-center mb-2'>
        Videos
      </h1>
    </div>

      <section className='grid grid-cols-3 w-full gap-12 place-items-center'>
        {
          jobsLength === 0 ? 
            <div> No jobs have been created yet </div> 
          : isArray ? 
              jobs.map((job) => {
                return <VideoCard job={job} key={job.id}/>
              }) 
          : <div>Error, message: {jobs.message}</div>
        }
      </section>
     
    </main>

  );
   
}

