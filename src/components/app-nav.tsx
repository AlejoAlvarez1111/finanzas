"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const ITEMS = [
  { href: "/", label: "Inicio", ready: true },
  { href: "/historial", label: "Historial", ready: false },
  { href: "/cuentas", label: "Cuentas", ready: false },
  { href: "/recurrentes", label: "Recurrentes", ready: false },
];

export function AppNav({ variant }: { variant: "side" | "bottom" }) {
  const pathname = usePathname();
  const side = variant === "side";

  return (
    <nav aria-label="Principal" className={side ? "flex flex-col gap-1" : "flex justify-around"}>
      {ITEMS.map(({ href, label, ready }) => {
        const active = href === "/" ? pathname === "/" : pathname.startsWith(href);
        const base = side ? "rounded-xl px-4 py-3 text-sm" : "flex min-h-14 items-center px-3 text-xs";
        if (!ready) {
          return (
            <span key={href} aria-disabled="true" className={`${base} text-muted/60`}>
              {label}
            </span>
          );
        }
        return (
          <Link
            key={href}
            href={href}
            aria-current={active ? "page" : undefined}
            className={`${base} font-semibold ${active ? (side ? "bg-[#e3ede7] text-brand" : "text-brand") : "text-muted"}`}
          >
            {label}
          </Link>
        );
      })}
    </nav>
  );
}