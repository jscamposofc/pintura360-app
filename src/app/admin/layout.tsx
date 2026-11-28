import "./admin.css";
import Link from "next/link";
import { createAdminClient } from "@/lib/supabase/admin";
import { getMembro, pode } from "@/lib/membro";
import { logoutAdmin } from "@/lib/actions/auth";
import AdminNav from "@/components/admin/AdminNav";

export const metadata = { title: "Painel de gestão — Pintura360", robots: { index: false, follow: false } };

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const membro = await getMembro();
  // Login e configuração inicial: sem barra de navegação.
  if (!membro) return <>{children}</>;

  const supabase = createAdminClient();
  const [{ count: novos }, { count: pendentes }] = await Promise.all([
    pode(membro, "pedidos_ver")
      ? supabase.from("pedidos").select("id", { count: "exact", head: true }).eq("status", "novo")
      : Promise.resolve({ count: 0 }),
    pode(membro, "profissionais_gerir")
      ? supabase.from("profissionais").select("id", { count: "exact", head: true }).eq("status", "pendente")
      : Promise.resolve({ count: 0 }),
  ]);

  const links = [
    pode(membro, "pedidos_ver") && { href: "/admin/pedidos", label: "Pedidos", count: novos ?? 0 },
    pode(membro, "profissionais_gerir") && { href: "/admin/profissionais", label: "Profissionais", count: pendentes ?? 0 },
    pode(membro, "equipa_gerir") && { href: "/admin/equipa", label: "Equipa", count: 0 },
  ].filter(Boolean) as { href: string; label: string; count: number }[];

  return (
    <div className="adm">
      <div className="adm-top">
        <div className="adm-top-inner">
          <Link href="/admin" className="adm-brand">
            <img src="/logo.png" alt="Pintura360" />
            <span>Gestão</span>
          </Link>
          <AdminNav links={links} />
          <Link href="/" className="adm-site-link" target="_blank">Ver site ↗</Link>
          <Link href="/admin/conta" className="adm-user">
            <span className="adm-avatar sm">{membro.nome.trim()[0]?.toUpperCase()}</span>
            <span><strong>{membro.nome}</strong><small>{membro.cargo}</small></span>
          </Link>
          <form action={logoutAdmin}>
            <button type="submit">Sair</button>
          </form>
        </div>
      </div>
      <div className="adm-main">{children}</div>
    </div>
  );
}
