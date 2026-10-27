"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

export function PanelNav({ items }: { items: { href: string; label: string }[] }) {
  const path = usePathname();
  return (
    <>
      {items.map((i) => {
        const active = i.href === "/admin" ? path === "/admin" : path.startsWith(i.href);
        return (
          <Link
            key={i.href}
            href={i.href}
            aria-current={active ? "page" : undefined}
            className={`flex min-h-11 items-center rounded-xl px-3 text-sm font-medium ${
              active ? "bg-zinc-100 text-zinc-900" : "text-zinc-400 hover:bg-zinc-950"
            }`}
          >
            {i.label}
          </Link>
        );
      })}
    </>
  );
}
