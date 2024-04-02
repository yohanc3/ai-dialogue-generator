import NextAuth, { NextAuthConfig } from 'next-auth';
// import { authConfig } from './auth.config';
import { Pool } from 'pg';
import PostgresAdapter from '@auth/pg-adapter';
import GoogleProvider from "@auth/core/providers/google"

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: true,
  host: 'localhost',
  user: 'database-user',
  max: 20,
  idleTimeoutMillis: 30000,
  connectionTimeoutMillis: 2000,
})

export const authConfig = {
  providers: [
    GoogleProvider({
      clientId: process.env.AUTH_GOOGLE_ID,
      clientSecret: process.env.AUTH_GOOGLE_SECRET
    })
  ],
  pages: {
    signIn: '/home',
    signOut: '/home',
  },  
  adapter: PostgresAdapter(pool),
} satisfies NextAuthConfig;

export const {handlers, auth, signOut, signIn} = NextAuth(authConfig);