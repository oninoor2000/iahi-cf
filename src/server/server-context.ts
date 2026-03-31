import type { Database } from "@/db";
import { getDb } from "@/db";
import { USER_ROLES } from "@/db/auth.schema";
import { auth } from "@/lib/auth";
import { getRequest } from "@tanstack/react-start/server";

export type BetterAuthSession = Awaited<ReturnType<typeof auth.api.getSession>>;

export type SessionUser = {
  id: string;
  role?: string;
  emailVerified: boolean;
};

export type ServerContext = {
  request: Request;
  db: Database;
  getSession: () => Promise<BetterAuthSession>;
};

type CacheEntry = {
  db: Database;
  sessionPromise: Promise<BetterAuthSession>;
};

const requestCache = new WeakMap<Request, CacheEntry>();

export function getServerContext(request?: Request): ServerContext {
  const req = request ?? getRequest();
  const existing = requestCache.get(req);
  if (existing) {
    return {
      request: req,
      db: existing.db,
      getSession: () => existing.sessionPromise,
    };
  }

  const db = getDb();
  const sessionPromise = auth.api.getSession({ headers: req.headers });
  requestCache.set(req, { db, sessionPromise });

  return {
    request: req,
    db,
    getSession: () => sessionPromise,
  };
}

function parseSessionUser(session: BetterAuthSession): SessionUser | null {
  const rawUser: unknown = (session as { user?: unknown } | null | undefined)?.user;
  if (!rawUser || typeof rawUser !== "object") return null;

  const id = (rawUser as { id?: unknown }).id;
  if (typeof id !== "string" || !id) return null;

  const role = (rawUser as { role?: unknown }).role;
  const emailVerified = (rawUser as { emailVerified?: unknown }).emailVerified;

  return {
    id,
    role: typeof role === "string" ? role : undefined,
    emailVerified: emailVerified === true,
  };
}

export async function requireSessionUser(ctx?: ServerContext): Promise<SessionUser> {
  const context = ctx ?? getServerContext();
  const session = await context.getSession();
  const user = parseSessionUser(session);
  if (!user) throw new Error("Unauthorized");
  return user;
}

export async function requireUserId(ctx?: ServerContext): Promise<string> {
  const user = await requireSessionUser(ctx);
  return user.id;
}

export async function requireAdminUser(ctx?: ServerContext): Promise<SessionUser> {
  const user = await requireSessionUser(ctx);
  if (user.role !== USER_ROLES.ADMIN) throw new Error("Forbidden");
  return user;
}

export async function requireVerifiedUser(ctx?: ServerContext): Promise<SessionUser> {
  const user = await requireSessionUser(ctx);
  if (!user.emailVerified) {
    throw new Error("Please verify your email before joining membership.");
  }
  return user;
}

