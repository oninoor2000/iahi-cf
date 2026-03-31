import { Button } from "@/components/ui/button";
import { authClient } from "@/lib/auth-client";
import { queryKeys } from "@/query/keys";
import { getMyMembershipFn } from "@/server/api/membership.functions";
import { useQuery } from "@tanstack/react-query";
import { Link } from "@tanstack/react-router";
import { SparklesIcon, XIcon } from "lucide-react";
import * as React from "react";

const DISMISS_KEY = "iahi-membership-promo-dismiss-until";
const COOLDOWN_MS = 24 * 60 * 60 * 1000;

function readDismissUntil(): number {
  if (typeof window === "undefined") return 0;
  const raw = window.localStorage.getItem(DISMISS_KEY);
  if (!raw) return 0;
  const parsed = Number(raw);
  return Number.isFinite(parsed) ? parsed : 0;
}

export default function MembershipPromoBanner() {
  const { data: session, isPending: isSessionPending } = authClient.useSession();
  const signedIn = Boolean(session?.user);
  const [dismissUntil, setDismissUntil] = React.useState<number>(0);

  React.useEffect(() => {
    setDismissUntil(readDismissUntil());
  }, []);

  const membershipQuery = useQuery({
    queryKey: queryKeys.membership.me(),
    queryFn: getMyMembershipFn,
    enabled: signedIn,
  });

  const now = Date.now();
  const isCoolingDown = dismissUntil > now;
  const shouldShow =
    signedIn &&
    !isSessionPending &&
    !membershipQuery.isPending &&
    !membershipQuery.data?.isActive &&
    !isCoolingDown;

  if (!signedIn || isSessionPending) return null;

  if (!shouldShow) return null;

  return (
    <div className="border-b border-border/50 bg-primary/5">
      <div className="mx-auto flex max-w-6xl items-center justify-between gap-3 px-4 py-2 lg:px-0">
        <div className="flex min-w-0 items-center gap-2 text-sm">
          <SparklesIcon className="size-4 shrink-0 text-primary" aria-hidden />
          <p className="truncate text-foreground">
            Your IAHI membership is not active yet. Complete your application to
            get your member number and digital member card.
          </p>
        </div>
        <div className="flex shrink-0 items-center gap-1">
          <Button asChild size="sm">
            <Link to="/membership/manage">Continue</Link>
          </Button>
          <Button
            type="button"
            variant="ghost"
            size="icon"
            className="size-8"
            aria-label="Close banner"
            onClick={() => {
              const next = Date.now() + COOLDOWN_MS;
              setDismissUntil(next);
              if (typeof window !== "undefined") {
                window.localStorage.setItem(DISMISS_KEY, String(next));
              }
            }}
          >
            <XIcon className="size-4" aria-hidden />
          </Button>
        </div>
      </div>
    </div>
  );
}
