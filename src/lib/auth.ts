import { NextAuthOptions } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import bcrypt from "bcryptjs";
import { prisma } from "@/lib/prisma";

export const authOptions: NextAuthOptions = {
  providers: [
    CredentialsProvider({
      name: "Credentials",

<<<<<<< HEAD
      credentials: {
        email: {
          label: "Email",
          type: "email",
        },
        password: {
          label: "Password",
          type: "password",
=======
            credentials: {
                email: {
                    label: "Email",
                    type: "email",
                },
                password: {
                    label: "Password",
                    type: "password",
                },
            },

            async authorize(credentials) {
                if (!credentials?.email || !credentials?.password) {
                    return null
                }

                const user = await prisma.user.findUnique({
                    where: {
                        email: credentials.email,
                    },
                })

                if (!user) {
                    return null
                }

                const passwordMatch = await bcrypt.compare(
                    credentials.password,
                    user.password
                )

                if (!passwordMatch) {
                    return null
                }

                return {
                    id: user.id,
                    name: user.name,
                    email: user.email,
                    nohp: user.nohp,
                    role: user.role,
                    profesi: user.profesi,
                    instansi: user.instansi,
                }
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
                session.user.role =
                    token.role as "ADMIN" | "NAKES" | "PETUGAS"
                session.user.profesi = token.profesi as
                    | "DOKTER"
                    | "PERAWAT"
                    | "BIDAN"
                    | null
                session.user.instansi = token.instansi as string | null
            }

            return session
>>>>>>> 334f6f186167aa34294285d00751522e37bab653
        },
      },

      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
          return null;
        }

        const user = await prisma.user.findUnique({
          where: {
            email: credentials.email,
          },
        });

        if (!user) {
          return null;
        }

        const passwordMatch = await bcrypt.compare(
          credentials.password,
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
    // =====================================================
    // JWT
    // =====================================================

    async jwt({ token, user }) {
      if (user) {
        token.id = user.id;
        token.name = user.name;
        token.email = user.email;
        token.nohp = user.nohp;
        token.role = user.role;
        token.profesi = user.profesi;
        token.instansi = user.instansi;
      }

      return token;
    },

    // =====================================================
    // SESSION
    // =====================================================

    async session({ session, token }) {
      if (session.user) {
        session.user.id = token.id as string;
        session.user.name = token.name as string;
        session.user.email = token.email as string;
        session.user.nohp = token.nohp as string;

        session.user.role = token.role as
          | "ADMIN"
          | "NAKES"
          | "PETUGAS";

        session.user.profesi = token.profesi as
          | "DOKTER"
          | "PERAWAT"
          | "BIDAN"
          | null;

        session.user.instansi = token.instansi as
          | string
          | null;
      }

      return session;
    },
  },

  pages: {
    signIn: "/login",
  },

  secret: process.env.NEXTAUTH_SECRET,
};