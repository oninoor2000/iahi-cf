import { env } from "cloudflare:workers";
import { drizzle } from "drizzle-orm/d1";

import { schema } from "./tables";

/**
 * Drizzle client for this Worker’s D1 binding. Cloudflare Workers do not use
 * traditional connection pools; `getDb()` is cheap to call per request.
 */
export function getDb() {
  return drizzle(env.DB as D1Database, { schema });
}

export type Database = ReturnType<typeof getDb>;
