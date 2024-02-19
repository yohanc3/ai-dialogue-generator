"use client"

import { link } from 'fs';
import { fetchVideos } from '../lib/data';

type Job = {
  url: string,
  id: string,
  userId: string,
  status: string
}

export default async function JobsGrid({jobs}: {jobs: Job[]}){

  const userId = 'c20a1304-da40-4211-91b3-59c01b195101';
  
  return(

    <section className='flex w-full border-white border-2'>
      <ul className='gap-x-8 gap-y-6'>
        {jobs.map(job => 

          <li key={job.id} className='border-white text-white text-2xl'>{job.url}</li>

        )}
      </ul>
    </section>

  );
   
}

