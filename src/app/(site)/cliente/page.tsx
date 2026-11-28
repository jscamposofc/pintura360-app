import Link from "next/link";
import { redirect } from "next/navigation";
import { createAdminClient } from "@/lib/supabase/admin";
import { getSessao, destinoDe } from "@/lib/conta";
import { associarPedido, sair } from "@/lib/actions/contas";

export const metadata = { title: "A minha área — Pintura360" };
export const dynamic = "force-dynamic";

// Estados como o cliente os vê (linguagem simples).
const ESTADO_CLIENTE: Record<string, { label: string; desc: string; passo: number }> = {
  novo: { label: "Pedido recebido", desc: "Vamos analisar o seu projeto e as fotografias.", passo: 1 },
  contactado: { label: "Em análise", desc: "Estamos a validar os detalhes consigo.", passo: 2 },
  atribuido: { label: "Profissional atribuído", desc: "Já escolhemos quem vai realizar o trabalho.", passo: 3 },
  pago: { label: "Reserva confirmada", desc: "Sinal recebido — a data está garantida.", passo: 4 },
  concluido: { label: "Concluído", desc: "Trabalho terminado. Obrigado pela confiança!", passo: 5 },
  cancelado: { label: "Cancelado", desc: "Este pedido foi cancelado.", passo: 0 },
};
const PASSOS = ["Recebido", "Em análise", "Profissional", "Reservado", "Concluído"];
const PLANOS: Record<string, string> = { essencial: "Essencial", recomendado: "Recomendado", premium: "Premium" };

type Linha = {
  id: number; created_at: string; referencia: string; servico: string; area_faturavel: number | null;
  concelho: string; plano: string | null; estimated_price: number | null; status: string; profissional_id: number | null;
};

const fmt = new Intl.DateTimeFormat("pt-PT", { timeZone: "Europe/Lisbon", day: "2-digit", month: "long", year: "numeric" });

export default async function AreaCliente({
  searchParams,
}: {
  searchParams: Promise<{ ligado?: string; erro?: string; ref?: string; bemvindo?: string }>;
}) {
  const sp = await searchParams;
  const sessao = await getSessao();
  if (!sessao) redirect("/entrar?tipo=cliente");
  if (sessao.papel !== "cliente") redirect(destinoDe(sessao.papel));

  const supabase = createAdminClient();
  const { data } = await supabase
    .from("pedidos")
    .select("id, created_at, referencia, servico, area_faturavel, concelho, plano, estimated_price, status, profissional_id")
    .eq("cliente_id", sessao.id)
    .order("created_at", { ascending: false });
  const pedidos = (data ?? []) as Linha[];

  const proIds = [...new Set(pedidos.map((p) => p.profissional_id).filter(Boolean))] as number[];
  const nomesPro = new Map<number, string>();
  if (proIds.length) {
    const { data: pros } = await supabase.from("profissionais").select("id, nome, empresa").in("id", proIds);
    (pros ?? []).forEach((p) => nomesPro.set(p.id, p.empresa || p.nome));
  }

  const primeiroNome = sessao.nome.split(" ")[0] || "";

  return (
    <section className="conta-section">
      <div className="wrap conta-area">
        <div className="conta-area-head">
          <div>
            <p className="section-eyebrow">Área de cliente</p>
            <h2>Olá{primeiroNome ? `, ${primeiroNome}` : ""}!</h2>
            <p className="conta-sub">{sessao.email}</p>
          </div>
          <div className="conta-area-acoes">
            <Link href="/#orcamento" className="btn btn-orange">+ Novo pedido de orçamento</Link>
            <form action={sair}><button type="submit" className="btn btn-outline-navy">Terminar sessão</button></form>
          </div>
        </div>

        {sp.bemvindo && <div className="conta-ok">Conta criada com sucesso. Os pedidos que fizer com a sessão iniciada aparecem aqui automaticamente.</div>}
        {sp.ligado && <div className="conta-ok">Pedido associado à sua conta.</div>}
        {sp.erro === "ligar" && <div className="conta-erro">Não encontrámos esse pedido com esse telemóvel. Confirme a referência (ex.: P360-2026-123456) e o número usado no pedido.</div>}

        <h3 className="conta-h3">Os meus pedidos</h3>
        {pedidos.length === 0 ? (
          <div className="conta-vazio">
            <strong>Ainda não tem pedidos na sua conta.</strong>
            <p>Peça um orçamento em 2 minutos — ou, se já fez um pedido antes de criar conta, associe-o abaixo.</p>
            <Link href="/#orcamento" className="btn btn-orange">Pedir orçamento</Link>
          </div>
        ) : (
          <div className="conta-pedidos">
            {pedidos.map((p) => {
              const e = ESTADO_CLIENTE[p.status] ?? ESTADO_CLIENTE.novo;
              return (
                <div className="conta-pedido" key={p.id}>
                  <div className="conta-pedido-top">
                    <div>
                      <span className="conta-ref">{p.referencia}</span>
                      <strong>{p.servico} · {p.area_faturavel ?? "—"} m²</strong>
                      <small>{p.concelho} · pedido a {fmt.format(new Date(p.created_at))}</small>
                    </div>
                    <div className="conta-pedido-valor">
                      <span>Plano {PLANOS[p.plano ?? ""] ?? "—"}</span>
                      <strong>{p.estimated_price != null ? `${Math.round(p.estimated_price)} €` : "—"}</strong>
                      <small>estimativa · IVA incluído</small>
                    </div>
                  </div>
                  {p.status === "cancelado" ? (
                    <p className="conta-estado cancelado">{e.label} — {e.desc}</p>
                  ) : (
                    <>
                      <div className="conta-passos">
                        {PASSOS.map((n, i) => (
                          <div key={n} className={`conta-passo${i < e.passo ? " feito" : ""}${i === e.passo - 1 ? " atual" : ""}`}>
                            <span />
                            <small>{n}</small>
                          </div>
                        ))}
                      </div>
                      <p className="conta-estado">
                        <strong>{e.label}.</strong> {e.desc}
                        {p.profissional_id && nomesPro.get(p.profissional_id) && <> Profissional: <strong>{nomesPro.get(p.profissional_id)}</strong>.</>}
                      </p>
                    </>
                  )}
                  <a
                    className="conta-wa"
                    href={`https://wa.me/351928358968?text=${encodeURIComponent(`Olá! Tenho uma questão sobre o meu pedido ${p.referencia}.`)}`}
                    target="_blank" rel="noopener noreferrer"
                  >Falar sobre este pedido no WhatsApp →</a>
                </div>
              );
            })}
          </div>
        )}

        <div className="conta-associar">
          <div>
            <h3 className="conta-h3" style={{ margin: 0 }}>Fez um pedido antes de criar conta?</h3>
            <p>Indique a referência que recebeu e o telemóvel usado no pedido.</p>
          </div>
          <form action={associarPedido}>
            <input name="ref" placeholder="P360-2026-000000" defaultValue={sp.ref ?? ""} required aria-label="Referência do pedido" />
            <input name="telefone" type="tel" placeholder="Telemóvel do pedido" required aria-label="Telemóvel usado no pedido" />
            <button type="submit" className="btn btn-outline-navy">Associar pedido</button>
          </form>
        </div>
      </div>
    </section>
  );
}
