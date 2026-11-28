import "server-only";

// Tipos e utilitários partilhados pelas páginas do painel de gestão.

export const ESTADOS = {
  novo: "Novo",
  contactado: "Contactado",
  atribuido: "Atribuído",
  pago: "Sinal pago",
  concluido: "Concluído",
  cancelado: "Cancelado",
} as const;
export type Estado = keyof typeof ESTADOS;
export const ORDEM_ESTADOS: Estado[] = ["novo", "contactado", "atribuido", "pago", "concluido"];

export type Pedido = {
  id: number;
  created_at: string;
  atualizado_em: string;
  referencia: string | null;
  servico: string;
  tipo_servico: string | null;
  area: number | null;
  area_faturavel: number | null;
  divisoes: number | null;
  divisoes_detalhe: Record<string, number> | null;
  estado_superficie: string | null;
  ocupacao: string | null;
  prazo: string | null;
  data_preferencial: string | null;
  codigo_postal: string | null;
  morada: string | null;
  andar: string | null;
  elevador: string | null;
  distrito: string | null;
  concelho: string;
  nome: string;
  telefone: string;
  email: string | null;
  notas: string | null;
  notas_admin: string | null;
  plano: string | null;
  estimated_price: number | null;
  materials_included: boolean | null;
  fotos: string[] | null;
  nif: string | null;
  metodo_pagamento: string | null;
  consent_marketing: boolean;
  status: Estado;
  profissional_id: number | null;
};

export type Profissional = {
  id: number;
  created_at: string;
  nome: string;
  empresa: string | null;
  nif: string;
  telefone: string;
  email: string;
  distrito: string;
  concelhos: string[];
  servicos: string[];
  anos_experiencia: number;
  tem_seguro: boolean;
  apresentacao: string;
  portfolio_link: string | null;
  comprovativo_path: string | null;
  status: "pendente" | "aprovado" | "rejeitado";
};

export type Evento = { id: number; created_at: string; tipo: string; descricao: string };

export const DIVISAO_LABELS: Record<string, string> = {
  quartos: "Quartos", salas: "Salas", corredores: "Corredores", banhos: "Casas de banho",
  cozinhas: "Cozinhas", varandas: "Varandas", escadarias: "Escadarias",
};

export const METODO_LABELS: Record<string, string> = {
  mbway: "MB WAY", multibanco: "Multibanco", cartao: "Cartão", klarna: "Klarna",
};

export const PLANO_LABELS: Record<string, string> = {
  essencial: "Essencial", recomendado: "Recomendado", premium: "Premium",
};

const fmtData = new Intl.DateTimeFormat("pt-PT", { timeZone: "Europe/Lisbon", day: "2-digit", month: "short", year: "numeric" });
const fmtDataHora = new Intl.DateTimeFormat("pt-PT", { timeZone: "Europe/Lisbon", day: "2-digit", month: "short", hour: "2-digit", minute: "2-digit" });
export const data = (iso: string) => fmtData.format(new Date(iso));
export const dataHora = (iso: string) => fmtDataHora.format(new Date(iso));
export const euros = (v: number | null | undefined) =>
  v == null ? "—" : new Intl.NumberFormat("pt-PT", { style: "currency", currency: "EUR", maximumFractionDigits: 0 }).format(v);

export function divisoesTexto(d: Record<string, number> | null): string {
  const e = Object.entries(d ?? {}).filter(([, v]) => v > 0);
  return e.length ? e.map(([k, v]) => `${v} ${DIVISAO_LABELS[k] ?? k}`).join(" · ") : "Não indicadas";
}

export function telefoneWa(tel: string): string {
  const d = tel.replace(/\D/g, "");
  if (d.length === 9) return "351" + d;
  return d.replace(/^00/, "");
}

export function normalizar(s: string): string {
  return s.normalize("NFD").replace(/[̀-ͯ]/g, "").trim().toLowerCase();
}

// Parceiros aprovados que cobrem a localidade do pedido (concelho), depois os do mesmo distrito.
export function sugerirParceiros(p: Pedido, aprovados: Profissional[]) {
  const loc = normalizar(p.concelho ?? "");
  return aprovados
    .map((pro) => {
      const cobre = pro.concelhos.some((c) => normalizar(c) === loc);
      const mesmoDistrito = !!p.distrito && normalizar(pro.distrito) === normalizar(p.distrito);
      return { pro, score: cobre ? 2 : mesmoDistrito ? 1 : 0 };
    })
    .sort((a, b) => b.score - a.score || (a.pro.empresa || a.pro.nome).localeCompare(b.pro.empresa || b.pro.nome));
}
