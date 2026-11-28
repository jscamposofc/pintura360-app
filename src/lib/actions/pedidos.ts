"use server";

import { redirect } from "next/navigation";
import { createAdminClient } from "@/lib/supabase/admin";

export async function criarPedido(formData: FormData) {
  const nome = String(formData.get("nome") ?? "").trim().slice(0, 80);
  const telefone = String(formData.get("telefone") ?? "").trim().slice(0, 30);
  const email = String(formData.get("email") ?? "").trim().slice(0, 120);
  const servico = String(formData.get("servico") ?? "").trim().slice(0, 40);
  const distrito = String(formData.get("distrito") ?? "").trim().slice(0, 40);
  const concelho = String(formData.get("concelho") ?? "").trim().slice(0, 60);
  const prazo = String(formData.get("prazo") ?? "").trim().slice(0, 40);
  const estado_superficie = String(formData.get("estado_superficie") ?? "").trim().slice(0, 40);
  const notas = String(formData.get("notas") ?? "").trim().slice(0, 500);
  const areaRaw = formData.get("area");
  const divisoesRaw = formData.get("divisoes");
  const consent = formData.get("consent");
  const plano = String(formData.get("plano") ?? "").trim().slice(0, 20);
  const estimatedPriceRaw = formData.get("estimated_price");
  const materialsIncluded = formData.get("materials_included") === "1";

  const emailOk = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
  const ok = nome && telefone && emailOk && servico && distrito && concelho && consent === "1";
  if (!ok) redirect("/pedido-orcamento?erro=1");

  const supabase = createAdminClient();
  const { error } = await supabase.from("pedidos").insert({
    nome,
    telefone,
    email,
    servico,
    distrito,
    concelho,
    prazo: prazo || null,
    estado_superficie: estado_superficie || null,
    notas: notas || null,
    area: areaRaw ? Number(areaRaw) : null,
    divisoes: divisoesRaw ? Number(divisoesRaw) : null,
    plano: plano || null,
    estimated_price: estimatedPriceRaw ? Number(estimatedPriceRaw) : null,
    materials_included: materialsIncluded,
  });

  if (error) redirect("/pedido-orcamento?erro=1");
  redirect("/obrigado-cliente");
}
