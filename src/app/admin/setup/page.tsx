import { criarContaAdmin } from "@/lib/actions/auth";

export const metadata = { title: "Configurar administrador — Pintura360" };

const MENSAGENS: Record<string, string> = {
  token: "Token de configuração incorreto.",
  email: "Esse email não corresponde ao ADMIN_EMAIL configurado no servidor.",
  curta: "A palavra-passe tem de ter pelo menos 12 caracteres.",
  existe: "Já existe uma conta de administrador. Use /admin/login.",
  falha: "Não foi possível criar a conta. Tente novamente.",
};

export default async function AdminSetup({
  searchParams,
}: {
  searchParams: Promise<{ erro?: string }>;
}) {
  const sp = await searchParams;
  return (
    <div className="adm-login">
      <div className="adm-login-card">
          <img src="/logo.png" alt="Pintura360" />
          <h1>Recuperar palavra-passe</h1>
          <p>
            Cria a conta do proprietário ou define uma nova palavra-passe, se se tiver esquecido. Precisa do
            token de configuração (Vercel → projeto pintura360-app → Settings → Environment Variables →
            ADMIN_SETUP_TOKEN).
          </p>
          {sp.erro && <div className="alert alert-error">{MENSAGENS[sp.erro] ?? "Erro desconhecido."}</div>}
          <form action={criarContaAdmin}>
            <div className="field">
              <label>Token de configuração</label>
              <input type="password" name="token" required />
              <p className="hint">Copie o valor de ADMIN_SETUP_TOKEN no Vercel.</p>
            </div>
            <div className="field">
              <label>Email</label>
              <input type="email" name="email" required />
              <p className="hint">O email do proprietário (geral@pintura360.pt).</p>
            </div>
            <div className="field">
              <label>Nova palavra-passe (mínimo 12 caracteres)</label>
              <input type="password" name="password" minLength={12} required />
            </div>
            <button type="submit" className="btn btn-orange">Guardar palavra-passe</button>
          </form>
      </div>
    </div>
  );
}
