import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/admin/dashboard")({
  head: () => ({
    meta: [
      { title: "Admin dashboard | IAHI" },
      {
        name: "description",
        content: "IAHI administration dashboard.",
      },
    ],
  }),
  component: AdminDashboardPage,
});

function AdminDashboardPage() {
  return (
    <main className="page-wrap mx-auto max-w-5xl px-4 py-12">
      <h1 className="text-2xl font-semibold tracking-tight">Admin dashboard</h1>
      <p className="mt-2 text-sm text-muted-foreground">
        This page is a placeholder. Add admin tools and metrics here.
      </p>
    </main>
  );
}
