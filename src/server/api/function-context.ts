import type { Database } from "@/db";
import { USER_ROLES } from "@/db/auth.schema";

export type BetterAuthSession = { user?: unknown } | null;

export type SessionUser = {
  id: string;
  role?: string;
  emailVerified: boolean;
};

export type DbContext = {
  db: Database;
};

export type SessionContext = {
  session: BetterAuthSession;
};

export type AuthContext = {
  user: SessionUser;
};

export type DbSessionContext = DbContext & SessionContext;
export type DbAuthContext = DbSessionContext & AuthContext;

export function parseSessionUser(session: BetterAuthSession): SessionUser | null {
  const rawUser: unknown = (session as { user?: unknown } | null | undefined)?.user;
  if (!rawUser || typeof rawUser !== "object") return null;

  const id = (rawUser as { id?: unknown }).id;
  if (typeof id !== "string" || id.length === 0) return null;

  const role = (rawUser as { role?: unknown }).role;
  const emailVerified = (rawUser as { emailVerified?: unknown }).emailVerified;

  return {
    id,
    role: typeof role === "string" ? role : undefined,
    emailVerified: emailVerified === true,
  };
}

export function isAdmin(user: SessionUser): boolean {
  return user.role === USER_ROLES.ADMIN;
}

export function getSessionFromUnknownContext(context: unknown): BetterAuthSession {
  if (!context || typeof context !== "object") return null;
  if (!("session" in context)) return null;
  return (context as { session?: BetterAuthSession }).session ?? null;
}

export function getUserFromUnknownContext(context: unknown): SessionUser | null {
  if (!context || typeof context !== "object") return null;
  if (!("user" in context)) return null;
  const user = (context as { user?: SessionUser }).user;
  if (!user) return null;
  if (typeof user.id !== "string" || user.id.length === 0) return null;
  return user;
}

