import { AdminShell } from "@/components/admin/admin-shell";
import { requireAdminUser } from "@/lib/route-guards";
import { Outlet, createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/admin")({
  beforeLoad: async ({ location }) => {
    await requireAdminUser(location);
  },
  component: AdminLayoutRoute,
});

function AdminLayoutRoute() {
  return (
    <AdminShell>
      <Outlet />
    </AdminShell>
  );
}
