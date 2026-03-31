import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/profile")({
  head: () => ({
    meta: [
      { title: "Profile | IAHI" },
      {
        name: "description",
        content: "Your IAHI account profile.",
      },
    ],
  }),
  component: ProfilePage,
});

function ProfilePage() {
  return (
    <main className="page-wrap mx-auto max-w-3xl px-4 py-12">
      <h1 className="text-2xl font-semibold tracking-tight">Profile</h1>
      <p className="mt-2 text-sm text-muted-foreground">
        This page is a placeholder. Add account details and settings here.
      </p>
    </main>
  );
}
