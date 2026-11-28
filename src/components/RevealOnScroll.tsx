"use client";

import { usePathname } from "next/navigation";
import { useEffect } from "react";

// Animação de entrada das secções (.reveal → .in-view), como no site original.
export default function RevealOnScroll() {
  const pathname = usePathname();
  useEffect(() => {
    const els = Array.from(document.querySelectorAll(".reveal:not(.in-view)"));
    if (!("IntersectionObserver" in window)) {
      els.forEach((el) => el.classList.add("in-view"));
      return;
    }
    const io = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add("in-view");
            io.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.12 }
    );
    els.forEach((el) => io.observe(el));
    return () => io.disconnect();
  }, [pathname]);
  return null;
}
