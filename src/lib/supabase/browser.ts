import { createClient } from "@supabase/supabase-js";

// Cliente público (chave anon), usado no browser só para enviar fotografias
// para URLs assinadas pelo servidor. Não tem acesso de leitura a nenhuma tabela.
export function createBrowserClient() {
  return createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!, {
    auth: { persistSession: false, autoRefreshToken: false },
  });
}
