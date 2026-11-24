import Link from "next/link";
import { ProfissionalPublico, corAvatar, estrelas, iniciais } from "@/lib/types";

export default function ProCard({ p }: { p: ProfissionalPublico }) {
  const nome = p.empresa || p.nome;
  const zona = p.concelhos.slice(0, 2).join(", ");
  return (
    <Link className="pro-card" href={`/profissionais/${p.id}`}>
      <div className="pro-cover">
        <div className={`pro-avatar ${corAvatar(p.id)}`}>{iniciais(nome)}</div>
      </div>
      <div className="pro-body">
        <div className="pro-name">{nome}</div>
        <div className="pro-zone">{zona} · {p.distrito}</div>
        <div className="pro-tags">
          {p.servicos.slice(0, 3).map((s) => (
            <span className="tag" key={s}>{s}</span>
          ))}
        </div>
        <div className="pro-rating">
          <span className="stars">{estrelas(p.avaliacao)}</span> {p.avaliacao.toFixed(1)}{" "}
          <span className="muted">({p.num_avaliacoes})</span>
        </div>
        {p.verificado ? (
          <span className="badge-verified">✓ Verificado</span>
        ) : (
          <span className="tag">Verificação pendente</span>
        )}
      </div>
    </Link>
  );
}
