import { createAdminClient } from "@/lib/supabase/admin";
import { exigirMembro } from "@/lib/membro";
import { PERMISSOES, TODAS, filtrarPermissoes, type Permissao } from "@/lib/equipa";
import { alternarAtivo, atualizarFuncionario, redefinirPalavraPasseFuncionario } from "@/lib/actions/equipa";
import FormFuncionario from "@/components/admin/FormFuncionario";
import { data as fmtData } from "@/lib/admin-dados";

export const dynamic = "force-dynamic";

type Linha = {
  user_id: string; created_at: string; nome: string; email: string; telefone: string | null;
  cargo: string; permissoes: string[]; ativo: boolean;
};

const MENSAGENS: Record<string, string> = {
  dados: "Preencha nome, email válido e cargo.",
  curta: "A palavra-passe tem de ter pelo menos 10 caracteres.",
  funcoes: "Escolha pelo menos uma função.",
  existe: "Já existe uma conta com esse email.",
  falha: "Não foi possível guardar. Tente novamente.",
  proprio: "Não pode desativar a sua própria conta nem retirar-se a função de gerir a equipa.",
};

export default async function AdminEquipa({
  searchParams,
}: {
  searchParams: Promise<{ erro?: string; criado?: string; guardado?: string; senha?: string }>;
}) {
  const sp = await searchParams;
  const eu = await exigirMembro("equipa_gerir");
  const supabase = createAdminClient();
  const { data } = await supabase.from("equipa").select("*").order("created_at", { ascending: true });
  const membros = (data ?? []) as Linha[];

  return (
    <>
      <div className="adm-head">
        <div>
          <h1>Equipa</h1>
          <p>Funcionários com acesso ao painel. Cada um só vê e faz o que as suas funções permitem.</p>
        </div>
      </div>

      {sp.erro && <div className="adm-warning">{MENSAGENS[sp.erro] ?? "Erro."}</div>}
      {sp.criado && <div className="adm-flash">Funcionário <strong>{sp.criado}</strong> criado. Envie-lhe o email e a palavra-passe inicial por um canal seguro.</div>}
      {sp.guardado && <div className="adm-flash">Alterações guardadas.</div>}
      {sp.senha && <div className="adm-flash">Palavra-passe redefinida.</div>}

      <div className="adm-detail">
        <div>
          <div className="adm-card">
            <h2>Pessoas com acesso ({membros.filter((m) => m.ativo).length + 1})</h2>
            <div className="adm-team">
              <div className="adm-member">
                <div className="adm-member-head">
                  <div className="adm-avatar">P</div>
                  <div>
                    <strong>Proprietário</strong>
                    <small>{process.env.ADMIN_EMAIL}</small>
                  </div>
                  <span className="pill pill-aprovado">Acesso total</span>
                </div>
              </div>

              {membros.length === 0 && <p className="adm-muted">Ainda não criou funcionários. Use o formulário ao lado.</p>}

              {membros.map((f) => {
                const perms = filtrarPermissoes(f.permissoes);
                const souEu = f.user_id === eu.id;
                return (
                  <div className={`adm-member${f.ativo ? "" : " off"}`} key={f.user_id}>
                    <div className="adm-member-head">
                      <div className="adm-avatar">{f.nome.trim()[0]?.toUpperCase()}</div>
                      <div>
                        <strong>{f.nome}{souEu && " (eu)"}</strong>
                        <small>{f.cargo} · {f.email}{f.telefone ? ` · ${f.telefone}` : ""}</small>
                      </div>
                      <span className={`pill ${f.ativo ? "pill-aprovado" : "pill-cancelado"}`}>{f.ativo ? "Ativo" : "Desativado"}</span>
                    </div>
                    <div className="adm-chips-sm">
                      {perms.map((p) => <span key={p}>{PERMISSOES[p].label}</span>)}
                    </div>
                    <details className="adm-edit">
                      <summary>Editar cargo e funções</summary>
                      <form action={atualizarFuncionario} className="adm-form">
                        <input type="hidden" name="user_id" value={f.user_id} />
                        <label>Cargo</label>
                        <input name="cargo" defaultValue={f.cargo} required />
                        <label>Funções</label>
                        <div className="adm-perms compact">
                          {TODAS.map((p: Permissao) => (
                            <label key={p}>
                              <input type="checkbox" name="permissoes" value={p} defaultChecked={perms.includes(p)} />
                              <span><strong>{PERMISSOES[p].label}</strong></span>
                            </label>
                          ))}
                        </div>
                        <button type="submit" className="btn btn-orange">Guardar alterações</button>
                      </form>
                      <form action={redefinirPalavraPasseFuncionario} className="adm-form adm-inline">
                        <input type="hidden" name="user_id" value={f.user_id} />
                        <input name="password" type="text" placeholder="Nova palavra-passe (mín. 10)" minLength={10} required autoComplete="new-password" />
                        <button type="submit" className="btn btn-outline-navy">Redefinir palavra-passe</button>
                      </form>
                      {!souEu && (
                        <form action={alternarAtivo}>
                          <input type="hidden" name="user_id" value={f.user_id} />
                          <input type="hidden" name="ativo" value={f.ativo ? "0" : "1"} />
                          <button type="submit" className="adm-link-btn">{f.ativo ? "Desativar acesso" : "Reativar acesso"}</button>
                        </form>
                      )}
                    </details>
                    <small className="adm-muted" style={{ fontSize: 11 }}>Desde {fmtData(f.created_at)}</small>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
        <div>
          <FormFuncionario />
        </div>
      </div>
    </>
  );
}
