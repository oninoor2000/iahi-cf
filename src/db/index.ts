import { drizzle } from "drizzle-orm/d1";

import { schema } from "./tables";
import { getDbBinding } from "@/server/api/env.server";

/**
 * Drizzle client for this Worker’s D1 binding. Cloudflare Workers do not use
 * traditional connection pools; `getDb()` is cheap to call per request.
 */
export function getDb() {
  return drizzle(getDbBinding(), { schema });
}

export type Database = ReturnType<typeof getDb>;
