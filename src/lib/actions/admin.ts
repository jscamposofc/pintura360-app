"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { createAdminClient } from "@/lib/supabase/admin";
import { getAdminUser } from "@/lib/supabase/server";

const ESTADOS_VALIDOS = ["novo", "contactado", "atribuido", "pago", "concluido", "cancelado"];
const ESTADO_TEXTO: Record<string, string> = {
  novo: "Novo", contactado: "Contactado", atribuido: "Atribuído", pago: "Sinal pago", concluido: "Concluído", cancelado: "Cancelado",
};

async function exigirAdmin() {
  const user = await getAdminUser();
  if (!user) redirect("/admin/login");
}

function revalidarPedido(id: number) {
  revalidatePath("/admin/pedidos");
  revalidatePath(`/admin/pedidos/${id}`);
}

async function registarEvento(pedidoId: number, tipo: string, descricao: string) {
  const supabase = createAdminClient();
  await supabase.from("pedido_eventos").insert({ pedido_id: pedidoId, tipo, descricao });
}

// ---------- Pedidos ----------

export async function atualizarEstado(formData: FormData) {
  await exigirAdmin();
  const id = Number(formData.get("id"));
  const status = String(formData.get("status") ?? "");
  const nota = String(formData.get("nota") ?? "").trim().slice(0, 500);
  if (!id || !ESTADOS_VALIDOS.includes(status)) return;

  const supabase = createAdminClient();
  const { data: atual } = await supabase.from("pedidos").select("status").eq("id", id).single();
  if (!atual) return;
  if (atual.status !== status) {
    await supabase.from("pedidos").update({ status }).eq("id", id);
    await registarEvento(id, "estado", `Estado: ${ESTADO_TEXTO[atual.status] ?? atual.status} → ${ESTADO_TEXTO[status]}${nota ? ` — ${nota}` : ""}`);
  } else if (nota) {
    await registarEvento(id, "nota", nota);
  }
  revalidarPedido(id);
}

export async function atribuirPedido(formData: FormData) {
  await exigirAdmin();
  const id = Number(formData.get("id"));
  const profissionalId = Number(formData.get("profissional_id"));
  if (!id || !profissionalId) return;

  const supabase = createAdminClient();
  const [{ data: pedido }, { data: pro }] = await Promise.all([
    supabase.from("pedidos").select("status").eq("id", id).single(),
    supabase.from("profissionais").select("id, nome, empresa, status").eq("id", profissionalId).single(),
  ]);
  if (!pedido || !pro || pro.status !== "aprovado") return;

  const novoEstado = pedido.status === "novo" || pedido.status === "contactado" ? "atribuido" : pedido.status;
  await supabase.from("pedidos").update({ profissional_id: profissionalId, status: novoEstado }).eq("id", id);
  await registarEvento(id, "atribuicao", `Atribuído a ${pro.empresa || pro.nome}`);
  revalidarPedido(id);
}

export async function removerAtribuicao(formData: FormData) {
  await exigirAdmin();
  const id = Number(formData.get("id"));
  if (!id) return;
  const supabase = createAdminClient();
  const { data: pedido } = await supabase.from("pedidos").select("status").eq("id", id).single();
  if (!pedido) return;
  const novoEstado = pedido.status === "atribuido" ? "contactado" : pedido.status;
  await supabase.from("pedidos").update({ profissional_id: null, status: novoEstado }).eq("id", id);
  await registarEvento(id, "atribuicao", "Atribuição removida");
  revalidarPedido(id);
}

export async function guardarNotas(formData: FormData) {
  await exigirAdmin();
  const id = Number(formData.get("id"));
  const notas = String(formData.get("notas_admin") ?? "").trim().slice(0, 4000);
  if (!id) return;
  const supabase = createAdminClient();
  await supabase.from("pedidos").update({ notas_admin: notas || null }).eq("id", id);
  revalidarPedido(id);
}

// ---------- Profissionais ----------

async function mudarEstadoProfissional(formData: FormData, status: "aprovado" | "rejeitado" | "pendente") {
  await exigirAdmin();
  const id = Number(formData.get("id"));
  if (!id) return;
  const supabase = createAdminClient();
  await supabase.from("profissionais").update({ status }).eq("id", id);
  revalidatePath("/admin/profissionais");
  revalidatePath("/admin/pedidos", "layout");
}

export async function aprovarProfissional(formData: FormData) {
  await mudarEstadoProfissional(formData, "aprovado");
}

export async function rejeitarProfissional(formData: FormData) {
  await mudarEstadoProfissional(formData, "rejeitado");
}

export async function reverProfissional(formData: FormData) {
  await mudarEstadoProfissional(formData, "pendente");
}
