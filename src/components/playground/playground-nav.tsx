"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/utils/class-name";

const NAV_ITEMS = [
  { href: "/", label: "Overview" },
  { href: "/chat", label: "Chat Lab" },
  { href: "/image", label: "Image Lab" },
] as const;

export function PlaygroundNav() {
  const pathname = usePathname();

  return (
    <nav className="flex flex-wrap gap-2">
      {NAV_ITEMS.map((item) => {
        const isActive = pathname === item.href;

        return (
          <Link
            key={item.href}
            href={item.href}
            className={cn(
              "rounded-lg border px-3 py-1.5 text-sm transition",
              isActive
                ? "border-slate-900 bg-slate-900 text-white"
                : "border-slate-200 bg-white text-slate-700 hover:bg-slate-50",
            )}
          >
            {item.label}
          </Link>
        );
      })}
    </nav>
  );
}
