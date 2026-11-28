import Link from "next/link";
import { exigirMembro, primeiraPagina } from "@/lib/membro";

export const dynamic = "force-dynamic";

export default async function SemAcesso() {
  const m = await exigirMembro();
  return (
    <div className="adm-card" style={{ maxWidth: 520, margin: "40px auto", textAlign: "center" }}>
      <h2 style={{ justifyContent: "center" }}>Sem acesso</h2>
      <p className="adm-muted" style={{ marginBottom: 18 }}>
        O seu cargo ({m.cargo}) não inclui esta função. Se precisar dela, peça a quem gere a equipa.
      </p>
      <Link href={primeiraPagina(m)} className="btn btn-orange">Voltar</Link>
    </div>
  );
}
