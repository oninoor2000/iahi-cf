import { SignUpForm } from "@/components/auth/sign-up-form";
import { Button } from "@/components/ui/button";
import { redirectIfAuthenticated } from "@/lib/route-guards";
import { ArrowLeftIcon } from "lucide-react";
import { Link, createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/sign-up")({
  beforeLoad: async () => {
    await redirectIfAuthenticated();
  },
  head: () => ({
    meta: [
      { title: "Sign up | IAHI" },
      {
        name: "description",
        content: "Create an IAHI account with email and password.",
      },
    ],
  }),
  component: SignUpPage,
});

function SignUpPage() {
  return (
    <main className="page-wrap flex min-h-svh flex-col">
      <div className="mx-auto w-full max-w-6xl px-4 pt-6">
        <Button variant="ghost" className="gap-2 px-2" asChild>
          <Link to="/">
            <ArrowLeftIcon className="size-4 shrink-0" aria-hidden />
            Back to home
          </Link>
        </Button>
      </div>
      <div className="flex flex-1 flex-col items-center justify-center px-4 py-12">
        <SignUpForm />
      </div>
    </main>
  );
}
