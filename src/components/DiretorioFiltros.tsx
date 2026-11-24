"use client";

import { useMemo, useState } from "react";
import ProCard from "./ProCard";
import { ProfissionalPublico } from "@/lib/types";

export default function DiretorioFiltros({ pros }: { pros: ProfissionalPublico[] }) {
  const [distrito, setDistrito] = useState("");
  const [servico, setServico] = useState("");
  const [ordenar, setOrdenar] = useState<"rating" | "experiencia">("rating");

  const distritos = useMemo(() => [...new Set(pros.map((p) => p.distrito))].sort(), [pros]);
  const servicos = useMemo(() => [...new Set(pros.flatMap((p) => p.servicos))].sort(), [pros]);

  const filtrados = useMemo(() => {
    let list = pros.filter((p) => {
      if (distrito && p.distrito !== distrito) return false;
      if (servico && !p.servicos.includes(servico)) return false;
      return true;
    });
    list = [...list].sort((a, b) =>
      ordenar === "experiencia" ? b.anos_experiencia - a.anos_experiencia : b.avaliacao - a.avaliacao
    );
    return list;
  }, [pros, distrito, servico, ordenar]);

  return (
    <>
      <div className="filters">
        <select value={distrito} onChange={(e) => setDistrito(e.target.value)}>
          <option value="">Todos os distritos</option>
          {distritos.map((d) => <option key={d} value={d}>{d}</option>)}
        </select>
        <select value={servico} onChange={(e) => setServico(e.target.value)}>
          <option value="">Todos os serviços</option>
          {servicos.map((s) => <option key={s} value={s}>{s}</option>)}
        </select>
        <select value={ordenar} onChange={(e) => setOrdenar(e.target.value as "rating" | "experiencia")}>
          <option value="rating">Ordenar por avaliação</option>
          <option value="experiencia">Ordenar por experiência</option>
        </select>
      </div>

      {filtrados.length === 0 && (
        <p className="muted">Nenhum profissional encontrado com estes filtros.</p>
      )}
      <div className="grid grid-3">
        {filtrados.map((p) => <ProCard key={p.id} p={p} />)}
      </div>
    </>
  );
}
