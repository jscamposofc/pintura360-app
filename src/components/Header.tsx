"use client";

import Link from "next/link";
import { useState } from "react";

export default function Header() {
  const [open, setOpen] = useState(false);

  return (
    <header className="site-header">
      <div className="container nav">
        <Link href="/" className="brand">
          <img src="/logo.png" alt="Pintura360" />
        </Link>
        <nav>
          <ul className={`nav-links ${open ? "open" : ""}`}>
            <li><Link href="/#como-funciona" onClick={() => setOpen(false)}>Como funciona</Link></li>
            <li><Link href="/profissionais" onClick={() => setOpen(false)}>Profissionais</Link></li>
            <li><Link href="/trabalhe-connosco" onClick={() => setOpen(false)}>Para Profissionais</Link></li>
            <li><Link href="/#contactos" onClick={() => setOpen(false)}>Contactos</Link></li>
          </ul>
        </nav>
        <div className="nav-cta">
          <Link href="/trabalhe-connosco" className="btn btn-outline-navy btn-sm">Sou Profissional</Link>
          <Link href="/pedido-orcamento" className="btn btn-orange btn-sm">Pedir Orçamento</Link>
          <button
            className="nav-toggle"
            aria-label="Abrir menu"
            onClick={() => setOpen((v) => !v)}
          >
            {open ? "✕" : "☰"}
          </button>
        </div>
      </div>
    </header>
  );
}
