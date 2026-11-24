"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { createAdminClient } from "@/lib/supabase/admin";
import { getAdminUser } from "@/lib/supabase/server";

async function exigirAdmin() {
  const user = await getAdminUser();
  if (!user) redirect("/admin/login");
}

export async function aprovarProfissional(formData: FormData) {
  await exigirAdmin();
  const id = Number(formData.get("id"));
  const supabase = createAdminClient();
  await supabase.from("profissionais").update({ status: "aprovado" }).eq("id", id);
  revalidatePath("/admin/profissionais");
  revalidatePath("/profissionais");
}

export async function rejeitarProfissional(formData: FormData) {
  await exigirAdmin();
  const id = Number(formData.get("id"));
  const supabase = createAdminClient();
  await supabase.from("profissionais").update({ status: "rejeitado" }).eq("id", id);
  revalidatePath("/admin/profissionais");
  revalidatePath("/profissionais");
}

export async function atribuirPedido(formData: FormData) {
  await exigirAdmin();
  const id = Number(formData.get("id"));
  const profissionalId = formData.get("profissional_id");
  const supabase = createAdminClient();
  await supabase
    .from("pedidos")
    .update({
      status: "atribuido",
      profissional_id: profissionalId ? Number(profissionalId) : null,
    })
    .eq("id", id);
  revalidatePath("/admin/pedidos");
}

export async function marcarPedido(formData: FormData) {
  await exigirAdmin();
  const id = Number(formData.get("id"));
  const status = String(formData.get("status") ?? "novo");
  const supabase = createAdminClient();
  await supabase.from("pedidos").update({ status }).eq("id", id);
  revalidatePath("/admin/pedidos");
}
