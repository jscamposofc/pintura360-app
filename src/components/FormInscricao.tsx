import { inscreverProfissional } from "@/lib/actions/profissionais";

// Formulário de inscrição de parceiro (usado na área de parceiro, com conta).
export default function FormInscricao({ nome, telefone, email }: { nome: string; telefone: string; email: string }) {
  return (
    <form className="conta-card conta-inscricao" action={inscreverProfissional} encType="multipart/form-data">
      <h3 className="conta-h3">1. Dados da empresa / profissional</h3>
      <div className="field-row-2">
        <div className="field"><label htmlFor="i-nome">Nome completo *</label><input id="i-nome" type="text" name="nome" defaultValue={nome} required /></div>
        <div className="field"><label htmlFor="i-emp">Nome da empresa (se aplicável)</label><input id="i-emp" type="text" name="empresa" /></div>
      </div>
      <div className="field-row-2">
        <div className="field"><label htmlFor="i-nif">NIF *</label><input id="i-nif" type="text" inputMode="numeric" name="nif" required pattern="[0-9]{9}" title="9 dígitos" /></div>
        <div className="field"><label htmlFor="i-anos">Anos de experiência *</label><input id="i-anos" type="number" name="anos_experiencia" min={0} max={60} required /></div>
      </div>
      <div className="field-row-2">
        <div className="field"><label htmlFor="i-tel">Telemóvel *</label><input id="i-tel" type="tel" name="telefone" defaultValue={telefone} required /></div>
        <div className="field"><label>Email da conta</label><input type="email" value={email} disabled readOnly /></div>
      </div>

      <h3 className="conta-h3">2. Zona de atuação e especialidades</h3>
      <div className="field-row-2">
        <div className="field">
          <label htmlFor="i-dist">Distrito principal *</label>
          <select id="i-dist" name="distrito" required defaultValue="">
            <option value="">Selecione…</option>
            <option>Lisboa</option><option>Setúbal</option><option>Outro</option>
          </select>
        </div>
        <div className="field"><label htmlFor="i-conc">Concelhos onde atua *</label><input id="i-conc" type="text" name="concelhos" placeholder="Ex: Lisboa, Oeiras, Cascais" required /></div>
      </div>
      <div className="field">
        <label>Serviços prestados *</label>
        <div className="choice-grid">
          {["Interiores", "Exteriores", "Fachadas", "Estuque/Pladur", "Impermeabilização"].map((s) => (
            <label className="choice-pill" key={s}>
              <input type="checkbox" name="servicos" value={s} />
              <span>{s === "Estuque/Pladur" ? "Estuque / Pladur" : s}</span>
            </label>
          ))}
        </div>
      </div>

      <h3 className="conta-h3">3. Verificação</h3>
      <label className="consent-row" style={{ marginBottom: 16 }}>
        <input type="checkbox" name="tem_seguro" value="sim" />
        <span>Tenho seguro de responsabilidade civil / acidentes de trabalho</span>
      </label>
      <div className="field"><label htmlFor="i-apr">Breve apresentação *</label><textarea id="i-apr" name="apresentacao" required placeholder="Fale-nos da sua experiência e forma de trabalhar." /></div>
      <div className="field-row-2">
        <div className="field">
          <label htmlFor="i-comp">Comprovativo de atividade (opcional)</label>
          <input id="i-comp" type="file" name="comprovativo" accept=".pdf,.jpg,.jpeg,.png" />
          <p className="conta-nota" style={{ marginTop: 6 }}>Recibos verdes ou certidão — PDF, JPG ou PNG. Só para verificação interna.</p>
        </div>
        <div className="field"><label htmlFor="i-port">Link de portfólio (opcional)</label><input id="i-port" type="text" name="portfolio_link" placeholder="Instagram, Google Drive, site…" /></div>
      </div>

      <label className="consent-row" style={{ marginTop: 6 }}>
        <input type="checkbox" name="consent" value="1" required />
        <span>Confirmo que os dados são verdadeiros e aceito os <a href="/termos" target="_blank">Termos para Parceiros</a> e a <a href="/privacidade" target="_blank">Política de Privacidade</a>.</span>
      </label>
      <button type="submit" className="btn btn-orange" style={{ width: "100%", marginTop: 22 }}>Submeter inscrição</button>
    </form>
  );
}
