import { dashClient } from "@better-auth/infra/client";
import { cloudflareClient } from "better-auth-cloudflare/client";
import { createAuthClient } from "better-auth/react";
export const authClient = createAuthClient({
  baseURL: import.meta.env.VITE_APP_URL, // The base URL of your auth server
  plugins: [
    cloudflareClient(),
    dashClient({
      resolveUserId: ({ userId, user, session }) => {
        return userId ?? user?.id ?? session?.user?.id ?? undefined;
      },
    }),
  ],
});
