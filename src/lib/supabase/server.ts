import "server-only";
import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";

// Cliente com sessão (cookies) — usado para login/logout e para saber
// quem está autenticado nas páginas /admin. Usa a chave pública (anon);
// as regras de acesso aos dados privados vivem no código do servidor,
// não em RLS, por isso este cliente nunca lê tabelas diretamente.
export async function createSessionClient() {
  const cookieStore = await cookies();
  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return cookieStore.getAll();
        },
        setAll(cookiesToSet) {
          try {
            cookiesToSet.forEach(({ name, value, options }) =>
              cookieStore.set(name, value, options)
            );
          } catch {
            // chamado a partir de um Server Component — ignorado,
            // o middleware trata da renovação da sessão.
          }
        },
      },
    }
  );
}
