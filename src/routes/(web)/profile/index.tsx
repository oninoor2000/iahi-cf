import { parseProfileSection } from "@/lib/profile-section";
import { createFileRoute, redirect } from "@tanstack/react-router";

/**
 * Default child for `/profile`. Parent renders the full layout (no Outlet).
 * Only normalize legacy `/profile/` (trailing slash) → `/profile`; an unconditional
 * redirect here caused an infinite loop with `/profile?section=…`.
 */
export const Route = createFileRoute("/(web)/profile/")({
  beforeLoad: ({ location, search }) => {
    if (location.pathname === "/profile/") {
      throw redirect({
        to: "/profile",
        search: { section: parseProfileSection(search.section) },
      });
    }
  },
  component: () => null,
});
