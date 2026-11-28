export const metadata = { title: "Política de Privacidade — Pintura360" };

export default function Privacidade() {
  return (
    <section className="section-sm">
      <div className="container" style={{ maxWidth: 760 }}>
        <h1>Política de Privacidade</h1>
        <div className="alert alert-info">Modelo inicial — deve ser revisto por um jurista antes da publicação definitiva e completado com os dados da entidade responsável.</div>
        <p className="muted">Última atualização: [DATA]</p>

        <h2>1. Quem é o responsável</h2>
        <p>[NOME DA EMPRESA], NIF [NIF], com sede em [MORADA] (&quot;Pintura360&quot;). Contacto: <a href="mailto:geral@pintura360.pt">geral@pintura360.pt</a>.</p>

        <h2>2. Que dados recolhemos</h2>
        <p><strong>De clientes:</strong> nome, email, telefone, localização do projeto e detalhes do pedido de orçamento.</p>
        <p><strong>De profissionais parceiros:</strong> nome, nome da empresa, NIF, telefone, email, zona de atuação, anos de experiência, documentos de verificação de atividade e, opcionalmente, fotografias de portfólio.</p>

        <h2>3. Para que os usamos</h2>
        <p>Para processar pedidos de orçamento, atribuir pedidos a profissionais verificados na zona indicada, verificar a identidade e atividade de profissionais candidatos, e comunicar sobre o estado do pedido/inscrição. Não vendemos nem cedemos os seus dados a terceiros para fins comerciais.</p>

        <h2>4. Partilha de contactos entre as partes</h2>
        <p>Os contactos diretos de um profissional só são partilhados com um cliente (e vice-versa) depois de um pedido de orçamento ter sido confirmado e atribuído através da plataforma. Documentos de verificação de profissionais nunca são publicados.</p>

        <h2>5. Fundamento</h2>
        <p>O seu consentimento, dado no formulário (artigo 6.º, n.º 1, alínea a) do RGPD) e, no caso de profissionais aprovados, a execução do contrato de parceria.</p>

        <h2>6. Durante quanto tempo</h2>
        <p>Pedidos de clientes: até 24 meses após o pedido, salvo obrigação legal de conservação. Dados de profissionais: enquanto a parceria estiver ativa e até 5 anos após o termo, para efeitos fiscais/legais.</p>

        <h2>7. Onde ficam os dados</h2>
        <p>Em servidores da Supabase, na União Europeia (Irlanda).</p>

        <h2>8. Os seus direitos</h2>
        <p>Pode pedir acesso, retificação, apagamento, limitação ou portabilidade dos seus dados, ou opor-se ao tratamento, escrevendo para <a href="mailto:geral@pintura360.pt">geral@pintura360.pt</a>. Pode também apresentar reclamação à Comissão Nacional de Proteção de Dados (CNPD), www.cnpd.pt.</p>

        <h2>9. Cookies</h2>
        <p>Consulte a nossa <a href="/cookies">Política de Cookies</a> para mais informação.</p>
      </div>
    </section>
  );
}
