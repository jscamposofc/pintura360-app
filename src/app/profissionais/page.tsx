import { createPublicClient } from "@/lib/supabase/public";
import { ProfissionalPublico } from "@/lib/types";
import DiretorioFiltros from "@/components/DiretorioFiltros";
import Link from "next/link";

export const metadata = { title: "Profissionais verificados — Pintura360" };
export const revalidate = 60;

export default async function Profissionais() {
  const supabase = createPublicClient();
  const { data } = await supabase.from("profissionais_publicos").select("*");
  const pros = (data ?? []) as ProfissionalPublico[];

  return (
    <>
      <section className="section-sm">
        <div className="container">
          <span className="eyebrow">Diretório</span>
          <h1 style={{ fontSize: "2.1rem" }}>Profissionais verificados</h1>
          <p className="muted" style={{ maxWidth: 560 }}>
            Todos os profissionais aqui listados passaram pela nossa verificação. Para pedir um orçamento,
            submeta um pedido — o trabalho é atribuído ao profissional mais adequado da sua zona, e os
            contactos só são partilhados depois da reserva confirmada.
          </p>
          <DiretorioFiltros pros={pros} />
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
