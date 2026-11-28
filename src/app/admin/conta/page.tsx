import { exigirMembro } from "@/lib/membro";
import { alterarMinhaPalavraPasse } from "@/lib/actions/auth";
import { PERMISSOES } from "@/lib/equipa";

export const dynamic = "force-dynamic";

const ERROS: Record<string, string> = {
  curta: "A nova palavra-passe tem de ter pelo menos 10 caracteres.",
  diferente: "As duas palavras-passe não coincidem.",
  falha: "Não foi possível alterar. Tente novamente.",
};

export default async function MinhaConta({ searchParams }: { searchParams: Promise<{ erro?: string; ok?: string }> }) {
  const sp = await searchParams;
  const m = await exigirMembro();
  return (
    <>
      <div className="adm-head">
        <div>
          <h1>A minha conta</h1>
          <p>{m.nome} · {m.cargo} · {m.email}</p>
        </div>
      </div>
      <div className="adm-detail">
        <div className="adm-card">
          <h2>As minhas funções</h2>
          <div className="adm-perms compact readonly">
            {m.permissoes.map((p) => (
              <label key={p} className="on"><span><strong>{PERMISSOES[p].label}</strong><small>{PERMISSOES[p].desc}</small></span></label>
            ))}
          </div>
        </div>
        <form action={alterarMinhaPalavraPasse} className="adm-card adm-form">
          <h2>Alterar palavra-passe</h2>
          {sp.erro && <div className="adm-warning">{ERROS[sp.erro] ?? "Erro."}</div>}
          {sp.ok && <div className="adm-flash">Palavra-passe alterada.</div>}
          <label htmlFor="nova">Nova palavra-passe (mín. 10)</label>
          <input id="nova" name="nova" type="password" minLength={10} autoComplete="new-password" required />
          <label htmlFor="confirmar">Confirmar</label>
          <input id="confirmar" name="confirmar" type="password" minLength={10} autoComplete="new-password" required />
          <button type="submit" className="btn btn-orange">Guardar</button>
        </form>
      </div>
    </>
  );
}
