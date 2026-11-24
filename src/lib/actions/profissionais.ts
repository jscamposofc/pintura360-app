"use server";

import { redirect } from "next/navigation";
import { createAdminClient } from "@/lib/supabase/admin";

export async function inscreverProfissional(formData: FormData) {
  const nome = String(formData.get("nome") ?? "").trim().slice(0, 80);
  const empresa = String(formData.get("empresa") ?? "").trim().slice(0, 80);
  const nif = String(formData.get("nif") ?? "").trim();
  const telefone = String(formData.get("telefone") ?? "").trim().slice(0, 30);
  const email = String(formData.get("email") ?? "").trim().slice(0, 120);
  const distrito = String(formData.get("distrito") ?? "").trim().slice(0, 40);
  const concelhosRaw = String(formData.get("concelhos") ?? "").trim();
  const anosRaw = formData.get("anos_experiencia");
  const temSeguro = formData.get("tem_seguro") === "sim";
  const apresentacao = String(formData.get("apresentacao") ?? "").trim().slice(0, 800);
  const portfolioLink = String(formData.get("portfolio_link") ?? "").trim().slice(0, 200);
  const servicos = formData.getAll("servicos").map((s) => String(s).slice(0, 40));
  const consent = formData.get("consent");
  const comprovativo = formData.get("comprovativo") as File | null;

  const emailOk = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
  const nifOk = /^\d{9}$/.test(nif);
  const ok =
    nome && nifOk && telefone && emailOk && distrito && concelhosRaw &&
    servicos.length > 0 && anosRaw && apresentacao && consent === "1";
  if (!ok) redirect("/trabalhe-connosco?erro=1");

  const concelhos = concelhosRaw.split(",").map((c) => c.trim()).filter(Boolean);
  const supabase = createAdminClient();

  const { data: inserido, error } = await supabase
    .from("profissionais")
    .insert({
      nome,
      empresa: empresa || null,
      nif,
      telefone,
      email,
      distrito,
      concelhos,
      servicos,
      anos_experiencia: Number(anosRaw),
      tem_seguro: temSeguro,
      apresentacao,
      portfolio_link: portfolioLink || null,
    })
    .select("id")
    .single();

  if (error || !inserido) redirect("/trabalhe-connosco?erro=1");

  if (comprovativo && comprovativo.size > 0) {
    const permitido = ["application/pdf", "image/jpeg", "image/png"].includes(comprovativo.type);
    if (permitido && comprovativo.size <= 5 * 1024 * 1024) {
      const ext = comprovativo.type === "application/pdf" ? "pdf" : comprovativo.type === "image/png" ? "png" : "jpg";
      const path = `profissional_${inserido.id}/comprovativo.${ext}`;
      const bytes = new Uint8Array(await comprovativo.arrayBuffer());
      const { error: uploadError } = await supabase.storage
        .from("comprovativos")
        .upload(path, bytes, { contentType: comprovativo.type, upsert: true });
      if (!uploadError) {
        await supabase.from("profissionais").update({ comprovativo_path: path }).eq("id", inserido.id);
      }
    }
  }

  redirect("/obrigado-profissional");
}
