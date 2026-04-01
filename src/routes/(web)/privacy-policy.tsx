import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/(web)/privacy-policy")({
  head: () => ({
    meta: [
      { title: "Privacy Policy | IAHI" },
      {
        name: "description",
        content: "Privacy policy for the IAHI organization profile website.",
      },
    ],
  }),
  component: PrivacyPolicyPage,
});

function PrivacyPolicyPage() {
  return (
    <main className="page-wrap px-4 pt-10 pb-12">
      <h1 className="text-3xl font-semibold text-foreground">Privacy Policy</h1>
      <p className="mt-3 text-muted-foreground">
        This page is under development. Data usage, privacy rights, and
        protection commitments will be published soon.
      </p>
    </main>
  );
}
