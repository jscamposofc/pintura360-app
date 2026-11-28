import { createAdminClient } from "@/lib/supabase/admin";
import AdminTabs from "@/components/admin/AdminTabs";
import { atribuirPedido, marcarPedido } from "@/lib/actions/admin";

export const dynamic = "force-dynamic";

type Pedido = {
  id: number;
  created_at: string;
  servico: string;
  area: number | null;
  distrito: string;
  concelho: string;
  prazo: string | null;
  nome: string;
  telefone: string;
  email: string;
  notas: string | null;
  status: string;
  profissional_id: number | null;
  plano: string | null;
  estimated_price: number | null;
  materials_included: boolean | null;
};

type ProfissionalLinha = { id: number; nome: string; empresa: string | null; status: string };

const ESTADOS: Record<string, string> = {
  novo: "Novo", atribuido: "Atribuído", pago: "Pago", concluido: "Concluído",
};

export default async function AdminPedidos() {
  const supabase = createAdminClient();
  const [{ data: pedidosData }, { data: prosData }] = await Promise.all([
    supabase.from("pedidos").select("*").order("created_at", { ascending: false }),
    supabase.from("profissionais").select("id, nome, empresa, status").eq("status", "aprovado"),
  ]);

  const pedidos = (pedidosData ?? []) as Pedido[];
  const aprovados = (prosData ?? []) as ProfissionalLinha[];
  const porAtribuir = pedidos.filter((p) => p.status === "novo").length;

  return (
    <section className="admin-main container" style={{ padding: "28px 16px 64px" }}>
      <h1 style={{ margin: "0 0 4px" }}>Painel de gestão</h1>
      <AdminTabs active="pedidos" />

      <div className="kpis">
        <div className="card"><span className="muted">Total de pedidos</span><b>{pedidos.length}</b></div>
        <div className="card"><span className="muted">Por atribuir</span><b>{porAtribuir}</b></div>
        <div className="card"><span className="muted">Profissionais aprovados</span><b>{aprovados.length}</b></div>
      </div>

      <div className="grid" style={{ gap: 14 }}>
        {pedidos.length === 0 && <div className="card">Ainda não há pedidos.</div>}
        {pedidos.map((p) => {
          const atribuido = aprovados.find((a) => a.id === p.profissional_id);
          return (
            <div className="card item-card" key={p.id} style={{ display: "flex", flexWrap: "wrap", justifyContent: "space-between", gap: 14 }}>
              <div>
                <strong>{p.nome}</strong> · <span className={`status-pill status-${p.status}`}>{ESTADOS[p.status] ?? p.status}</span><br />
                <span className="muted" style={{ fontSize: ".86rem" }}>
                  {p.servico} · {p.area ?? "—"}m² · {p.concelho}, {p.distrito} · {p.prazo}
                </span><br />
                <span className="muted" style={{ fontSize: ".86rem" }}>
                  {p.telefone} · {p.email} · {new Date(p.created_at).toLocaleString("pt-PT")}
                </span>
                {p.estimated_price != null && (
                  <p style={{ margin: "6px 0 0" }}>
                    <strong>Estimativa:</strong> {p.estimated_price} € ({p.plano}{p.materials_included ? ", com material" : ", sem material"})
                  </p>
                )}
                {p.notas && <p className="muted" style={{ margin: "6px 0 0" }}>{p.notas}</p>}
                {atribuido && <p style={{ margin: "6px 0 0" }}><strong>Atribuído a:</strong> {atribuido.empresa || atribuido.nome}</p>}
              </div>
              <div style={{ display: "flex", flexDirection: "column", gap: 8, alignItems: "flex-end" }}>
                <form action={atribuirPedido} style={{ display: "flex", gap: 8 }}>
                  <input type="hidden" name="id" value={p.id} />
                  <select name="profissional_id" defaultValue={p.profissional_id ?? ""} style={{ minWidth: 180 }}>
                    <option value="">Atribuir a…</option>
                    {aprovados.map((a) => (
                      <option key={a.id} value={a.id}>{a.empresa || a.nome}</option>
                    ))}
                  </select>
                  <button className="btn btn-outline-navy btn-sm" type="submit">Atribuir</button>
                </form>
                <form action={marcarPedido} style={{ display: "flex", gap: 8 }}>
                  <input type="hidden" name="id" value={p.id} />
                  <select name="status" defaultValue={p.status}>
                    {Object.entries(ESTADOS).map(([k, l]) => <option key={k} value={k}>{l}</option>)}
                  </select>
                  <button className="btn btn-orange btn-sm" type="submit">Atualizar</button>
                </form>
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
}
