import Orcamento from "@/components/Orcamento";

// Página inicial — layout do site original (pintura360.pt).

const Check = () => (
  <span className="check"><svg viewBox="0 0 16 16"><path d="M2 8l4 4 8-8" /></svg></span>
);

const METODO = [
  { t: "Preparação", d: "Preparação das superfícies para um resultado perfeito.", p: "M14 4l6 6-9 9H5v-6l9-9z" },
  { t: "Proteção", d: "Protegemos o que mais importa: seus móveis, chãos e detalhes.", p: "M12 2l8 4v6c0 5-3.5 8.5-8 10-4.5-1.5-8-5-8-10V6l8-4z" },
  { t: "Reparação", d: "Correção de imperfeições para acabamentos impecáveis.", p: "M3 21l4-1 11-11-3-3L4 17l-1 4z" },
  { t: "Pintura", d: "Pintura profissional com materiais de alta qualidade.", p: "M14 4l6 6-9 9H5v-6l9-9z" },
  { t: "Acabamento", d: "Detalhes que fazem toda a diferença no resultado final.", p: "M12 17.3l-6.2 3.6 1.6-7L2 9.2l7.1-.6L12 2l2.9 6.6 7.1.6-5.4 4.7 1.6 7z" },
  { t: "Limpeza", d: "Deixamos tudo limpo e pronto para você desfrutar.", p: "M3 20h18M6 20V10l6-6 6 6v10" },
];

