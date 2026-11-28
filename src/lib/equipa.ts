// Funções (permissões) e cargos da equipa Pintura360 no painel de gestão.
// Ficheiro partilhado entre servidor e browser — sem acesso a dados aqui.

export const PERMISSOES = {
  pedidos_ver: { label: "Ver pedidos", desc: "Lista de pedidos e ficha completa (contactos, morada, fotografias)." },
  pedidos_gerir: { label: "Gerir pedidos", desc: "Mudar o estado do pedido e escrever notas internas." },
  pedidos_atribuir: { label: "Atribuir a parceiros", desc: "Escolher o profissional que executa cada pedido." },
  profissionais_gerir: { label: "Gerir profissionais", desc: "Ver inscrições, aprovar, rejeitar ou suspender parceiros." },
  equipa_gerir: { label: "Gerir equipa", desc: "Criar funcionários, mudar cargos e funções, desativar acessos." },
} as const;

export type Permissao = keyof typeof PERMISSOES;
export const TODAS: Permissao[] = Object.keys(PERMISSOES) as Permissao[];

export const CARGOS: { cargo: string; permissoes: Permissao[]; desc: string }[] = [
  { cargo: "Administrador", permissoes: TODAS, desc: "Acesso total, incluindo a gestão da equipa." },
  { cargo: "Gestor de operações", permissoes: ["pedidos_ver", "pedidos_gerir", "pedidos_atribuir", "profissionais_gerir"], desc: "Trata pedidos do início ao fim e gere os parceiros." },
  { cargo: "Atendimento / Comercial", permissoes: ["pedidos_ver", "pedidos_gerir"], desc: "Contacta clientes e atualiza o estado dos pedidos." },
  { cargo: "Orçamentista / Técnico", permissoes: ["pedidos_ver"], desc: "Consulta pedidos e fotografias para validar orçamentos." },
];

export function filtrarPermissoes(valores: string[]): Permissao[] {
  return TODAS.filter((p) => valores.includes(p));
}
