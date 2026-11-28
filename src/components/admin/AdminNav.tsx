"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

export default function AdminNav({ novos, pendentes }: { novos: number; pendentes: number }) {
  const pathname = usePathname();
  const links = [
    { href: "/admin/pedidos", label: "Pedidos", count: novos },
    { href: "/admin/profissionais", label: "Profissionais", count: pendentes },
  ];
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
