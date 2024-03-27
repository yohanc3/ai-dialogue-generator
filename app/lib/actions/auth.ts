import NextAuth from 'next-auth';
import Credentials from 'next-auth/providers/credentials';
import {z} from "zod";
import { postgresSql } from './data';
import { User } from './definitions';
import Auth from "@auth/core"
import GoogleProvider from "@auth/core/providers/google"


export const {handlers, auth} = NextAuth({
  providers: [
    GoogleProvider({
      clientId: process.env.AUTH_GOOGLE_ID,
      clientSecret: process.env.AUTH_GOOGLE_SECRET
    })
  ],
  secret: process.env.AUTH_SECRET
})

export async function getUser(email: string): Promise<User | undefined> {

  const sql = postgresSql();

  try {
    const user = await sql<User[]>`SELECT * FROM users WHERE email=${email}`;
    return user[0];
  } catch (error) {
    console.error('Failed to fetch user:', error);
    throw new Error('Failed to fetch user.');
  }
}
 
// export const { auth, signIn, signOut } = NextAuth({
//   ...authConfig,
//   providers: [
//     Credentials({
//       async authorize(credentials) {
//         const parsedCredentials = z
//           .object({ email: z.string().email(), password: z.string().min(6) })
//           .safeParse(credentials);

//           if (parsedCredentials.success) {
//             const { email, password } = parsedCredentials.data;
//             const user = await getUser(email);
//             if (!user) return null;

//             const passwordsMatch = await bcrypt.compare(password, user.password);
//             if (passwordsMatch) return user;

//           }
//             console.log('Invalid credentials');
//             return null;
//         }
//     })
//   ]
// });