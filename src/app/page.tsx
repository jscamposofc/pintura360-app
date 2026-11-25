import Link from "next/link";
import { createPublicClient } from "@/lib/supabase/public";
import { ProfissionalPublico } from "@/lib/types";
import ProCard from "@/components/ProCard";
import ProcessAnimation from "@/components/ProcessAnimation";

export default async function Home() {
  const supabase = createPublicClient();
  const { data } = await supabase
    .from("profissionais_publicos")
    .select("*")
    .order("avaliacao", { ascending: false })
    .limit(3);
  const destaque = (data ?? []) as ProfissionalPublico[];

  const { count } = await supabase
    .from("profissionais_publicos")
    .select("*", { count: "exact", head: true });

  return (
    <>
      <section className="hero">
        <div className="container hero-grid">
          <div>
            <span className="eyebrow">Plataforma de Pintura · Grande Lisboa</span>
            <h1>Encontre o profissional de pintura certo. Sem surpresas.</h1>
            <p className="muted" style={{ fontSize: "1.08rem", maxWidth: 540 }}>
              Descreva o seu projeto, receba propostas de profissionais verificados na sua zona
              e só paga depois do trabalho ser atribuído e confirmado. Simples, transparente, seguro.
            </p>
            <div className="hero-actions">
              <Link href="/pedido-orcamento" className="btn btn-orange">Pedir Orçamento Grátis</Link>
              <Link href="/trabalhe-connosco" className="btn btn-outline-navy">Quero Receber Trabalhos</Link>
            </div>
            <div className="hero-stats">
              <div className="hero-stat"><b>{(count ?? 0) + "+"}</b><span>Profissionais verificados</span></div>
              <div className="hero-stat"><b>48h</b><span>Tempo médio de resposta</span></div>
              <div className="hero-stat"><b>100%</b><span>Pagamento protegido</span></div>
            </div>
          </div>
          <div className="hero-photo">
            <img src="/fotos/hero-divisao-pintura.jpg" alt="Profissional Pintura360 a pintar uma divisão" />
            <div className="hero-photo-badge">360° de cuidado — do primeiro contacto à limpeza final.</div>
          </div>
        </div>
      </section>

      <section className="section" id="como-funciona">
        <div className="container">
          <div className="center" style={{ maxWidth: 640, margin: "0 auto 36px" }}>
            <span className="eyebrow">Como funciona</span>
            <h2>Do pedido à parede pintada, em 4 passos.</h2>
          </div>
          <ProcessAnimation />
          <div className="center" style={{ marginTop: 28 }}>
            <Link href="/como-funciona" className="btn btn-outline-navy">Ver como funciona em detalhe</Link>
          </div>
        </div>
      </section>

      <section className="section" style={{ background: "#fff", borderTop: "1px solid var(--line)" }}>
        <div className="container">
          <div className="center" style={{ maxWidth: 640, margin: "0 auto 36px" }}>
            <span className="eyebrow">Transformamos espaços</span>
            <h2>Profissionais a sério, trabalho a sério.</h2>
          </div>
          <div className="photo-gallery">
            <img className="tall" src="/fotos/hero-divisao-pintura.jpg" alt="Profissional Pintura360 a pintar uma parede cinzenta" />
            <img src="/fotos/foto-equipa-1.jpg" alt="Profissional Pintura360 a pintar, visto de costas" />
            <img src="/fotos/hero-cuidado-detalhe.jpg" alt="Pormenor do trabalho de pintura Pintura360" />
          </div>
        </div>
      </section>

      {destaque.length > 0 && (
        <section className="section" style={{ background: "#fff", borderTop: "1px solid var(--line)", borderBottom: "1px solid var(--line)" }}>
          <div className="container">
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-end", marginBottom: 28, flexWrap: "wrap", gap: 12 }}>
              <div>
                <span className="eyebrow">Diretório</span>
                <h2 style={{ marginBottom: 0 }}>Profissionais verificados</h2>
              </div>
              <Link href="/profissionais" className="btn btn-outline-navy btn-sm">Ver todos</Link>
            </div>
            <div className="grid grid-3">
              {destaque.map((p) => <ProCard key={p.id} p={p} />)}
            </div>
          </div>
        </section>
      )}

      <section className="section">
        <div className="container cta-band">
          <h2>Pronto para começar?</h2>
          <p className="muted">Peça já um orçamento ou junte-se à nossa rede de profissionais.</p>
          <div className="hero-actions" style={{ justifyContent: "center" }}>
            <Link href="/pedido-orcamento" className="btn btn-orange">Pedir Orçamento Grátis</Link>
            <Link href="/trabalhe-connosco" className="btn btn-outline-navy" style={{ borderColor: "#fff", color: "#fff" }}>
              Quero Receber Trabalhos
            </Link>
          </div>
        </div>
      </section>
    </>
  );
}
