// Calculadora de preços — regras do site original (pintura360.pt).
// Valores de mão de obra "sem materiais" por m², Grande Lisboa (2026).
// O preço "com materiais" é sempre derivado por multiplicação (+30%).
// Usado no browser (estimativa) e no servidor (o preço gravado é sempre
// recalculado aqui, nunca aceite tal como vem do cliente).
export const PRICING = {
  interior: { essencial: 5.5, recomendado: 7.8, premium: 11.7 },
  exterior: { essencial: 9.2, recomendado: 13.1, premium: 19.2 },
  comercial: { essencial: 8.8, recomendado: 12.0, premium: 16.0 },
} as const;

export type TipoServico = keyof typeof PRICING;
export type Plano = "essencial" | "recomendado" | "premium";
export type Materiais = "pintura360" | "cliente";

export const TIPOS: TipoServico[] = ["interior", "exterior", "comercial"];
export const PLANOS: Plano[] = ["essencial", "recomendado", "premium"];

export const MATERIALS_MARKUP = 0.3;
export const MIN_BILLABLE_AREA = 10; // m² — área mínima faturável
export const AREA_MIN = 10; // limites do slider
export const AREA_MAX = 400;

// Escalão mínimo: até FLAT_TIER_MAX_AREA m² o preço base é fixo.
export const FLAT_TIER_MAX_AREA = 20;
export const FLAT_TIER_PRICES: Record<Plano, number> = { essencial: 150, recomendado: 200, premium: 300 };

export const SERVICE_LABELS: Record<TipoServico, string> = {
  interior: "Pintura Interior",
  exterior: "Pintura Exterior",
  comercial: "Pintura Comercial",
};

export const PLAN_LABELS: Record<Plano, string> = {
  essencial: "Essencial",
  recomendado: "Recomendado",
  premium: "Premium",
};

export function getBillableArea(area: number): number {
  return Math.max(MIN_BILLABLE_AREA, area || 0);
}

export function calcPrice(tipo: TipoServico, area: number, plano: Plano, comMateriais: boolean): number {
  const billable = getBillableArea(area);
  const base = billable <= FLAT_TIER_MAX_AREA ? FLAT_TIER_PRICES[plano] : PRICING[tipo][plano] * billable;
  const total = comMateriais ? base * (1 + MATERIALS_MARKUP) : base;
  return Math.round(total);
}

export function calcDeposit(total: number): { agora: number; depois: number } {
  const agora = Math.round(total / 2);
  return { agora, depois: total - agora };
}
