import { redirect } from "next/navigation";

// Página antiga — o ecrã de confirmação passou para o próprio questionário.
export default function ObrigadoCliente() {
  redirect("/#orcamento");
}
