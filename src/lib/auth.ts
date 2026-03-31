import { USER_ROLES } from "@/db/auth.schema";
import {
  buildVerifyEmailContent,
  scheduleTransactionalEmail,
  sendTransactionalEmail,
} from "@/lib/email";
import { getDb } from "../db";
import { dash } from "@better-auth/infra";
import { betterAuth } from "better-auth";
import { drizzleAdapter } from "better-auth/adapters/drizzle";
import { admin, customSession } from "better-auth/plugins";
import { adminAc, userAc } from "better-auth/plugins/admin/access";
import { tanstackStartCookies } from "better-auth/tanstack-start";
import { withCloudflare } from "better-auth-cloudflare";
import { env } from "cloudflare:workers";
import { user as userTable } from "@/db/auth.schema";
import { eq } from "drizzle-orm";

const db = getDb();
const cloudflareOptions = {
  cf: {},
  d1: {
    db,
  },
  kv: env.KV,
} as unknown as Parameters<typeof withCloudflare>[0];

export const auth = betterAuth({
  ...withCloudflare(cloudflareOptions, {
    appName: "IAHI",
    secret: process.env.BETTER_AUTH_SECRET,
    database: drizzleAdapter(db, {
      provider: "sqlite",
    }),
    emailAndPassword: {
      enabled: true,
      requireEmailVerification: true,
    },
    emailVerification: {
      sendOnSignUp: true,
      sendOnSignIn: true,
      autoSignInAfterVerification: true,
      sendVerificationEmail: async ({ user, url }) => {
        const { text, html } = buildVerifyEmailContent({
          name: user.name,
          verifyUrl: url,
        });
        scheduleTransactionalEmail(() =>
          sendTransactionalEmail({
            to: user.email,
            subject: "Verify your email — IAHI",
            text,
            html,
          }),
        );
      },
    },
    experimental: {
      joins: true, // Enable database joins for better performance
    },
    plugins: [
      dash({
        apiKey: process.env.BETTER_AUTH_API_KEY,
        activityTracking: {
          enabled: true,
          updateInterval: 300000, // Update interval in ms (default: 5 minutes)
        },
      }),
      admin({
        defaultRole: USER_ROLES.SUBSCRIBER,
        adminRoles: [USER_ROLES.ADMIN],
        roles: {
          [USER_ROLES.ADMIN]: adminAc,
          [USER_ROLES.AUTHOR]: userAc,
          [USER_ROLES.EDITOR]: userAc,
          [USER_ROLES.CONTRIBUTOR]: userAc,
          [USER_ROLES.SUBSCRIBER]: userAc,
        },
      }),
      customSession(async ({ user, session }) => {
        const [fullUser] = await db
          .select({
            role: userTable.role,
          })
          .from(userTable)
          .where(eq(userTable.id, user.id))
          .limit(1);
        const role = fullUser?.role ?? USER_ROLES.SUBSCRIBER;
        return {
          user: { ...user, role },
          session,
        };
      }),
      tanstackStartCookies(),
    ], // Make sure tanstack start cookies plugin is the last plugin on the array
  }),
  baseURL: process.env.BETTER_AUTH_URL,
});

/** Inferred session shape from the server config. */
export type Session = typeof auth.$Infer.Session;

/**
 * User payload after `customSession` merges `role` from D1.
 * Use in UI when client inference does not list `role` on `session.user`.
 */
export type SessionUserWithRole = {
  id: string;
  name: string;
  email: string;
  emailVerified: boolean;
  image?: string | null;
  role: string;
};
