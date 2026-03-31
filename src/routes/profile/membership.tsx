import {
  Alert,
  AlertAction,
  AlertDescription,
  AlertTitle,
} from "@/components/ui/alert";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogMedia,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { authClient } from "@/lib/auth-client";
import { queryKeys } from "@/query/keys";
import { getMyProfileFn } from "@/server/api/profile.functions";
import { createFileRoute } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { CreditCardIcon, SparklesIcon } from "lucide-react";
import * as React from "react";
import { toast } from "sonner";
import { getMyMembershipFn } from "@/server/api/membership.functions";

export const Route = createFileRoute("/profile/membership")({
  component: ProfileMembershipPage,
});

function ProfileMembershipPage() {
  const { data: session } = authClient.useSession();
  const user = session?.user;
  const initial =
    user?.name?.trim().slice(0, 1).toUpperCase() ??
    user?.email?.slice(0, 1).toUpperCase() ??
    "?";

  const membershipQuery = useQuery({
    queryKey: queryKeys.membership.me(),
    queryFn: getMyMembershipFn,
    enabled: Boolean(user),
  });
  const profileQuery = useQuery({
    queryKey: queryKeys.profile.me(),
    queryFn: getMyProfileFn,
    enabled: Boolean(user),
  });
  React.useEffect(() => {
    if (!membershipQuery.error) return;
    toast.error(
      membershipQuery.error instanceof Error
        ? membershipQuery.error.message
        : "Failed to load",
    );
  }, [membershipQuery.error]);

  const membershipData = membershipQuery.data;
  const isActive = Boolean(membershipData?.isActive);
  const status = membershipData?.membership?.status ?? "not_a_member";
  const memberNumber = membershipData?.membership?.memberNumber ?? "—";
  const avatarImage = profileQuery.data?.profile.image ?? user?.image ?? null;
  const verifyUrl = membershipData?.membership?.verifyUrl ?? "";
  const qrSrc = verifyUrl
    ? `https://api.qrserver.com/v1/create-qr-code/?size=240x240&data=${encodeURIComponent(
        `${typeof window !== "undefined" ? window.location.origin : ""}${verifyUrl}`,
      )}`
    : "";
  const cardName = (user?.name ?? "Your name").trim() || "Your name";
  const cardEmail =
    (user?.email ?? "you@example.com").trim() || "you@example.com";
  const cardStatus = status.replace(/_/g, " ");
  const cardValidUntil = membershipData?.membership?.validUntil
    ? new Date(membershipData.membership.validUntil).toLocaleDateString()
    : "—";

  const statusMeta = React.useMemo(() => {
    if (status === "active") {
      return {
        badgeLabel: "Active",
        badgeVariant: "default" as const,
        ctaLabel: "Open verification page",
        ctaHref: verifyUrl || "/members/verify",
      };
    }
    if (status === "rejected") {
      return {
        badgeLabel: "Rejected (Final)",
        badgeVariant: "destructive" as const,
        ctaLabel: "View final decision",
        ctaHref: "/membership/manage",
      };
    }
    if (status === "needs_correction") {
      return {
        badgeLabel: "Needs correction",
        badgeVariant: "destructive" as const,
        ctaLabel: "Fix and resubmit request",
        ctaHref: "/membership/manage",
      };
    }
    if (status === "cancelled") {
      return {
        badgeLabel: "Revoked",
        badgeVariant: "destructive" as const,
        ctaLabel: "Apply membership again",
        ctaHref: "/membership/manage",
      };
    }
    return {
      badgeLabel: "Not active",
      badgeVariant: "outline" as const,
      ctaLabel: "Join membership",
      ctaHref: "/membership/manage",
    };
  }, [status, verifyUrl]);

  const truncateText = React.useCallback((value: string, max: number) => {
    const safe = value.trim();
    if (safe.length <= max) return safe;
    return `${safe.slice(0, Math.max(0, max - 1))}\u2026`;
  }, []);

  return (
    <Card>
      <CardHeader>
        <div className="flex items-start justify-between gap-3">
          <CardTitle>Membership</CardTitle>
          <Badge variant={statusMeta.badgeVariant}>{statusMeta.badgeLabel}</Badge>
        </div>
      </CardHeader>
      <CardContent>
        {!membershipQuery.isPending && !isActive ? (
          <Alert className="mb-6">
            <SparklesIcon aria-hidden />
            <AlertTitle>Unlock your digital member card</AlertTitle>
            <AlertDescription>
              Join membership to get your official IAHI member number and a
              shareable member ID card template.
            </AlertDescription>
            <AlertAction>
              <AlertDialog>
                <AlertDialogTrigger asChild>
                  <Button size="sm">Join membership</Button>
                </AlertDialogTrigger>
                <AlertDialogContent size="default">
                  <AlertDialogHeader>
                    <AlertDialogMedia>
                      <CreditCardIcon aria-hidden />
                    </AlertDialogMedia>
                    <AlertDialogTitle>Join IAHI Membership</AlertDialogTitle>
                    <AlertDialogDescription>
                      You’ll get a member number, digital member card, and
                      access to member-only benefits.
                    </AlertDialogDescription>
                  </AlertDialogHeader>
                  <AlertDialogFooter>
                    <AlertDialogCancel variant="outline" size="sm">
                      Not now
                    </AlertDialogCancel>
                    <AlertDialogAction variant="default" size="sm" asChild>
                      <a href="/membership/manage">Continue</a>
                    </AlertDialogAction>
                  </AlertDialogFooter>
                </AlertDialogContent>
              </AlertDialog>
            </AlertAction>
          </Alert>
        ) : null}

        <div className="grid gap-6 lg:grid-cols-[1fr_260px]">
          <div>
            <div className="text-xs text-muted-foreground">ID card preview</div>
            <div
              className="relative mt-2 w-full max-w-[520px] overflow-hidden rounded-xl border border-border/60 bg-linear-to-br from-primary/15 via-background to-background"
              style={{ aspectRatio: "1.586/1" }}
            >
              <svg
                viewBox="0 0 860 542"
                className="h-full w-full"
                role="img"
                aria-label="IAHI digital member ID card preview"
                preserveAspectRatio="xMidYMid meet"
              >
                <defs>
                  <linearGradient
                    id="cardBg"
                    x1="0%"
                    y1="0%"
                    x2="100%"
                    y2="100%"
                  >
                    <stop offset="0%" stopColor="hsl(224 80% 94%)" />
                    <stop offset="55%" stopColor="hsl(0 0% 100%)" />
                    <stop offset="100%" stopColor="hsl(0 0% 97%)" />
                  </linearGradient>
                  <clipPath id="avatarClip">
                    <circle cx="110" cy="170" r="52" />
                  </clipPath>
                </defs>

                <rect
                  x="0"
                  y="0"
                  width="860"
                  height="542"
                  fill="url(#cardBg)"
                />
                <rect
                  x="1"
                  y="1"
                  width="858"
                  height="540"
                  rx="22"
                  ry="22"
                  fill="none"
                  stroke="hsl(0 0% 84%)"
                />

                <text
                  x="44"
                  y="52"
                  fontSize="18"
                  fontWeight="700"
                  fill="hsl(222 20% 16%)"
                >
                  IAHI Digital Member ID
                </text>
                <text
                  x="764"
                  y="52"
                  fontSize="14"
                  textAnchor="end"
                  fill="hsl(215 12% 42%)"
                >
                  Card preview
                </text>

                <circle cx="110" cy="170" r="52" fill="hsl(220 16% 88%)" />
                {avatarImage ? (
                  <image
                    href={avatarImage}
                    x="58"
                    y="118"
                    width="104"
                    height="104"
                    clipPath="url(#avatarClip)"
                    preserveAspectRatio="xMidYMid slice"
                  />
                ) : (
                  <text
                    x="110"
                    y="183"
                    textAnchor="middle"
                    fontSize="38"
                    fontWeight="700"
                    fill="hsl(222 20% 24%)"
                  >
                    {initial}
                  </text>
                )}

                <text
                  x="184"
                  y="160"
                  fontSize="30"
                  fontWeight="700"
                  fill="hsl(222 20% 16%)"
                >
                  {truncateText(cardName, 30)}
                </text>
                <text x="184" y="196" fontSize="18" fill="hsl(215 12% 42%)">
                  {truncateText(cardEmail, 42)}
                </text>

                <rect
                  x="650"
                  y="102"
                  width="160"
                  height="160"
                  rx="10"
                  ry="10"
                  fill="white"
                />
                <rect
                  x="650"
                  y="102"
                  width="160"
                  height="160"
                  rx="10"
                  ry="10"
                  fill="none"
                  stroke="hsl(0 0% 84%)"
                />
                {qrSrc ? (
                  <image
                    href={qrSrc}
                    x="662"
                    y="114"
                    width="136"
                    height="136"
                    preserveAspectRatio="xMidYMid meet"
                  />
                ) : (
                  <text
                    x="730"
                    y="188"
                    textAnchor="middle"
                    fontSize="24"
                    fontWeight="600"
                    fill="hsl(215 12% 42%)"
                  >
                    QR
                  </text>
                )}

                <text x="44" y="300" fontSize="16" fill="hsl(215 12% 42%)">
                  Member No.
                </text>
                <text
                  x="44"
                  y="326"
                  fontSize="22"
                  fontWeight="600"
                  fill="hsl(222 20% 16%)"
                >
                  {truncateText(memberNumber, 26)}
                </text>

                <text x="430" y="300" fontSize="16" fill="hsl(215 12% 42%)">
                  Status
                </text>
                <text
                  x="430"
                  y="326"
                  fontSize="22"
                  fontWeight="600"
                  fill="hsl(222 20% 16%)"
                  style={{ textTransform: "capitalize" }}
                >
                  {truncateText(cardStatus, 18)}
                </text>

                <text x="44" y="380" fontSize="16" fill="hsl(215 12% 42%)">
                  Valid until
                </text>
                <text
                  x="44"
                  y="406"
                  fontSize="22"
                  fontWeight="600"
                  fill="hsl(222 20% 16%)"
                >
                  {cardValidUntil}
                </text>

                <text x="430" y="380" fontSize="16" fill="hsl(215 12% 42%)">
                  Card version
                </text>
                <text
                  x="430"
                  y="406"
                  fontSize="22"
                  fontWeight="600"
                  fill="hsl(222 20% 16%)"
                >
                  {membershipData?.membership?.cardVersion ?? "—"}
                </text>

                <line
                  x1="44"
                  y1="452"
                  x2="816"
                  y2="452"
                  stroke="hsl(0 0% 84%)"
                />
                <text x="44" y="488" fontSize="16" fill="hsl(215 12% 42%)">
                  {isActive ? "Ready for verify/check-in" : "Preview mode"}
                </text>
              </svg>

              <div className="absolute right-6 bottom-6 text-xs text-muted-foreground">
                {verifyUrl ? (
                  <a
                    href={verifyUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="underline underline-offset-2"
                  >
                    Open verify link
                  </a>
                ) : (
                  <span>Verification link unavailable</span>
                )}
              </div>
            </div>
          </div>

          <div className="space-y-2 rounded-none border border-border/60 p-4">
            <div className="text-sm font-semibold">Why join?</div>
            <ul className="list-disc space-y-1 pl-4 text-xs text-muted-foreground">
              <li>Official member number & card template</li>
              <li>Card QR for verification and event check-in</li>
              <li>Priority updates for community programs</li>
            </ul>
            {!isActive ? (
              <Button asChild className="mt-3 w-full">
                <a href={statusMeta.ctaHref}>{statusMeta.ctaLabel}</a>
              </Button>
            ) : (
              <Button variant="outline" className="mt-3 w-full" asChild>
                <a
                  href={statusMeta.ctaHref}
                  target="_blank"
                  rel="noreferrer"
                >
                  {statusMeta.ctaLabel}
                </a>
              </Button>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
