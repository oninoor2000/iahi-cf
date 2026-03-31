import { createMiddleware } from "@tanstack/react-start";
import { getRequest } from "@tanstack/react-start/server";

type Session = { user?: unknown } | null;

const sessionCache = new WeakMap<Request, Promise<Session>>();

async function getSessionOnce(request: Request): Promise<Session> {
  const cached = sessionCache.get(request);
  if (cached) return cached;
  const sessionPromise = import("@/lib/auth").then(({ auth }) =>
    auth.api.getSession({ headers: request.headers }),
  );
  sessionCache.set(request, sessionPromise);
  return sessionPromise;
}

export const sessionMiddleware = createMiddleware({ type: "function" }).server(async ({ next }) => {
  const request = getRequest();
  const session = await getSessionOnce(request);
  return next({
    context: {
      session,
    },
  });
});

