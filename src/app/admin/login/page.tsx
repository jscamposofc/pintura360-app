import { loginAdmin } from "@/lib/actions/auth";

export const metadata = { title: "Área reservada — Pintura360" };

export default async function AdminLogin({
  searchParams,
}: {
  searchParams: Promise<{ erro?: string; criado?: string; redefinida?: string }>;
}) {
  const sp = await searchParams;
  return (
    <div className="adm-login">
      <div className="adm-login-card">
        <img src="/logo.png" alt="Pintura360" />
        <h1>Área reservada</h1>
        <p>Painel de gestão — proprietário e equipa Pintura360.</p>
        {sp.criado && <div className="alert alert-success">Conta criada. Entre com a palavra-passe escolhida.</div>}
        {sp.redefinida && <div className="alert alert-success">Palavra-passe redefinida. Já pode entrar.</div>}
        {sp.erro === "acesso" && <div className="alert alert-error">Esta conta não tem acesso ao painel de gestão.</div>}
        {sp.erro === "ligacao" && <div className="alert alert-error">Não foi possível contactar o servidor de contas. Tente novamente dentro de instantes.</div>}
        {sp.erro === "1" && <div className="alert alert-error">Email ou palavra-passe incorretos.</div>}
        <form action={loginAdmin}>
          <div className="field">
            <label htmlFor="email">Email</label>
            <input id="email" type="email" name="email" autoComplete="username" required autoFocus />
          </div>
          <div className="field">
            <label htmlFor="password">Palavra-passe</label>
            <input id="password" type="password" name="password" autoComplete="current-password" required />
          </div>
          <button type="submit" className="btn btn-orange">Entrar</button>
        </form>
        <a href="/admin/setup" className="btn btn-outline-navy adm-forgot">Esqueci-me da palavra-passe</a>
        <p className="adm-login-foot">
          Proprietário: redefine aqui com o token de configuração.<br />
          Funcionários: peçam uma nova palavra-passe a quem gere a equipa.
        </p>
      </div>
    </div>
  );
}
