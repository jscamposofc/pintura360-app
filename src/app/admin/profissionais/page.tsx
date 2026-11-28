import Link from "next/link";
import { createAdminClient } from "@/lib/supabase/admin";
import { aprovarProfissional, rejeitarProfissional, reverProfissional } from "@/lib/actions/admin";
import { data, telefoneWa, type Profissional } from "@/lib/admin-dados";

export const dynamic = "force-dynamic";

const ESTADOS_PRO = { pendente: "Por rever", aprovado: "Aprovado", rejeitado: "Rejeitado" } as const;
type EstadoPro = keyof typeof ESTADOS_PRO;

export default async function AdminProfissionais({ searchParams }: { searchParams: Promise<{ estado?: string }> }) {
  const sp = await searchParams;
  const filtro = sp.estado && sp.estado in ESTADOS_PRO ? (sp.estado as EstadoPro) : "";

  const supabase = createAdminClient();
  const [{ data: rowsData }, { data: atribs }] = await Promise.all([
    supabase.from("profissionais").select("*").order("created_at", { ascending: false }),
    supabase.from("pedidos").select("profissional_id, status").not("profissional_id", "is", null),
  ]);
  const todos = (rowsData ?? []) as Profissional[];
  const rows = filtro ? todos.filter((r) => r.status === filtro) : todos;

  const trabalhos = new Map<number, { ativos: number; concluidos: number }>();
  for (const a of (atribs ?? []) as { profissional_id: number; status: string }[]) {
    const t = trabalhos.get(a.profissional_id) ?? { ativos: 0, concluidos: 0 };
    if (a.status === "concluido") t.concluidos++;
    else if (a.status !== "cancelado") t.ativos++;
    trabalhos.set(a.profissional_id, t);
  }

  const comprovativos: Record<number, string> = {};
  const paths = rows.filter((r) => r.comprovativo_path).map((r) => r.comprovativo_path!) ;
  if (paths.length) {
    const { data: signed } = await supabase.storage.from("comprovativos").createSignedUrls(paths, 60 * 30);
    (signed ?? []).forEach((s) => {
      const r = rows.find((x) => x.comprovativo_path === s.path);
      if (r && s.signedUrl) comprovativos[r.id] = s.signedUrl;
    });
  }

  const contar = (s: EstadoPro) => todos.filter((r) => r.status === s).length;

  return (
    <>
      <div className="adm-head">
        <div>
          <h1>Profissionais parceiros</h1>
          <p>Inscrições feitas em <Link href="/trabalhe-connosco" target="_blank" style={{ color: "var(--orange)" }}>/trabalhe-connosco</Link>. Só os aprovados aparecem para atribuição de pedidos.</p>
        </div>
      </div>

      <div className="adm-kpis" style={{ gridTemplateColumns: "repeat(4,1fr)" }}>
        <div className="adm-kpi"><span>Inscrições</span><b>{todos.length}</b></div>
        <Link href="?estado=pendente" className="adm-kpi hl"><span>Por rever</span><b>{contar("pendente")}</b><small>Verificar NIF e comprovativo</small></Link>
        <Link href="?estado=aprovado" className="adm-kpi"><span>Aprovados</span><b>{contar("aprovado")}</b></Link>
        <Link href="?estado=rejeitado" className="adm-kpi"><span>Rejeitados</span><b>{contar("rejeitado")}</b></Link>
      </div>

      <div className="adm-chips">
        <Link href="/admin/profissionais" className={`adm-chip${!filtro ? " active" : ""}`}>Todos<em>{todos.length}</em></Link>
        {(Object.keys(ESTADOS_PRO) as EstadoPro[]).map((s) => (
          <Link key={s} href={`?estado=${s}`} className={`adm-chip${filtro === s ? " active" : ""}`}>{ESTADOS_PRO[s]}<em>{contar(s)}</em></Link>
        ))}
      </div>

      <div className="adm-pros">
        {rows.length === 0 && (
          <div className="adm-table-wrap">
            <div className="adm-empty">
              <strong>Sem inscrições {filtro ? "neste estado" : "ainda"}</strong>
              Partilhe a página <Link href="/trabalhe-connosco" target="_blank" style={{ color: "var(--orange)" }}>Para Profissionais</Link> com pintores da sua rede.
            </div>
          </div>
        )}
        {rows.map((r) => {
          const t = trabalhos.get(r.id);
          return (
            <div className="adm-pro-card" key={r.id}>
              <div>
                <h3>{r.empresa || r.nome} <span className={`pill pill-${r.status}`}>{ESTADOS_PRO[r.status]}</span></h3>
                <p>{r.nome} · NIF {r.nif} · {r.anos_experiencia} anos de experiência · Seguro: {r.tem_seguro ? "sim" : "não"}</p>
                <p>{r.telefone} · {r.email} · Inscrito a {data(r.created_at)}</p>
                <p>Zona: {r.concelhos.join(", ")} ({r.distrito})</p>
                {t && <p>Trabalhos: {t.ativos} ativos · {t.concluidos} concluídos</p>}
                <div className="tags">{r.servicos.map((s) => <span key={s}>{s}</span>)}</div>
                {r.apresentacao && <p className="bio">{r.apresentacao}</p>}
                <p style={{ marginTop: 8, display: "flex", gap: 16, flexWrap: "wrap" }}>
                  {r.portfolio_link && <a href={r.portfolio_link} target="_blank" rel="noreferrer" style={{ color: "var(--orange)" }}>Ver portfólio ↗</a>}
                  {comprovativos[r.id] ? (
                    <a href={comprovativos[r.id]} target="_blank" rel="noreferrer" style={{ color: "var(--orange)" }}>Ver comprovativo ↗</a>
                  ) : (
                    <span>Sem comprovativo</span>
                  )}
                </p>
              </div>
              <div className="side">
                <a href={`https://wa.me/${telefoneWa(r.telefone)}`} target="_blank" rel="noopener noreferrer" className="btn btn-wa">WhatsApp</a>
                {r.status !== "aprovado" && (
                  <form action={aprovarProfissional}>
                    <input type="hidden" name="id" value={r.id} />
                    <button className="btn btn-orange" type="submit">Aprovar</button>
                  </form>
                )}
                {r.status !== "rejeitado" && (
                  <form action={rejeitarProfissional}>
                    <input type="hidden" name="id" value={r.id} />
                    <button className="btn btn-outline-navy" type="submit">{r.status === "aprovado" ? "Suspender" : "Rejeitar"}</button>
                  </form>
                )}
                {r.status !== "pendente" && (
                  <form action={reverProfissional}>
                    <input type="hidden" name="id" value={r.id} />
                    <button className="adm-link-btn" type="submit">Voltar a &ldquo;por rever&rdquo;</button>
                  </form>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </>
  );
}