export default function Home() {
  return (
    <>
      {/* HERO */}
      <section className="hero" id="inicio" style={{ padding: 0 }}>
        <div className="hero-grid">
          <div className="hero-text">
            <p className="hero-eyebrow">Pintura Profissional na Grande Lisboa</p>
            <h1>Pintamos.<br />Cuidamos.<br /><span className="accent">Cumprimos.</span></h1>
            <p className="hero-sub">Serviço completo, do início à limpeza final, com qualidade, rapidez e preço justo.</p>
            <div className="hero-trust">
              <div className="hero-trust-item">
                <div className="icon"><svg viewBox="0 0 24 24"><path d="M12 3l7 3v6c0 4.5-3 8-7 9-4-1-7-4.5-7-9V6l7-3z" /><path d="M9 12l2 2 4-4" /></svg></div>
                <span>Profissionais Experientes</span>
              </div>
              <div className="hero-trust-item">
                <div className="icon"><svg viewBox="0 0 24 24"><circle cx="12" cy="12" r="9" /><path d="M12 7v5l3 3" /></svg></div>
                <span>Cumprimos Prazos</span>
              </div>
              <div className="hero-trust-item">
                <div className="icon"><svg viewBox="0 0 24 24"><circle cx="12" cy="8" r="5" /><path d="M12 13v0" /><path d="M8.5 12L6 21l6-3 6 3-2.5-9" /></svg></div>
                <span>Preço Justo e Transparente</span>
              </div>
            </div>
          </div>
          <div className="hero-visual">
            <img className="hero-visual-bg" src="/site/hero-bg.jpg" alt="Divisão em processo de pintura" />
            <img className="hero-badge-img" src="/site/hero-badge.jpg" alt="360° — Cuidado em cada detalhe. Do primeiro contacto à limpeza final, nós tratamos de tudo por si." />
          </div>
        </div>
      </section>

      {/* CONFIANÇA + CTA RÁPIDA */}
      <section className="trust-cta-band">
        <div className="wrap trust-cta-inner reveal">
          <div className="trust-cta-list">
            <div className="trust-cta-item">
              <div className="trust-cta-icon"><svg viewBox="0 0 24 24"><circle cx="12" cy="12" r="9" /><path d="M12 7v5l3 3" /></svg></div>
              <div><strong>Orçamento pronto em minutos</strong><p>Preencha os dados do seu espaço e receba logo uma estimativa, sem esperar por ninguém.</p></div>
            </div>
            <div className="trust-cta-item">
              <div className="trust-cta-icon"><svg viewBox="0 0 24 24"><path d="M12 3l7 3v6c0 4.5-3 8-7 9-4-1-7-4.5-7-9V6l7-3z" /></svg></div>
              <div><strong>Sinal protegido com a Stripe</strong><p>Pagamentos processados com a mesma tecnologia usada por milhares de empresas em todo o mundo.</p></div>
            </div>
            <div className="trust-cta-item">
              <div className="trust-cta-icon"><svg viewBox="0 0 24 24"><path d="M4 12h16M4 6h16M4 18h10" /></svg></div>
              <div><strong>Consigo do início ao fim</strong><p>A nossa equipa acompanha o projeto em cada etapa, até à limpeza final.</p></div>
            </div>
          </div>
          <a href="#orcamento" className="btn btn-orange trust-cta-btn">Pedir o Meu Orçamento →</a>
        </div>
      </section>

      {/* MÉTODO */}
      <section id="como-trabalhamos">
        <div className="wrap">
          <div className="section-head reveal">
            <p className="section-eyebrow">O Nosso Método</p>
            <h2>Um serviço completo, sem preocupações.</h2>
          </div>
          <div className="metodo-steps reveal">
            {METODO.map((m, i) => (
              <div className="metodo-step" key={m.t}>
                <div className="metodo-icon"><svg viewBox="0 0 24 24"><path d={m.p} /></svg></div>
                <div className="metodo-num">{String(i + 1).padStart(2, "0")}</div>
                <div className="metodo-title">{m.t}</div>
                <div className="metodo-desc">{m.d}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CALCULADORA */}
      <section className="calc-section" id="orcamento">
        <div className="wrap">
          <div className="section-head reveal">
            <p className="section-eyebrow">Orçamento Personalizado</p>
            <h2>Monte o seu projeto e veja a estimativa.</h2>
            <p>Adicione as divisões, paredes ou tetos que quer pintar — calculamos tudo automaticamente.</p>
          </div>
          <div className="calc-card reveal" id="wizardCard">
            <Orcamento />
          </div>
        </div>
      </section>

      {/* PORQUÊ ESCOLHER */}
      <section className="why-section" id="sobre">
        <div className="wrap">
          <div className="why-grid reveal">
            <div className="why-list">
              <p className="section-eyebrow">Porque Escolher a Pintura360?</p>
              <h2>Mais que pintura, tranquilidade para si.</h2>
              <ul className="why-checklist">
                <li><Check /> Cumprimos o prazo combinado</li>
                <li><Check /> Orçamento claro e sem surpresas</li>
                <li><Check /> Profissionais qualificados</li>
                <li><Check /> Atendimento próximo e transparente</li>
                <li><Check /> Respeito total pelo seu espaço</li>
              </ul>
            </div>
            <div className="why-photo"><img src="/site/why-photo.jpg" alt="Profissional Pintura360 a pintar uma parede" loading="lazy" /></div>
            <div className="why-quote">
              <div className="quote-mark">&ldquo;</div>
              <p>Este espaço está reservado para uma avaliação real de um cliente Pintura360 — ainda não temos nenhuma publicada.</p>
            </div>
          </div>
        </div>
      </section>

      {/* PROJETOS */}
      <section id="projetos">
        <div className="wrap">
          <div className="projetos-head reveal">
            <div className="section-head" style={{ marginBottom: 0 }}>
              <p className="section-eyebrow">Projetos Recentes</p>
              <h2>Transformamos espaços.<br />Criamos novos ambientes.</h2>
            </div>
          </div>
          <div className="projects-placeholder reveal">
            <div className="icon"><svg viewBox="0 0 40 40"><rect x="5" y="8" width="30" height="24" rx="1" /><circle cx="14" cy="16" r="3" /><path d="M5 27l9-9 8 8 4-4 9 9" /></svg></div>
            <h3>Portfólio em preparação</h3>
            <p>Não apresentamos imagens de stock como se fossem projetos Pintura360. Assim que os primeiros projetos estiverem documentados, serão apresentados aqui.</p>
          </div>
        </div>
      </section>

      {/* CTA FINAL */}
      <section className="cta-final">
        <div className="wrap">
          <div className="cta-final-inner reveal">
            <div style={{ borderLeft: "3px solid var(--orange)", paddingLeft: 22 }}>
              <h2>Pronto para transformar o seu espaço?</h2>
              <p>Fale connosco e receba um orçamento gratuito e sem compromisso.</p>
            </div>
            <div className="cta-final-info">
              <div className="cta-final-item">
                <div className="icon"><svg viewBox="0 0 24 24"><rect x="3" y="4" width="18" height="18" rx="2" /><path d="M3 10h18M8 2v4M16 2v4" /></svg></div>
                <span>Resposta rápida em até 24h</span>
              </div>
              <div className="cta-final-item">
                <div className="icon"><svg viewBox="0 0 24 24" style={{ fill: "var(--orange)", stroke: "none" }}><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347" /></svg></div>
                <span>Orçamento grátis pelo WhatsApp</span>
              </div>
            </div>
            <a href="#orcamento" className="btn btn-orange">Pedir Orçamento</a>
          </div>
        </div>
      </section>
    </>
  );
}
