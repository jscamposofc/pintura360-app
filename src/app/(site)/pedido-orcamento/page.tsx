import { redirect } from "next/navigation";

// O pedido de orçamento vive agora na página inicial (#orcamento), como no site original.
export default function PedidoOrcamento() {
  redirect("/#orcamento");
}
