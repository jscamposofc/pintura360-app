import Link from "next/link";
import { logoutAdmin } from "@/lib/actions/auth";

export default function AdminTabs({ active }: { active: "pedidos" | "profissionais" }) {
  return (
    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 8 }}>
      <div className="admin-tabs">
        <Link href="/admin/pedidos"><button className={active === "pedidos" ? "active" : ""}>Pedidos de Clientes</button></Link>
        <Link href="/admin/profissionais"><button className={active === "profissionais" ? "active" : ""}>Profissionais</button></Link>
      </div>
      <form action={logoutAdmin}>
        <button type="submit" className="btn btn-outline-navy btn-sm">Terminar sessão</button>
      </form>
    </div>
  );
}
