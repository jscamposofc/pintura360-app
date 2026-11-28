import { createClient } from "@supabase/supabase-js";
import { SUPABASE_ANON_KEY, SUPABASE_URL } from "@/lib/supabase/env";

// Cliente público (chave anon), usado no browser só para enviar fotografias
// para URLs assinadas pelo servidor. Não tem acesso de leitura a nenhuma tabela.
export function createBrowserClient() {
  return createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
    auth: { persistSession: false, autoRefreshToken: false },
  });
}
