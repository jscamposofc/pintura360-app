import Link from "next/link";
import { redirect } from "next/navigation";
import { criarConta, entrar } from "@/lib/actions/contas";
import { destinoDe, getSessao } from "@/lib/conta";

export const metadata = { title: "Entrar ou criar conta — Pintura360" };
export const dynamic = "force-dynamic";

type SP = { tipo?: string; modo?: string; erro?: string; email?: string; ref?: string };

const ERROS: Record<string, string> = {
  credenciais: "Email ou palavra-passe incorretos.",
  dados: "Verifique os dados: nome, email válido, telemóvel com 9 dígitos e aceitação dos termos.",
  curta: "A palavra-passe tem de ter pelo menos 8 caracteres.",
  existe: "Já existe uma conta com este email. Entre com a sua palavra-passe.",
  falha: "Não foi possível criar a conta. Tente novamente dentro de instantes.",
  ligacao: "Não foi possível contactar o servidor de contas. Tente novamente dentro de instantes.",
};

const TEXTOS = {
  cliente: {
    titulo: "Sou cliente",
    sub: "Quero pintar a minha casa ou espaço",
    beneficios: ["Acompanhe o estado dos seus pedidos", "Veja a referência, o plano e o valor de cada orçamento", "Saiba quem é o profissional atribuído"],
    icone: "M3 11l9-7 9 7v9a1 1 0 01-1 1h-5v-6H9v6H4a1 1 0 01-1-1z",
  },
  profissional: {
    titulo: "Sou profissional",
    sub: "Sou pintor ou empresa de pintura",
    beneficios: ["Inscreva-se na rede de parceiros Pintura360", "Receba trabalhos já qualificados na sua zona", "Consulte os detalhes de cada trabalho atribuído"],
    icone: "M14 4l6 6-9 9H5v-6l9-9zM12 6l6 6",
  },
} as const;

