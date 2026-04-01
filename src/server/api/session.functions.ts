import { createServerFn } from "@tanstack/react-start";

export type SessionGuardUser = {
  role?: string;
};

export type SessionResponse = {
  user?: SessionGuardUser | null;
} | null;

export const getCurrentSessionFn = createServerFn({ method: "GET" }).handler(
  async (): Promise<SessionResponse> => {
    const [{ auth }, { getRequest }] = await Promise.all([
      import("@/lib/auth"),
      import("@tanstack/react-start/server"),
    ]);
    const request = getRequest();
    const session = await auth.api.getSession({ headers: request.headers });
    return (session ?? null) as SessionResponse;
  },
);
