import Link from "next/link";
import ProcessAnimation from "@/components/ProcessAnimation";

export const metadata = { title: "Como Funciona — Pintura360" };

export default function ComoFunciona() {
  return (
    <>
      <section className="section-sm">
        <div className="container center" style={{ maxWidth: 680 }}>
          <span className="eyebrow">Como Funciona</span>
          <h1 style={{ fontSize: "2.1rem" }}>O nosso método, passo a passo</h1>
          <p className="muted">
            Sem surpresas, sem negociações às escuras. Veja como funciona encontrar — e contratar —
            um profissional de pintura através da Pintura360.
          </p>
        </div>
      </section>

      <section className="section-sm">
        <div className="container">
          <ProcessAnimation />
          {/* Narração em voz (ElevenLabs) — a adicionar assim que o áudio estiver pronto. */}
          <p className="muted center" style={{ marginTop: 16, fontSize: ".85rem" }}>
            🔊 Narração em áudio a chegar em breve.
          </p>
        </div>
      </section>

      <section className="section">
        <div className="container">
          <div className="grid grid-2" style={{ gap: 48 }}>
            <div>
              <span className="eyebrow">O nosso método</span>
              <h2 style={{ fontSize: "1.6rem", marginBottom: 20 }}>Como garantimos confiança</h2>
              <div className="grid" style={{ gap: 16 }}>
                <div className="step-card">
                  <span className="step-num">1</span>
                  <h3>Verificação de identidade e atividade</h3>
                  <p className="muted">Todo o profissional confirma NIF e comprovativo de atividade antes de entrar na rede Pintura360.</p>
                </div>
                <div className="step-card">
                  <span className="step-num">2</span>
                  <h3>Experiência comprovada</h3>
                  <p className="muted">Avaliamos anos de experiência, especialidades e, quando disponível, seguro de responsabilidade civil.</p>
                </div>
                <div className="step-card">
                  <span className="step-num">3</span>
                  <h3>Atribuição por zona e serviço</h3>
                  <p className="muted">Cada pedido é atribuído ao profissional aprovado mais adequado à localização e ao tipo de trabalho.</p>
                </div>
                <div className="step-card">
                  <span className="step-num">4</span>
                  <h3>Avaliações reais</h3>
                  <p className="muted">Após cada serviço concluído, o cliente avalia o profissional — isto alimenta a nota pública do perfil.</p>
                </div>
              </div>
            </div>

            <div>
              <span className="eyebrow">Como contratar</span>
              <h2 style={{ fontSize: "1.6rem", marginBottom: 20 }}>Do pedido ao profissional em casa</h2>
              <div className="grid" style={{ gap: 16 }}>
                <div className="step-card">
                  <span className="step-num">1</span>
                  <h3>Peça um orçamento</h3>
                  <p className="muted">Indique o tipo de serviço, área, localização e prazo pretendido — sem custo, sem compromisso.</p>
                </div>
                <div className="step-card">
                  <span className="step-num">2</span>
                  <h3>Aguarde a atribuição</h3>
                  <p className="muted">A nossa equipa analisa o pedido e atribui-o a um profissional verificado da sua zona.</p>
                </div>
                <div className="step-card">
                  <span className="step-num">3</span>
                  <h3>Confirme a reserva</h3>
                  <p className="muted">Só depois de confirmar é que os contactos diretos do profissional são partilhados consigo.</p>
                </div>
                <div className="step-card">
                  <span className="step-num">4</span>
                  <h3>Serviço e avaliação</h3>
                  <p className="muted">O profissional realiza o trabalho; no final, avalia a experiência para ajudar outros clientes.</p>
                </div>
              </div>
              <div style={{ marginTop: 24 }}>
                <Link href="/#orcamento" className="btn btn-orange">Pedir Orçamento Grátis</Link>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="section" style={{ background: "#fff", borderTop: "1px solid var(--line)" }}>
        <div className="container">
          <div className="photo-gallery-2">
            <img src="/fotos/foto-equipa-1.jpg" alt="Profissional Pintura360 a pintar, visto de costas" />
            <img src="/fotos/hero-divisao-pintura.jpg" alt="Profissional Pintura360 a pintar uma parede cinzenta" />
          </div>
        </div>
      </section>

      <section className="section">
        <div className="container cta-band">
          <h2>É profissional de pintura?</h2>
          <p className="muted">Inscreva a sua empresa e comece a receber pedidos na sua zona.</p>
          <Link href="/trabalhe-connosco" className="btn btn-orange">Quero Receber Trabalhos</Link>
        </div>
      </section>
    </>
  );
}
