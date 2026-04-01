import { Separator } from "@/components/ui/separator";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarInset,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarProvider,
  SidebarRail,
  SidebarTrigger,
} from "@/components/ui/sidebar";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";
import { authClient } from "@/lib/auth-client";
import type { SessionUserWithRole } from "@/lib/auth";
import { profileMeQueryOptions } from "@/query/queries";
import { useQuery } from "@tanstack/react-query";
import { Link, useNavigate, useRouterState } from "@tanstack/react-router";
import ThemeToggle from "@/components/ThemeToggle";
import { ArrowLeft, BadgeCheck, LayoutDashboard, LogOutIcon, User, Users } from "lucide-react";
import type * as React from "react";

type AdminRoutePath = "/admin/dashboard" | "/admin/membership" | "/admin/users";

type NavItem = {
  label: string;
  to: AdminRoutePath;
  icon: React.ComponentType<React.SVGProps<SVGSVGElement>>;
};

const ADMIN_NAV: readonly NavItem[] = [
  { label: "Dashboard", to: "/admin/dashboard", icon: LayoutDashboard },
  { label: "Membership", to: "/admin/membership", icon: BadgeCheck },
  { label: "Users", to: "/admin/users", icon: Users },
] as const;

function isNavActive(pathname: string, to: AdminRoutePath): boolean {
  if (to === "/admin/dashboard") {
    return (
      pathname === "/admin" ||
      pathname === "/admin/" ||
      pathname === "/admin/dashboard" ||
      pathname.startsWith("/admin/dashboard/")
    );
  }
  return pathname === to || pathname.startsWith(`${to}/`);
}

function getCurrentAdminLabel(pathname: string): string {
  if (pathname === "/admin" || pathname === "/admin/") return "Dashboard";
  if (pathname.startsWith("/admin/membership")) return "Membership";
  if (pathname.startsWith("/admin/users")) return "Users";
  if (pathname.startsWith("/admin/dashboard")) return "Dashboard";
  return "Administration";
}

function AdminSidebar() {
  const pathname = useRouterState({ select: (s) => s.location.pathname });

  return (
    <Sidebar>
      <SidebarHeader>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton
              asChild
              size="lg"
              className="hover:bg-transparent hover:text-sidebar-foreground"
            >
              <Link to="/admin/dashboard">
                <div className="flex size-8 items-center justify-center">
                  <img
                    src="/iahi-logo-square.png"
                    alt="IAHI"
                    className="size-8 rounded-sm object-contain"
                  />
                </div>
                <div className="grid flex-1 text-left text-sm leading-tight">
                  <span className="truncate font-medium">IAHI Admin</span>
                  <span className="truncate text-xs text-muted-foreground">
                    Administration panel
                  </span>
                </div>
              </Link>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarHeader>

      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel>Navigation</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {ADMIN_NAV.map((item) => {
                const Icon = item.icon;
                const isActive = isNavActive(pathname, item.to);
                return (
                  <SidebarMenuItem key={item.to}>
                    <SidebarMenuButton
                      asChild
                      isActive={isActive}
                      // Override default sidebar accent styling for admin: keep active minimal.
                      className="hover:bg-transparent hover:text-sidebar-foreground data-[active=true]:bg-transparent data-[active=true]:text-sidebar-foreground data-[active=true]:font-medium"
                    >
                      <Link to={item.to}>
                        <Icon className="size-4" />
                        <span>{item.label}</span>
                      </Link>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                );
              })}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>

      <SidebarFooter>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton asChild>
              <Link to="/">
                <ArrowLeft className="size-4" />
                <span>Back to Home</span>
              </Link>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
        <div className="px-2 pb-2 text-xs text-muted-foreground">
          Admin access only
        </div>
      </SidebarFooter>
      <SidebarRail />
    </Sidebar>
  );
}

type AdminShellProps = {
  children: React.ReactNode;
  className?: string;
};

function AdminTopbarUserMenu() {
  const navigate = useNavigate();
  const { data: session, isPending: isSessionPending } = authClient.useSession();
  const user = session?.user as SessionUserWithRole | undefined;
  const signedIn = Boolean(user);
  const baseUrl = import.meta.env.VITE_APP_URL;

  const profileQuery = useQuery({
    ...profileMeQueryOptions,
    enabled: signedIn,
  });

  const initial =
    user?.name?.trim().slice(0, 1).toUpperCase() ??
    user?.email?.slice(0, 1).toUpperCase() ??
    "?";

  const rawAvatar = profileQuery.data?.profile.image ?? user?.image ?? null;
  const avatarSrc = rawAvatar
    ? rawAvatar.startsWith("http://") || rawAvatar.startsWith("https://")
      ? rawAvatar
      : rawAvatar.startsWith("/")
        ? rawAvatar
        : `${baseUrl.replace(/\/$/, "")}/${rawAvatar.replace(/^\//, "")}`
    : null;

  async function handleSignOut() {
    await authClient.signOut();
    void navigate({ to: "/" });
  }

  if (isSessionPending) return <Skeleton className="h-9 w-9" />;
  if (!signedIn) return null;

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="outline"
          size="default"
          className="h-9 min-h-9 gap-2 px-2"
          aria-label="Open user menu"
        >
          <Avatar size="sm" className="size-7">
            {avatarSrc ? <AvatarImage src={avatarSrc} alt="" /> : null}
            <AvatarFallback className="text-xs">{initial}</AvatarFallback>
          </Avatar>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="min-w-48">
        <DropdownMenuLabel className="font-normal">
          <div className="flex flex-col gap-0.5">
            <span className="truncate text-sm font-medium">
              {user?.name ?? "Account"}
            </span>
            <span className="truncate text-xs text-muted-foreground">
              {user?.email}
            </span>
          </div>
        </DropdownMenuLabel>
        <DropdownMenuSeparator />
        <DropdownMenuItem asChild>
          <Link to="/profile" className="cursor-pointer">
            <User className="size-4" aria-hidden />
            Profile
          </Link>
        </DropdownMenuItem>
        <DropdownMenuSeparator />
        <DropdownMenuItem
          variant="destructive"
          className="cursor-pointer"
          onSelect={() => {
            void handleSignOut();
          }}
        >
          <LogOutIcon className="size-4" aria-hidden />
          Sign out
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

export function AdminShell({ children, className }: AdminShellProps) {
  const pathname = useRouterState({ select: (s) => s.location.pathname });
  const currentLabel = getCurrentAdminLabel(pathname);

  return (
    <SidebarProvider className={cn(className)}>
      <AdminSidebar />
      <SidebarInset>
        <header className="flex h-14 shrink-0 items-center gap-2 border-b px-4">
          <SidebarTrigger className="-ml-1" />
          <Separator orientation="vertical" className="mr-1 h-4" />
          <p className="text-sm text-muted-foreground">
            Admin / <span className="font-medium text-foreground">{currentLabel}</span>
          </p>
          <div className="ml-auto flex items-center gap-2">
            <ThemeToggle />
            <AdminTopbarUserMenu />
          </div>
        </header>
        <div className="flex-1 p-4 md:p-6">{children}</div>
      </SidebarInset>
    </SidebarProvider>
  );
}
