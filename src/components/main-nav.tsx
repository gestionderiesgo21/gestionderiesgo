"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";

type Item = { href: string; label: string };

export function MainNav({ items }: { items: Item[] }) {
  const pathname = usePathname();
  return (
    <nav className="hidden items-center gap-1 sm:flex">
      {items.map((item) => {
        const activo = pathname === item.href || pathname.startsWith(item.href + "/");
        return (
          <Link
            key={item.href}
            href={item.href}
            className={cn(
              "rounded-lg px-3 py-1.5 text-sm font-medium transition-all duration-200",
              activo
                ? "bg-accent text-accent-foreground shadow-sm"
                : "text-muted-foreground hover:bg-accent/70 hover:text-accent-foreground"
            )}
          >
            {item.label}
          </Link>
        );
      })}
    </nav>
  );
}
