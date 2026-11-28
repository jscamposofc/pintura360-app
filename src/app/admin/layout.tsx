import "./admin.css";
import Link from "next/link";
import { getAdminUser } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { logoutAdmin } from "@/lib/actions/auth";
import AdminNav from "@/components/admin/AdminNav";

export const metadata = { title: "Painel de gestão — Pintura360", robots: { index: false, follow: false } };

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const user = await getAdminUser();
  // Login e configuração inicial: sem barra de navegação.
  if (!user) return <>{children}</>;

  const supabase = createAdminClient();
  const [{ count: novos }, { count: pendentes }] = await Promise.all([
    supabase.from("pedidos").select("id", { count: "exact", head: true }).eq("status", "novo"),
    supabase.from("profissionais").select("id", { count: "exact", head: true }).eq("status", "pendente"),
  ]);

  return (
    <div className="adm">
      <div className="adm-top">
        <div className="adm-top-inner">
          <Link href="/admin/pedidos" className="adm-brand">
            <img src="/logo.png" alt="Pintura360" />
            <span>Gestão</span>
          </Link>
          <AdminNav novos={novos ?? 0} pendentes={pendentes ?? 0} />
          <Link href="/" className="adm-site-link" target="_blank">Ver site ↗</Link>
          <form action={logoutAdmin}>
            <button type="submit">Terminar sessão</button>
          </form>
        </div>
      </div>
      <div className="adm-main">{children}</div>
    </div>
  );
}
