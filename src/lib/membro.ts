import "server-only";
import { redirect } from "next/navigation";
import { createSessionClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { TODAS, filtrarPermissoes, type Permissao } from "@/lib/equipa";

// Quem está no painel de gestão: o dono (ADMIN_EMAIL, acesso total) ou um
// funcionário ativo da tabela equipa, com as funções que lhe foram dadas.
export type Membro = {
  id: string;
  email: string;
  nome: string;
  cargo: string;
  dono: boolean;
  permissoes: Permissao[];
};

export async function getMembro(): Promise<Membro | null> {
  const supabase = await createSessionClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user?.email) return null;

  if (user.email === process.env.ADMIN_EMAIL) {
    return { id: user.id, email: user.email, nome: "Administrador", cargo: "Proprietário", dono: true, permissoes: TODAS };
  }

  const admin = createAdminClient();
  const { data } = await admin
    .from("equipa")
    .select("nome, cargo, permissoes, ativo")
    .eq("user_id", user.id)
    .maybeSingle();
  if (!data || !data.ativo) return null;
  return {
    id: user.id,
    email: user.email,
    nome: data.nome,
    cargo: data.cargo,
    dono: false,
    permissoes: filtrarPermissoes(data.permissoes ?? []),
  };
}

export function pode(m: Membro | null, p: Permissao): boolean {
  return !!m && m.permissoes.includes(p);
}

// Para páginas e ações: exige sessão de membro e, opcionalmente, uma função.
export async function exigirMembro(p?: Permissao): Promise<Membro> {
  const m = await getMembro();
  if (!m) redirect("/admin/login");
  if (p && !m.permissoes.includes(p)) redirect("/admin/sem-acesso");
  return m;
}

export function primeiraPagina(m: Membro): string {
  if (m.permissoes.includes("pedidos_ver")) return "/admin/pedidos";
  if (m.permissoes.includes("profissionais_gerir")) return "/admin/profissionais";
  if (m.permissoes.includes("equipa_gerir")) return "/admin/equipa";
  return "/admin/conta";
}
