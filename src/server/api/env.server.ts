import { createServerOnlyFn } from "@tanstack/react-start";
import { env } from "cloudflare:workers";

export const getDbBinding = createServerOnlyFn(() => env.DB as D1Database);

export const getFrequentR2Binding = createServerOnlyFn(
  () => env.iahiR2 as R2Bucket,
);

export const getInfrequentR2Binding = createServerOnlyFn(
  () => env.iahiR2Infrequent as R2Bucket,
);

// Backward compatible alias for existing callers.
export const getR2Binding = getFrequentR2Binding;

export const getKvBinding = createServerOnlyFn(() => env.KV);
