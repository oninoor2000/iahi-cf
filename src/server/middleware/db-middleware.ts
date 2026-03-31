import { getDb } from "@/db";
import { createMiddleware } from "@tanstack/react-start";

export const dbMiddleware = createMiddleware({ type: "function" }).server(({ next }) => {
  const db = getDb();
  return next({
    context: {
      db,
    },
  });
});

