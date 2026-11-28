// Opções do questionário (textos exatamente como no site original).

export const DIVISOES = [
  { key: "quartos", label: "Quartos" },
  { key: "salas", label: "Salas de Estar / Jantar" },
  { key: "corredores", label: "Corredores" },
  { key: "banhos", label: "Casas de Banho" },
  { key: "cozinhas", label: "Cozinhas" },
  { key: "varandas", label: "Varandas" },
  { key: "escadarias", label: "Escadarias" },
] as const;
export type DivisaoKey = (typeof DIVISOES)[number]["key"];

export const PRAZOS = [
  { value: "O mais rapidamente possível", label: "🔥 O mais rapidamente possível", curto: "🔥 O mais rápido possível" },
  { value: "Dentro de 30 dias", label: "📅 Dentro de 30 dias", curto: "📅 Dentro de 30 dias" },
  { value: "Entre 1 e 3 meses", label: "📆 Entre 1 e 3 meses", curto: "📆 Entre 1 e 3 meses" },
  { value: "Ainda estou a planear", label: "💭 Ainda estou a planear", curto: "💭 Ainda a planear" },
] as const;

export const CONDICOES = [
  { value: "Bom estado", title: "🟢 Bom estado", desc: "Apenas necessita de uma nova pintura." },
  { value: "Algumas imperfeições", title: "🟡 Algumas imperfeições", desc: "Pequenos furos, marcas ou fissuras." },
  { value: "Necessita de reparações", title: "🟠 Necessita de reparações", desc: "Existem várias zonas que precisam de preparação." },
  { value: "Humidade ou danos graves", title: "🔴 Humidade ou danos graves", desc: "Necessita de avaliação." },
] as const;
export const CONDICAO_GRAVE = "Humidade ou danos graves";

export const OCUPACOES = [
  { value: "Mobilado e habitado", title: "🛋️ Mobilado e habitado" },
  { value: "Mobilado, mas desocupado", title: "📦 Mobilado, mas desocupado" },
  { value: "Vazio", title: "🏠 Vazio" },
] as const;

export const ELEVADOR = [
  { value: "Sim", label: "Sim" },
  { value: "Não", label: "Não" },
  { value: "N/A", label: "Não aplicável" },
] as const;

export const METODOS_PAGAMENTO = ["mbway", "multibanco", "cartao", "klarna"] as const;
export type MetodoPagamento = (typeof METODOS_PAGAMENTO)[number];

// Concelhos sugeridos no campo "Localidade" — servem para sugerir os
// parceiros que cobrem a zona. O cliente pode escrever outra localidade.
export const CONCELHOS: Record<string, "Lisboa" | "Setúbal"> = {
  Lisboa: "Lisboa", Amadora: "Lisboa", Cascais: "Lisboa", Loures: "Lisboa", Mafra: "Lisboa",
  Odivelas: "Lisboa", Oeiras: "Lisboa", Sintra: "Lisboa", "Vila Franca de Xira": "Lisboa",
  Alenquer: "Lisboa", "Arruda dos Vinhos": "Lisboa", Azambuja: "Lisboa",
  "Sobral de Monte Agraço": "Lisboa",
  Almada: "Setúbal", Barreiro: "Setúbal", Moita: "Setúbal", Montijo: "Setúbal", Palmela: "Setúbal",
  Seixal: "Setúbal", Sesimbra: "Setúbal", Setúbal: "Setúbal", Alcochete: "Setúbal",
};

export function normalizar(s: string): string {
  return s.normalize("NFD").replace(/[̀-ͯ]/g, "").trim().toLowerCase();
}

export function distritoDe(localidade: string): string | null {
  const n = normalizar(localidade);
  const hit = Object.entries(CONCELHOS).find(([c]) => normalizar(c) === n);
  return hit ? hit[1] : null;
}

export const WHATSAPP_NUMBER = "351928358968";
export function waLink(texto: string): string {
  return `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(texto)}`;
}
