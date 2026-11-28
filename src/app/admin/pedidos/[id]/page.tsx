import Link from "next/link";
import { notFound } from "next/navigation";
import { createAdminClient } from "@/lib/supabase/admin";
import { BUCKET_FOTOS } from "@/lib/storage";
import { atribuirPedido, atualizarEstado, guardarNotas, removerAtribuicao } from "@/lib/actions/admin";
import {
  ESTADOS, METODO_LABELS, ORDEM_ESTADOS, PLANO_LABELS, data, dataHora, divisoesTexto, euros,
  sugerirParceiros, telefoneWa, type Estado, type Evento, type Pedido, type Profissional,
} from "@/lib/admin-dados";

export const dynamic = "force-dynamic";

function waUrl(tel: string, texto: string) {
  return `https://wa.me/${telefoneWa(tel)}?text=${encodeURIComponent(texto)}`;
}

export default async function AdminPedido({ params }: { params: Promise<{ id: string }> }) {
  const { id: idParam } = await params;
  const id = Number(idParam);
  if (!Number.isInteger(id) || id <= 0) notFound();

  const supabase = createAdminClient();
  const [{ data: pedidoData }, { data: prosData }, { data: eventosData }] = await Promise.all([
    supabase.from("pedidos").select("*").eq("id", id).single(),
    supabase.from("profissionais").select("*").eq("status", "aprovado"),
    supabase.from("pedido_eventos").select("id, created_at, tipo, descricao").eq("pedido_id", id).order("created_at", { ascending: false }),
  ]);
  if (!pedidoData) notFound();

  const p = pedidoData as Pedido;
  const aprovados = (prosData ?? []) as Profissional[];
  const eventos = (eventosData ?? []) as Evento[];
  const fotos = p.fotos ?? [];

  const fotosUrls: string[] = [];
  if (fotos.length) {
    const { data: signed } = await supabase.storage.from(BUCKET_FOTOS).createSignedUrls(fotos, 60 * 60);
    (signed ?? []).forEach((s) => s.signedUrl && fotosUrls.push(s.signedUrl));
  }

  let atribuido: Profissional | null = aprovados.find((a) => a.id === p.profissional_id) ?? null;
  if (p.profissional_id && !atribuido) {
    const { data: pro } = await supabase.from("profissionais").select("*").eq("id", p.profissional_id).single();
    atribuido = (pro as Profissional) ?? null;
  }
  const sugestoes = sugerirParceiros(p, aprovados).filter((s) => s.pro.id !== p.profissional_id);

  const ref = p.referencia ?? `#${p.id}`;
  const preco = Number(p.estimated_price ?? 0);
  const sinal = Math.round(preco / 2);
  const localCompleto = [p.morada, p.andar, p.codigo_postal, p.concelho].filter(Boolean).join(", ");
  const mapsUrl = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent([p.morada, p.codigo_postal, p.concelho, "Portugal"].filter(Boolean).join(", "))}`;
  const idxEstado = ORDEM_ESTADOS.indexOf(p.status as Estado);

  const msgCliente = `Olá ${p.nome.split(" ")[0]}! Aqui é a equipa Pintura360, sobre o seu pedido ${ref} (${p.servico}, ${p.area_faturavel ?? p.area} m²).`;
  const msgParceiro = atribuido
    ? [
        `Olá ${atribuido.nome.split(" ")[0]}! Novo trabalho Pintura360 atribuído a si:`,
        "",
        `Referência: ${ref}`,
        `Serviço: ${p.servico} — ${p.area_faturavel ?? p.area} m² · Plano ${PLANO_LABELS[p.plano ?? ""] ?? p.plano ?? "—"}`,
        `Divisões: ${divisoesTexto(p.divisoes_detalhe)}`,
        `Superfícies: ${p.estado_superficie ?? "—"} · Imóvel: ${p.ocupacao ?? "—"}`,
        `Materiais: ${p.materials_included ? "fornecidos pela Pintura360" : "fornecidos pelo cliente"}`,
        `Prazo: ${p.prazo ?? "—"}${p.data_preferencial ? ` (data preferida ${data(p.data_preferencial)})` : ""}`,
        `Local: ${localCompleto || "—"}${p.elevador ? ` · Elevador: ${p.elevador}` : ""}`,
        `Cliente: ${p.nome} · ${p.telefone}`,
      ].join("\n")
    : "";

  return (
    <>
      <Link href="/admin/pedidos" className="adm-back">← Todos os pedidos</Link>
      <div className="adm-head">
        <div>
          <h1>{ref} <span className={`pill pill-${p.status}`} style={{ verticalAlign: "middle", marginLeft: 6 }}>{ESTADOS[p.status] ?? p.status}</span></h1>
          <p>Recebido a {dataHora(p.created_at)} · Última alteração {dataHora(p.atualizado_em)}</p>
        </div>
      </div>

      <div className="adm-detail">
        <div>
          {p.estado_superficie === "Humidade ou danos graves" && (
            <div className="adm-warning">⚠️ O cliente indicou <strong>humidade ou danos graves</strong> — é preciso avaliar no local antes de confirmar o valor.</div>
          )}

          <div className="adm-card">
            <h2>Cliente</h2>
            <div className="adm-client">
              <div>
                <h3>{p.nome}</h3>
                <p>{p.telefone}{p.email ? ` · ${p.email}` : ""}</p>
                <p style={{ marginTop: 4 }}>{p.consent_marketing ? "✓ Aceita comunicações comerciais" : "Não aceita comunicações comerciais"}</p>
              </div>
              <div className="adm-actions">
                <a href={waUrl(p.telefone, msgCliente)} target="_blank" rel="noopener noreferrer" className="btn btn-wa">WhatsApp</a>
                <a href={`tel:${p.telefone.replace(/\s/g, "")}`} className="btn btn-outline-navy">Ligar</a>
                {p.email && <a href={`mailto:${p.email}?subject=${encodeURIComponent(`Pintura360 — pedido ${ref}`)}`} className="btn btn-outline-navy">Email</a>}
              </div>
            </div>
          </div>

          <div className="adm-card">
            <h2>Projeto</h2>
            <div className="adm-dl">
              <div><span>Serviço</span><strong>{p.servico}</strong></div>
              <div><span>Área indicada</span><strong>{p.area ?? "—"} m²</strong></div>
              <div><span>Área faturável</span><strong>{p.area_faturavel ?? "—"} m²</strong></div>
              <div><span>Divisões</span><strong>{divisoesTexto(p.divisoes_detalhe)}</strong></div>
              <div><span>Estado das superfícies</span><strong>{p.estado_superficie ?? "—"}</strong></div>
              <div><span>Ocupação do imóvel</span><strong>{p.ocupacao ?? "—"}</strong></div>
              <div><span>Prazo pretendido</span><strong>{p.prazo ?? "—"}</strong></div>
              <div><span>Data preferencial</span><strong>{p.data_preferencial ? data(p.data_preferencial) : "—"}</strong></div>
              <div><span>Materiais</span><strong>{p.materials_included ? "Pintura360 fornece" : "Cliente fornece"}</strong></div>
            </div>
            <div className="adm-price-band">
              <div className="main"><span>Plano {PLANO_LABELS[p.plano ?? ""] ?? p.plano ?? "—"}</span><strong>{euros(p.estimated_price)}</strong></div>
              <div><span>Sinal (50%)</span><strong>{euros(sinal)}</strong></div>
              <div><span>Restante</span><strong>{euros(preco - sinal)}</strong></div>
            </div>
          </div>

          <div className="adm-card">
            <h2>
              Localização
              {(p.morada || p.codigo_postal) && <a href={mapsUrl} target="_blank" rel="noopener noreferrer" className="adm-card-action">Abrir no Google Maps ↗</a>}
            </h2>
            <div className="adm-dl">
              <div><span>Morada</span><strong>{p.morada || "—"}</strong></div>
              <div><span>Andar</span><strong>{p.andar || "—"}</strong></div>
              <div><span>Elevador</span><strong>{p.elevador || "—"}</strong></div>
              <div><span>Código postal</span><strong>{p.codigo_postal || "—"}</strong></div>
              <div><span>Localidade</span><strong>{p.concelho || "—"}</strong></div>
              <div><span>Distrito</span><strong>{p.distrito || "—"}</strong></div>
            </div>
          </div>

          <div className="adm-card">
            <h2>Fotografias ({fotos.length})</h2>
            {fotosUrls.length ? (
              <div className="adm-photos">
                {fotosUrls.map((u, i) => (
                  <a key={u} href={u} target="_blank" rel="noopener noreferrer"><img src={u} alt={`Fotografia ${i + 1} do pedido ${ref}`} /></a>
                ))}
              </div>
            ) : (
              <p className="adm-muted">O cliente não enviou fotografias. Pode pedi-las por WhatsApp.</p>
            )}
          </div>

          <div className="adm-card">
            <h2>Pagamento</h2>
            <div className="adm-dl">
              <div><span>Método preferido</span><strong>{p.metodo_pagamento ? METODO_LABELS[p.metodo_pagamento] ?? p.metodo_pagamento : "—"}</strong></div>
              <div><span>NIF para fatura</span><strong>{p.nif || "—"}</strong></div>
              <div><span>Estado</span><strong>{p.status === "pago" || p.status === "concluido" ? "Sinal pago" : "Por pagar"}</strong></div>
            </div>
          </div>
        </div>

        <div>
          <div className="adm-card adm-form">
            <h2>Estado do pedido</h2>
            <div className="adm-status-steps">
              {ORDEM_ESTADOS.map((s, i) => <span key={s} className={p.status !== "cancelado" && i <= idxEstado ? "on" : ""} title={ESTADOS[s]} />)}
            </div>
            <form action={atualizarEstado}>
              <input type="hidden" name="id" value={p.id} />
              <label htmlFor="status">Mudar para</label>
              <select id="status" name="status" defaultValue={p.status}>
                {(Object.keys(ESTADOS) as Estado[]).map((s) => <option key={s} value={s}>{ESTADOS[s]}</option>)}
              </select>
              <label htmlFor="nota">Nota para o histórico (opcional)</label>
              <input id="nota" name="nota" placeholder="Ex.: falei com o cliente, visita marcada" />
              <button type="submit" className="btn btn-orange">Guardar</button>
            </form>
          </div>

          <div className="adm-card adm-form">
            <h2>Parceiro</h2>
            {atribuido ? (
              <div className="adm-assigned">
                <strong>{atribuido.empresa || atribuido.nome}</strong>
                <small>{atribuido.nome} · {atribuido.telefone}</small>
                <div className="adm-actions">
                  <a href={waUrl(atribuido.telefone, msgParceiro)} target="_blank" rel="noopener noreferrer" className="btn btn-wa">Enviar trabalho por WhatsApp</a>
                </div>
                <form action={removerAtribuicao} style={{ marginTop: 10 }}>
                  <input type="hidden" name="id" value={p.id} />
                  <button type="submit" className="adm-link-btn">Remover atribuição</button>
                </form>
              </div>
            ) : (
              <p className="adm-muted" style={{ marginBottom: 12 }}>Ainda não atribuído.</p>
            )}

            {sugestoes.length > 0 ? (
              <>
                <label>{atribuido ? "Trocar para" : "Parceiros aprovados"}</label>
                <div className="adm-suggest">
                  {sugestoes.slice(0, 8).map(({ pro, score }) => (
                    <form key={pro.id} action={atribuirPedido} className="adm-pro">
                      <input type="hidden" name="id" value={p.id} />
                      <input type="hidden" name="profissional_id" value={pro.id} />
                      <div>
                        <strong>
                          {pro.empresa || pro.nome}
                          {score === 2 && <span className="adm-match">Cobre {p.concelho}</span>}
                          {score === 1 && <span className="adm-match" style={{ background: "#EAF1FF", color: "#1F4E9C" }}>Mesmo distrito</span>}
                        </strong>
                        <small>{pro.concelhos.slice(0, 4).join(", ")}{pro.concelhos.length > 4 ? "…" : ""} · {pro.anos_experiencia} anos</small>
                      </div>
                      <button type="submit">Atribuir</button>
                    </form>
                  ))}
                </div>
              </>
            ) : (
              !atribuido && (
                <p className="adm-muted">
                  Ainda não há parceiros aprovados. <Link href="/admin/profissionais" style={{ color: "var(--orange)" }}>Ver inscrições →</Link>
                </p>
              )
            )}
          </div>

          <div className="adm-card adm-form">
            <h2>Notas internas</h2>
            <form action={guardarNotas}>
              <input type="hidden" name="id" value={p.id} />
              <textarea name="notas_admin" defaultValue={p.notas_admin ?? ""} placeholder="Só visível para a equipa Pintura360." />
              <button type="submit" className="btn btn-outline-navy">Guardar notas</button>
            </form>
          </div>

          <div className="adm-card">
            <h2>Histórico</h2>
            {eventos.length ? (
              <ul className="adm-timeline">
                {eventos.map((e) => (
                  <li key={e.id}><time>{dataHora(e.created_at)}</time>{e.descricao}</li>
                ))}
              </ul>
            ) : (
              <p className="adm-muted">Sem registos.</p>
            )}
          </div>
        </div>
      </div>
    </>
  );
}
