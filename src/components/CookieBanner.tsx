"use client";

import Link from "next/link";
import { useState, useSyncExternalStore } from "react";

const KEY = "p360_cookies_ok";
const subscribe = () => () => {};
function lerAceite(): boolean {
  try {
    return localStorage.getItem(KEY) === "1";
  } catch {
    return true; // armazenamento indisponível — não mostra o aviso
  }
}

export default function CookieBanner() {
  const aceiteGuardado = useSyncExternalStore(subscribe, lerAceite, () => true);
  const [fechado, setFechado] = useState(false);
  const visible = !aceiteGuardado && !fechado;

  function accept() {
    try {
      localStorage.setItem(KEY, "1");
    } catch {
      /* ignorado */
    }
    setFechado(true);
  }

  return (
    <div className={`cookie-banner${visible ? " visible" : ""}`} role="dialog" aria-live="polite">
      <p>
        Este site utiliza cookies essenciais ao seu funcionamento. Cookies opcionais (análise, marketing) só serão
        ativados com o seu consentimento explícito, quando existirem. <Link href="/cookies">Saber mais</Link>.
      </p>
      <button type="button" className="btn btn-orange" onClick={accept}>Entendi</button>
    </div>
  );
}
