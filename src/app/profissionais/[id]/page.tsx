import { notFound } from "next/navigation";
import Link from "next/link";
import { createPublicClient } from "@/lib/supabase/public";
import { ProfissionalPublico, corAvatar, estrelas, iniciais } from "@/lib/types";

export const revalidate = 60;

export default async function Perfil({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const supabase = createPublicClient();
  const { data } = await supabase
    .from("profissionais_publicos")
    .select("*")
    .eq("id", id)
    .maybeSingle();

  if (!data) notFound();
  const p = data as ProfissionalPublico;
  const nome = p.empresa || p.nome;

  return (
    <section className="section-sm">
      <div className="container" style={{ maxWidth: 820 }}>
        <p><Link href="/profissionais" className="muted">← Voltar ao diretório</Link></p>

        <div className="card" style={{ display: "flex", gap: 20, alignItems: "center", flexWrap: "wrap" }}>
          <div className={`pro-avatar ${corAvatar(p.id)}`} style={{ position: "static" }}>
            {iniciais(nome)}
          </div>
          <div style={{ flex: 1, minWidth: 200 }}>
            <h1 style={{ fontSize: "1.6rem", marginBottom: 4 }}>{nome}</h1>
            <div className="pro-zone" style={{ marginBottom: 8 }}>
              {p.concelhos.join(", ")} · {p.distrito}
            </div>
            {p.verificado ? (
              <span className="badge-verified">✓ Verificado pela Pintura360</span>
            ) : (
              <span className="tag">Verificação pendente</span>
            )}
          </div>
        </div>

        <div className="grid grid-2" style={{ marginTop: 24 }}>
          <div className="card">
            <h3>Sobre</h3>
            <p className="muted">{p.bio || "Sem descrição disponível."}</p>
            <p><strong>{p.anos_experiencia} anos</strong> <span className="muted">de experiência</span></p>
          </div>
          <div className="card">
            <h3>Especialidades</h3>
            <div className="pro-tags" style={{ marginBottom: 16 }}>
              {p.servicos.map((s) => <span className="tag" key={s}>{s}</span>)}
            </div>
            <h3>Zona de atuação</h3>
            <div className="pro-tags">
              {p.concelhos.map((s) => <span className="tag" key={s}>{s}</span>)}
            </div>
          </div>
        </div>

        <div className="card" style={{ marginTop: 24 }}>
          <h3>Avaliação</h3>
          <div className="pro-rating" style={{ fontSize: "1.3rem" }}>
            <span className="stars">{estrelas(p.avaliacao)}</span> {p.avaliacao.toFixed(1)}{" "}
            <span className="muted">({p.num_avaliacoes} avaliações)</span>
          </div>
          <p className="muted" style={{ marginTop: 8 }}>
            Baseado em avaliações de clientes que concluíram um serviço através da Pintura360.
          </p>
        </div>

        <div className="alert alert-info" style={{ marginTop: 24 }}>
          Por segurança de todas as partes, os contactos diretos deste profissional só são
          partilhados depois de um pedido ser confirmado e atribuído através da plataforma.
        </div>

        <div className="cta-band" style={{ marginTop: 8 }}>
          <h2 style={{ fontSize: "1.5rem" }}>Quer trabalhar com este profissional?</h2>
          <p className="muted">
            Peça um orçamento indicando esta preferência — tentaremos atribuir o pedido a ele(a),
            consoante disponibilidade na sua zona.
          </p>
          <Link
            href={`/pedido-orcamento?pref=${p.id}&prefNome=${encodeURIComponent(nome)}`}
            className="btn btn-orange"
          >
            Pedir Orçamento
          </Link>
        </div>
      </div>
    </section>
  );
}
