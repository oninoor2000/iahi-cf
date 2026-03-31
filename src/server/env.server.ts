import { createServerOnlyFn } from "@tanstack/react-start";
import { env } from "cloudflare:workers";

export const getDbBinding = createServerOnlyFn(() => env.DB as D1Database);

export const getR2Binding = createServerOnlyFn(() => env.R2 as R2Bucket);

export const getKvBinding = createServerOnlyFn(() => env.KV);

