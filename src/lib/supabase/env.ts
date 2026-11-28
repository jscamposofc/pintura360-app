// Valores do Supabase lidos das variáveis de ambiente, sem espaços nem quebras
// de linha acidentais (um espaço no fim da chave impede o envio dos pedidos).
export const SUPABASE_URL = (process.env.NEXT_PUBLIC_SUPABASE_URL ?? "").trim().replace(/\/+$/, "");
export const SUPABASE_ANON_KEY = (process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ?? "").trim();
