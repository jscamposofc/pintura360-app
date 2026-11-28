"use client";

import { useState } from "react";
import { criarPedido } from "@/lib/actions/pedidos";
import { calcPrice, PLAN_LABELS, PLAN_DESCRIPTIONS, type Plano } from "@/lib/pricing";

const SERVICOS = ["Interiores", "Exteriores", "Fachadas", "Estuque/Pladur", "Outro"];
const PLANOS: Plano[] = ["essencial", "recomendado", "premium"];

export default function WizardOrcamento({
  prefId,
  prefNome,
}: {
  prefId: string | null;
  prefNome: string | null;
}) {
  const [step, setStep] = useState(1);
  const [servico, setServico] = useState("");
  const [area, setArea] = useState("");
  const [divisoes, setDivisoes] = useState("");
  const [estadoSuperficie, setEstadoSuperficie] = useState("Boas");
  const [comMateriais, setComMateriais] = useState(true);
  const [plano, setPlano] = useState<Plano>("recomendado");
  const [distrito, setDistrito] = useState("");
  const [concelho, setConcelho] = useState("");
  const [prazo, setPrazo] = useState("Esta semana");
  const [nome, setNome] = useState("");
  const [telefone, setTelefone] = useState("");
  const [email, setEmail] = useState("");
  const [notas, setNotas] = useState("");
  const [consent, setConsent] = useState(false);

  const areaNum = Number(area) || 0;
  const precoEstimado = servico ? calcPrice(servico, areaNum, plano, comMateriais) : 0;

  function next() {
    if (step === 1 && !servico) return alert("Escolha um tipo de serviço.");
    if (step === 4 && (!distrito || !concelho.trim())) return alert("Preencha distrito e concelho.");
    if (step === 5) {
      if (!nome.trim() || !telefone.trim() || !email.trim()) return alert("Preencha todos os campos obrigatórios.");
      if (!consent) return alert("Tem de aceitar a política de privacidade.");
    }
    setStep((s) => Math.min(s + 1, 6));
  }
  function prev() {
    setStep((s) => Math.max(s - 1, 1));
  }

  return (
    <form className="wizard-shell" action={criarPedido}>
      <input type="hidden" name="servico" value={servico} />
      <input type="hidden" name="pref_id" value={prefId ?? ""} />
      <input type="hidden" name="pref_nome" value={prefNome ?? ""} />
      <input type="hidden" name="plano" value={plano} />
      <input type="hidden" name="estimated_price" value={precoEstimado} />
      <input type="hidden" name="materials_included" value={comMateriais ? "1" : "0"} />

      <div className="wizard-progress">
        {[1, 2, 3, 4, 5, 6].map((n) => <span key={n} className={n <= step ? "done" : ""} />)}
      </div>

      {prefNome && (
        <p className="muted center" style={{ marginBottom: 16 }}>Preferência indicada: {prefNome}</p>
      )}

      <div className={`wizard-step ${step === 1 ? "active" : ""}`}>
        <h3>Que tipo de serviço procura?</h3>
        <div className="option-grid">
          {SERVICOS.map((s) => (
            <div
              key={s}
              className={`option-card ${servico === s ? "selected" : ""}`}
              onClick={() => setServico(s)}
            >
              {s === "Estuque/Pladur" ? "Estuque / Pladur" : s}
            </div>
          ))}
        </div>
        <div className="wizard-nav"><span /><button type="button" className="btn btn-orange" onClick={next}>Continuar</button></div>
      </div>

      <div className={`wizard-step ${step === 2 ? "active" : ""}`}>
        <h3>Detalhes do espaço</h3>
        <div className="field">
          <label>Área aproximada (m²)</label>
          <input type="number" min={1} name="area" value={area} onChange={(e) => setArea(e.target.value)} placeholder="Ex: 80" />
        </div>
        <div className="field">
          <label>Número de divisões</label>
          <input type="number" min={1} name="divisoes" value={divisoes} onChange={(e) => setDivisoes(e.target.value)} placeholder="Ex: 4" />
        </div>
        <div className="field">
          <label>Estado das superfícies</label>
          <select name="estado_superficie" value={estadoSuperficie} onChange={(e) => setEstadoSuperficie(e.target.value)}>
            <option value="Boas">Boas, só precisa de pintura</option>
            <option value="Pequenas reparações">Pequenas reparações necessárias</option>
            <option value="Más">Más — fissuras, humidade ou bolor</option>
          </select>
        </div>
        <div className="wizard-nav"><button type="button" className="btn btn-outline-navy" onClick={prev}>Voltar</button><button type="button" className="btn btn-orange" onClick={next}>Continuar</button></div>
      </div>

      <div className={`wizard-step ${step === 3 ? "active" : ""}`}>
        <h3>A sua estimativa</h3>
        <p className="muted" style={{ marginTop: -8, marginBottom: 16 }}>
          Valor indicativo — o preço final é confirmado com o profissional atribuído.
        </p>
        <div className="checkbox-row" style={{ marginBottom: 18 }}>
          <input type="checkbox" id="comMateriais" checked={comMateriais} onChange={(e) => setComMateriais(e.target.checked)} />
          <label htmlFor="comMateriais">Material incluído (tintas e consumíveis)</label>
        </div>
        <div className="grid grid-3" style={{ gap: 14 }}>
          {PLANOS.map((p) => {
            const preco = servico ? calcPrice(servico, areaNum, p, comMateriais) : 0;
            return (
              <div
                key={p}
                className={`option-card ${plano === p ? "selected" : ""}`}
                style={{ textAlign: "left", padding: 18, cursor: "pointer" }}
                onClick={() => setPlano(p)}
              >
                <div className="muted" style={{ fontSize: ".72rem", fontWeight: 800, textTransform: "uppercase", letterSpacing: ".04em" }}>
                  {PLAN_LABELS[p]}
                </div>
                <div style={{ fontSize: "1.5rem", fontWeight: 800, color: "var(--navy)", margin: "6px 0" }}>
                  {preco} <span style={{ fontSize: ".85rem", fontWeight: 600, color: "var(--muted)" }}>€</span>
                </div>
                <div className="muted" style={{ fontSize: ".78rem", fontWeight: 400 }}>{PLAN_DESCRIPTIONS[p]}</div>
              </div>
            );
          })}
        </div>
        <div className="wizard-nav"><button type="button" className="btn btn-outline-navy" onClick={prev}>Voltar</button><button type="button" className="btn btn-orange" onClick={next}>Continuar</button></div>
      </div>

      <div className={`wizard-step ${step === 4 ? "active" : ""}`}>
        <h3>Localização e prazo</h3>
        <div className="field">
          <label>Distrito</label>
          <select name="distrito" value={distrito} onChange={(e) => setDistrito(e.target.value)} required>
            <option value="">Selecione…</option>
            <option>Lisboa</option><option>Setúbal</option><option>Porto</option><option>Outro</option>
          </select>
        </div>
        <div className="field">
          <label>Concelho</label>
          <input type="text" name="concelho" value={concelho} onChange={(e) => setConcelho(e.target.value)} placeholder="Ex: Cascais" required />
        </div>
        <div className="field">
          <label>Quando pretende o serviço?</label>
          <select name="prazo" value={prazo} onChange={(e) => setPrazo(e.target.value)}>
            <option>Esta semana</option>
            <option>Próximas 2 semanas</option>
            <option>Próximo mês</option>
            <option>Ainda não sei</option>
          </select>
        </div>
        <div className="wizard-nav"><button type="button" className="btn btn-outline-navy" onClick={prev}>Voltar</button><button type="button" className="btn btn-orange" onClick={next}>Continuar</button></div>
      </div>

      <div className={`wizard-step ${step === 5 ? "active" : ""}`}>
        <h3>Os seus dados</h3>
        <div className="field">
          <label>Nome</label>
          <input type="text" name="nome" value={nome} onChange={(e) => setNome(e.target.value)} required />
        </div>
        <div className="field">
          <label>Telemóvel</label>
          <input type="tel" name="telefone" value={telefone} onChange={(e) => setTelefone(e.target.value)} required />
        </div>
        <div className="field">
          <label>Email</label>
          <input type="email" name="email" value={email} onChange={(e) => setEmail(e.target.value)} required />
        </div>
        <div className="field">
          <label>Notas adicionais (opcional)</label>
          <textarea name="notas" value={notas} onChange={(e) => setNotas(e.target.value)} placeholder="Algo que devamos saber sobre o projeto?" />
        </div>
        <div className="checkbox-row">
          <input type="checkbox" id="consent" name="consent" value="1" checked={consent} onChange={(e) => setConsent(e.target.checked)} />
          <label htmlFor="consent">Aceito a <a href="/privacidade" target="_blank">Política de Privacidade</a> e os <a href="/termos" target="_blank">Termos e Condições</a>.</label>
        </div>
        <div className="wizard-nav"><button type="button" className="btn btn-outline-navy" onClick={prev}>Voltar</button><button type="button" className="btn btn-orange" onClick={next}>Rever Pedido</button></div>
      </div>

      <div className={`wizard-step ${step === 6 ? "active" : ""}`}>
        <h3>Confirme o seu pedido</h3>
        <div className="card" style={{ background: "var(--paper)" }}>
          <p><strong>Serviço:</strong> {servico || "—"}</p>
          <p><strong>Área:</strong> {area || "—"} m² · <strong>Divisões:</strong> {divisoes || "—"}</p>
          <p><strong>Estimativa ({PLAN_LABELS[plano]}{comMateriais ? ", com material" : ", sem material"}):</strong> {precoEstimado} €</p>
          <p><strong>Localização:</strong> {concelho || "—"}, {distrito || "—"}</p>
          <p><strong>Nome:</strong> {nome || "—"} · <strong>Telemóvel:</strong> {telefone || "—"}</p>
          <p><strong>Email:</strong> {email || "—"}</p>
          {prefNome && <p><strong>Profissional preferido:</strong> {prefNome}</p>}
        </div>
        <div className="alert alert-info">
          Esta estimativa é indicativa. Não há nenhum pagamento a fazer agora. A nossa equipa
          analisa o pedido e atribui-o a um profissional verificado da sua zona, que confirma
          o valor final consigo. Os contactos diretos só são partilhados depois de confirmar.
        </div>
        <div className="wizard-nav"><button type="button" className="btn btn-outline-navy" onClick={prev}>Voltar</button><button type="submit" className="btn btn-orange">Enviar Pedido</button></div>
      </div>
    </form>
  );
}
