import { loginAdmin } from "@/lib/actions/auth";

export const metadata = { title: "Área reservada — Pintura360" };

export default async function AdminLogin({
  searchParams,
}: {
  searchParams: Promise<{ erro?: string; criado?: string }>;
}) {
  const sp = await searchParams;
  return (
    <section className="section-sm">
      <div className="container" style={{ maxWidth: 420 }}>
        <div className="card">
          <h1 style={{ fontSize: "1.4rem" }}>Área reservada</h1>
          {sp.criado && <div className="alert alert-success">Conta criada. Entre com a palavra-passe escolhida.</div>}
          {sp.erro && <div className="alert alert-error">Credenciais incorretas.</div>}
          <form action={loginAdmin}>
            <div className="field">
              <label>Email</label>
              <input type="email" name="email" required autoFocus />
            </div>
            <div className="field">
              <label>Palavra-passe</label>
              <input type="password" name="password" required />
            </div>
            <button type="submit" className="btn btn-orange btn-block">Entrar</button>
          </form>
        </div>
      </div>
    </section>
  );
}
