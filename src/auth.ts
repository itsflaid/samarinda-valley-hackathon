import NextAuth from "next-auth";
import Credentials from "next-auth/providers/credentials";
import bcrypt from "bcryptjs";
import { prisma } from "@/lib/prisma";

export const { handlers, auth, signIn, signOut } = NextAuth({
    providers: [
        Credentials({
            credentials: {
                email: {},
                password: {},
            },

            async authorize(credentials) {
                if (!credentials?.email || !credentials?.password) {
                    return null;
                }

                const user = await prisma.user.findUnique({
                    where: {
                        email: credentials.email as string,
                    },
                });

                if (!user) {
                    return null;
                }

                const passwordMatch = await bcrypt.compare(
                    credentials.password as string,
                    user.password
                );

                if (!passwordMatch) {
                    return null;
                }

                return {
                    id: user.id,
                    name: user.name,
                    email: user.email,
                    nohp: user.nohp,
                    role: user.role,
                    profesi: user.profesi,
                    instansi: user.instansi,
                };
            },
        }),
    ],

    session: {
        strategy: "jwt",
    },

 callbacks: {
    async jwt({ token, user }) {
        if (user) {
            token.id = user.id
            token.name = user.name
            token.email = user.email
            token.nohp = user.nohp
            token.role = user.role
            token.profesi = user.profesi
            token.instansi = user.instansi
        }

        return token
    },

    async session({ session, token }) {
        if (session.user) {
            session.user.id = token.id as string
            session.user.name = token.name as string
            session.user.email = token.email as string
            session.user.nohp = token.nohp as string
            session.user.role = token.role as "ADMIN" | "NAKES" | "PETUGAS"
            session.user.profesi = token.profesi as any
            session.user.instansi = token.instansi as string | null
        }

        return session
    },
},

    pages: {
        signIn: "/login",
    },
});