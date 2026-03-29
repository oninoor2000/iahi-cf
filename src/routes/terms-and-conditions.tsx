import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/terms-and-conditions")({
  head: () => ({
    meta: [
      { title: "Terms and Conditions | IAHI" },
      {
        name: "description",
        content: "Terms and conditions for using the IAHI website.",
      },
    ],
  }),
  component: TermsAndConditionsPage,
});

function TermsAndConditionsPage() {
  return (
    <main className="page-wrap px-4 pb-12 pt-10">
      <h1 className="text-3xl font-semibold text-foreground">
        Terms and Conditions
      </h1>
      <p className="mt-3 text-muted-foreground">
        This page is under development. Website usage terms and legal statements
        will be added soon.
      </p>
    </main>
  );
}
