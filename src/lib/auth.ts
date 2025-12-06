import User, { type IUser } from "@/models/User";
import NextAuth from "next-auth";
import type { Provider } from "next-auth/providers";
import Google from "next-auth/providers/google";
import Resend from "next-auth/providers/resend";
import { SUBSCRIPTION_STATUS } from "./constants";
import dbConnect from "./db";

// Extend the types
declare module "next-auth" {
  interface Session {
    user: {
      id: string;
      email: string;
      name: string;
      image?: string;
      usageCount: number;
      subscriptionStatus: string;
    };
  }

  interface User {
    id: string;
    usageCount?: number;
    subscriptionStatus?: string;
  }
}

const providers: Provider[] = [
  Google({
    clientId: process.env.AUTH_GOOGLE_ID,
    clientSecret: process.env.AUTH_GOOGLE_SECRET,
  }),
];

// Only add Resend if the API key is available
if (process.env.AUTH_RESEND_KEY) {
  providers.push(
    Resend({
      apiKey: process.env.AUTH_RESEND_KEY,
      from: process.env.AUTH_RESEND_FROM || "noreply@fwdlink.io",
    })
  );
}

export const { handlers, signIn, signOut, auth } = NextAuth({
  providers,
  pages: {
    signIn: "/auth/signin",
    error: "/auth/error",
  },
  callbacks: {
    async signIn({ user, account }) {
      await dbConnect();

      try {
        // Check if user exists
        const existingUser = await User.findOne({ email: user.email });

        if (!existingUser) {
          // Create new user
          const newUser = new User({
            email: user.email,
            name: user.name || user.email?.split("@")[0],
            image: user.image,
            usageCount: 0,
            subscriptionStatus: SUBSCRIPTION_STATUS.FREE,
            provider: account?.provider === "google" ? "google" : "email",
            emailVerified: account?.provider === "google" ? new Date() : undefined,
          });
          await newUser.save();
        }

        return true;
      } catch (error) {
        console.error("Error in signIn callback:", error);
        return false;
      }
    },
    async session({ session, token }) {
      if (session.user && token.sub) {
        await dbConnect();
        const dbUser = await User.findOne({ email: session.user.email }).lean();

        if (dbUser) {
          session.user.id = (dbUser as IUser)._id.toString();
          session.user.usageCount = (dbUser as IUser).usageCount;
          session.user.subscriptionStatus = (dbUser as IUser).subscriptionStatus;
        }
      }
      return session;
    },
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id;
      }
      return token;
    },
  },
  session: {
    strategy: "jwt",
  },
});
