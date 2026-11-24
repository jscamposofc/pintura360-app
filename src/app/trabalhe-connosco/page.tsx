import { inscreverProfissional } from "@/lib/actions/profissionais";

export const metadata = { title: "Torne-se Parceiro — Pintura360" };

export default async function TrabalheConnosco({
  searchParams,
}: {
  searchParams: Promise<{ erro?: string }>;
}) {
  const sp = await searchParams;
  return (
    <>
      <section className="hero" style={{ padding: "48px 0" }}>
        <div className="container hero-grid">
          <div>
            <span className="eyebrow">Para Profissionais</span>
            <h1 style={{ fontSize: "2.1rem" }}>Receba pedidos de pintura na sua zona</h1>
            <p className="muted">Sem concorrer por leads. Sem mensalidades para se inscrever. Cada pedido atribuído é um cliente que já confirmou o serviço.</p>
            <div className="hero-stats">
              <div className="hero-stat"><b>0€</b><span>Para se inscrever</span></div>
              <div className="hero-stat"><b>48h</b><span>Até à verificação</span></div>
            </div>
          </div>
          <div className="grid" style={{ gap: 14 }}>
            <div className="step-card"><span className="step-num">1</span><h3>Preencha o formulário</h3><p className="muted">Dados da empresa, zona e especialidades.</p></div>
            <div className="step-card"><span className="step-num">2</span><h3>Aguarde verificação</h3><p className="muted">Confirmamos os seus dados antes de ativar o perfil.</p></div>
            <div className="step-card"><span className="step-num">3</span><h3>Receba pedidos</h3><p className="muted">Entramos em contacto quando houver um pedido na sua zona.</p></div>
          </div>
        </div>
      </section>

      <section className="section-sm">
        <div className="container" style={{ maxWidth: 720 }}>
          {sp.erro && (
            <div className="alert alert-error">Não foi possível submeter a inscrição. Verifique os dados (NIF com 9 dígitos) e tente novamente.</div>
          )}
          <form className="card" action={inscreverProfissional} encType="multipart/form-data">
            <fieldset>
              <legend>Dados da empresa / profissional</legend>
              <div className="grid grid-2">
                <div className="field"><label>Nome completo *</label><input type="text" name="nome" required /></div>
                <div className="field"><label>Nome da empresa (se aplicável)</label><input type="text" name="empresa" /></div>
              </div>
              <div className="grid grid-2">
                <div className="field"><label>NIF *</label><input type="text" name="nif" required pattern="[0-9]{9}" title="9 dígitos" /></div>
                <div className="field"><label>Anos de experiência *</label><input type="number" name="anos_experiencia" min={0} required /></div>
              </div>
              <div className="grid grid-2">
                <div className="field"><label>Telemóvel *</label><input type="tel" name="telefone" required /></div>
                <div className="field"><label>Email *</label><input type="email" name="email" required /></div>
              </div>
            </fieldset>

            <fieldset style={{ marginTop: 22 }}>
              <legend>Zona de atuação e especialidades</legend>
              <div className="grid grid-2">
                <div className="field">
                  <label>Distrito principal *</label>
                  <select name="distrito" required defaultValue="">
                    <option value="">Selecione…</option>
                    <option>Lisboa</option><option>Setúbal</option><option>Porto</option><option>Outro</option>
                  </select>
                </div>
                <div className="field"><label>Concelhos onde atua *</label><input type="text" name="concelhos" placeholder="Ex: Cascais, Oeiras, Sintra" required /></div>
              </div>
              <div className="field">
                <label>Serviços prestados *</label>
                <div className="checkbox-row" style={{ flexWrap: "wrap", gap: 16 }}>
                  {["Interiores", "Exteriores", "Fachadas", "Estuque/Pladur", "Impermeabilização"].map((s) => (
                    <label className="checkbox-row" key={s}>
                      <input type="checkbox" name="servicos" value={s} /> {s === "Estuque/Pladur" ? "Estuque / Pladur" : s}
                    </label>
                  ))}
                </div>
              </div>
            </fieldset>

            <fieldset style={{ marginTop: 22 }}>
              <legend>Verificação</legend>
              <div className="checkbox-row" style={{ marginBottom: 12 }}>
                <input type="checkbox" id="seguro" name="tem_seguro" value="sim" />
                <label htmlFor="seguro">Tenho seguro de responsabilidade civil / acidentes de trabalho</label>
              </div>
              <div className="field"><label>Breve apresentação *</label><textarea name="apresentacao" required placeholder="Fale-nos da sua experiência e forma de trabalhar." /></div>
              <div className="field">
                <label>Comprovativo de atividade (recibos verdes / certidão) — opcional nesta fase</label>
                <input type="file" name="comprovativo" accept=".pdf,.jpg,.jpeg,.png" />
                <p className="hint">Aceite em PDF, JPG ou PNG. Usado apenas para verificação interna, nunca publicado.</p>
              </div>
              <div className="field"><label>Link de portfólio (Instagram, Google Drive, site) — opcional</label><input type="text" name="portfolio_link" placeholder="https://..." /></div>
            </fieldset>

            <div className="checkbox-row" style={{ marginTop: 20 }}>
              <input type="checkbox" id="consent" name="consent" value="1" required />
              <label htmlFor="consent">Confirmo que os dados são verdadeiros e aceito os <a href="/termos" target="_blank">Termos para Parceiros</a> e a <a href="/privacidade" target="_blank">Política de Privacidade</a>.</label>
            </div>

            <button type="submit" className="btn btn-orange btn-block" style={{ marginTop: 22 }}>Submeter Inscrição</button>
          </form>
        </div>
      </section>
    </>
  );
}
