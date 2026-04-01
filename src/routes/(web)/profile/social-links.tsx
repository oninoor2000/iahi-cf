import { createFileRoute, redirect } from "@tanstack/react-router";

export const Route = createFileRoute("/(web)/profile/social-links")({
  beforeLoad: () => {
    throw redirect({
      to: "/profile",
      search: { section: "social-links" },
    });
  },
});
