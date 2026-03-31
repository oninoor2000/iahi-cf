import { USER_ROLES } from "@/db/auth.schema";
import { authClient } from "@/lib/auth-client";
import { redirect } from "@tanstack/react-router";

type RouteLocationLike = {
  pathname?: string;
  searchStr?: string;
};

type SessionGuardUser = {
  role?: string;
};

type SessionResponse = {
  user?: SessionGuardUser | null;
} | null;

function getRedirectTarget(location?: RouteLocationLike): string {
  const pathname = location?.pathname ?? "/";
  const searchStr = location?.searchStr ?? "";
  return `${pathname}${searchStr}`;
}

async function readSession(): Promise<SessionResponse> {
  if (typeof window === "undefined") {
    const [{ auth }, { getRequest }] = await Promise.all([
      import("@/lib/auth"),
      import("@tanstack/react-start/server"),
    ]);
    const request = getRequest();
    const session = await auth.api.getSession({ headers: request.headers });
    return (session ?? null) as SessionResponse;
  }

  const result = await authClient.getSession({
    query: { disableCookieCache: true },
  });
  return (result.data ?? null) as SessionResponse;
}

export async function requireAuthenticatedUser(
  location?: RouteLocationLike,
): Promise<SessionGuardUser> {
  const session = await readSession();
  const user = session?.user ?? null;
  if (!user) {
    throw redirect({
      to: "/sign-in",
      search: { redirect: getRedirectTarget(location) },
    });
  }
  return user;
}

export async function requireAdminUser(
  location?: RouteLocationLike,
): Promise<SessionGuardUser> {
  const user = await requireAuthenticatedUser(location);
  if (user.role !== USER_ROLES.ADMIN) {
    throw redirect({ to: "/unauthorized" });
  }
  return user;
}

export async function redirectIfAuthenticated(): Promise<void> {
  const session = await readSession();
  if (session?.user) {
    throw redirect({ to: "/" });
  }
}
