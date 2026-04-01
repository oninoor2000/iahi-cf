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
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import {
  ProfileMembershipPending,
  ProfileSectionPending,
} from "@/components/profile/profile-pending";
import { ProfileContactSection } from "@/components/profile/sections/contact";
import { ProfileMembershipSection } from "@/components/profile/sections/membership";
import { ProfilePersonalInfoSection } from "@/components/profile/sections/personal-info";
import { ProfilePreferencesSection } from "@/components/profile/sections/preferences";
import { ProfileSecuritySection } from "@/components/profile/sections/security";
import { ProfileSocialLinksSection } from "@/components/profile/sections/social-links";
import { authClient } from "@/lib/auth-client";
import {
  type ProfileSection,
  parseProfileSection,
} from "@/lib/profile-section";
import { requireAuthenticatedUser } from "@/lib/route-guards";
import {
  membershipMeQueryOptions,
  profileMeQueryOptions,
} from "@/query/queries";
import { useSuspenseQuery } from "@tanstack/react-query";
import { Link, createFileRoute } from "@tanstack/react-router";
import {
  BellIcon,
  CreditCardIcon,
  LockKeyholeIcon,
  SettingsIcon,
  SparklesIcon,
  UserRoundIcon,
} from "lucide-react";
import * as React from "react";
import { toast } from "sonner";

type ProfileNavItem = {
  section: ProfileSection;
  label: string;
  description: string;
  icon: React.ComponentType<{ className?: string; "aria-hidden"?: boolean }>;
};

const NAV_ITEMS: ProfileNavItem[] = [
  {
    section: "personal",
    label: "Personal Info",
    description: "Name, bio, and profile photo",
    icon: UserRoundIcon,
  },
  {
    section: "contact",
    label: "Contact",
    description: "Contact details for your account",
    icon: BellIcon,
  },
  {
    section: "social-links",
    label: "Social Links",
    description: "Show links on your public profile",
    icon: SettingsIcon,
  },
  {
    section: "preferences",
    label: "Preferences",
    description: "Theme and other app preferences",
    icon: SettingsIcon,
  },
  {
    section: "security",
    label: "Security",
    description: "Password and account security",
    icon: LockKeyholeIcon,
  },
  {
    section: "membership",
    label: "Membership",
    description: "Member card and membership status",
    icon: CreditCardIcon,
  },
];

export const Route = createFileRoute("/(web)/profile")({
  validateSearch: (search: Record<string, unknown>) => ({
    section: parseProfileSection(search.section),
  }),
  beforeLoad: async ({ location }) => {
    await requireAuthenticatedUser(location);
  },
  loader: ({ context }) =>
    Promise.all([
      context.queryClient.ensureQueryData(profileMeQueryOptions),
      context.queryClient.ensureQueryData(membershipMeQueryOptions),
    ]),
  head: () => ({
    meta: [
      { title: "Profile | IAHI" },
      { name: "description", content: "Manage your profile and settings." },
    ],
  }),
  component: ProfileLayoutRoute,
});

function ProfileLayoutRoute() {
  const { section } = Route.useSearch();
  const { data: session } = authClient.useSession();
  const user = session?.user;
  const emailVerified = Boolean(user?.emailVerified);
  const [isResendingVerification, setIsResendingVerification] =
    React.useState(false);
  const membershipQuery = useSuspenseQuery(membershipMeQueryOptions);
  const showJoinMembership =
    section !== "membership" && !membershipQuery.data.isActive;

  return (
    <main className="page-wrap mx-auto w-full max-w-6xl px-4 py-10">
      <div className="flex items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">
            Edit Profile
          </h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Manage your personal information and preferences.
          </p>
        </div>
      </div>

      <Separator className="my-6" />

      <div className="grid gap-8 lg:grid-cols-[260px_1fr]">
        <aside className="space-y-2">
          <nav aria-label="Profile sections" className="space-y-1">
            {NAV_ITEMS.map((item) => {
              const active = section === item.section;
              const Icon = item.icon;
              return (
                <Link
                  key={item.section}
                  to="/profile"
                  search={{ section: item.section }}
                  className={[
                    "group flex w-full flex-col rounded-lg border px-3 py-2.5 transition",
                    active
                      ? "border-primary/30 bg-primary/5"
                      : "border-border/60 hover:bg-accent",
                  ].join(" ")}
                >
                  <div className="flex items-center gap-2">
                    <Icon
                      className={[
                        "size-4 shrink-0",
                        active ? "text-primary" : "text-muted-foreground",
                      ].join(" ")}
                      aria-hidden
                    />
                    <span className="text-sm font-medium">{item.label}</span>
                  </div>
                  <span className="mt-1 text-xs text-muted-foreground">
                    {item.description}
                  </span>
                </Link>
              );
            })}
          </nav>
        </aside>

        <section className="min-w-0">
          <>
            {!emailVerified ? (
              <Alert className="mb-4">
                <AlertTitle>Email verification required</AlertTitle>
                <AlertDescription>
                  Verify your email before accessing membership enrollment and
                  other protected actions.
                </AlertDescription>
                <AlertAction>
                  <Button
                    size="sm"
                    variant="outline"
                    disabled={isResendingVerification}
                    onClick={async () => {
                      const home =
                        typeof window !== "undefined"
                          ? `${window.location.origin}/`
                          : "/";
                      const email = user?.email;
                      if (!email) {
                        toast.error("Email not found for this session.");
                        return;
                      }
                      setIsResendingVerification(true);
                      try {
                        const res = await authClient.sendVerificationEmail({
                          email,
                          callbackURL: home,
                        });
                        if (res.error) {
                          throw new Error(
                            res.error.message ??
                              "Could not send verification email.",
                          );
                        }
                        toast.success(
                          "Verification email sent. Check your inbox.",
                        );
                      } catch (err) {
                        toast.error(
                          err instanceof Error
                            ? err.message
                            : "Failed to resend verification email.",
                        );
                      } finally {
                        setIsResendingVerification(false);
                      }
                    }}
                  >
                    {isResendingVerification
                      ? "Sending..."
                      : "Resend verification email"}
                  </Button>
                </AlertAction>
              </Alert>
            ) : null}
            {showJoinMembership ? (
              <Alert className="mb-4">
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
                        <AlertDialogTitle>
                          Join IAHI Membership
                        </AlertDialogTitle>
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
            <ProfileSectionContent section={section} />
          </>
        </section>
      </div>
    </main>
  );
}

function ProfileSectionContent({ section }: { section: ProfileSection }) {
  switch (section) {
    case "personal":
      return (
        <React.Suspense fallback={<ProfileSectionPending />}>
          <ProfilePersonalInfoSection />
        </React.Suspense>
      );
    case "contact":
      return <ProfileContactSection />;
    case "social-links":
      return <ProfileSocialLinksSection />;
    case "preferences":
      return <ProfilePreferencesSection />;
    case "security":
      return <ProfileSecuritySection />;
    case "membership":
      return (
        <React.Suspense fallback={<ProfileMembershipPending />}>
          <ProfileMembershipSection />
        </React.Suspense>
      );
    default:
      return null;
  }
}
