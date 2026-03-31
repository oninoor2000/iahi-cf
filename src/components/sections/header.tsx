import {
  ArrowRightIcon,
  ChevronDownIcon,
  LayoutDashboardIcon,
  LogOutIcon,
  MenuIcon,
  UserIcon,
} from "lucide-react";

import { USER_ROLES } from "@/db/auth.schema";
import type { SessionUserWithRole } from "@/lib/auth";
import { authClient } from "@/lib/auth-client";
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
import {
  Sheet,
  SheetClose,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import ThemeToggle from "../ThemeToggle";
import { Link, useNavigate } from "@tanstack/react-router";

type NavigationItem = {
  title: string;
  href: string;
};

const navigationData: NavigationItem[] = [
  { title: "Home", href: "/" },
  { title: "About", href: "/about" },
  { title: "Publications", href: "/publications" },
  { title: "Agenda", href: "/agenda" },
  { title: "Members", href: "/members" },
  { title: "Contact Us", href: "/contact-us" },
];

function isAdminRole(user: SessionUserWithRole | undefined): boolean {
  return user?.role === USER_ROLES.ADMIN;
}

/** Desktop inline nav starts at `lg` so tablets (e.g. iPad mini) keep the mobile sheet. */
const Navbar = () => {
  const navigate = useNavigate();
  const { data: session } = authClient.useSession();
  const user = session?.user as SessionUserWithRole | undefined;
  const signedIn = Boolean(user);
  const showAdmin = isAdminRole(user);

  async function handleSignOut() {
    await authClient.signOut();
    void navigate({ to: "/" });
  }

  const initial =
    user?.name?.trim().slice(0, 1).toUpperCase() ??
    user?.email?.slice(0, 1).toUpperCase() ??
    "?";

  return (
    <header className="sticky top-0 z-50 border-b border-border/50 bg-background">
      <div className="mx-auto flex max-w-6xl items-center justify-between gap-4 px-4 py-3 lg:px-0">
        <span className="text-xl font-bold tracking-tight lg:text-2xl">
          IAHI
        </span>
        <nav
          className="hidden flex-1 items-center justify-center gap-6 font-medium text-muted-foreground lg:flex xl:gap-8"
          aria-label="Main"
        >
          {navigationData.map((item) => (
            <Link
              key={item.href}
              to={item.href}
              className="inline-flex min-h-10 items-center px-1 text-base font-normal hover:text-primary"
              activeProps={{ className: "text-primary font-medium!" }}
            >
              {item.title}
            </Link>
          ))}
        </nav>

        <div className="flex shrink-0 items-center gap-2">
          <ThemeToggle />
          {signedIn ? (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  variant="outline"
                  size="default"
                  className="hidden h-10 min-h-10 gap-2 px-2 lg:inline-flex"
                  aria-label="Open user menu"
                >
                  <Avatar size="sm" className="size-7">
                    {user?.image ? (
                      <AvatarImage src={user.image} alt="" />
                    ) : null}
                    <AvatarFallback className="text-xs">
                      {initial}
                    </AvatarFallback>
                  </Avatar>
                  {/* <span className="max-w-40 truncate text-base font-medium">
                    {user?.name ?? user?.email ?? "Account"}
                  </span> */}
                  {/* <ChevronDownIcon className="size-4 shrink-0 opacity-70" aria-hidden /> */}
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
                    <UserIcon className="size-4" aria-hidden />
                    Profile
                  </Link>
                </DropdownMenuItem>
                {showAdmin ? (
                  <DropdownMenuItem asChild>
                    <Link to="/admin/dashboard" className="cursor-pointer">
                      <LayoutDashboardIcon className="size-4" aria-hidden />
                      Admin dashboard
                    </Link>
                  </DropdownMenuItem>
                ) : null}
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
          ) : (
            <Button
              asChild
              size="default"
              className="group hidden h-10 min-h-10 px-3.5 hover:cursor-pointer lg:inline-flex"
            >
              <Link
                to="/sign-in"
                className="inline-flex items-center gap-1.5 text-base"
              >
                Join Us
                <ArrowRightIcon
                  className="size-4 shrink-0 transition-transform duration-300 group-hover:-rotate-45"
                  aria-hidden
                />
              </Link>
            </Button>
          )}
          <Sheet>
            <SheetTrigger asChild>
              <Button
                variant="outline"
                size="icon"
                className="h-11 min-h-11 min-w-11 lg:hidden"
                aria-label="Open menu"
              >
                <MenuIcon className="size-5" />
              </Button>
            </SheetTrigger>
            <SheetContent
              side="right"
              className="w-[88vw] border-l-0 p-0 duration-300 sm:max-w-sm"
            >
              <SheetHeader className="border-b px-5 py-4">
                <SheetTitle className="text-lg">IAHI</SheetTitle>
                <SheetDescription>
                  Indonesian Association of Health Informatics
                </SheetDescription>
              </SheetHeader>
              <div className="data-[state=open]:animate-in data-[state=open]:fade-in-0 flex h-full flex-col overflow-y-auto px-3 py-4 data-[state=open]:duration-300">
                <nav aria-label="Mobile navigation">
                  <ul className="data-[state=open]:animate-in data-[state=open]:slide-in-from-right-2 space-y-1 data-[state=open]:duration-300">
                    {navigationData.map((item) => (
                      <li key={item.href}>
                        <SheetClose asChild>
                          <a
                            href={item.href}
                            className="flex min-h-10 items-center rounded-md px-4 py-2.5 text-base font-medium transition duration-200 hover:bg-accent"
                          >
                            {item.title}
                          </a>
                        </SheetClose>
                      </li>
                    ))}
                    {signedIn ? (
                      <>
                        <li>
                          <SheetClose asChild>
                            <Link
                              to="/profile"
                              className="flex min-h-10 items-center rounded-md px-4 py-2.5 text-base font-medium transition duration-200 hover:bg-accent"
                            >
                              Profile
                            </Link>
                          </SheetClose>
                        </li>
                        {showAdmin ? (
                          <li>
                            <SheetClose asChild>
                              <Link
                                to="/admin/dashboard"
                                className="flex min-h-10 items-center rounded-md px-4 py-2.5 text-base font-medium transition duration-200 hover:bg-accent"
                              >
                                Admin dashboard
                              </Link>
                            </SheetClose>
                          </li>
                        ) : null}
                      </>
                    ) : null}
                  </ul>
                </nav>
                <div className="data-[state=open]:animate-in data-[state=open]:fade-in-0 mt-auto border-t px-2 pt-4 data-[state=open]:duration-300">
                  {signedIn ? (
                    <SheetClose asChild>
                      <Button
                        type="button"
                        variant="outline"
                        className="h-10 min-h-10 w-full"
                        onClick={() => {
                          void handleSignOut();
                        }}
                      >
                        Sign out
                      </Button>
                    </SheetClose>
                  ) : (
                    <SheetClose asChild>
                      <Button
                        asChild
                        size="default"
                        className="group h-10 min-h-10 w-full"
                      >
                        <Link
                          to="/sign-in"
                          className="inline-flex items-center justify-center gap-1.5"
                        >
                          Join Us
                          <ArrowRightIcon
                            className="size-4 shrink-0 transition-transform duration-300 group-hover:-rotate-45"
                            aria-hidden
                          />
                        </Link>
                      </Button>
                    </SheetClose>
                  )}
                </div>
              </div>
            </SheetContent>
          </Sheet>
        </div>
      </div>
    </header>
  );
};

export default Navbar;
