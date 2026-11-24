import WizardOrcamento from "@/components/WizardOrcamento";

export const metadata = { title: "Pedir Orçamento — Pintura360" };

export default async function PedidoOrcamento({
  searchParams,
}: {
  searchParams: Promise<{ pref?: string; prefNome?: string; erro?: string }>;
}) {
  const sp = await searchParams;
  return (
    <section className="section-sm">
      <div className="container">
        <div className="center" style={{ marginBottom: 28 }}>
          <span className="eyebrow">Pedido de Orçamento</span>
          <h1 style={{ fontSize: "1.9rem" }}>Vamos encontrar o profissional certo para si</h1>
        </div>
        {sp.erro && (
          <div className="alert alert-error" style={{ maxWidth: 760, margin: "0 auto 16px" }}>
            Não foi possível submeter o pedido. Verifique os dados e tente novamente.
          </div>
        )}
        <WizardOrcamento prefId={sp.pref ?? null} prefNome={sp.prefNome ?? null} />
      </div>
    </section>
  );
}
