// Valores do Supabase lidos das variáveis de ambiente, sem espaços nem quebras
// de linha acidentais.
//
// A chave "anon" é pública (vai sempre para o browser do visitante). Se a
// variável no Vercel estiver estragada — por exemplo, colada com os "•••" da
// versão mascarada —, usamos a chave pública correta do projeto.
const ANON_KEY_PROJETO =
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im1qbGJsb3lscmdsZWx0ZWtpZXNyIiwicm9sZSI6ImFub24iLCJpYXQiOjE3OTU1NDg1NjUsImV4cCI6MjExMTEyNDU2NX0.qbzwIiK5YT5SlVSq5vfn5Nffv1yF1RJ2d8bSC29G5a4";

const chaveValida = (k: string) => /^[A-Za-z0-9._-]{20,}$/.test(k);

export const SUPABASE_URL = (process.env.NEXT_PUBLIC_SUPABASE_URL ?? "").trim().replace(/\/+$/, "");

const anonEnv = (process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ?? "").trim();
export const SUPABASE_ANON_KEY = chaveValida(anonEnv) ? anonEnv : ANON_KEY_PROJETO;
