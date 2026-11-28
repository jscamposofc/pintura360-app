"use client";

// PDFs gerados no browser (jsPDF), com o mesmo desenho do site original.
import { PLAN_LABELS, SERVICE_LABELS, getBillableArea, type Plano, type TipoServico } from "@/lib/pricing";

type Linha = [string, string | number | null | undefined];

async function novoDoc(titulo: string, subtitulo: string) {
  const { jsPDF } = await import("jspdf");
  const doc = new jsPDF();
  doc.setFillColor(11, 31, 61);
  doc.rect(0, 0, 210, 30, "F");
  doc.setTextColor(255, 255, 255);
  doc.setFontSize(18);
  doc.text(titulo, 15, 18);
  doc.setFontSize(10);
  doc.text(subtitulo, 15, 25);
  return doc;
}

function corpo(doc: Awaited<ReturnType<typeof novoDoc>>, linhas: Linha[], destaque: string, notas: string[]) {
  doc.setTextColor(20, 30, 60);
  doc.setFontSize(11);
  let y = 42;
  for (const [label, value] of linhas) {
    doc.setFont("helvetica", "bold");
    doc.text(label + ":", 15, y);
    doc.setFont("helvetica", "normal");
    doc.text(String(value || "-"), 75, y);
    y += 8;
  }
  y += 4;
  doc.setFillColor(245, 130, 31);
  doc.rect(15, y, 180, 24, "F");
  doc.setTextColor(255, 255, 255);
  doc.setFontSize(14);
  doc.text(destaque, 20, y + 11);
  doc.setFontSize(9);
  doc.text("Estimativa inicial, sujeita a validação. IVA incluído.", 20, y + 19);
  doc.setTextColor(120, 120, 120);
  doc.setFontSize(8.5);
  notas.forEach((n, i) => doc.text(n, 15, y + 34 + i * 5));
}

const NOTAS_BASE = [
  "Esta é uma estimativa inicial baseada nas informações fornecidas.",
  "O valor final será confirmado após análise do projeto. Válido 30 dias.",
];

export async function downloadPlanPDF(opts: {
  tipo: TipoServico; area: number; plano: Plano; comMateriais: boolean; preco: number;
}) {
  const label = PLAN_LABELS[opts.plano];
  const doc = await novoDoc("Pintura360", `Proposta — Plano ${label}`);
  corpo(
    doc,
    [
      ["Serviço", SERVICE_LABELS[opts.tipo]],
      ["Área a pintar", getBillableArea(opts.area) + " m²"],
      ["Materiais", opts.comMateriais ? "Incluídos (Pintura360 fornece)" : "Fornecidos pelo cliente"],
    ],
    `Plano ${label} — ${opts.preco} €`,
    [...NOTAS_BASE, "Pagamento processado com segurança pela Stripe."]
  );
  doc.save(`Pintura360-Proposta-${label}.pdf`);
}

export type ResumoPedido = {
  referencia: string;
  nome: string;
  tipo: TipoServico;
  area: number;
  areaFaturavel: number;
  condicao: string;
  ocupacao: string;
  comMateriais: boolean;
  localidade: string;
  plano: Plano;
  preco: number;
};

export async function downloadQuotePDF(r: ResumoPedido) {
  const doc = await novoDoc("Pintura360", `Referência ${r.referencia}`);
  corpo(
    doc,
    [
      ["Nome", r.nome],
      ["Serviço", SERVICE_LABELS[r.tipo]],
      ["Área real", r.area + " m²"],
      ["Área faturável", r.areaFaturavel + " m²"],
      ["Estado das superfícies", r.condicao],
      ["Ocupação", r.ocupacao],
      ["Materiais", r.comMateriais ? "Incluídos" : "Fornecidos pelo cliente"],
      ["Localização", r.localidade],
    ],
    `Plano ${PLAN_LABELS[r.plano]} — ${r.preco} €`,
    NOTAS_BASE
  );
  doc.save(`Pintura360-${r.referencia}.pdf`);
}
