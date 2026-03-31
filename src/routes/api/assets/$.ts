import { createFileRoute } from "@tanstack/react-router";
import { getR2Binding } from "@/server/env.server";

export const Route = createFileRoute("/api/assets/$")({
  server: {
    handlers: {
      GET: async ({ request }: { request: Request }) => {
        const url = new URL(request.url);
        const prefix = "/api/assets/";
        const rawKey = url.pathname.startsWith(prefix)
          ? url.pathname.slice(prefix.length)
          : "";
        const objectKey = decodeURIComponent(rawKey);

        if (!objectKey) {
          return new Response("Not found", { status: 404 });
        }

        const obj = await getR2Binding().get(objectKey);
        if (!obj) return new Response("Not found", { status: 404 });

        const headers = new Headers();
        obj.writeHttpMetadata(headers);
        headers.set("etag", obj.httpEtag);
        headers.set("cache-control", "public, max-age=3600, immutable");

        return new Response(obj.body, { headers });
      },
    },
  },
});

