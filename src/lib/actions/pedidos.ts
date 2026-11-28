"use server";

import { createAdminClient } from "@/lib/supabase/admin";
import { BUCKET_FOTOS } from "@/lib/storage";
import {
  AREA_MAX, AREA_MIN, PLANOS, SERVICE_LABELS, TIPOS, calcPrice, getBillableArea,
  type Materiais, type Plano, type TipoServico,
} from "@/lib/pricing";
import {
  CONDICOES, DIVISOES, ELEVADOR, METODOS_PAGAMENTO, OCUPACOES, PRAZOS, distritoDe,
} from "@/lib/opcoes";

const MAX_FOTOS = 12;

export type PedidoInput = {
  tipo: TipoServico;
  area: number;
  materiais: Materiais;
  plano: Plano;
  divisoes: Record<string, number>;
  codigoPostal: string;
  localidade: string;
  morada: string;
  andar: string;
  elevador: string;
  prazo: string;
  dataPreferencial: string;
  condicao: string;
  ocupacao: string;
  nome: string;
  email: string;
  telefone: string;
  consentPrivacidade: boolean;
  consentMarketing: boolean;
  numFotos: number;
  fotoTipos: string[];
  website?: string; // campo-armadilha anti-spam (fica sempre vazio para humanos)
};

export type CriarPedidoResult =
  | {
      ok: true;
      id: number;
      referencia: string;
      precoEstimado: number;
      areaFaturavel: number;
      uploads: { path: string; token: string }[];
    }
  | { ok: false; erro: string };

const txt = (v: unknown, max: number) => String(v ?? "").trim().slice(0, max);
const umDe = <T extends string>(v: string, lista: readonly T[]) => (lista as readonly string[]).includes(v);

function extensao(tipo: string): string {
  if (tipo === "image/png") return "png";
  if (tipo === "image/webp") return "webp";
  if (tipo === "image/heic") return "heic";
  if (tipo === "image/heif") return "heif";
  return "jpg";
}

