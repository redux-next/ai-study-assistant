import NextAuth from "next-auth";
import Credentials from "next-auth/providers/credentials";
import bcrypt from "bcryptjs";

import prisma from "@/lib/prisma";

export const { handlers, signIn, signOut, auth } =
  NextAuth({
    providers: [
      Credentials({
        name: "Credentials",

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
          if (
            !credentials?.email ||
            !credentials?.password
          ) {
            return null;
          }

          const email = String(
            credentials.email
          )
            .trim()
            .toLowerCase();

          const password = String(
            credentials.password
          );

          try {
            const user =
              await prisma.user.findUnique({
                where: {
                  email,
                },
              });

            if (!user) {
              return null;
            }

            if (!user.password) {
              return null;
            }

            const valid =
              await bcrypt.compare(
                password,
                user.password
              );

            if (!valid) {
              return null;
            }

            return {
              id: user.id,
              name: user.name,
              email: user.email,
              avatarUrl: user.avatarUrl,
            };
          } catch (error) {
            console.error(
              "Authentication error:",
              error
            );

            return null;
          }
        },
      }),
    ],

    session: {
      strategy: "jwt",
    },

    pages: {
      signIn: "/login",
    },

    callbacks: {
      async jwt({ token, user }) {
        if (user) {
          token.id = user.id;
          token.avatarUrl =
            user.avatarUrl ?? null;
        }

        return token;
      },

      async session({ session, token }) {
        if (session.user) {
          session.user.id =
            token.id as string;

          session.user.avatarUrl =
            (token.avatarUrl as string | null) ??
            null;
        }

        return session;
      },
    },

    secret: process.env.AUTH_SECRET,
  });