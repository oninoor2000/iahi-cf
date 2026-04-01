import {
  getSessionFromUnknownContext,
  getUserFromUnknownContext,
  isAdmin,
  parseSessionUser,
} from "@/server/api/function-context";
import { createMiddleware } from "@tanstack/react-start";

export const requireAuthMiddleware = createMiddleware({ type: "function" }).server(
  ({ next, context }) => {
    const user = parseSessionUser(getSessionFromUnknownContext(context));
    if (!user) throw new Error("Unauthorized");
    return next({
      context: {
        user,
      },
    });
  },
);

export const requireVerifiedMiddleware = createMiddleware({ type: "function" }).server(
  ({ next, context }) => {
    const user = getUserFromUnknownContext(context);
    if (!user?.emailVerified) {
      throw new Error("Please verify your email before joining membership.");
    }
    return next();
  },
);

export const requireAdminMiddleware = createMiddleware({ type: "function" }).server(
  ({ next, context }) => {
    const user = getUserFromUnknownContext(context);
    if (!user || !isAdmin(user)) {
      throw new Error("Forbidden");
    }
    return next();
  },
);

