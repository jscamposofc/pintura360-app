export const metadata = { title: "Termos e Condições — Pintura360" };

export default function Termos() {
  return (
    <section className="section-sm">
      <div className="container" style={{ maxWidth: 760 }}>
        <h1>Termos e Condições</h1>
        <div className="alert alert-info">Modelo inicial — deve ser revisto por um jurista antes da publicação definitiva.</div>

        <h2>1. O que é a Pintura360</h2>
        <p>A Pintura360 é uma plataforma de intermediação que liga clientes que procuram serviços de pintura a profissionais independentes verificados. A Pintura360 não é, ela própria, a empresa que executa os trabalhos de pintura.</p>

        <h2>2. Pedidos de orçamento (Clientes)</h2>
        <p>Ao submeter um pedido, o cliente autoriza a Pintura360 a partilhar os detalhes do projeto com profissionais parceiros da sua zona, para efeitos de elaboração de proposta. A atribuição final do trabalho a um profissional específico é feita pela Pintura360, podendo considerar preferências indicadas pelo cliente, consoante disponibilidade.</p>

        <h2>3. Condições para Profissionais Parceiros</h2>
        <p>Para se inscrever, o profissional deve fornecer dados verdadeiros, incluindo NIF e, quando solicitado, comprovativo de atividade e seguro aplicável. A Pintura360 reserva-se o direito de recusar, suspender ou remover a qualquer momento um perfil que não cumpra os critérios de verificação ou que receba avaliações insatisfatórias recorrentes.</p>

        <h2>4. Contactos e intermediação</h2>
        <p>Os contactos diretos entre cliente e profissional só são partilhados depois de um pedido ser confirmado e atribuído através da plataforma. É proibido contornar a plataforma para negociar diretamente trabalhos originados através da Pintura360 [DETALHAR COMISSÃO/TAXA, SE APLICÁVEL].</p>

        <h2>5. Pagamentos</h2>
        <p>[DESCREVER MODELO DE PAGAMENTO: reserva, comissão por trabalho atribuído, mensalidade, etc. — a definir antes da publicação. Pagamentos serão processados via Stripe.]</p>

        <h2>6. Responsabilidade</h2>
        <p>A execução do serviço de pintura é da exclusiva responsabilidade do profissional atribuído. A Pintura360 atua como intermediária e facilitadora do processo, [DETALHAR GARANTIAS OFERECIDAS, SE APLICÁVEL].</p>

        <h2>7. Alterações aos termos</h2>
        <p>A Pintura360 pode atualizar estes termos a qualquer momento, sendo a versão em vigor sempre a publicada nesta página.</p>

        <h2>8. Contacto</h2>
        <p><a href="mailto:geral@pintura360.pt">geral@pintura360.pt</a></p>
      </div>
    </section>
  );
}
