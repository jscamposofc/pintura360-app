export type ProfissionalPublico = {
  id: number;
  nome: string;
  empresa: string | null;
  distrito: string;
  concelhos: string[];
  servicos: string[];
  anos_experiencia: number;
  bio: string;
  avaliacao: number;
  num_avaliacoes: number;
  verificado: boolean;
};

export function iniciais(nome: string): string {
  const parts = nome.trim().split(/\s+/);
  const first = parts[0]?.[0] ?? "";
  const last = parts.length > 1 ? parts[parts.length - 1][0] : "";
  return (first + last).toUpperCase();
}

export function estrelas(rating: number): string {
  const r = Math.round(rating * 2) / 2;
  const full = Math.floor(r);
  const half = r - full >= 0.5;
  return "★".repeat(full) + (half ? "½" : "");
}

const CORES = ["avatar-1", "avatar-2", "avatar-3", "avatar-4", "avatar-5"];
export function corAvatar(id: number): string {
  return CORES[id % CORES.length];
}
