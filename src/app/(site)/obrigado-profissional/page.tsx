import Link from "next/link";

export const metadata = { title: "Inscrição recebida — Pintura360" };

export default function ObrigadoProfissional() {
  return (
    <section className="section center">
      <div className="container" style={{ maxWidth: 560 }}>
        <span className="eyebrow">Inscrição Recebida</span>
        <h1>🎉 Obrigado pela sua inscrição!</h1>
        <p className="muted">
          A nossa equipa vai rever os seus dados. Assim que a verificação estiver concluída,
          o seu perfil fica visível no diretório público e começa a receber pedidos na sua zona.
        </p>
        <Link href="/" className="btn btn-orange">Voltar ao Início</Link>
      </div>
    </section>
  );
}
