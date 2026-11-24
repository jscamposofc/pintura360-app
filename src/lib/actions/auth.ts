"use server";

import { redirect } from "next/navigation";
import { createSessionClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";

export async function loginAdmin(formData: FormData) {
  const email = String(formData.get("email") ?? "").trim();
  const password = String(formData.get("password") ?? "");

  const supabase = await createSessionClient();
  const { error } = await supabase.auth.signInWithPassword({ email, password });

  if (error || email !== process.env.ADMIN_EMAIL) {
    await supabase.auth.signOut();
    redirect("/admin/login?erro=1");
  }
  redirect("/admin/pedidos");
}

export async function logoutAdmin() {
  const supabase = await createSessionClient();
  await supabase.auth.signOut();
  redirect("/admin/login");
}

export async function criarContaAdmin(formData: FormData) {
  const token = String(formData.get("token") ?? "");
  const email = String(formData.get("email") ?? "").trim();
  const password = String(formData.get("password") ?? "");

  if (!process.env.ADMIN_SETUP_TOKEN || token !== process.env.ADMIN_SETUP_TOKEN) {
    redirect("/admin/setup?erro=token");
  }
  if (email !== process.env.ADMIN_EMAIL) {
    redirect("/admin/setup?erro=email");
  }
  if (password.length < 12) {
    redirect("/admin/setup?erro=curta");
  }

  const admin = createAdminClient();
  const { error } = await admin.auth.admin.createUser({
    email,
    password,
    email_confirm: true,
  });

  if (error) {
    redirect(`/admin/setup?erro=${error.message === "User already registered" ? "existe" : "falha"}`);
  }

  redirect("/admin/login?criado=1");
}
