import { redirect } from "next/navigation";

// Página antiga — a confirmação da inscrição aparece agora na área de parceiro.
export default function ObrigadoProfissional() {
  redirect("/parceiro");
}
