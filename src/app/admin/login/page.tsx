import { loginAdmin } from "@/lib/actions/auth";

export const metadata = { title: "Área reservada — Pintura360" };

export default async function AdminLogin({
  searchParams,
}: {
  searchParams: Promise<{ erro?: string; criado?: string }>;
}) {
  const sp = await searchParams;
  return (
    <div className="adm-login">
      <div className="adm-login-card">
        <img src="/logo.png" alt="Pintura360" />
        <h1>Área reservada</h1>
        <p>Painel de gestão de pedidos e parceiros.</p>
        {sp.criado && <div className="alert alert-success">Conta criada. Entre com a palavra-passe escolhida.</div>}
        {sp.erro && <div className="alert alert-error">Credenciais incorretas.</div>}
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
      </div>
    </div>
  );
}
