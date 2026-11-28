import Link from "next/link";

export const metadata = { title: "Torne-se Parceiro — Pintura360" };

export default function TrabalheConnosco() {
  return (
    <>
      <section className="page-hero" style={{ padding: "48px 0" }}>
        <div className="container page-hero-grid">
          <div>
            <span className="eyebrow">Para Profissionais</span>
            <h1 style={{ fontSize: "2.1rem" }}>Receba pedidos de pintura na sua zona</h1>
            <p className="muted">Sem concorrer por leads. Sem mensalidades para se inscrever. Cada pedido atribuído é um cliente que já confirmou o serviço.</p>
            <div className="hero-stats">
              <div className="hero-stat"><b>0€</b><span>Para se inscrever</span></div>
              <div className="hero-stat"><b>48h</b><span>Até à verificação</span></div>
            </div>
          </div>
          <div className="grid" style={{ gap: 14 }}>
            <div className="step-card"><span className="step-num">1</span><h3>Crie conta e inscreva-se</h3><p className="muted">Dados da empresa, zona e especialidades.</p></div>
            <div className="step-card"><span className="step-num">2</span><h3>Aguarde verificação</h3><p className="muted">Confirmamos os seus dados antes de ativar o perfil.</p></div>
            <div className="step-card"><span className="step-num">3</span><h3>Receba pedidos</h3><p className="muted">Entramos em contacto quando houver um pedido na sua zona.</p></div>
          </div>
        </div>
      </section>

      <section className="section-sm">
        <div className="container" style={{ maxWidth: 720 }}>
          <div className="card center">
            <span className="eyebrow">Inscrição de parceiro</span>
            <h2 style={{ fontSize: "1.6rem" }}>Comece por criar a sua conta de profissional</h2>
            <p className="muted">
              Com a conta preenche a inscrição da sua empresa, acompanha a verificação e, depois de aprovado,
              vê todos os detalhes dos trabalhos que lhe atribuirmos.
            </p>
            <div className="hero-actions" style={{ justifyContent: "center" }}>
              <Link href="/entrar?tipo=profissional&modo=criar" className="btn btn-orange">Criar conta de profissional</Link>
              <Link href="/entrar?tipo=profissional&modo=entrar" className="btn btn-outline-navy">Já tenho conta</Link>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
