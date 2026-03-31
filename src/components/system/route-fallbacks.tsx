import { Button } from "@/components/ui/button";
import { Empty, EmptyDescription, EmptyHeader, EmptyTitle } from "@/components/ui/empty";
import { AlertTriangleIcon, LockIcon, SearchXIcon } from "lucide-react";
import { Link } from "@tanstack/react-router";

type ErrorFallbackProps = {
  error: unknown;
  reset: () => void;
};

function readErrorMessage(error: unknown): string {
  if (error instanceof Error && error.message.trim()) {
    return error.message;
  }
  return "Something unexpected happened. Please try again.";
}

export function UnauthorizedView() {
  return (
    <main className="page-wrap flex min-h-svh items-center justify-center px-4 py-12">
      <Empty className="max-w-xl border-border/60 bg-muted/15 py-10">
        <EmptyHeader>
          <div className="mb-2 flex size-10 items-center justify-center rounded-none border border-border/60 bg-background">
            <LockIcon className="size-5" aria-hidden />
          </div>
          <EmptyTitle className="text-base">Unauthorized access</EmptyTitle>
          <EmptyDescription className="max-w-md text-sm">
            You do not have permission to access this page. Sign in with an
            account that has access, or return to the home page.
          </EmptyDescription>
        </EmptyHeader>
        <div className="mt-2 flex flex-wrap items-center justify-center gap-2">
          <Button asChild>
            <Link to="/sign-in">Sign in</Link>
          </Button>
          <Button asChild variant="outline">
            <Link to="/">Back to home</Link>
          </Button>
        </div>
      </Empty>
    </main>
  );
}

export function NotFoundView() {
  return (
    <main className="page-wrap mx-auto w-full max-w-4xl px-4 py-16">
      <Empty className="border-border/60 bg-muted/10 py-10">
        <EmptyHeader>
          <div className="mb-2 flex size-10 items-center justify-center rounded-none border border-border/60 bg-background">
            <SearchXIcon className="size-5" aria-hidden />
          </div>
          <EmptyTitle className="text-base">Page not found</EmptyTitle>
          <EmptyDescription className="max-w-md text-sm">
            The page you are looking for does not exist or may have been moved.
          </EmptyDescription>
        </EmptyHeader>
        <div className="mt-2">
          <Button asChild>
            <Link to="/">Go to home</Link>
          </Button>
        </div>
      </Empty>
    </main>
  );
}

export function ErrorView({ error, reset }: ErrorFallbackProps) {
  return (
    <main className="page-wrap mx-auto w-full max-w-4xl px-4 py-16">
      <Empty className="border-border/60 bg-muted/10 py-10">
        <EmptyHeader>
          <div className="mb-2 flex size-10 items-center justify-center rounded-none border border-border/60 bg-background">
            <AlertTriangleIcon className="size-5" aria-hidden />
          </div>
          <EmptyTitle className="text-base">Something went wrong</EmptyTitle>
          <EmptyDescription className="max-w-md text-sm">
            {readErrorMessage(error)}
          </EmptyDescription>
        </EmptyHeader>
        <div className="mt-2 flex flex-wrap items-center justify-center gap-2">
          <Button type="button" onClick={reset}>
            Try again
          </Button>
          <Button asChild variant="outline">
            <Link to="/">Back to home</Link>
          </Button>
        </div>
      </Empty>
    </main>
  );
}
