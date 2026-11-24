"use client";

import { useState } from "react";
import { criarPedido } from "@/lib/actions/pedidos";

const SERVICOS = ["Interiores", "Exteriores", "Fachadas", "Estuque/Pladur", "Outro"];

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
  const [distrito, setDistrito] = useState("");
  const [concelho, setConcelho] = useState("");
  const [prazo, setPrazo] = useState("Esta semana");
  const [nome, setNome] = useState("");
  const [telefone, setTelefone] = useState("");
  const [email, setEmail] = useState("");
  const [notas, setNotas] = useState("");
  const [consent, setConsent] = useState(false);

  function next() {
    if (step === 1 && !servico) return alert("Escolha um tipo de serviço.");
    if (step === 3 && (!distrito || !concelho.trim())) return alert("Preencha distrito e concelho.");
    if (step === 4) {
      if (!nome.trim() || !telefone.trim() || !email.trim()) return alert("Preencha todos os campos obrigatórios.");
      if (!consent) return alert("Tem de aceitar a política de privacidade.");
    }
    setStep((s) => Math.min(s + 1, 5));
  }
  function prev() {
    setStep((s) => Math.max(s - 1, 1));
  }

  return (
    <form className="wizard-shell" action={criarPedido}>
      <input type="hidden" name="servico" value={servico} />
      <input type="hidden" name="pref_id" value={prefId ?? ""} />
      <input type="hidden" name="pref_nome" value={prefNome ?? ""} />

      <div className="wizard-progress">
        {[1, 2, 3, 4, 5].map((n) => <span key={n} className={n <= step ? "done" : ""} />)}
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

      <div className={`wizard-step ${step === 4 ? "active" : ""}`}>
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

      <div className={`wizard-step ${step === 5 ? "active" : ""}`}>
        <h3>Confirme o seu pedido</h3>
        <div className="card" style={{ background: "var(--paper)" }}>
          <p><strong>Serviço:</strong> {servico || "—"}</p>
          <p><strong>Área:</strong> {area || "—"} m² · <strong>Divisões:</strong> {divisoes || "—"}</p>
          <p><strong>Localização:</strong> {concelho || "—"}, {distrito || "—"}</p>
          <p><strong>Nome:</strong> {nome || "—"} · <strong>Telemóvel:</strong> {telefone || "—"}</p>
          <p><strong>Email:</strong> {email || "—"}</p>
          {prefNome && <p><strong>Profissional preferido:</strong> {prefNome}</p>}
        </div>
        <div className="alert alert-info">
          Não há nenhum pagamento a fazer agora. A nossa equipa analisa o pedido e envia-lhe
          até 3 propostas de profissionais verificados na sua zona. Os contactos diretos do
          profissional só são partilhados depois de escolher e confirmar uma proposta.
        </div>
        <div className="wizard-nav"><button type="button" className="btn btn-outline-navy" onClick={prev}>Voltar</button><button type="submit" className="btn btn-orange">Enviar Pedido</button></div>
      </div>
    </form>
  );
}
