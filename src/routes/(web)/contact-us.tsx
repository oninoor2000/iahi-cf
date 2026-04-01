import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/(web)/contact-us")({
  head: () => ({
    meta: [
      { title: "Contact Us | IAHI" },
      {
        name: "description",
        content: "Get in touch with IAHI for inquiries and collaboration.",
      },
    ],
  }),
  component: ContactUsPage,
});

function ContactUsPage() {
  return (
    <main className="page-wrap px-4 pt-10 pb-12">
      <h1 className="text-3xl font-semibold text-foreground">Contact Us</h1>
      <p className="mt-3 text-muted-foreground">
        This page is under development. Contact details and inquiry channels
        will be available soon.
      </p>
    </main>
  );
}
