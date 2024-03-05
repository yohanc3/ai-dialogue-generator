import postgres from "postgres";
import { unstable_noStore as noStore } from "next/cache";

const userId = 'c20a1304-da40-4211-91b3-59c01b195101';

interface Job {
  url: string,
  id: string,
  jobid: string,
  userId: string,
  status: string
}

const postgresSql = () => {
    return postgres(process.env.DATABASE_URL!, {ssl: 'require'})
}

export async function fetchVideos(userId: string){
  noStore();
  const sql = postgresSql();

  try {

    const jobs = await sql<Job[]>`
      SELECT jobid, url, status, userId
      FROM jobs
      WHERE userId = ${userId}
    `;
    return jobs;

  } catch(e){
    console.log(e);
    console.log("ERROR AT PULLING VIDEOS");
  }

}

export async function fetchVideosByStatus(userId: string, status: string){
  noStore();

  const sql = postgresSql();

  const result = await sql`
    SELECT 
  `;
}