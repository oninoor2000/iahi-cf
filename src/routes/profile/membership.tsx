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
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { authClient } from "@/lib/auth-client";
import { queryKeys } from "@/query/keys";
import { getMyProfileFn } from "@/server/profile.functions";
import { createFileRoute } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { CreditCardIcon, SparklesIcon } from "lucide-react";
import * as React from "react";
import { toast } from "sonner";
import { getMyMembershipFn } from "@/server/membership.functions";

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

  return (
    <Card>
      <CardHeader>
        <div className="flex items-start justify-between gap-3">
          <CardTitle>Membership</CardTitle>
          <Badge variant={isActive ? "default" : "outline"}>
            {isActive ? "Active" : "Not active"}
          </Badge>
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
                      <a href="/members">Continue</a>
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
            <div className="mt-2 overflow-hidden rounded-none border border-border/60 bg-linear-to-br from-primary/10 via-background to-background p-4">
              <div className="flex items-center gap-3">
                <Avatar className="size-12 rounded-full">
                  {avatarImage ? <AvatarImage src={avatarImage} alt="" /> : null}
                  <AvatarFallback className="text-sm">{initial}</AvatarFallback>
                </Avatar>
                <div className="min-w-0">
                  <div className="truncate text-sm font-semibold">
                    {user?.name ?? "Your name"}
                  </div>
                  <div className="truncate text-xs text-muted-foreground">
                    {user?.email ?? "you@example.com"}
                  </div>
                </div>
              </div>
              <div className="mt-4 grid grid-cols-2 gap-3 text-xs">
                <div className="space-y-0.5">
                  <div className="text-muted-foreground">Member No.</div>
                  <div className="font-medium tabular-nums">{memberNumber}</div>
                </div>
                <div className="space-y-0.5">
                  <div className="text-muted-foreground">Status</div>
                  <div className="font-medium">{status}</div>
                </div>
              </div>
              <div className="mt-4 flex items-center justify-between border-t border-border/40 pt-3 text-xs text-muted-foreground">
                <span>IAHI</span>
                <span>Digital Member Card</span>
              </div>
            </div>
          </div>

          <div className="space-y-2 rounded-none border border-border/60 p-4">
            <div className="text-sm font-semibold">Why join?</div>
            <ul className="list-disc space-y-1 pl-4 text-xs text-muted-foreground">
              <li>Official member number & card template</li>
              <li>Member recognition for events & activities</li>
              <li>Priority updates for community programs</li>
            </ul>
            {!isActive ? (
              <Button asChild className="mt-3 w-full">
                <a href="/members">Join membership</a>
              </Button>
            ) : (
              <Button variant="outline" className="mt-3 w-full" disabled>
                Membership active
              </Button>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
