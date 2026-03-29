import { Mail, MapPin } from "lucide-react";
import { motion, useReducedMotion } from "framer-motion";

import { Separator } from "@/components/ui/separator";

const QUICK_LINKS = [
  { label: "Home", href: "/" },
  { label: "About", href: "/about" },
  { label: "Publications", href: "/publications" },
  { label: "Agenda", href: "/agenda" },
  { label: "Members", href: "/members" },
] as const;

const LEGAL_LINKS = [
  { label: "Privacy Policy", href: "/privacy-policy" },
  { label: "Terms and Conditions", href: "/terms-and-conditions" },
] as const;

export default function Footer() {
  const year = new Date().getFullYear();
  const reduceMotion = useReducedMotion();

  return (
    <motion.footer
      className="bg-sidebar text-sidebar-foreground"
      initial={
        reduceMotion ? { opacity: 1, y: 0 } : { opacity: 0, y: 16 }
      }
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, amount: 0.2 }}
      transition={{
        duration: reduceMotion ? 0 : 0.45,
        ease: [0.25, 0.1, 0.25, 1],
      }}
    >
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        {/* Main footer grid */}
        <div className="grid grid-cols-1 gap-10 py-14 sm:grid-cols-2 lg:grid-cols-4">
          {/* Brand */}
          <div className="col-span-1 sm:col-span-2 lg:col-span-1">
            <div className="flex items-center gap-3 mb-4">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-sidebar-primary text-sidebar-primary-foreground font-bold text-sm">
                IAHI
              </div>
              <div>
                <p className="text-xs font-semibold text-sidebar-foreground/80 leading-tight">
                  Perhimpunan Informatika
                </p>
                <p className="text-xs font-semibold text-sidebar-foreground/80 leading-tight">
                  Kesehatan Indonesia
                </p>
              </div>
            </div>
            <p className="text-sm text-sidebar-foreground/80 leading-relaxed max-w-xs">
              Independent and non-profit professional organization advancing
              health informatics through collaboration, scientific exchange, and
              institutional development in Indonesia.
            </p>
          </div>

          {/* Quick Links */}
          <div>
            <h2 className="text-sm font-semibold text-sidebar-foreground mb-4 uppercase tracking-wider">
              Quick Links
            </h2>
            <ul className="space-y-2.5">
              {QUICK_LINKS.map(({ label, href }) => (
                <li key={href}>
                  <a
                    href={href}
                    className="text-sm text-sidebar-foreground/80 hover:text-sidebar-primary transition-colors"
                  >
                    {label}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          {/* Legal */}
          <div>
            <h2 className="text-sm font-semibold text-sidebar-foreground mb-4 uppercase tracking-wider">
              Legal
            </h2>
            <ul className="space-y-2.5">
              {LEGAL_LINKS.map(({ label, href }) => (
                <li key={href}>
                  <a
                    href={href}
                    className="text-sm text-sidebar-foreground/80 hover:text-sidebar-primary transition-colors"
                  >
                    {label}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h2 className="text-sm font-semibold text-sidebar-foreground mb-4 uppercase tracking-wider">
              Contact
            </h2>
            <ul className="space-y-3">
              <li className="flex items-start gap-2.5 text-sm text-sidebar-foreground/80">
                <MapPin className="h-4 w-4 mt-0.5 shrink-0 text-sidebar-primary/70" />
                <span>Jakarta, Indonesia</span>
              </li>
              <li className="flex items-center gap-2.5 text-sm text-sidebar-foreground/80">
                <Mail className="h-4 w-4 shrink-0 text-sidebar-primary/70" />
                <a
                  href="mailto:sekretariat@iahi.net"
                  className="hover:text-sidebar-primary transition-colors"
                >
                  sekretariat@iahi.net
                </a>
              </li>
            </ul>
          </div>
        </div>

        <Separator className="bg-sidebar-border" />

        {/* Bottom bar */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-3 py-6 text-xs text-sidebar-foreground/70">
          <p>
            &copy; {year} Indonesian Association of Health Informatics (IAHI).
            All rights reserved.
          </p>
          <p className="flex items-center gap-1">
            Established on November 10, 2005 · Jakarta
          </p>
        </div>
      </div>
    </motion.footer>
  );
}
