import Link from "next/link";

export default function Footer() {
  const year = new Date().getFullYear();
  return (
    <footer className="site-footer" id="contactos">
      <div className="container footer-grid">
        <div>
          <div className="footer-logo"><img src="/logo.png" alt="Pintura360" /></div>
          <p style={{ fontSize: ".88rem", maxWidth: 280 }}>
            A plataforma que liga quem precisa de pintura a profissionais verificados em Portugal.
          </p>
        </div>
        <div>
          <h4>Navegação</h4>
          <ul>
            <li><Link href="/#como-funciona">Como funciona</Link></li>
            <li><Link href="/profissionais">Profissionais</Link></li>
            <li><Link href="/pedido-orcamento">Pedir orçamento</Link></li>
          </ul>
        </div>
        <div>
          <h4>Para Profissionais</h4>
          <ul>
            <li><Link href="/trabalhe-connosco">Inscrever a minha empresa</Link></li>
            <li><Link href="/termos">Termos para parceiros</Link></li>
          </ul>
        </div>
        <div>
          <h4>Contactos</h4>
          <ul>
            <li><a href="https://wa.me/351928358968" target="_blank" rel="noopener noreferrer">WhatsApp</a></li>
            <li><Link href="/privacidade">Política de Privacidade</Link></li>
            <li><Link href="/cookies">Cookies</Link></li>
            <li><Link href="/termos">Termos e Condições</Link></li>
          </ul>
        </div>
      </div>
      <div className="container footer-bottom">
        <span>© {year} Pintura360. Todos os direitos reservados.</span>
        <span>Grande Lisboa, Portugal</span>
      </div>
    </footer>
  );
}
