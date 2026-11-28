"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

export default function AdminNav({ links }: { links: { href: string; label: string; count: number }[] }) {
  const pathname = usePathname();
  return (
    <nav className="adm-nav">
      {links.map((l) => (
        <Link key={l.href} href={l.href} className={pathname.startsWith(l.href) ? "active" : ""}>
          {l.label}
          {l.count > 0 && <span className="count">{l.count}</span>}
        </Link>
      ))}
    </nav>
  );
}
