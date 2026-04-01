import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/(web)/members")({
  head: () => ({
    meta: [
      { title: "Members | IAHI" },
      {
        name: "description",
        content:
          "Membership categories, benefits, and registration information.",
      },
    ],
  }),
  component: MembersPage,
});

function MembersPage() {
  return (
    <main className="page-wrap px-4 pt-10 pb-12">
      <h1 className="text-3xl font-semibold text-foreground">Members</h1>
      <p className="mt-3 text-muted-foreground">
        This page explains membership in IAHI: benefits, responsibilities, and
        organizational context. For account-level membership management, use
        your profile membership area.
      </p>
    </main>
  );
}
