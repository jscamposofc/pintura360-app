import "server-only";
import { createSessionClient } from "@/lib/supabase/server";

// Contas do site: cliente, profissional ou administrador.
// O papel fica em app_metadata (só o servidor o pode alterar).
export type Papel = "cliente" | "profissional" | "admin" | "equipa";

export type Sessao = {
  id: string;
  email: string;
  papel: Papel;
  nome: string;
  telefone: string;
};

export async function getSessao(): Promise<Sessao | null> {
  const supabase = await createSessionClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user || !user.email) return null;
  const papelMeta = user.app_metadata?.role;
  const papel: Papel =
    user.email === process.env.ADMIN_EMAIL
      ? "admin"
      : papelMeta === "equipa"
        ? "equipa"
        : papelMeta === "profissional"
          ? "profissional"
          : "cliente";
  return {
    id: user.id,
    email: user.email,
    papel,
    nome: String(user.user_metadata?.nome ?? ""),
    telefone: String(user.user_metadata?.telefone ?? ""),
  };
}

export function destinoDe(papel: Papel): string {
  if (papel === "admin" || papel === "equipa") return "/admin";
  if (papel === "profissional") return "/parceiro";
  return "/cliente";
}

export function soDigitos(s: string): string {
  return s.replace(/\D/g, "").replace(/^(00351|351)(?=\d{9}$)/, "");
}