export async function criarPedido(input: PedidoInput): Promise<CriarPedidoResult> {
  if (input.website) return { ok: false, erro: "Pedido inválido." };

  const tipo = input.tipo;
  const plano = input.plano;
  const area = Math.round(Number(input.area));
  const nome = txt(input.nome, 80);
  const telefone = txt(input.telefone, 30);
  const email = txt(input.email, 120);
  const prazo = txt(input.prazo, 40);
  const condicao = txt(input.condicao, 40);
  const ocupacao = txt(input.ocupacao, 40);
  const elevador = txt(input.elevador, 5);
  const localidade = txt(input.localidade, 60);
  const dataPref = txt(input.dataPreferencial, 10);

  const emailOk = email === "" || /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
  const valido =
    umDe(tipo, TIPOS) &&
    umDe(plano, PLANOS) &&
    Number.isFinite(area) && area >= AREA_MIN && area <= AREA_MAX &&
    (input.materiais === "pintura360" || input.materiais === "cliente") &&
    nome.length >= 2 && telefone.replace(/\D/g, "").length >= 9 && emailOk &&
    input.consentPrivacidade === true &&
    PRAZOS.some((p) => p.value === prazo) &&
    CONDICOES.some((c) => c.value === condicao) &&
    OCUPACOES.some((o) => o.value === ocupacao) &&
    (elevador === "" || ELEVADOR.some((e) => e.value === elevador)) &&
    (dataPref === "" || /^\d{4}-\d{2}-\d{2}$/.test(dataPref));
  if (!valido) return { ok: false, erro: "Verifique os dados do pedido e tente novamente." };

  const divisoes: Record<string, number> = {};
  for (const d of DIVISOES) {
    const n = Math.max(0, Math.min(50, Math.floor(Number(input.divisoes?.[d.key]) || 0)));
    if (n > 0) divisoes[d.key] = n;
  }
  const totalDivisoes = Object.values(divisoes).reduce((a, b) => a + b, 0);

  const comMateriais = input.materiais === "pintura360";
  const precoEstimado = calcPrice(tipo, area, plano, comMateriais);
  const areaFaturavel = getBillableArea(area);

  const supabase = createAdminClient();
  const { data, error } = await supabase
    .from("pedidos")
    .insert({
      servico: SERVICE_LABELS[tipo],
      tipo_servico: tipo,
      area,
      area_faturavel: areaFaturavel,
      divisoes: totalDivisoes || null,
      divisoes_detalhe: divisoes,
      estado_superficie: condicao,
      ocupacao,
      prazo,
      data_preferencial: dataPref || null,
      codigo_postal: txt(input.codigoPostal, 10) || null,
      concelho: localidade || "—",
      distrito: distritoDe(localidade),
      morada: txt(input.morada, 160) || null,
      andar: txt(input.andar, 30) || null,
      elevador: elevador || null,
      nome,
      telefone,
      email: email || null,
      plano,
      estimated_price: precoEstimado,
      materials_included: comMateriais,
      consent_privacidade: true,
      consent_marketing: input.consentMarketing === true,
    })
    .select("id, referencia")
    .single();

  if (error || !data) {
    console.error("criarPedido", error);
    return { ok: false, erro: "Não foi possível registar o pedido. Tente novamente ou fale connosco por WhatsApp." };
  }

  await supabase.from("pedido_eventos").insert({
    pedido_id: data.id,
    tipo: "criado",
    descricao: `Pedido criado no site — ${SERVICE_LABELS[tipo]}, ${areaFaturavel} m², plano ${plano}, ${precoEstimado} €`,
  });

  // URLs de envio assinadas: o browser envia as fotografias diretamente para
  // a pasta privada do pedido, sem passar pelo servidor (limite de tamanho).
  const uploads: { path: string; token: string }[] = [];
  const n = Math.max(0, Math.min(MAX_FOTOS, Math.floor(Number(input.numFotos) || 0)));
  for (let i = 0; i < n; i++) {
    const path = `pedido_${data.id}/foto_${String(i + 1).padStart(2, "0")}.${extensao(input.fotoTipos?.[i] ?? "")}`;
    const { data: signed } = await supabase.storage.from(BUCKET_FOTOS).createSignedUploadUrl(path);
    if (signed) uploads.push({ path, token: signed.token });
  }

  return { ok: true, id: data.id, referencia: data.referencia, precoEstimado, areaFaturavel, uploads };
}

// Depois do envio, regista no pedido as fotografias que chegaram à pasta.
export async function confirmarFotos(id: number, referencia: string): Promise<{ total: number }> {
  const supabase = createAdminClient();
  const { data: pedido } = await supabase
    .from("pedidos").select("id").eq("id", id).eq("referencia", referencia).single();
  if (!pedido) return { total: 0 };

  const { data: files } = await supabase.storage.from(BUCKET_FOTOS).list(`pedido_${id}`, { limit: 50 });
  const paths = (files ?? []).filter((f) => f.name && !f.name.startsWith(".")).map((f) => `pedido_${id}/${f.name}`).sort();
  await supabase.from("pedidos").update({ fotos: paths }).eq("id", id);
  return { total: paths.length };
}

// Ecrã de confirmação: guarda NIF e método preferido antes de seguir para o pagamento.
export async function guardarPreferenciasPagamento(
  id: number, referencia: string, nif: string, metodo: string
): Promise<void> {
  const nifLimpo = nif.replace(/\D/g, "").slice(0, 9);
  const metodoOk = (METODOS_PAGAMENTO as readonly string[]).includes(metodo) ? metodo : null;
  const supabase = createAdminClient();
  await supabase
    .from("pedidos")
    .update({ nif: nifLimpo.length === 9 ? nifLimpo : null, metodo_pagamento: metodoOk })
    .eq("id", id)
    .eq("referencia", referencia);
}
