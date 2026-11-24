import "server-only";
import { createClient } from "@supabase/supabase-js";

// Cliente privilegiado (service role) — NUNCA importar em código de cliente.
// Usado só em Server Actions / Route Handlers para escrever nas tabelas
// e ler dados privados (pedidos, inscrições completas de profissionais).
export function createAdminClient() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    { auth: { persistSession: false, autoRefreshToken: false } }
  );
}
