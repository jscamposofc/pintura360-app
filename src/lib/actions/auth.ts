"use server";

import { redirect } from "next/navigation";
import { createSessionClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { getMembro, primeiraPagina } from "@/lib/membro";

export async function loginAdmin(formData: FormData) {
  const email = String(formData.get("email") ?? "").trim().toLowerCase();
  const password = String(formData.get("password") ?? "");

  const supabase = await createSessionClient();
  const { error } = await supabase.auth.signInWithPassword({ email, password });
  if (error) redirect("/admin/login?erro=1");

  const membro = await getMembro();
  if (!membro) {
    await supabase.auth.signOut();
    redirect("/admin/login?erro=acesso");
  }
  redirect(primeiraPagina(membro));
}

export async function logoutAdmin() {
  const supabase = await createSessionClient();
  await supabase.auth.signOut();
  redirect("/admin/login");
}

// Conta do proprietário (ADMIN_EMAIL): cria-a ou define uma nova palavra-passe.
// Protegido pelo token secreto ADMIN_SETUP_TOKEN (variável de ambiente no Vercel).
export async function criarContaAdmin(formData: FormData) {
  const token = String(formData.get("token") ?? "");
  const email = String(formData.get("email") ?? "").trim().toLowerCase();
  const password = String(formData.get("password") ?? "");

  if (!process.env.ADMIN_SETUP_TOKEN || token !== process.env.ADMIN_SETUP_TOKEN) {
    redirect("/admin/setup?erro=token");
  }
  if (email !== (process.env.ADMIN_EMAIL ?? "").toLowerCase()) {
    redirect("/admin/setup?erro=email");
  }
  if (password.length < 12) {
    redirect("/admin/setup?erro=curta");
  }

  const admin = createAdminClient();
  const { error } = await admin.auth.admin.createUser({ email, password, email_confirm: true });
  if (!error) redirect("/admin/login?criado=1");

  // Já existe: redefine a palavra-passe.
  if (/already|registered|exists/i.test(error.message)) {
    for (let page = 1; page <= 20; page++) {
      const { data } = await admin.auth.admin.listUsers({ page, perPage: 200 });
      const user = data?.users.find((u) => u.email?.toLowerCase() === email);
      if (user) {
        const { error: upd } = await admin.auth.admin.updateUserById(user.id, { password });
        redirect(upd ? "/admin/setup?erro=falha" : "/admin/login?redefinida=1");
      }
      if (!data || data.users.length < 200) break;
    }
  }
  redirect("/admin/setup?erro=falha");
}

// Qualquer membro da equipa: alterar a própria palavra-passe (com sessão iniciada).
export async function alterarMinhaPalavraPasse(formData: FormData) {
  const membro = await getMembro();
  if (!membro) redirect("/admin/login");
  const nova = String(formData.get("nova") ?? "");
  const confirmar = String(formData.get("confirmar") ?? "");
  if (nova.length < 10) redirect("/admin/conta?erro=curta");
  if (nova !== confirmar) redirect("/admin/conta?erro=diferente");
  const supabase = await createSessionClient();
  const { error } = await supabase.auth.updateUser({ password: nova });
  redirect(error ? "/admin/conta?erro=falha" : "/admin/conta?ok=1");
}
