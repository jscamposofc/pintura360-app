import Link from "next/link";

// Rodapé do site original (pintura360.pt).
export default function Footer() {
  const year = new Date().getFullYear();
  return (
    <footer id="contactos">
      <div className="wrap">
        <div className="footer-top">
          <div>
            <div className="footer-brand">
              <img src="/logo.png" alt="Pintura360" className="footer-logo-img" />
            </div>
            <p className="footer-desc">
              Empresa de pintura profissional na Grande Lisboa. Qualidade, confiança e compromisso em cada detalhe.
            </p>
          </div>
          <div className="footer-col">
            <h4>Navegação</h4>
            <ul>
              <li><Link href="/#inicio">Início</Link></li>
              <li><Link href="/#sobre">Sobre Nós</Link></li>
              <li><Link href="/como-funciona">Como Funciona</Link></li>
              <li><Link href="/#projetos">Projetos</Link></li>
              <li><Link href="/trabalhe-connosco">Para Profissionais</Link></li>
            </ul>
          </div>
          <div className="footer-col">
            <h4>Serviços</h4>
            <ul>
              <li><Link href="/#orcamento">Pintura Interior</Link></li>
              <li><Link href="/#orcamento">Pintura Exterior</Link></li>
              <li><Link href="/#orcamento">Pintura Comercial</Link></li>
              <li><Link href="/#orcamento">Calculadora</Link></li>
            </ul>
          </div>
          <div className="footer-col">
            <h4>Contactos</h4>
            <ul>
              <li><a href="https://wa.me/351928358968" target="_blank" rel="noopener noreferrer">+351 928 358 968</a></li>
              <li><Link href="/#orcamento">Pedir orçamento</Link></li>
              <li style={{ color: "var(--muted-dim)", fontSize: 12 }}>NIF: 519224809 · Grande Lisboa</li>
            </ul>
          </div>
        </div>
        <div className="footer-bottom">
          <p>© {year} Pintura360. Todos os direitos reservados.</p>
          <p className="footer-legal">
            <Link href="/privacidade">Política de Privacidade</Link>
            <Link href="/cookies">Política de Cookies</Link>
            <Link href="/termos">Termos e Condições</Link>
          </p>
        </div>
      </div>
    </footer>
  );
}
