import { redirect } from "next/navigation";
import { exigirMembro, primeiraPagina } from "@/lib/membro";

export const dynamic = "force-dynamic";

export default async function AdminIndex() {
  const m = await exigirMembro();
  redirect(primeiraPagina(m));
}
