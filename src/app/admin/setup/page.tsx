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
          <h1>Configurar conta de administrador</h1>
          <p>
            Só precisa de usar esta página uma vez. Depois de criar a conta, entre sempre por{" "}
            <a href="/admin/login">/admin/login</a>.
          </p>
          {sp.erro && <div className="alert alert-error">{MENSAGENS[sp.erro] ?? "Erro desconhecido."}</div>}
          <form action={criarContaAdmin}>
            <div className="field">
              <label>Token de configuração</label>
              <input type="password" name="token" required />
              <p className="hint">O valor de ADMIN_SETUP_TOKEN nas variáveis de ambiente.</p>
            </div>
            <div className="field">
              <label>Email</label>
              <input type="email" name="email" required />
              <p className="hint">Tem de ser igual ao valor de ADMIN_EMAIL.</p>
            </div>
            <div className="field">
              <label>Palavra-passe (mínimo 12 caracteres)</label>
              <input type="password" name="password" minLength={12} required />
            </div>
            <button type="submit" className="btn btn-orange">Criar conta</button>
          </form>
      </div>
    </div>
  );
}