export default async function Entrar({ searchParams }: { searchParams: Promise<SP> }) {
  const sp = await searchParams;
  const sessao = await getSessao();
  if (sessao) redirect(destinoDe(sessao.papel));

  const tipo = sp.tipo === "profissional" ? "profissional" : sp.tipo === "cliente" ? "cliente" : null;
  const modo = sp.modo === "criar" ? "criar" : "entrar";
  const erro = sp.erro ? ERROS[sp.erro] : null;
  const ref = (sp.ref ?? "").slice(0, 20);
  const link = (t: string, m: string) => `/entrar?tipo=${t}&modo=${m}${ref ? `&ref=${encodeURIComponent(ref)}` : ""}`;

  return (
    <section className="conta-section">
      <div className="wrap">
        <div className="section-head center">
          <p className="section-eyebrow">Área Pintura360</p>
          <h2>{tipo ? (modo === "criar" ? "Criar conta" : "Entrar na sua conta") : "Como quer entrar?"}</h2>
          {!tipo && <p>Escolha o tipo de conta. Pode entrar ou criar uma conta nova no passo seguinte.</p>}
        </div>

        {/* Escolha: cliente ou profissional */}
        <div className={`conta-escolha${tipo ? " compacta" : ""}`}>
          {(["cliente", "profissional"] as const).map((t) => (
            <Link key={t} href={link(t, modo)} className={`conta-opcao${tipo === t ? " ativa" : ""}`}>
              <span className="conta-opcao-icone"><svg viewBox="0 0 24 24"><path d={TEXTOS[t].icone} /></svg></span>
              <span className="conta-opcao-txt">
                <strong>{TEXTOS[t].titulo}</strong>
                <small>{TEXTOS[t].sub}</small>
              </span>
              {!tipo && (
                <ul>
                  {TEXTOS[t].beneficios.map((b) => <li key={b}>{b}</li>)}
                </ul>
              )}
              {!tipo && <span className="btn btn-orange conta-opcao-btn">Continuar como {t}</span>}
            </Link>
          ))}
        </div>

        {tipo && (
          <div className="conta-card">
            <div className="conta-tabs" role="tablist">
              <Link href={link(tipo, "entrar")} className={modo === "entrar" ? "ativa" : ""} role="tab" aria-selected={modo === "entrar"}>Entrar</Link>
              <Link href={link(tipo, "criar")} className={modo === "criar" ? "ativa" : ""} role="tab" aria-selected={modo === "criar"}>Criar conta</Link>
            </div>

            {erro && <div className="conta-erro" role="alert">{erro}</div>}

            {modo === "entrar" ? (
              <form action={entrar} className="conta-form">
                <input type="hidden" name="tipo" value={tipo} />
                <div className="field"><label htmlFor="email">Email</label><input id="email" type="email" name="email" autoComplete="username" defaultValue={sp.email ?? ""} required autoFocus /></div>
                <div className="field"><label htmlFor="password">Palavra-passe</label><input id="password" type="password" name="password" autoComplete="current-password" required /></div>
                <button type="submit" className="btn btn-orange">Entrar</button>
                <p className="conta-nota">
                  Ainda não tem conta? <Link href={link(tipo, "criar")}>Criar conta de {tipo}</Link>
                  <br />Esqueceu-se da palavra-passe? <a href="https://wa.me/351928358968?text=Ol%C3%A1!%20Preciso%20de%20recuperar%20o%20acesso%20%C3%A0%20minha%20conta%20Pintura360." target="_blank" rel="noopener noreferrer">Fale connosco no WhatsApp</a>
                </p>
              </form>
            ) : (
              <form action={criarConta} className="conta-form">
                <input type="hidden" name="tipo" value={tipo} />
                {ref && <input type="hidden" name="ref" value={ref} />}
                <div aria-hidden="true" style={{ position: "absolute", left: -10000, width: 1, height: 1, overflow: "hidden" }}>
                  <label>Website<input name="website" tabIndex={-1} autoComplete="off" /></label>
                </div>
                {ref && tipo === "cliente" && (
                  <p className="conta-info">O pedido <strong>{ref}</strong> fica associado à sua conta se usar o mesmo telemóvel do pedido.</p>
                )}
                <div className="field"><label htmlFor="nome">{tipo === "profissional" ? "Nome do responsável" : "Nome completo"}</label><input id="nome" name="nome" autoComplete="name" required /></div>
                <div className="field-row-2">
                  <div className="field"><label htmlFor="email">Email</label><input id="email" type="email" name="email" autoComplete="email" required /></div>
                  <div className="field"><label htmlFor="telefone">Telemóvel</label><input id="telefone" type="tel" name="telefone" autoComplete="tel" placeholder="+351 ___ ___ ___" required /></div>
                </div>
                <div className="field"><label htmlFor="password">Palavra-passe (mínimo 8 caracteres)</label><input id="password" type="password" name="password" autoComplete="new-password" minLength={8} required /></div>
                <label className="consent-row">
                  <input type="checkbox" name="consent" value="1" required />
                  <span>
                    Li e aceito a <a href="/privacidade" target="_blank">Política de Privacidade</a>
                    {tipo === "profissional" && <> e os <a href="/termos" target="_blank">Termos para Parceiros</a></>}.
                  </span>
                </label>
                <button type="submit" className="btn btn-orange">{tipo === "profissional" ? "Criar conta de profissional" : "Criar conta de cliente"}</button>
                <p className="conta-nota">
                  {tipo === "profissional"
                    ? "Depois de criar a conta, preenche a inscrição da sua empresa. A nossa equipa verifica os dados antes de lhe atribuir trabalhos."
                    : "Não precisa de conta para pedir um orçamento — a conta serve para acompanhar os seus pedidos."}
                  <br />Já tem conta? <Link href={link(tipo, "entrar")}>Entrar</Link>
                </p>
              </form>
            )}
          </div>
        )}
      </div>
    </section>
  );
}
