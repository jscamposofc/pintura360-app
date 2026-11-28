"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { createSessionClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { destinoDe, getSessao, soDigitos } from "@/lib/conta";

const txt = (v: FormDataEntryValue | null, max: number) => String(v ?? "").trim().slice(0, max);

function voltar(tipo: string, modo: string, erro: string, extra = ""): never {
  redirect(`/entrar?tipo=${tipo}&modo=${modo}&erro=${erro}${extra}`);
}

// Liga um pedido existente à conta do cliente (referência + telefone do pedido).
async function ligarPedido(userId: string, referencia: string, telefone: string): Promise<boolean> {
  const ref = referencia.trim().toUpperCase();
  if (!/^P360-\d{4}-\d{6}$/.test(ref)) return false;
  const supabase = createAdminClient();
  const { data: p } = await supabase.from("pedidos").select("id, telefone, cliente_id").eq("referencia", ref).single();
  if (!p || (p.cliente_id && p.cliente_id !== userId)) return false;
  if (soDigitos(p.telefone) !== soDigitos(telefone)) return false;
  await supabase.from("pedidos").update({ cliente_id: userId }).eq("id", p.id);
  await supabase.from("pedido_eventos").insert({ pedido_id: p.id, tipo: "conta", descricao: "Cliente associou o pedido à sua conta" });
  return true;
}

export async function entrar(formData: FormData) {
  const tipo = txt(formData.get("tipo"), 20) === "profissional" ? "profissional" : "cliente";
  const email = txt(formData.get("email"), 120).toLowerCase();
  const password = String(formData.get("password") ?? "");

  const supabase = await createSessionClient();
  const { error } = await supabase.auth.signInWithPassword({ email, password });
  if (error) {
    console.error("entrar", error.name, error.status, error.message);
    voltar(tipo, "entrar", error.status ? "credenciais" : "ligacao", `&email=${encodeURIComponent(email)}`);
  }

  const sessao = await getSessao();
  redirect(sessao ? destinoDe(sessao.papel) : "/entrar");
}

export async function criarConta(formData: FormData) {
  const tipo = txt(formData.get("tipo"), 20) === "profissional" ? "profissional" : "cliente";
  const nome = txt(formData.get("nome"), 80);
  const email = txt(formData.get("email"), 120).toLowerCase();
  const telefone = txt(formData.get("telefone"), 30);
  const password = String(formData.get("password") ?? "");
  const ref = txt(formData.get("ref"), 20);
  const consent = formData.get("consent") === "1";
  if (formData.get("website")) voltar(tipo, "criar", "dados");

  const emailOk = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
  if (nome.length < 2 || !emailOk || soDigitos(telefone).length < 9 || !consent) voltar(tipo, "criar", "dados");
  if (password.length < 8) voltar(tipo, "criar", "curta");
  if (email === (process.env.ADMIN_EMAIL ?? "").toLowerCase()) voltar(tipo, "criar", "existe");

  const admin = createAdminClient();
  const { data: criado, error } = await admin.auth.admin.createUser({
    email,
    password,
    email_confirm: true,
    app_metadata: { role: tipo },
    user_metadata: { nome, telefone },
  });
  if (error || !criado.user) {
    const existe = /already|registered|exists/i.test(error?.message ?? "");
    voltar(tipo, "criar", existe ? "existe" : "falha");
  }

  const supabase = await createSessionClient();
  const { error: eLogin } = await supabase.auth.signInWithPassword({ email, password });
  if (eLogin) console.error("criarConta/login", eLogin.name, eLogin.status, eLogin.message);

  if (tipo === "cliente") {
    const ligado = ref ? await ligarPedido(criado.user.id, ref, telefone) : false;
    redirect(ligado ? "/cliente?ligado=1" : ref ? `/cliente?ref=${encodeURIComponent(ref)}` : "/cliente?bemvindo=1");
  }
  redirect("/parceiro?bemvindo=1");
}

export async function sair() {
  const supabase = await createSessionClient();
  await supabase.auth.signOut();
  redirect("/");
}

export async function associarPedido(formData: FormData) {
  const sessao = await getSessao();
  if (!sessao) redirect("/entrar?tipo=cliente");
  const ok = await ligarPedido(sessao.id, txt(formData.get("ref"), 20), txt(formData.get("telefone"), 30));
  revalidatePath("/cliente");
  redirect(ok ? "/cliente?ligado=1" : `/cliente?erro=ligar&ref=${encodeURIComponent(txt(formData.get("ref"), 20))}`);
}
