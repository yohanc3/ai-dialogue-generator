"use server";

import { unstable_noStore as noStore } from "next/cache";
import { S3Client } from "@aws-sdk/client-s3";
import { Upload } from "@aws-sdk/lib-storage";
import postgresSql from "@/app/lib/db/db";
import { Jobs, Video, Error as ErrorType, RawJobs } from "./definitions";
import { milisecondsToTime } from "./actions";

export async function getDailyCreatedVideosCount() {
  const sql = postgresSql();

  try {
    const videos = await sql`
    SELECT * FROM jobs;
    `;
    return videos.length;
  } catch (e) {
    console.log("error when returning viedos from db");
  }
}

export async function getUserDailyCreatedVideos(userId: string) {
  const sql = postgresSql();

  const videosDates = await sql`
    SELECT date FROM jobs
    WHERE userid = ${userId};
  `;
  const todayToDateString = new Date().toLocaleDateString();

  const todayCreatedVideos = videosDates
    .map((video) => {
      const transformedDate = new Date(video.date).toLocaleDateString();
      return transformedDate;
    })
    .reduce((prev, dateToDateString) => {
      if (dateToDateString === todayToDateString) {
        return prev + 1;
      }
      return prev;
    }, 0);

  return todayCreatedVideos;
}

export async function getVideoUrlById(id: string) {
  const sql = postgresSql();
  const url = await sql`
    SELECT jobs.url, jobs.title, jobs.date, users.name
    FROM jobs, users
    WHERE jobs.userid = users.id
  `;

  return url;
}

export async function findUserIdByEmail(email: string) {
  const sql = postgresSql();

  try {
    const userId = await sql`
      SELECT id FROM users
      WHERE email = ${email};
    `;

    return userId;
  } catch (e) {
    console.log(e);
    throw new Error(`${e}`);
  }
}

export async function deleteVideo(id: string) {
  if (process.env.DEVELOPMENT_STAGE === "true") {
    console.log("development stage");
    return;
  }

  const sql = postgresSql();

  try {
    const queryResult = await sql`
      DELETE FROM jobs 
      WHERE id = ${id}
    `;

    return "SUCCESS";
  } catch (e) {
    console.log(e);
    return "ERROR";
  }
}

export async function fetchVideos(userId: string) {
  noStore();
  const sql = postgresSql();

  try {
    const jobs = await sql<Jobs>`
      SELECT id, url, status, userId
      FROM jobs
      WHERE userId = ${userId}
    `;
    return jobs;
  } catch (e) {
    console.log(e);
    console.log("ERROR AT PULLING VIDEOS");
  }
}

export async function fetchJobsByStatus(userId: string, status: string) {
  noStore();

  const sql = postgresSql();

  try {
    const result = await sql`
    SELECT * FROM jobs
    WHERE userId = ${userId}, status = ${status}
  `;

    return result;
  } catch (e) {
    console.log(e);
  }
}

export async function storeJob(jobId: string, userId: string, title: string, status: string) {
  const sql = postgresSql();

  try {
    const response = sql`
    INSERT into jobs(id, userId, title, status, date)
    VALUES(${jobId}, ${userId}, ${title}, ${status}, ${new Date(Date.now())})
    `;
    return response;
  } catch (e) {
    console.log("ERROR AT SAVING JOB");
    return e;
  }
}

export async function storeAudioName(id: string, userId: string, url: string) {
  const sql = postgresSql();

  try {
    const result = await sql`
      INSERT INTO audios (id, userId, url) VALUES (${id}, ${userId}, ${url})
    `;
  } catch (e) {
    console.log(e);
    return e;
  }
}

export async function updateVideoStatus(videoId: string, status: string, url: string) {
  console.log("\njobId: ", videoId);
  console.log("status: ", status);
  console.log("url: ", url, "\n");

  const sql = postgresSql();

  try {
    const result = await sql`
    UPDATE videos 
    SET 
      status = ${status}, 
      url = ${url}
    WHERE id = ${videoId}
    `;

    return result;
  } catch (e) {
    console.log(e);
  }
}

