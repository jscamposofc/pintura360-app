"use client";

// Calculadora + questionário de 9 passos + confirmação/pagamento + sucesso.
// Layout, textos e regras portados do site original (pintura360.pt). A
// diferença: o pedido passa a ser gravado no Supabase (com as fotografias)
// e a referência P360 é gerada no servidor.

import { useEffect, useRef, useState } from "react";
import {
  AREA_MAX, AREA_MIN, MIN_BILLABLE_AREA, PLANOS, SERVICE_LABELS, calcDeposit, calcPrice, getBillableArea,
  type Materiais, type Plano, type TipoServico,
} from "@/lib/pricing";
import {
  CONCELHOS, CONDICAO_GRAVE, CONDICOES, DIVISOES, ELEVADOR, OCUPACOES, PRAZOS, waLink,
  type DivisaoKey,
} from "@/lib/opcoes";
import { confirmarFotos, criarPedido, guardarPreferenciasPagamento } from "@/lib/actions/pedidos";
import { createBrowserClient } from "@/lib/supabase/browser";
import { BUCKET_FOTOS } from "@/lib/storage";
import { downloadPlanPDF, downloadQuotePDF, type ResumoPedido } from "@/lib/pdf";

const TOTAL_STEPS = 9;
const MIN_PHOTOS_RECOMMENDED = 3;
const MAX_PHOTOS = 12;
const MAX_PHOTO_SIZE = 10 * 1024 * 1024;
const STRIPE_PAYMENT_LINK = process.env.NEXT_PUBLIC_STRIPE_PAYMENT_LINK ?? "";
const PENDING_KEY = "p360_pending_lead";

const TIER_LABELS_PT: Record<Plano, string> = { essencial: "🟢 Essencial", recomendado: "⭐ Recomendado", premium: "🟡 Premium" };

type Foto = { file: File; url: string };
type Fase = "slider" | "wizard" | "confirm" | "success";
type Registo = ResumoPedido & { id: number; prazo: string; telefone: string; divisoes: Record<string, number> };

const emptyRooms = () => Object.fromEntries(DIVISOES.map((d) => [d.key, 0])) as Record<DivisaoKey, number>;

// Reduz as fotografias do telemóvel (até ~1920px, JPEG) antes do envio.
async function comprimir(file: File): Promise<Blob> {
  if (!/^image\/(jpeg|png|webp)$/.test(file.type)) return file;
  try {
    const bmp = await createImageBitmap(file);
    const escala = Math.min(1, 1920 / Math.max(bmp.width, bmp.height));
    const canvas = document.createElement("canvas");
    canvas.width = Math.round(bmp.width * escala);
    canvas.height = Math.round(bmp.height * escala);
    canvas.getContext("2d")!.drawImage(bmp, 0, 0, canvas.width, canvas.height);
    const blob = await new Promise<Blob | null>((res) => canvas.toBlob(res, "image/jpeg", 0.82));
    return blob && blob.size < file.size ? blob : file;
  } catch {
    return file;
  }
}

function mensagemWhatsApp(r: Registo): string {
  const rooms = Object.entries(r.divisoes).filter(([, v]) => v > 0).map(([k, v]) => `${v}x ${k}`).join(", ") || "não especificado";
  return [
    "Olá! Pedido de orçamento via Pintura360.",
    "",
    `Referência: ${r.referencia}`,
    `Nome: ${r.nome}`,
    `Telefone: ${r.telefone}`,
    `Serviço: ${SERVICE_LABELS[r.tipo]}`,
    `Divisões: ${rooms}`,
    `Área faturável: ${r.areaFaturavel} m²`,
    `Plano: ${r.plano} — ${r.preco} €`,
    `Localização: ${r.localidade || "não indicada"}`,
  ].join("\n");
}

