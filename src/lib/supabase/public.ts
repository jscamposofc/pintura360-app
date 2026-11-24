import { createClient } from "@supabase/supabase-js";

// Cliente público (anon key) — só lê a view profissionais_publicos.
// Seguro para correr no browser ou no servidor.
export function createPublicClient() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    { auth: { persistSession: false } }
  );
}
