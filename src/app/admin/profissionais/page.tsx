import { createAdminClient } from "@/lib/supabase/admin";
import AdminTabs from "@/components/admin/AdminTabs";
import { aprovarProfissional, rejeitarProfissional } from "@/lib/actions/admin";

export const dynamic = "force-dynamic";

type ProfissionalCompleto = {
  id: number;
  created_at: string;
  nome: string;
  empresa: string | null;
  nif: string;
  telefone: string;
  email: string;
  distrito: string;
  concelhos: string[];
  servicos: string[];
  anos_experiencia: number;
  tem_seguro: boolean;
  apresentacao: string;
  portfolio_link: string | null;
  comprovativo_path: string | null;
  status: string;
};

export default async function AdminProfissionais() {
  const supabase = createAdminClient();
  const { data } = await supabase
    .from("profissionais")
    .select("*")
    .order("created_at", { ascending: false });
  const rows = (data ?? []) as ProfissionalCompleto[];

  const comprovativoUrls: Record<number, string> = {};
  for (const r of rows) {
    if (r.comprovativo_path) {
      const { data: signed } = await supabase.storage
        .from("comprovativos")
        .createSignedUrl(r.comprovativo_path, 60 * 10);
      if (signed) comprovativoUrls[r.id] = signed.signedUrl;
    }
  }

  const aprovados = rows.filter((r) => r.status === "aprovado").length;
  const porRever = rows.filter((r) => r.status === "pendente").length;

  return (
    <section className="admin-main container" style={{ padding: "28px 16px 64px" }}>
      <h1 style={{ margin: "0 0 4px" }}>Painel de gestão</h1>
      <AdminTabs active="profissionais" />

      <div className="kpis">
        <div className="card"><span className="muted">Total de inscrições</span><b>{rows.length}</b></div>
        <div className="card"><span className="muted">Aprovados</span><b>{aprovados}</b></div>
        <div className="card"><span className="muted">Por rever</span><b>{porRever}</b></div>
      </div>

      <div className="grid" style={{ gap: 14 }}>
        {rows.length === 0 && <div className="card">Ainda não há inscrições.</div>}
        {rows.map((r) => (
          <div className="card item-card" key={r.id} style={{ display: "flex", flexWrap: "wrap", justifyContent: "space-between", gap: 14 }}>
            <div>
              <strong>{r.empresa || r.nome}</strong> · <span className={`status-pill status-${r.status}`}>{r.status}</span><br />
              <span className="muted" style={{ fontSize: ".86rem" }}>
                {r.nome} · NIF {r.nif} · {r.anos_experiencia} anos de experiência
              </span><br />
              <span className="muted" style={{ fontSize: ".86rem" }}>
                {r.telefone} · {r.email} · {r.concelhos.join(", ")} ({r.distrito})
              </span><br />
              <span className="muted" style={{ fontSize: ".86rem" }}>
                Serviços: {r.servicos.join(", ")} · Seguro: {r.tem_seguro ? "sim" : "não"}
              </span>
              <p className="muted" style={{ margin: "6px 0 0" }}>{r.apresentacao}</p>
              {r.portfolio_link && <p style={{ margin: "4px 0 0" }}><a href={r.portfolio_link} target="_blank" rel="noreferrer">Ver portfólio ↗</a></p>}
              {comprovativoUrls[r.id] && <p style={{ margin: "4px 0 0" }}><a href={comprovativoUrls[r.id]} target="_blank" rel="noreferrer">Ver comprovativo ↗</a></p>}
            </div>
            <div style={{ display: "flex", gap: 8 }}>
              <form action={aprovarProfissional}>
                <input type="hidden" name="id" value={r.id} />
                <button className="btn btn-orange btn-sm" type="submit">Aprovar</button>
              </form>
              <form action={rejeitarProfissional}>
                <input type="hidden" name="id" value={r.id} />
                <button className="btn btn-outline-navy btn-sm" type="submit">Rejeitar</button>
              </form>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
