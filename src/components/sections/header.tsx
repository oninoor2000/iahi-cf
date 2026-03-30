import { ArrowRightIcon, MenuIcon } from "lucide-react";

import { Button } from "@/components/ui/button";
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
import { Link } from "@tanstack/react-router";

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

const Navbar = () => {
  return (
    <header className="sticky top-0 z-50 border-b border-border/50 bg-background">
      <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-5 lg:px-0">
        <span className="text-2xl font-bold">IAHI</span>
        <div className="flex items-center gap-8 font-medium text-muted-foreground md:justify-center">
          {navigationData.map((item) => (
            <Link
              key={item.href}
              to={item.href}
              className="text-base font-normal hover:text-primary max-md:hidden"
              activeProps={{ className: "text-primary font-medium!" }}
            >
              {item.title}
            </Link>
          ))}
        </div>

        <div className="flex items-center gap-2">
          <ThemeToggle />
          <Button
            size="default"
            className="group hidden px-4 py-2 hover:cursor-pointer md:inline-flex"
          >
            <>
              <a href="/join-us">Join Us</a>
              <ArrowRightIcon className="size-4 transition-transform duration-300 group-hover:-rotate-45" />
            </>
          </Button>
          <Sheet>
            <SheetTrigger asChild>
              <Button
                variant="outline"
                size="icon"
                className="md:hidden"
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
                            className="block rounded-md px-4 py-3 text-base font-medium transition duration-200 hover:bg-accent"
                          >
                            {item.title}
                          </a>
                        </SheetClose>
                      </li>
                    ))}
                  </ul>
                </nav>
                <div className="data-[state=open]:animate-in data-[state=open]:fade-in-0 mt-auto border-t px-2 pt-4 data-[state=open]:duration-300">
                  <SheetClose asChild>
                    <a href="/join-us" className="block">
                      <Button size="default" className="group w-full">
                        Join Us
                        <ArrowRightIcon className="size-4 transition-transform duration-300 group-hover:-rotate-45" />
                      </Button>
                    </a>
                  </SheetClose>
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