export async function updateJobStatus(jobId: string, status: string, url: string) {
  const sql = postgresSql();

  try {
    const queryResult = sql`
    
      UPDATE jobs 
      SET status = ${status}, url = ${url}
      WHERE id = ${jobId}

    `;

    return queryResult;
  } catch (e) {}
}

export async function uploadFileToS3(bucketName: string, keyName: string, Body: ReadableStream) {
  noStore();

  const awsAccessKey = process.env.AWS_ACCESS_S3_KEY;
  const secretAccessKey = process.env.AWS_SECRET_S3_KEY;
  const awsRegion = process.env.AWS_S3_REGION;

  const client = new S3Client({
    credentials: {
      accessKeyId: awsAccessKey!,
      secretAccessKey: secretAccessKey!,
    },
    region: awsRegion,
  });

  try {
    const Bucket = bucketName;
    const Key = keyName;

    const parallelUploads3 = new Upload({
      client,
      params: {
        Bucket,
        Key,
        Body,
      },
      queueSize: 4,
      partSize: 1024 * 1024 * 5,
      leavePartsOnError: false,
    });

    return await parallelUploads3.done();
  } catch (e) {
    console.log(e);
  }
}

export async function getAllJobs() {
  const sql = postgresSql();

  try {
    const jobs = await sql`
    SELECT * FROM jobs 
    WHERE status = 'COMPLETED'
    `;
    return jobs;
  } catch (e) {
    console.log(e);
  }
}

export async function getJobIdByVideoId(videoId: string) {
  const sql = postgresSql();

  try {
    const job = await sql`
    SELECT jobId FROM videos
    WHERE id = ${videoId}
    `;
    const jobId = job[0].jobid;

    if (!jobId) throw new Error("ERROR AT OBTAINING JOBID BY VIDEOID");

    console.log("JOBID: ", jobId);

    return jobId;
  } catch (e) {
    console.log("ERROR AT getJobIdByVideoId", e);
    return e;
  }
}

export async function getVideosByJobId(jobId: string) {
  const sql = postgresSql();

  try {
    const queryResult = await sql<[Video]>`
    SELECT * FROM videos 
    WHERE jobid = ${jobId}
  `;
    const results = queryResult.map((video) => video);

    return results;
  } catch (e) {
    console.log("Error at pulling videos by job id");
    return null;
  }
}

export async function getJobStatusById(jobId: string) {
  const sql = postgresSql();

  try {
    const queryResult = await sql`
    SELECT * FROM videos 
    WHERE jobid = ${jobId}
    `;

    const areJobVideosCompleted = queryResult.every((video) => {
      return video.status === "COMPLETED";
    });

    console.log("ARE ALL VIDEOS COMPLETED?, ", areJobVideosCompleted);

    return areJobVideosCompleted ? "COMPLETED" : "PENDING";
  } catch (e) {
    console.log("ERROR AT PULLING JOB STATUS");
    return null;
  }
}

export async function getJobsByUserId(userId: string) {
  const sql = postgresSql();

  try {
    const rawJobs = await sql<RawJobs>`
      SELECT * FROM jobs
      WHERE userId = ${userId}
      ORDER BY date DESC
    `;

    const jobs = [];

    for (const job of rawJobs) {
      const transcurredTime = await milisecondsToTime(Date.now() - new Date(job.date.getTime() - (1000 * 60 * 60 * 10)).getTime());

      jobs.push({
        ...job,
        date: transcurredTime ?? "N/A",
      });
    }

    return jobs;
  } catch (e) {
    console.log(e);
    const error: ErrorType = {
      message: "Error at pulling jobs",
      problemCause: "database",
      originalError: `${e}`,
    };
    return error;
  }
}

export async function storeVideoName(id: string, jobId: string, userId: string, status: string, videoNumber: number) {
  try {
    const sql = postgresSql();

    const result = await sql`
      INSERT INTO videos(id, jobid, userId, status, video_number)
      VALUES(${id}, ${jobId}, ${userId}, ${status}, ${videoNumber})
    `;

    return result;
  } catch (e) {
    console.log("ERROR AT SAVING VIDEO NAME", e);
  }
}
