import { createFileRoute } from "@tanstack/react-router";
import { getInfrequentR2Binding } from "@/server/env.server";
import { getServerContext, requireAdminUser } from "@/server/server-context";

export const Route = createFileRoute("/api/proofs/$")({
  server: {
    handlers: {
      GET: async ({ request }: { request: Request }) => {
        const ctx = getServerContext(request);
        try {
          await requireAdminUser(ctx);
        } catch {
          return new Response("Forbidden", { status: 403 });
        }

        const url = new URL(request.url);
        const prefix = "/api/proofs/";
        const rawKey = url.pathname.startsWith(prefix)
          ? url.pathname.slice(prefix.length)
          : "";
        const objectKey = decodeURIComponent(rawKey);
        if (!objectKey) return new Response("Not found", { status: 404 });

        const obj = await getInfrequentR2Binding().get(objectKey);
        if (!obj) return new Response("Not found", { status: 404 });

        const headers = new Headers();
        obj.writeHttpMetadata(headers);
        headers.set("etag", obj.httpEtag);
        headers.set("cache-control", "private, max-age=300");
        return new Response(obj.body, { headers });
      },
    },
  },
});
