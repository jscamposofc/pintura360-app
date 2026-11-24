import Link from "next/link";

export const metadata = { title: "Pedido recebido — Pintura360" };

export default function ObrigadoCliente() {
  return (
    <section className="section center">
      <div className="container" style={{ maxWidth: 560 }}>
        <span className="eyebrow">Pedido Recebido</span>
        <h1>🎉 Obrigado! O seu pedido foi recebido.</h1>
        <p className="muted">
          A nossa equipa vai analisar o seu projeto e entrar em contacto em breve com propostas
          de profissionais verificados na sua zona. Nenhum pagamento é necessário neste momento.
        </p>
        <Link href="/" className="btn btn-orange">Voltar ao Início</Link>
      </div>
    </section>
  );
}