export default function Orcamento() {
  const [fase, setFase] = useState<Fase>("slider");

  // Fase 0 — slider rápido
  const [tipo, setTipo] = useState<TipoServico>("interior");
  const [materiais, setMateriais] = useState<Materiais>("pintura360");
  const [quickTier, setQuickTier] = useState<Plano>("recomendado");
  const [area, setArea] = useState(80);

  // Questionário
  const [step, setStep] = useState(1);
  const [erroStep, setErroStep] = useState<number | null>(null);
  const [rooms, setRooms] = useState(emptyRooms);
  const [codigoPostal, setCodigoPostal] = useState("");
  const [localidade, setLocalidade] = useState("");
  const [morada, setMorada] = useState("");
  const [andar, setAndar] = useState("");
  const [elevador, setElevador] = useState("Sim");
  const [prazo, setPrazo] = useState("");
  const [dataPreferencial, setDataPreferencial] = useState("");
  const [condicao, setCondicao] = useState("");
  const [ocupacao, setOcupacao] = useState("");
  const [fotos, setFotos] = useState<Foto[]>([]);
  const [nome, setNome] = useState("");
  const [email, setEmail] = useState("");
  const [telefone, setTelefone] = useState("");
  const [privacy, setPrivacy] = useState(false);
  const [marketing, setMarketing] = useState(false);
  const [website, setWebsite] = useState("");
  const [plano, setPlano] = useState<Plano | null>(null);

  // Envio
  const [aEnviar, setAEnviar] = useState(false);
  const [estadoEnvio, setEstadoEnvio] = useState("");
  const [erroEnvio, setErroEnvio] = useState("");
  const [registo, setRegisto] = useState<Registo | null>(null);
  const [fotosFalhadas, setFotosFalhadas] = useState(0);

  // Confirmação / pagamento
  const [nifAberto, setNifAberto] = useState(false);
  const [nif, setNif] = useState("");
  const [metodo, setMetodo] = useState("mbway");

  const photoInput = useRef<HTMLInputElement>(null);
  const nifInput = useRef<HTMLInputElement>(null);
  const comMateriais = materiais === "pintura360";
  const areaFaturavel = getBillableArea(area);

  const scrollTopo = () => document.getElementById("orcamento")?.scrollIntoView({ behavior: "instant", block: "start" });

  // Regresso da Stripe (?paid=1): mostra o ecrã de sucesso com o pedido guardado.
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    if (params.get("paid") !== "1") return;
    const t = setTimeout(() => {
      try {
        const stored = localStorage.getItem(PENDING_KEY);
        if (stored) {
          setRegisto(JSON.parse(stored) as Registo);
          localStorage.removeItem(PENDING_KEY);
          setFase("success");
          setTimeout(scrollTopo, 50);
        }
      } catch {
        /* ignorado */
      }
      window.history.replaceState({}, document.title, window.location.pathname + window.location.hash);
    }, 0);
    return () => clearTimeout(t);
  }, []);

  useEffect(() => () => fotos.forEach((f) => URL.revokeObjectURL(f.url)), []); // eslint-disable-line react-hooks/exhaustive-deps

  function startFullWizard() {
    setPlano(quickTier);
    setStep(1);
    setFase("wizard");
  }

  function validar(n: number): boolean {
    let ok = true;
    if (n === 4) ok = !!prazo;
    else if (n === 5) ok = !!condicao;
    else if (n === 6) ok = !!ocupacao;
    else if (n === 8) {
      const emailOk = email.trim() === "" || /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim());
      ok = nome.trim().length >= 2 && telefone.replace(/\D/g, "").length >= 9 && emailOk && privacy;
    } else if (n === 9) ok = !!plano;
    setErroStep(ok ? null : n);
    return ok;
  }

  function seguinte() {
    if (!validar(step)) return;
    setStep((s) => Math.min(s + 1, TOTAL_STEPS));
  }
  function anterior() {
    setErroStep(null);
    if (step === 1) {
      setFase("slider");
      return;
    }
    setStep((s) => Math.max(s - 1, 1));
  }

  function adicionarFotos(e: React.ChangeEvent<HTMLInputElement>) {
    const novas: Foto[] = [];
    for (const file of Array.from(e.target.files ?? [])) {
      if (!file.type.startsWith("image/")) { alert(`"${file.name}" não é uma imagem válida.`); continue; }
      if (file.size > MAX_PHOTO_SIZE) { alert(`"${file.name}" excede o tamanho máximo de 10MB.`); continue; }
      novas.push({ file, url: URL.createObjectURL(file) });
    }
    e.target.value = "";
    setFotos((prev) => {
      const todas = [...prev, ...novas];
      if (todas.length > MAX_PHOTOS) alert(`Pode enviar até ${MAX_PHOTOS} fotografias.`);
      todas.slice(MAX_PHOTOS).forEach((f) => URL.revokeObjectURL(f.url));
      return todas.slice(0, MAX_PHOTOS);
    });
  }
  function removerFoto(idx: number) {
    setFotos((prev) => {
      URL.revokeObjectURL(prev[idx].url);
      return prev.filter((_, i) => i !== idx);
    });
  }

  async function submeter(e: React.FormEvent) {
    e.preventDefault();
    if (aEnviar || !validar(TOTAL_STEPS) || !plano) return;
    setAEnviar(true);
    setErroEnvio("");
    setEstadoEnvio("A registar o seu pedido…");

    try {
      const blobs = await Promise.all(fotos.map((f) => comprimir(f.file)));
      const res = await criarPedido({
        tipo, area, materiais, plano,
        divisoes: rooms,
        codigoPostal, localidade, morada, andar, elevador,
        prazo, dataPreferencial, condicao, ocupacao,
        nome, email, telefone,
        consentPrivacidade: privacy, consentMarketing: marketing,
        numFotos: blobs.length,
        fotoTipos: blobs.map((b) => b.type),
        website,
      });
      if (!res.ok) {
        setErroEnvio(res.erro);
        setAEnviar(false);
        return;
      }

      let falhadas = 0;
      if (res.uploads.length) {
        const sb = createBrowserClient();
        for (let i = 0; i < res.uploads.length; i++) {
          setEstadoEnvio(`A enviar fotografias (${i + 1} de ${res.uploads.length})…`);
          const u = res.uploads[i];
          const { error } = await sb.storage.from(BUCKET_FOTOS).uploadToSignedUrl(u.path, u.token, blobs[i], {
            contentType: blobs[i].type || "image/jpeg",
          });
          if (error) falhadas++;
        }
        await confirmarFotos(res.id, res.referencia);
      }
      falhadas += Math.max(0, blobs.length - res.uploads.length);

      const r: Registo = {
        id: res.id,
        referencia: res.referencia,
        nome: nome.trim(),
        telefone: telefone.trim(),
        tipo,
        area,
        areaFaturavel: res.areaFaturavel,
        condicao,
        ocupacao,
        comMateriais,
        localidade: localidade.trim(),
        plano,
        preco: res.precoEstimado,
        prazo,
        divisoes: Object.fromEntries(Object.entries(rooms).filter(([, v]) => v > 0)),
      };
      try { localStorage.setItem(PENDING_KEY, JSON.stringify(r)); } catch { /* ignorado */ }
      setRegisto(r);
      setFotosFalhadas(falhadas);
      setFase("confirm");
      setTimeout(scrollTopo, 30);
    } catch (err) {
      console.error(err);
      setErroEnvio("Não foi possível registar o pedido. Verifique a ligação à internet e tente novamente.");
    } finally {
      setAEnviar(false);
      setEstadoEnvio("");
    }
  }

  function aoPagar() {
    if (!registo) return;
    void guardarPreferenciasPagamento(registo.id, registo.referencia, nif, metodo);
  }

  const pct = ((area - AREA_MIN) / (AREA_MAX - AREA_MIN)) * 100;
  const deposito = registo ? calcDeposit(registo.preco) : { agora: 0, depois: 0 };
  const payHref = registo && STRIPE_PAYMENT_LINK
    ? `${STRIPE_PAYMENT_LINK}${STRIPE_PAYMENT_LINK.includes("?") ? "&" : "?"}client_reference_id=${encodeURIComponent(registo.referencia)}`
    : "";
  const stepCls = (n: number, extra = "") =>
    `wiz-step${extra}${step === n ? " active" : ""}${erroStep === n ? " error" : ""}`;

  return (
    <>
      {/* ===================== FASE 0 — SLIDER RÁPIDO ===================== */}
      <div className={`calc-phase${fase === "slider" ? " active" : ""}`} id="sliderPhase">
        <div className="calc-grid">
          <div className="calc-controls">
            <div className="calc-group">
              <div className="calc-label">Tipo de Serviço</div>
              <div className="type-grid">
                {([["interior", "🏠 Pintura Interior"], ["exterior", "🏡 Pintura Exterior"], ["comercial", "🏢 Comercial"]] as const).map(([t, l]) => (
                  <button key={t} type="button" className={`type-btn${tipo === t ? " active" : ""}`} onClick={() => setTipo(t)}>{l}</button>
                ))}
              </div>
            </div>

            <div className="calc-group" style={{ marginBottom: 0 }}>
              <div className="calc-label">Área a Pintar (m²)</div>
              <div className="area-display">{area} <span>m²</span></div>
              <input
                type="range" min={AREA_MIN} max={AREA_MAX} value={area} className="calc-slider"
                style={{ "--pct": pct + "%" } as React.CSSProperties}
                onChange={(e) => setArea(parseInt(e.target.value) || 80)}
                aria-label="Área a pintar em metros quadrados"
              />
              <div className="slider-labels"><span>{AREA_MIN} m²</span><span>{AREA_MAX} m²</span></div>
              <p className="wiz-sub" style={{ margin: "14px 0 0" }}>Some as áreas de todas as paredes (e teto, se aplicável) que pretende pintar.</p>
              <p className="calc-disclaimer">Indique uma estimativa aproximada da área a pintar. O valor apresentado é indicativo e poderá ser ajustado após validação do serviço.</p>
            </div>

            <div className="calc-group" style={{ marginBottom: 0, marginTop: 26 }}>
              <div className="calc-label">Quem Fornece a Tinta?</div>
              <div className="type-grid">
                <button type="button" className={`type-btn${materiais === "pintura360" ? " active" : ""}`} onClick={() => setMateriais("pintura360")}>🎨 Pintura360 Fornece</button>
                <button type="button" className={`type-btn${materiais === "cliente" ? " active" : ""}`} onClick={() => setMateriais("cliente")}>🏠 Eu Forneço</button>
              </div>
            </div>
          </div>

          <div className="calc-results">
            <div className="results-header">Estimativa Instantânea</div>
            {PLANOS.map((p) => (
              <div
                key={p}
                className={`tier-card${p === "recomendado" ? " featured" : ""}${quickTier === p ? " selected" : ""}`}
                onClick={() => setQuickTier(p)}
                role="button"
                tabIndex={0}
                onKeyDown={(e) => (e.key === "Enter" || e.key === " ") && setQuickTier(p)}
              >
                {p === "recomendado" && <div className="tier-badge">⭐ Mais Escolhido</div>}
                <div className="tier-top">
                  <div className="tier-name">{p === "essencial" ? "🟢 Essencial" : p === "premium" ? "🟡 Premium" : "Recomendado"}</div>
                  <div className="tier-price">{calcPrice(tipo, area, p, comMateriais)}<span> €</span></div>
                </div>
                <div className="tier-desc">
                  {p === "essencial" ? "Acabamento standard, indicado para renovações rápidas." : p === "recomendado" ? "Melhor relação qualidade/preço, com acabamento cuidado." : "Acabamento superior, tintas premium."}
                </div>
              </div>
            ))}
            <div className="calc-cta">
              <button type="button" className="btn btn-orange" style={{ width: "100%" }} onClick={startFullWizard}>Pedir Orçamento em 2 Minutos</button>
              <p className="calc-note">Sem compromisso · Leva menos de 2 minutos</p>
            </div>
          </div>
        </div>
      </div>

      {/* ===================== FASE 1 — QUESTIONÁRIO COMPLETO ===================== */}
      <div className={`calc-phase${fase === "wizard" ? " active" : ""}${step === TOTAL_STEPS ? " wizard-wide" : ""}`} id="wizardPhase">
        <div className="wiz-progress">
          <div className="wiz-progress-bar"><div className="wiz-progress-fill" style={{ width: (step / TOTAL_STEPS) * 100 + "%" }} /></div>
          <span className="wiz-progress-label">Passo {step} de {TOTAL_STEPS}</span>
        </div>

        <form id="quoteWizard" noValidate onSubmit={submeter}>
          {/* Campo-armadilha anti-spam: invisível para pessoas */}
          <div aria-hidden="true" style={{ position: "absolute", left: -10000, width: 1, height: 1, overflow: "hidden" }}>
            <label>Website<input tabIndex={-1} autoComplete="off" value={website} onChange={(e) => setWebsite(e.target.value)} /></label>
          </div>

          {/* STEP 1 — CONFIRMAÇÃO DE ÁREA */}
          <div className={stepCls(1)}>
            <p className="wiz-kicker">1. Confirmação</p>
            <h3>Área a pintar</h3>
            <div className="area-confirm-box">
              <div className="area-confirm-row"><span>Área indicada</span><strong>{area} m²</strong></div>
              <div className="area-confirm-row highlight"><span>Área faturável</span><strong>{areaFaturavel} m²</strong></div>
            </div>
            {area < MIN_BILLABLE_AREA && (
              <p className="min-area-note">A área indicada é inferior à área mínima de serviço. Para este tipo de intervenção, aplicamos uma área mínima faturável de <strong>{MIN_BILLABLE_AREA} m²</strong>.</p>
            )}
          </div>

          {/* STEP 2 — DIVISÕES */}
          <div className={stepCls(2)}>
            <p className="wiz-kicker">2. Divisões</p>
            <h3>Que divisões pretende pintar?</h3>
            <p className="wiz-sub">Inclua apenas as divisões que pretende pintar.</p>
            <p className="calc-disclaimer">Esta informação ajuda-nos a compreender melhor o trabalho e a preparar a validação do pedido.</p>
            <div className="counter-list">
              {DIVISOES.map((d) => (
                <div className="counter-row" key={d.key}>
                  <span className="counter-label">{d.label}</span>
                  <div className="counter-control">
                    <button type="button" aria-label={`Menos ${d.label}`} onClick={() => setRooms((r) => ({ ...r, [d.key]: Math.max(0, r[d.key] - 1) }))}>–</button>
                    <span>{rooms[d.key]}</span>
                    <button type="button" aria-label={`Mais ${d.label}`} onClick={() => setRooms((r) => ({ ...r, [d.key]: Math.min(50, r[d.key] + 1) }))}>+</button>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* STEP 3 — LOCALIZAÇÃO */}
          <div className={stepCls(3)}>
            <p className="wiz-kicker">3. Localização</p>
            <h3>Onde é o projeto?</h3>
            <div className="field-row-2">
              <div className="field"><label htmlFor="cp">Código Postal</label><input id="cp" type="text" inputMode="numeric" placeholder="0000-000" maxLength={8} value={codigoPostal} onChange={(e) => setCodigoPostal(e.target.value)} /></div>
              <div className="field">
                <label htmlFor="loc">Localidade</label>
                <input id="loc" type="text" placeholder="Ex. Lisboa" list="p360-concelhos" value={localidade} onChange={(e) => setLocalidade(e.target.value)} />
                <datalist id="p360-concelhos">{Object.keys(CONCELHOS).map((c) => <option key={c} value={c} />)}</datalist>
              </div>
            </div>
            <div className="field"><label htmlFor="morada">Morada</label><input id="morada" type="text" placeholder="Rua, número" value={morada} onChange={(e) => setMorada(e.target.value)} /></div>
            <div className="field-row-2">
              <div className="field"><label htmlFor="andar">Andar</label><input id="andar" type="text" placeholder="Ex. 3º Esq." value={andar} onChange={(e) => setAndar(e.target.value)} /></div>
              <div className="field">
                <label htmlFor="elev">Existe elevador?</label>
                <select id="elev" value={elevador} onChange={(e) => setElevador(e.target.value)}>
                  {ELEVADOR.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
                </select>
              </div>
            </div>
            <p className="privacy-note">🔒 A sua morada é um dado pessoal e nunca é exibida publicamente — só é partilhada com o profissional quando o trabalho lhe for atribuído.</p>
          </div>

          {/* STEP 4 — CALENDÁRIO */}
          <div className={stepCls(4)}>
            <p className="wiz-kicker">4. Calendário</p>
            <h3>Quando pretende realizar o serviço? <span className="req">*</span></h3>
            <div className="choice-grid">
              {PRAZOS.map((p) => (
                <label className="choice-pill" key={p.value}>
                  <input type="radio" name="prazo" value={p.value} checked={prazo === p.value} onChange={() => setPrazo(p.value)} />
                  <span>{p.label}</span>
                </label>
              ))}
            </div>
            <div className="field" style={{ marginTop: 20 }}>
              <label htmlFor="dataPref">Data preferencial (opcional)</label>
              <input id="dataPref" type="date" value={dataPreferencial} min={new Date().toISOString().slice(0, 10)} onChange={(e) => setDataPreferencial(e.target.value)} />
            </div>
            <p className="wiz-error">Por favor, selecione uma opção.</p>
          </div>

          {/* STEP 5 — ESTADO DAS SUPERFÍCIES */}
          <div className={stepCls(5)}>
            <p className="wiz-kicker">5. Estado</p>
            <h3>Como estão as superfícies? <span className="req">*</span></h3>
            <div className="state-list">
              {CONDICOES.map((c) => (
                <label className="state-card" key={c.value}>
                  <input type="radio" name="condicao" value={c.value} checked={condicao === c.value} onChange={() => setCondicao(c.value)} />
                  <span className="state-title">{c.title}</span>
                  <span className="state-desc">{c.desc}</span>
                </label>
              ))}
            </div>
            {condicao === CONDICAO_GRAVE && (
              <div className="severe-warning">⚠️ O seu projeto necessita de análise pela nossa equipa antes de ser possível confirmar uma estimativa final. Pode continuar — vamos entrar em contacto para avaliar em detalhe.</div>
            )}
            <p className="wiz-error">Por favor, selecione o estado das superfícies.</p>
          </div>

          {/* STEP 6 — OCUPAÇÃO */}
          <div className={stepCls(6)}>
            <p className="wiz-kicker">6. Ocupação</p>
            <h3>Como se encontra o imóvel? <span className="req">*</span></h3>
            <div className="state-list">
              {OCUPACOES.map((o) => (
                <label className="state-card" key={o.value}>
                  <input type="radio" name="ocupacao" value={o.value} checked={ocupacao === o.value} onChange={() => setOcupacao(o.value)} />
                  <span className="state-title">{o.title}</span>
                </label>
              ))}
            </div>
            <p className="wiz-error">Por favor, selecione uma opção.</p>
          </div>

          {/* STEP 7 — FOTOGRAFIAS */}
          <div className={stepCls(7)}>
            <p className="wiz-kicker">7. Fotografias</p>
            <h3>Ajude-nos a conhecer melhor o espaço</h3>
            <p className="wiz-sub">Idealmente: uma fotografia geral, outra perspetiva, e detalhes importantes. Pedimos pelo menos 3 fotografias.</p>
            <input ref={photoInput} type="file" accept="image/*" multiple style={{ display: "none" }} onChange={adicionarFotos} />
            <button type="button" className="btn btn-outline-navy" onClick={() => photoInput.current?.click()}>📷 + Adicionar Fotografias</button>
            <div className="photo-grid">
              {fotos.map((f, idx) => (
                <div className="photo-thumb" key={f.url}>
                  <img src={f.url} alt={`Fotografia ${idx + 1}`} />
                  <button type="button" aria-label="Remover fotografia" onClick={() => removerFoto(idx)}>×</button>
                </div>
              ))}
            </div>
            <p className="photo-note">{fotos.length} de {MIN_PHOTOS_RECOMMENDED} fotografias recomendadas adicionadas.</p>
          </div>

          {/* STEP 8 — CONTACTO */}
          <div className={stepCls(8)}>
            <p className="wiz-kicker">8. Contacto</p>
            <h3>Os seus dados <span className="req">*</span></h3>
            <div className="field"><label htmlFor="nome">Nome completo</label><input id="nome" type="text" autoComplete="name" placeholder="O seu nome completo" value={nome} onChange={(e) => setNome(e.target.value)} /></div>
            <div className="field"><label htmlFor="email">Email</label><input id="email" type="email" autoComplete="email" placeholder="o.seu@email.com" value={email} onChange={(e) => setEmail(e.target.value)} /></div>
            <div className="field"><label htmlFor="tel">Telefone</label><input id="tel" type="tel" autoComplete="tel" placeholder="+351 ___ ___ ___" value={telefone} onChange={(e) => setTelefone(e.target.value)} /></div>
            <div className="consent-block">
              <label className="consent-row">
                <input type="checkbox" checked={privacy} onChange={(e) => setPrivacy(e.target.checked)} />
                <span>Li e aceito a <a href="/privacidade" target="_blank">Política de Privacidade</a> e compreendo como os meus dados serão utilizados para gerir o meu pedido. <span className="req">*</span></span>
              </label>
              <label className="consent-row">
                <input type="checkbox" checked={marketing} onChange={(e) => setMarketing(e.target.checked)} />
                <span>Aceito receber comunicações comerciais e novidades da Pintura360 (opcional).</span>
              </label>
            </div>
            <p className="wiz-error">Por favor, preencha nome, telefone válido e aceite a Política de Privacidade.</p>
          </div>

          {/* STEP 9 — PLANOS */}
          <div className={stepCls(9, " wiz-step-wide")}>
            <p className="wiz-kicker">9. As suas propostas</p>
            <h3>As suas 3 propostas, prontas.</h3>
            <p className="wiz-sub">Construídas a partir do que nos disse sobre o projeto — escolha a que melhor se ajusta ao que procura.</p>

            <div className="plans-grid">
              {PLANOS.map((p) => {
                const preco = calcPrice(tipo, area, p, comMateriais);
                const featured = p === "recomendado";
                return (
                  <div key={p} className={`plan-card${featured ? " plan-featured" : ""}${plano === p ? " selected" : ""}`} onClick={() => { setPlano(p); setErroStep(null); }}>
                    {featured && <div className="plan-flag">A opção mais equilibrada</div>}
                    <div className="plan-tag">{p === "essencial" ? "Essencial" : p === "recomendado" ? "⭐ Recomendado" : "Premium"}</div>
                    <p className="plan-tagline">
                      {p === "essencial" ? "Pintura funcional, cuidado essencial." : p === "recomendado" ? "Preparação cuidada, acabamento reforçado." : "Cuidado máximo, do início ao fim."}
                    </p>
                    <div className="plan-price"><span>{preco}</span><span className="plan-price-suffix"> € · IVA incluído</span></div>
                    <ul className="plan-features">
                      {(p === "essencial"
                        ? ["Proteção das áreas principais", "Acabamento uniforme, tinta standard", "2 demãos"]
                        : p === "recomendado"
                          ? ["Proteção completa do espaço", "Correção de pequenas imperfeições", "Acabamento melhorado", "2 demãos"]
                          : ["Proteção completa + reparações maiores", "Tinta de gama premium", "Acompanhamento por profissional sénior", "3 demãos"]
                      ).map((f) => <li key={f}>{f}</li>)}
                    </ul>
                    <button type="button" className={`btn ${featured ? "btn-orange" : "btn-outline-navy"} plan-select-btn`}>
                      {plano === p ? "✓ Escolhido" : `Escolher ${p === "essencial" ? "Essencial" : p === "recomendado" ? "Recomendado" : "Premium"}`}
                    </button>
                    <button
                      type="button" className="plan-pdf-link"
                      onClick={(e) => { e.stopPropagation(); void downloadPlanPDF({ tipo, area, plano: p, comMateriais, preco }); }}
                    >↓ Descarregar PDF</button>
                  </div>
                );
              })}
            </div>
            <p className="wiz-error">Por favor, escolha um plano.</p>

            <div className="klarna-box">
              <span className="klarna-logo"><img src="/site/klarna.png" alt="Klarna" className="klarna-logo-img" /></span>
              <div>
                <strong>Pague o sinal em prestações</strong>
                <p>Não quer pagar tudo de uma vez? Com a Klarna pode dividir o valor da reserva — disponível na etapa de pagamento.</p>
              </div>
            </div>

            <p className="stripe-badge-line">🔒 Pagamento processado com segurança pela <img src="/site/stripe.png" alt="Stripe" className="stripe-inline-logo" /> · Dados encriptados de ponta a ponta</p>

            <div className="payment-info-box">
              <div className="calc-label">Como funciona o pagamento</div>
              <div className="payment-split">
                <div className="payment-split-item"><strong>50%</strong><span>Na reserva da data (reembolsável até 48h antes)</span></div>
                <div className="payment-split-item"><strong>50%</strong><span>Só depois de confirmar que está satisfeito</span></div>
              </div>
            </div>

            <div className="guarantee-box">
              <div className="guarantee-icon">🛡️</div>
              <div>
                <strong>Sem risco para si.</strong>
                <p>Se algo não correr como esperado, resolvemos a situação ou substituímos o profissional — sem custo adicional para si.</p>
              </div>
            </div>

            <div className="contact-cta-box">
              <div>
                <strong>Prefere esclarecer dúvidas antes de decidir?</strong>
                <p>Estamos disponíveis para o ajudar a escolher o plano certo para o seu espaço.</p>
              </div>
              <div className="contact-cta-actions">
                <a href={waLink("Olá! Tenho dúvidas sobre os planos da Pintura360 antes de decidir.")} target="_blank" rel="noopener noreferrer" className="btn btn-orange">Falar no WhatsApp</a>
              </div>
            </div>

            <div className="next-steps-timeline">
              <div className="calc-label">O que acontece depois</div>
              {[
                ["Confirmação técnica", "Validamos consigo todos os detalhes do pedido."],
                ["Reserva da data", "Escolhe o plano e garante a disponibilidade da equipa."],
                ["Ligação com o profissional", "Apresentamos quem vai realizar o trabalho."],
                ["Acompanhamento da obra", "Apoio disponível do início ao fim da execução."],
                ["Pagamento final", "Só depois de confirmar que está satisfeito com o resultado."],
              ].map(([t, d], i) => (
                <div className="timeline-row" key={t}><span className="timeline-num">{i + 1}</span><div><strong>{t}</strong><p>{d}</p></div></div>
              ))}
            </div>

            <p className="trust-footer-line">Orçamento válido por 30 dias · Os seus dados nunca são partilhados com terceiros.</p>
          </div>

          {erroEnvio && <p className="submit-error" role="alert">{erroEnvio}</p>}

          <div className="wiz-nav">
            <button type="button" className="btn btn-outline-navy" onClick={anterior} disabled={aEnviar}>{step === 1 ? "← Voltar ao início" : "Anterior"}</button>
            {step < TOTAL_STEPS ? (
              <button type="button" className="btn btn-orange" onClick={seguinte}>Próximo</button>
            ) : (
              <button type="submit" className="btn btn-orange" id="wizBtnSubmit" disabled={aEnviar}>
                {aEnviar ? <><span className="btn-spinner" aria-hidden="true" /> {estadoEnvio || "A enviar…"}</> : "Criar Pedido"}
              </button>
            )}
          </div>
        </form>
      </div>

      {/* ===================== CONFIRMAÇÃO / PAGAMENTO ===================== */}
      {registo && (
        <div className={`confirm-phase${fase === "confirm" ? " visible" : ""}`}>
          <div className="confirm-registered">
            <span>✓ Pedido registado</span>
            <strong>Referência {registo.referencia}</strong>
            <button type="button" onClick={() => void downloadQuotePDF(registo)}>↓ Resumo em PDF</button>
          </div>
          <div className="confirm-account">
            <span>👤</span>
            <p><strong>Acompanhe este pedido online.</strong> Crie uma conta de cliente com o mesmo telemóvel e o pedido fica guardado na sua área.</p>
            <a href={`/entrar?tipo=cliente&modo=criar&ref=${encodeURIComponent(registo.referencia)}`} className="btn btn-outline-navy">Criar conta</a>
          </div>
          {fotosFalhadas > 0 && (
            <p className="confirm-photo-warning">
              {fotosFalhadas === 1 ? "Uma fotografia não foi enviada." : `${fotosFalhadas} fotografias não foram enviadas.`} Pode enviá-las depois pelo WhatsApp, indicando a referência.
            </p>
          )}
          <div className="confirm-grid">
            <div className="confirm-main">
              <div className="confirm-header">
                <div className="confirm-header-icon">🛡️</div>
                <div>
                  <h3>Confirmação da Reserva</h3>
                  <p className="wiz-sub" style={{ margin: 0 }}>Reveja os detalhes do seu pedido antes de garantir a data.</p>
                </div>
              </div>

              <div className="confirm-box">
                <div className="calc-label">Resumo do pedido</div>
                <div className="confirm-summary-grid">
                  <div className="confirm-summary-item"><span>Serviço</span><strong>{SERVICE_LABELS[registo.tipo]}</strong></div>
                  <div className="confirm-summary-item"><span>Área faturável</span><strong>{registo.areaFaturavel} m²</strong></div>
                  <div className="confirm-summary-item"><span>Plano escolhido</span><strong>{TIER_LABELS_PT[registo.plano]}</strong></div>
                  <div className="confirm-summary-item"><span>Materiais</span><strong>{registo.comMateriais ? "🎨 Pintura360 fornece" : "🏠 Cliente fornece"}</strong></div>
                  <div className="confirm-summary-item"><span>Prazo pretendido</span><strong>{PRAZOS.find((p) => p.value === registo.prazo)?.curto ?? (registo.prazo || "-")}</strong></div>
                  <div className="confirm-summary-item"><span>Localização</span><strong>{registo.localidade || "-"}</strong></div>
                </div>
                <div className="confirm-total-row"><span>Valor total estimado</span><strong>{registo.preco} €</strong></div>
              </div>

              <div className="confirm-protected-box">
                <div className="confirm-protected-icon">🔒</div>
                <div className="confirm-protected-list">
                  <div className="confirm-protected-check">✓ Depósito reembolsável até 48h antes</div>
                  <div className="confirm-protected-check">✓ Profissionais verificados</div>
                  <div className="confirm-protected-check">✓ Pagamento só é entregue ao profissional após conclusão</div>
                  <div className="confirm-protected-check">✓ Acompanhamento da nossa equipa do início ao fim</div>
                </div>
              </div>

              <div className="confirm-box">
                <div className="calc-label">Resumo do pagamento</div>
                <div className="confirm-pay-row"><span>Valor total do projeto</span><strong>{registo.preco} €</strong></div>
                <div className="confirm-pay-row"><span>A pagar agora (depósito)</span><strong>{deposito.agora} €</strong></div>
                <div className="confirm-pay-row"><span>Restante após conclusão</span><strong>{deposito.depois} €</strong></div>
                <div className="confirm-pay-split">
                  <div className="confirm-pay-split-item"><strong>50% agora</strong><span>Depósito reembolsável</span></div>
                  <div className="confirm-pay-split-item"><strong>50% no fim</strong><span>Pagamento final</span></div>
                </div>
              </div>

              <button
                type="button" className="confirm-nif-toggle"
                onClick={() => { setNifAberto((v) => !v); setTimeout(() => nifInput.current?.focus(), 0); }}
              >{nifAberto ? "− Ocultar NIF" : "+ Incluir NIF na fatura"}</button>
              {nifAberto && (
                <div className="confirm-nif-field">
                  <input ref={nifInput} type="text" inputMode="numeric" placeholder="Número de Contribuinte" maxLength={9} value={nif} onChange={(e) => setNif(e.target.value.replace(/\D/g, ""))} />
                </div>
              )}

              <div className="calc-label" style={{ margin: "22px 0 12px" }}>Como prefere pagar?</div>
              <div className="confirm-method-list">
                {([
                  ["mbway", <img key="i" src="/site/mbway.svg" alt="" className="mbway-icon" />, "MB WAY"],
                  ["multibanco", <img key="i" src="/site/multibanco.svg" alt="" className="mb-icon" />, "Multibanco"],
                  ["cartao", "💳", "Cartão"],
                  ["klarna", <img key="i" src="/site/klarna.png" alt="" className="klarna-row-logo" />, "Klarna"],
                ] as const).map(([v, icon, label]) => (
                  <label className="confirm-method-row" key={v}>
                    <input type="radio" name="metodoPagamento" value={v} checked={metodo === v} onChange={() => setMetodo(v)} />
                    <span className="confirm-method-icon">{icon}</span>
                    <span>{label}</span>
                  </label>
                ))}
              </div>
              <p className="confirm-method-note">A escolha final do método é feita na página segura de pagamento.</p>

              {payHref ? (
                <>
                  <a href={payHref} target="_blank" rel="noopener noreferrer" className="btn btn-orange confirm-pay-btn" onClick={aoPagar}>
                    🔒 Reservar Data — <span>{deposito.agora} €</span>
                  </a>
                  <p className="confirm-pay-note">Pagamento seguro · Pode cancelar até 48h antes</p>
                  <div className="confirm-methods-row">
                    <span className="confirm-method-chip">💳 Cartão</span>
                    <span className="confirm-method-chip">MB WAY</span>
                    <span className="confirm-method-chip confirm-method-chip-svg"><img src="/site/multibanco.svg" alt="Multibanco" className="mb-icon" /></span>
                    <span className="confirm-method-chip confirm-method-chip-img"><img src="/site/klarna.png" alt="Klarna" className="klarna-chip-logo" /></span>
                    <span className="confirm-method-chip">🔒 SSL Seguro</span>
                  </div>
                </>
              ) : (
                <p className="confirm-pay-fallback">
                  A configurar o pagamento online — entre em contacto por WhatsApp para confirmarmos a reserva diretamente consigo.
                  <a href={waLink(mensagemWhatsApp(registo))} target="_blank" rel="noopener noreferrer" className="btn btn-orange" style={{ width: "100%", marginTop: 12 }} onClick={aoPagar}>
                    Confirmar reserva no WhatsApp
                  </a>
                </p>
              )}
            </div>

            <div className="confirm-side">
              <div className="confirm-side-box">
                <strong>Tem dúvidas antes de reservar?</strong>
                <p>Estamos disponíveis para esclarecer qualquer questão sobre o seu pedido.</p>
                <a href={waLink(mensagemWhatsApp(registo))} target="_blank" rel="noopener noreferrer" className="btn btn-orange" style={{ width: "100%" }}>WhatsApp</a>
                <p className="confirm-side-hours">Horário: seg-sáb · 9h-19h</p>
              </div>
              <div className="confirm-side-trust">
                <div className="confirm-side-trust-item">👤 <span>Profissionais verificados</span></div>
                <div className="confirm-side-trust-item">🔄 <span>Substituição em caso de imprevisto</span></div>
                <div className="confirm-side-trust-item">🎧 <span>Acompanhamento até ao fim</span></div>
                <div className="confirm-side-trust-item">🛡️ <span>Pagamento protegido</span></div>
              </div>
              <div className="confirm-side-safe">🔒 A sua reserva é processada com segurança, do início ao fim.</div>
            </div>
          </div>
        </div>
      )}

      {/* ===================== SUCESSO (regresso do pagamento) ===================== */}
      {registo && (
        <div className={`calc-success${fase === "success" ? " visible" : ""}`}>
          <div className="icon"><svg viewBox="0 0 24 24"><path d="M5 12l5 5L20 7" /></svg></div>
          <h3>🎉 Pedido recebido!</h3>
          <p className="lead-ref">Referência do pedido<br /><strong>{registo.referencia}</strong></p>
          <div className="next-steps">
            <div className="calc-label">O que acontece agora?</div>
            <div className="next-step-row">1️⃣ Analisamos o seu projeto</div>
            <div className="next-step-row">2️⃣ Validamos as informações e fotografias</div>
            <div className="next-step-row">3️⃣ Entramos em contacto consigo</div>
          </div>
          <div className="success-actions">
            <button type="button" className="btn btn-orange" onClick={() => void downloadQuotePDF(registo)}>Descarregar Resumo em PDF</button>
            <a href={waLink(mensagemWhatsApp(registo))} target="_blank" rel="noopener noreferrer" className="btn btn-outline-navy">Confirmar no WhatsApp</a>
          </div>
        </div>
      )}
    </>
  );
}
