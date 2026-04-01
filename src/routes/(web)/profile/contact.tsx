import { createFileRoute, redirect } from "@tanstack/react-router";

export const Route = createFileRoute("/(web)/profile/contact")({
  beforeLoad: () => {
    throw redirect({
      to: "/profile",
      search: { section: "contact" },
    });
  },
});
