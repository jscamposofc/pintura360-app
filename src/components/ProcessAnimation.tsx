const STAGES = [
  {
    key: "pedido",
    title: "Pedido",
    desc: "Descreve o projeto em menos de 2 minutos.",
    icon: (
      <path d="M8 4h8a2 2 0 0 1 2 2v12a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2Z M9 3h6v3H9z M9 10h6 M9 13h6 M9 16h3" />
    ),
  },
  {
    key: "verificacao",
    title: "Verificação",
    desc: "Atribuído a um profissional aprovado pela Pintura360.",
    icon: (
      <path d="M12 3 5 6v5c0 4.5 3 7.7 7 9 4-1.3 7-4.5 7-9V6l-7-3Z M9 12l2 2 4-4" />
    ),
  },
  {
    key: "trabalho",
    title: "Trabalho",
    desc: "A sua casa ganha cor, com acompanhamento até ao fim.",
    icon: (
      <path d="M3 8h9v4H3z M7 12v7a1 1 0 0 0 1 1h0a1 1 0 0 0 1-1v-3h0a1 1 0 0 0 1 1v2a1 1 0 0 0 1 1h0a1 1 0 0 0 1-1v-7 M14 8h3a2 2 0 0 1 2 2v1a2 2 0 0 1-2 2h-1" />
    ),
  },
  {
    key: "concluido",
    title: "Concluído",
    desc: "Confirma o serviço e fica tudo registado.",
    icon: (
      <path d="M12 21a9 9 0 1 0 0-18 9 9 0 0 0 0 18Z M8.5 12.5l2.3 2.3 4.7-4.8" />
    ),
  },
];

export default function ProcessAnimation() {
  return (
    <div className="process-anim" role="img" aria-label="Animação: pedido, verificação, trabalho e conclusão do serviço de pintura">
      <div className="process-anim-track">
        <svg className="process-anim-line" viewBox="0 0 400 4" preserveAspectRatio="none" aria-hidden="true">
          <line x1="0" y1="2" x2="400" y2="2" />
        </svg>
        <div className="process-anim-dot" aria-hidden="true" />
        {STAGES.map((s, i) => (
          <div className={`process-stage process-stage-${i + 1}`} key={s.key}>
            <div className="process-stage-ring">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
                {s.icon}
              </svg>
            </div>
            <div className="process-stage-caption">
              <strong>{s.title}</strong>
              <span>{s.desc}</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
