import { createFileRoute, redirect } from "@tanstack/react-router";

export const Route = createFileRoute("/(web)/profile/security")({
  beforeLoad: () => {
    throw redirect({
      to: "/profile",
      search: { section: "security" },
    });
  },
});
