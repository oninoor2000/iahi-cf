import type { ReactNode } from "react";
import { QueryClientProvider } from "@tanstack/react-query";
import { TanStackDevtools } from "@tanstack/react-devtools";
import { TanStackRouterDevtoolsPanel } from "@tanstack/react-router-devtools";
import {
  HeadContent,
  Scripts,
  createRootRouteWithContext,
  type ErrorComponentProps,
  useRouter,
  useRouterState,
} from "@tanstack/react-router";

import type { AppRouterContext } from "@/router-context";
import { ThemeProvider } from "../components/providers/theme-provider";

import appCss from "../styles.css?url";
import Footer from "@/components/sections/footer";
import Header from "../components/sections/header";
import MembershipPromoBanner from "@/components/sections/membership-promo-banner";
import {
  ErrorView,
  NotFoundView,
} from "@/components/system/route-fallbacks";
import { Toaster } from "@/components/ui/sonner";

const THEME_INIT_SCRIPT = `(function(){try{var key='iahi-theme';var cookie=document.cookie.match(new RegExp('(?:^|; )'+key+'=([^;]*)'));var cookieMode=cookie?decodeURIComponent(cookie[1]):null;var stored=window.localStorage.getItem(key);var mode=(stored==='light'||stored==='dark'||stored==='system')?stored:((cookieMode==='light'||cookieMode==='dark'||cookieMode==='system')?cookieMode:'system');var prefersDark=window.matchMedia('(prefers-color-scheme: dark)').matches;var resolved=mode==='system'?(prefersDark?'dark':'light'):mode;var root=document.documentElement;root.classList.remove('light','dark');root.classList.add(resolved);if(mode==='system'){root.removeAttribute('data-theme')}else{root.setAttribute('data-theme',mode)}root.style.colorScheme=resolved;}catch(e){}})();`;

const CHROME_HIDDEN_PATHS = new Set(["/sign-in", "/sign-up", "/unauthorized"]);

function SiteChrome({ children }: { children: ReactNode }) {
  const pathname = useRouterState({
    select: (s) => s.location.pathname,
  });
  const isAdminRoute = pathname.startsWith("/admin");
  const showSiteChrome = !CHROME_HIDDEN_PATHS.has(pathname) && !isAdminRoute;

  return (
    <>
      {showSiteChrome ? (
        <>
          <Header />
          <MembershipPromoBanner />
        </>
      ) : null}
      {children}
      {showSiteChrome ? <Footer /> : null}
    </>
  );
}

export const Route = createRootRouteWithContext<AppRouterContext>()({
  head: () => ({
    meta: [
      { charSet: "utf-8" },
      { name: "viewport", content: "width=device-width, initial-scale=1" },
      {
        title: "IAHI – Perhimpunan Informatika Kesehatan Indonesia",
      },
      {
        name: "description",
        content:
          "Organisasi profesi yang menaungi pemerhati di bidang Informatika Kesehatan di Indonesia. Bergabung bersama para profesional dari kedokteran, kesehatan masyarakat, dan teknologi informasi.",
      },
      { name: "theme-color", content: "#1a6fb4" },
    ],
    links: [
      {
        rel: "stylesheet",
        href: appCss,
      },
      {
        rel: "icon",
        type: "image/png",
        sizes: "32x32",
        href: "/favicon/favicon-32x32.png",
      },
      {
        rel: "icon",
        type: "image/png",
        sizes: "16x16",
        href: "/favicon/favicon-16x16.png",
      },
      {
        rel: "apple-touch-icon",
        sizes: "180x180",
        href: "/favicon/apple-touch-icon.png",
      },
      {
        rel: "manifest",
        href: "/manifest.json",
      },
    ],
  }),
  notFoundComponent: NotFoundView,
  errorComponent: RootErrorComponent,
  shellComponent: RootDocument,
});

function RootErrorComponent(props: ErrorComponentProps) {
  return <ErrorView error={props.error} reset={props.reset} />;
}

function RootDocument({ children }: { children: ReactNode }) {
  const router = useRouter();
  const queryClient = router.options.context.queryClient;

  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <script dangerouslySetInnerHTML={{ __html: THEME_INIT_SCRIPT }} />
        <HeadContent />
      </head>
      <body className="font-sans wrap-anywhere antialiased selection:bg-[rgba(79,184,178,0.24)]">
        <QueryClientProvider client={queryClient}>
          <ThemeProvider>
            <SiteChrome>{children}</SiteChrome>
            <Toaster position="bottom-right" richColors closeButton />
          </ThemeProvider>
        </QueryClientProvider>
        <TanStackDevtools
          config={{
            position: "bottom-right",
          }}
          plugins={[
            {
              name: "Tanstack Router",
              render: <TanStackRouterDevtoolsPanel />,
            },
          ]}
        />
        <Scripts />
      </body>
    </html>
  );
}
