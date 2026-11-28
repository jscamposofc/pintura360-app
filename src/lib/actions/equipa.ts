"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { createAdminClient } from "@/lib/supabase/admin";
import { exigirMembro } from "@/lib/membro";
import { filtrarPermissoes } from "@/lib/equipa";

const txt = (v: FormDataEntryValue | null, max: number) => String(v ?? "").trim().slice(0, max);

export async function criarFuncionario(formData: FormData) {
  await exigirMembro("equipa_gerir");
  const nome = txt(formData.get("nome"), 80);
  const email = txt(formData.get("email"), 120).toLowerCase();
  const telefone = txt(formData.get("telefone"), 30);
  const cargo = txt(formData.get("cargo"), 60);
  const password = String(formData.get("password") ?? "");
  const permissoes = filtrarPermissoes(formData.getAll("permissoes").map(String));

  if (nome.length < 2 || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email) || !cargo) redirect("/admin/equipa?erro=dados");
  if (password.length < 10) redirect("/admin/equipa?erro=curta");
  if (permissoes.length === 0) redirect("/admin/equipa?erro=funcoes");
  if (email === (process.env.ADMIN_EMAIL ?? "").toLowerCase()) redirect("/admin/equipa?erro=existe");

  const admin = createAdminClient();
  const { data, error } = await admin.auth.admin.createUser({
    email,
    password,
    email_confirm: true,
    app_metadata: { role: "equipa" },
    user_metadata: { nome, telefone },
  });
  if (error || !data.user) {
    redirect(`/admin/equipa?erro=${/already|registered|exists/i.test(error?.message ?? "") ? "existe" : "falha"}`);
  }

  const { error: e2 } = await admin.from("equipa").insert({
    user_id: data.user.id, nome, email, telefone: telefone || null, cargo, permissoes,
  });
  if (e2) {
    await admin.auth.admin.deleteUser(data.user.id);
    redirect("/admin/equipa?erro=falha");
  }
  revalidatePath("/admin/equipa");
  redirect(`/admin/equipa?criado=${encodeURIComponent(nome)}`);
}

export async function atualizarFuncionario(formData: FormData) {
  const m = await exigirMembro("equipa_gerir");
  const userId = txt(formData.get("user_id"), 60);
  const cargo = txt(formData.get("cargo"), 60);
  const permissoes = filtrarPermissoes(formData.getAll("permissoes").map(String));
  if (!userId || !cargo) redirect("/admin/equipa?erro=dados");
  // Ninguém retira a si próprio a gestão da equipa (evita ficar sem acesso).
  if (userId === m.id && !permissoes.includes("equipa_gerir")) redirect("/admin/equipa?erro=proprio");

  const admin = createAdminClient();
  await admin.from("equipa").update({ cargo, permissoes }).eq("user_id", userId);
  revalidatePath("/admin/equipa");
  redirect("/admin/equipa?guardado=1");
}

export async function alternarAtivo(formData: FormData) {
  const m = await exigirMembro("equipa_gerir");
  const userId = txt(formData.get("user_id"), 60);
  const ativo = formData.get("ativo") === "1";
  if (!userId || userId === m.id) redirect("/admin/equipa?erro=proprio");
  const admin = createAdminClient();
  await admin.from("equipa").update({ ativo }).eq("user_id", userId);
  revalidatePath("/admin/equipa");
  redirect("/admin/equipa?guardado=1");
}

export async function redefinirPalavraPasseFuncionario(formData: FormData) {
  await exigirMembro("equipa_gerir");
  const userId = txt(formData.get("user_id"), 60);
  const password = String(formData.get("password") ?? "");
  if (password.length < 10) redirect("/admin/equipa?erro=curta");
  const admin = createAdminClient();
  const { data: f } = await admin.from("equipa").select("user_id").eq("user_id", userId).maybeSingle();
  if (!f) redirect("/admin/equipa?erro=dados");
  const { error } = await admin.auth.admin.updateUserById(userId, { password });
  redirect(error ? "/admin/equipa?erro=falha" : "/admin/equipa?senha=1");
}
