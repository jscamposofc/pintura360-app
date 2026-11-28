// Calculadora de preços — portada do site original (pintura360.pt).
// Valores de mão de obra "sem materiais" por m², Grande Lisboa (2026).
// O preço "com materiais" é sempre derivado por multiplicação (+30%).
export const PRICING = {
  interior: { essencial: 5.5, recomendado: 7.8, premium: 11.7 },
  exterior: { essencial: 9.2, recomendado: 13.1, premium: 19.2 },
  comercial: { essencial: 8.8, recomendado: 12.0, premium: 16.0 },
} as const;

export type Categoria = keyof typeof PRICING;
export type Plano = "essencial" | "recomendado" | "premium";

export const MATERIALS_MARKUP = 0.3;

// Escalão mínimo: de MIN_BILLABLE_AREA até FLAT_TIER_MAX_AREA m², o preço
// base é fixo, independentemente dos m² exatos dentro desse intervalo.
export const FLAT_TIER_MAX_AREA = 20;
export const FLAT_TIER_PRICES: Record<Plano, number> = { essencial: 150, recomendado: 200, premium: 300 };
export const MIN_BILLABLE_AREA = 10;

export const PLAN_LABELS: Record<Plano, string> = {
  essencial: "Essencial",
  recomendado: "Recomendado",
  premium: "Premium",
};
export const PLAN_DESCRIPTIONS: Record<Plano, string> = {
  essencial: "Acabamento standard, indicado para renovações rápidas.",
  recomendado: "Melhor relação qualidade/preço, com acabamento cuidado.",
  premium: "Acabamento superior, tintas premium.",
};

export function categoriaParaServico(servico: string): Categoria {
  if (servico === "Exteriores" || servico === "Fachadas") return "exterior";
  return "interior";
}

export function getBillableArea(area: number): number {
  return Math.max(MIN_BILLABLE_AREA, area || 0);
}

export function calcPrice(servico: string, area: number, plano: Plano, comMateriais: boolean): number {
  const categoria = categoriaParaServico(servico);
  const billable = getBillableArea(area);
  const base = billable <= FLAT_TIER_MAX_AREA ? FLAT_TIER_PRICES[plano] : PRICING[categoria][plano] * billable;
  const total = comMateriais ? base * (1 + MATERIALS_MARKUP) : base;
  return Math.round(total);
}
