import Link from "next/link";
import { createAdminClient } from "@/lib/supabase/admin";
import ClickableRow from "@/components/admin/ClickableRow";
import { PRAZOS } from "@/lib/opcoes";
import { exigirMembro } from "@/lib/membro";
import {
  ESTADOS, PLANO_LABELS, data, euros, type Estado, type Pedido, type Profissional,
} from "@/lib/admin-dados";

export const dynamic = "force-dynamic";

// Momento de corte (agora − N dias), em ISO. Função fora do componente: o painel é sempre dinâmico.
function desde(dias: number): string {
  return new Date(Date.now() - dias * 864e5).toISOString();
}

type SP = { q?: string; estado?: string; plano?: string; periodo?: string };

const PERIODOS: Record<string, { label: string; dias: number | null }> = {
  "7": { label: "Últimos 7 dias", dias: 7 },
  "30": { label: "Últimos 30 dias", dias: 30 },
  "90": { label: "Últimos 90 dias", dias: 90 },
  todos: { label: "Todo o período", dias: null },
};

export default async function AdminPedidos({ searchParams }: { searchParams: Promise<SP> }) {
  const sp = await searchParams;
  await exigirMembro("pedidos_ver");
  const q = (sp.q ?? "").replace(/[,()%*]/g, " ").trim().slice(0, 60);
  const estado = sp.estado && sp.estado in ESTADOS ? (sp.estado as Estado) : "";
  const plano = sp.plano && sp.plano in PLANO_LABELS ? sp.plano : "";
  const periodo = sp.periodo && sp.periodo in PERIODOS ? sp.periodo : "todos";

  const supabase = createAdminClient();

  let query = supabase
    .from("pedidos")
    .select("id, created_at, referencia, servico, area_faturavel, area, concelho, distrito, nome, telefone, plano, estimated_price, status, profissional_id, fotos, estado_superficie, prazo")
    .order("created_at", { ascending: false })
    .limit(300);
  if (estado) query = query.eq("status", estado);
  if (plano) query = query.eq("plano", plano);
  const dias = PERIODOS[periodo].dias;
  if (dias) query = query.gte("created_at", desde(dias));
  if (q) query = query.or(`nome.ilike.%${q}%,referencia.ilike.%${q}%,telefone.ilike.%${q}%,concelho.ilike.%${q}%,email.ilike.%${q}%`);

  const [{ data: rows }, { data: todos }, { data: pros }] = await Promise.all([
    query,
    supabase.from("pedidos").select("status, estimated_price, created_at"),
    supabase.from("profissionais").select("id, nome, empresa"),
  ]);

  const pedidos = (rows ?? []) as Pedido[];
  const geral = (todos ?? []) as Pick<Pedido, "status" | "estimated_price" | "created_at">[];
  const nomes = new Map(((pros ?? []) as Pick<Profissional, "id" | "nome" | "empresa">[]).map((p) => [p.id, p.empresa || p.nome]));

  const contar = (s: Estado) => geral.filter((p) => p.status === s).length;
  const emAberto = geral.filter((p) => !["concluido", "cancelado"].includes(p.status));
  const valorAberto = emAberto.reduce((a, p) => a + Number(p.estimated_price ?? 0), 0);
  const corte7 = desde(7);
  const ultimos7 = geral.filter((p) => new Date(p.created_at).toISOString() >= corte7).length;

  const filtrosAtivos = !!(q || estado || plano || periodo !== "todos");
  const urlEstado = (s: string) => {
    const p = new URLSearchParams();
    if (q) p.set("q", q);
    if (s) p.set("estado", s);
    if (plano) p.set("plano", plano);
    if (periodo !== "todos") p.set("periodo", periodo);
    const qs = p.toString();
    return `/admin/pedidos${qs ? `?${qs}` : ""}`;
  };

  return (
    <>
      <div className="adm-head">
        <div>
          <h1>Pedidos de orçamento</h1>
          <p>Todos os pedidos que chegam pelo site. Clique num pedido para ver a ficha completa e atribuí-lo a um parceiro.</p>
        </div>
      </div>

      <div className="adm-kpis">
        <Link href={urlEstado("novo")} className="adm-kpi hl"><span>Novos por tratar</span><b>{contar("novo")}</b><small>{ultimos7} recebidos nos últimos 7 dias</small></Link>
        <Link href={urlEstado("contactado")} className="adm-kpi"><span>Contactados</span><b>{contar("contactado")}</b><small>À espera de atribuição</small></Link>
        <Link href={urlEstado("atribuido")} className="adm-kpi"><span>Atribuídos</span><b>{contar("atribuido")}</b><small>Com parceiro definido</small></Link>
        <Link href={urlEstado("pago")} className="adm-kpi"><span>Sinal pago</span><b>{contar("pago")}</b><small>{contar("concluido")} concluídos</small></Link>
        <div className="adm-kpi"><span>Valor em aberto</span><b>{euros(valorAberto)}</b><small>{emAberto.length} pedidos ativos (estimativa)</small></div>
      </div>

      <form className="adm-filters" method="get">
        <input type="search" name="q" defaultValue={q} placeholder="Procurar por nome, referência, telefone, email ou localidade…" />
        {estado && <input type="hidden" name="estado" value={estado} />}
        <select name="plano" defaultValue={plano}>
          <option value="">Todos os planos</option>
          {Object.entries(PLANO_LABELS).map(([k, l]) => <option key={k} value={k}>{l}</option>)}
        </select>
        <select name="periodo" defaultValue={periodo}>
          {Object.entries(PERIODOS).map(([k, v]) => <option key={k} value={k}>{v.label}</option>)}
        </select>
        <button type="submit" className="btn btn-orange">Filtrar</button>
        {filtrosAtivos && <Link href="/admin/pedidos" className="adm-clear">Limpar</Link>}
      </form>

      <div className="adm-chips">
        <Link href={urlEstado("")} className={`adm-chip${!estado ? " active" : ""}`}>Todos<em>{geral.length}</em></Link>
        {(Object.keys(ESTADOS) as Estado[]).map((s) => (
          <Link key={s} href={urlEstado(s)} className={`adm-chip${estado === s ? " active" : ""}`}>{ESTADOS[s]}<em>{contar(s)}</em></Link>
        ))}
      </div>

      <div className="adm-table-wrap">
        {pedidos.length === 0 ? (
          <div className="adm-empty">
            <strong>{filtrosAtivos ? "Nenhum pedido com estes filtros" : "Ainda não há pedidos"}</strong>
            {filtrosAtivos ? "Experimente limpar os filtros." : "Quando um cliente terminar o questionário no site, o pedido aparece aqui."}
          </div>
        ) : (
          <table className="adm-table">
            <thead>
              <tr>
                <th>Referência</th>
                <th>Cliente</th>
                <th>Localidade</th>
                <th>Serviço</th>
                <th>Plano · Estimativa</th>
                <th>Prazo</th>
                <th>Estado</th>
                <th>Parceiro</th>
              </tr>
            </thead>
            <tbody>
              {pedidos.map((p) => (
                <ClickableRow key={p.id} href={`/admin/pedidos/${p.id}`}>
                  <td>
                    <Link href={`/admin/pedidos/${p.id}`} className="adm-ref">{p.referencia ?? `#${p.id}`}</Link>
                    <span className="adm-sub">{data(p.created_at)}</span>
                  </td>
                  <td>
                    <strong>{p.nome}</strong>
                    <span className="adm-sub">{p.telefone}</span>
                  </td>
                  <td>
                    {p.concelho}
                    {p.distrito && <span className="adm-sub">{p.distrito}</span>}
                  </td>
                  <td>
                    {p.servico}
                    <span className="adm-sub">
                      {p.area_faturavel ?? p.area ?? "—"} m² · {(p.fotos ?? []).length} fotos
                      {p.estado_superficie === "Humidade ou danos graves" && <span className="adm-flag red">Avaliar</span>}
                    </span>
                  </td>
                  <td>
                    <span className="adm-money">{euros(p.estimated_price)}</span>
                    <span className="adm-sub">{p.plano ? PLANO_LABELS[p.plano] ?? p.plano : "—"}</span>
                  </td>
                  <td>
                    {p.prazo === "O mais rapidamente possível"
                      ? <span className="adm-flag orange" style={{ marginLeft: 0 }}>Urgente</span>
                      : PRAZOS.find((x) => x.value === p.prazo)?.curto.replace(/^\S+\s/, "") ?? "—"}
                  </td>
                  <td><span className={`pill pill-${p.status}`}>{ESTADOS[p.status] ?? p.status}</span></td>
                  <td>{p.profissional_id ? nomes.get(p.profissional_id) ?? "—" : <span className="adm-muted">Por atribuir</span>}</td>
                </ClickableRow>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </>
  );
}
