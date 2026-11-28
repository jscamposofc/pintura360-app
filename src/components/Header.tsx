"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";

// Cabeçalho do site original (pintura360.pt), com a navegação por secções.
const LINKS = [
  { href: "/#inicio", id: "inicio", label: "Início" },
  { href: "/#sobre", id: "sobre", label: "Sobre Nós" },
  { href: "/#como-trabalhamos", id: "como-trabalhamos", label: "Como Trabalhamos" },
  { href: "/#projetos", id: "projetos", label: "Projetos" },
  { href: "/trabalhe-connosco", id: "profissionais", label: "Para Profissionais" },
  { href: "/#contactos", id: "contactos", label: "Contactos" },
];

const WA_ICON =
  "M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347";

export default function Header() {
  const [open, setOpen] = useState(false);
  const [active, setActive] = useState("inicio");
  const pathname = usePathname();

  // Realça a secção visível na página inicial (como no site original).
  useEffect(() => {
    if (pathname !== "/") return;
    const ids = ["inicio", "sobre", "como-trabalhamos", "projetos", "contactos"];
    const els = ids.map((id) => document.getElementById(id)).filter(Boolean) as HTMLElement[];
    const io = new IntersectionObserver(
      (entries) => {
        entries.forEach((e) => {
          if (e.isIntersecting) setActive(e.target.id);
        });
      },
      { rootMargin: "-45% 0px -50% 0px" }
    );
    els.forEach((el) => io.observe(el));
    return () => io.disconnect();
  }, [pathname]);

  const activeId = pathname === "/" ? active : pathname.startsWith("/trabalhe-connosco") ? "profissionais" : "";

  return (
    <header>
      <nav className="nav">
        <Link href="/#inicio" className="brand">
          <img src="/logo.png" alt="Pintura360" className="brand-logo-img" />
        </Link>
        <div className={`nav-links${open ? " mobile-open" : ""}`}>
          {LINKS.map((l) => (
            <Link
              key={l.id}
              href={l.href}
              className={activeId === l.id ? "active" : ""}
              onClick={() => setOpen(false)}
            >
              {l.label}
            </Link>
          ))}
        </div>
        <div className="nav-actions">
          <Link href="/entrar" className="nav-login" onClick={() => setOpen(false)}>
            <svg viewBox="0 0 24 24" aria-hidden="true"><circle cx="12" cy="8" r="4" /><path d="M4 21c0-4 3.6-7 8-7s8 3 8 7" /></svg>
            <span>Entrar</span>
          </Link>
          <Link href="/#orcamento" className="btn btn-orange nav-cta-btn" onClick={() => setOpen(false)}>
            <svg width="15" height="15" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
              <path d={WA_ICON} />
            </svg>
            <span className="cta-long">Orçamento Grátis</span>
            <span className="cta-short">Orçamento</span>
          </Link>
        </div>
        <button
          className="menu-toggle"
          aria-label={open ? "Fechar menu" : "Abrir menu"}
          aria-expanded={open}
          onClick={() => setOpen((v) => !v)}
        >
          <span></span>
          <span></span>
          <span></span>
        </button>
      </nav>
    </header>
  );
}
