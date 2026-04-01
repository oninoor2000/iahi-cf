import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

function GoogleIcon({ className }: { className?: string }) {
  return (
    <svg
      className={cn("size-5 shrink-0", className)}
      viewBox="0 0 24 24"
      aria-hidden
    >
      <path
        fill="#4285F4"
        d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
      />
      <path
        fill="#34A853"
        d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
      />
      <path
        fill="#FBBC05"
        d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
      />
      <path
        fill="#EA4335"
        d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
      />
    </svg>
  );
}

function GitHubIcon({ className }: { className?: string }) {
  return (
    <svg
      className={cn("size-5 shrink-0", className)}
      viewBox="0 0 24 24"
      fill="currentColor"
      aria-hidden
    >
      <path d="M12 .5c-6.63 0-12 5.28-12 11.79 0 5.21 3.24 9.63 7.73 11.19.57.1.78-.24.78-.54 0-.27-.01-.94-.01-1.84-2.78.48-3.37-1.2-3.37-1.2-.45-1.11-1.11-1.41-1.11-1.41-.91-.6.07-.59.07-.59 1.01.07 1.54 1.04 1.54 1.04.89 1.52 2.34 1.08 2.91.83.09-.65.35-1.08.64-1.33-2.22-.23-4.55-1.11-4.55-4.94 0-1.09.39-1.98 1.03-2.68-.1-.23-.45-1.17.1-2.43 0 0 .84-.27 2.75 1.02a9.39 9.39 0 0 1 2.5-.34c.85.01 1.71.12 2.51.34 1.91-1.29 2.75-1.02 2.75-1.02.55 1.26.2 2.2.1 2.43.64.7 1.03 1.59 1.03 2.68 0 3.84-2.34 4.7-4.57 4.94.36.31.68.92.68 1.85 0 1.33-.01 2.41-.01 2.73 0 .31.21.65.79.54A12.02 12.02 0 0 0 24 12.29C24 5.78 18.63.5 12 .5z" />
    </svg>
  );
}

function MicrosoftIcon({ className }: { className?: string }) {
  return (
    <svg
      className={cn("size-5 shrink-0", className)}
      viewBox="0 0 24 24"
      aria-hidden
    >
      <path fill="#F65314" d="M1 1h10v10H1V1z" />
      <path fill="#7CBB00" d="M13 1h10v10H13V1z" />
      <path fill="#00A4EF" d="M1 13h10v10H1V13z" />
      <path fill="#FFBB00" d="M13 13h10v10H13V13z" />
    </svg>
  );
}

export function SocialAuthButtonsFallback() {
  return (
    <div className="flex w-full flex-col gap-2">
      <Button
        type="button"
        variant="outline"
        className="h-11 w-full justify-center gap-2 border-input"
        disabled
        aria-disabled
        title="Coming soon"
      >
        <GoogleIcon />
        <span>Continue with Google</span>
      </Button>
      <Button
        type="button"
        variant="outline"
        className="h-11 w-full justify-center gap-2 border-input"
        disabled
        aria-disabled
        title="Coming soon"
      >
        <GitHubIcon />
        <span>Continue with GitHub</span>
      </Button>
      <Button
        type="button"
        variant="outline"
        className="h-11 w-full justify-center gap-2 border-input"
        disabled
        aria-disabled
        title="Coming soon"
      >
        <MicrosoftIcon />
        <span>Continue with Microsoft</span>
      </Button>
      <p className="text-center text-xs text-muted-foreground">
        Social sign-in will be available soon.
      </p>
    </div>
  );
}
