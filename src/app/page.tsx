import Link from "next/link";
import { createPublicClient } from "@/lib/supabase/public";
import { ProfissionalPublico } from "@/lib/types";
import ProCard from "@/components/ProCard";

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
          <div className="hero-art">
            <div className="ring" />
            <span style={{ position: "relative", fontWeight: 800, fontSize: "1.3rem", letterSpacing: "-.01em" }}>
              360° de confiança
            </span>
          </div>
        </div>
      </section>

      <section className="section" id="como-funciona">
        <div className="container">
          <div className="center" style={{ maxWidth: 640, margin: "0 auto 48px" }}>
            <span className="eyebrow">Como funciona</span>
            <h2>Duas portas de entrada. Um só processo de confiança.</h2>
          </div>
          <div className="grid grid-2" style={{ gap: 40 }}>
            <div>
              <h3 style={{ marginBottom: 18 }}>Para quem procura um pintor</h3>
              <div className="grid" style={{ gap: 16 }}>
                <div className="step-card">
                  <span className="step-num">1</span>
                  <h3>Descreva o projeto</h3>
                  <p className="muted">Área, divisões, localização e prazo pretendido — leva menos de 2 minutos.</p>
                </div>
                <div className="step-card">
                  <span className="step-num">2</span>
                  <h3>Reserve o serviço</h3>
                  <p className="muted">Confirma a sua reserva. Só depois da confirmação o pedido é atribuído a um profissional da sua zona.</p>
                </div>
                <div className="step-card">
                  <span className="step-num">3</span>
                  <h3>Trabalho acompanhado</h3>
                  <p className="muted">Recebe os contactos do profissional atribuído e acompanhamos até à conclusão.</p>
                </div>
              </div>
            </div>
            <div>
              <h3 style={{ marginBottom: 18 }}>Para profissionais de pintura</h3>
              <div className="grid" style={{ gap: 16 }}>
                <div className="step-card">
                  <span className="step-num">1</span>
                  <h3>Inscreva-se</h3>
                  <p className="muted">Indique a sua zona de atuação, especialidades e experiência.</p>
                </div>
                <div className="step-card">
                  <span className="step-num">2</span>
                  <h3>Verificação</h3>
                  <p className="muted">A nossa equipa confirma os seus dados antes de aparecer no diretório público.</p>
                </div>
                <div className="step-card">
                  <span className="step-num">3</span>
                  <h3>Receba pedidos</h3>
                  <p className="muted">Pedidos de clientes na sua zona são-lhe atribuídos diretamente — sem concorrer por leads.</p>
                </div>
              </div>
            </div>
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
