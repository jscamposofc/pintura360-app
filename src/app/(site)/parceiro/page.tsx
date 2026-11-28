import Link from "next/link";
import { redirect } from "next/navigation";
import { createAdminClient } from "@/lib/supabase/admin";
import { BUCKET_FOTOS } from "@/lib/storage";
import { getSessao, destinoDe } from "@/lib/conta";
import { sair } from "@/lib/actions/contas";
import FormInscricao from "@/components/FormInscricao";

export const metadata = { title: "Área de parceiro — Pintura360" };
export const dynamic = "force-dynamic";

const ESTADO_TRABALHO: Record<string, string> = {
  atribuido: "Atribuído — aguarda reserva do cliente",
  pago: "Reservado — sinal pago",
  concluido: "Concluído",
};
const DIV: Record<string, string> = {
  quartos: "Quartos", salas: "Salas", corredores: "Corredores", banhos: "Casas de banho",
  cozinhas: "Cozinhas", varandas: "Varandas", escadarias: "Escadarias",
};

type Trabalho = {
  id: number; created_at: string; referencia: string; servico: string; area_faturavel: number | null;
  divisoes_detalhe: Record<string, number> | null; estado_superficie: string | null; ocupacao: string | null;
  prazo: string | null; data_preferencial: string | null; morada: string | null; andar: string | null;
  elevador: string | null; codigo_postal: string | null; concelho: string; nome: string; telefone: string;
  plano: string | null; materials_included: boolean | null; status: string; fotos: string[] | null;
};

const fmt = new Intl.DateTimeFormat("pt-PT", { timeZone: "Europe/Lisbon", day: "2-digit", month: "short", year: "numeric" });

export default async function AreaParceiro({
  searchParams,
}: {
  searchParams: Promise<{ bemvindo?: string; inscrito?: string; erro?: string }>;
}) {
  const sp = await searchParams;
  const sessao = await getSessao();
  if (!sessao) redirect("/entrar?tipo=profissional");
  if (sessao.papel !== "profissional") redirect(destinoDe(sessao.papel));

  const supabase = createAdminClient();
  const { data: pro } = await supabase
    .from("profissionais")
    .select("id, nome, empresa, status, concelhos, servicos, created_at")
    .eq("user_id", sessao.id)
    .maybeSingle();

  let trabalhos: Trabalho[] = [];
  const fotosPorPedido = new Map<number, string[]>();
  if (pro?.status === "aprovado") {
    const { data } = await supabase
      .from("pedidos")
      .select("id, created_at, referencia, servico, area_faturavel, divisoes_detalhe, estado_superficie, ocupacao, prazo, data_preferencial, morada, andar, elevador, codigo_postal, concelho, nome, telefone, plano, materials_included, status, fotos")
      .eq("profissional_id", pro.id)
      .in("status", ["atribuido", "pago", "concluido"])
      .order("created_at", { ascending: false });
    trabalhos = (data ?? []) as Trabalho[];
    const todas = trabalhos.flatMap((t) => t.fotos ?? []);
    if (todas.length) {
      const { data: signed } = await supabase.storage.from(BUCKET_FOTOS).createSignedUrls(todas, 60 * 60);
      (signed ?? []).forEach((s) => {
        const id = Number(/pedido_(\d+)\//.exec(s.path ?? "")?.[1]);
        if (s.signedUrl && id) fotosPorPedido.set(id, [...(fotosPorPedido.get(id) ?? []), s.signedUrl]);
      });
    }
  }

  const primeiroNome = (pro?.nome || sessao.nome).split(" ")[0];

  return (
    <section className="conta-section">
      <div className="wrap conta-area">
        <div className="conta-area-head">
          <div>
            <p className="section-eyebrow">Área de parceiro</p>
            <h2>Olá{primeiroNome ? `, ${primeiroNome}` : ""}!</h2>
            <p className="conta-sub">{pro?.empresa ? `${pro.empresa} · ` : ""}{sessao.email}</p>
          </div>
          <div className="conta-area-acoes">
            <form action={sair}><button type="submit" className="btn btn-outline-navy">Terminar sessão</button></form>
          </div>
        </div>

        {sp.bemvindo && !pro && <div className="conta-ok">Conta criada. Falta só a inscrição da sua empresa — preencha o formulário abaixo.</div>}
        {sp.erro && <div className="conta-erro">Não foi possível submeter a inscrição. Verifique os dados (NIF com 9 dígitos, pelo menos um serviço) e tente novamente.</div>}

        {!pro && (
          <>
            <div className="conta-estado-box">
              <div className="conta-etapas">
                <div className="feito"><span>✓</span>Conta criada</div>
                <div className="atual"><span>2</span>Inscrição</div>
                <div><span>3</span>Verificação</div>
                <div><span>4</span>Receber trabalhos</div>
              </div>
            </div>
            <FormInscricao nome={sessao.nome} telefone={sessao.telefone} email={sessao.email} />
          </>
        )}

        {pro?.status === "pendente" && (
          <div className="conta-estado-box">
            <div className="conta-etapas">
              <div className="feito"><span>✓</span>Conta criada</div>
              <div className="feito"><span>✓</span>Inscrição</div>
              <div className="atual"><span>3</span>Verificação</div>
              <div><span>4</span>Receber trabalhos</div>
            </div>
            <h3>{sp.inscrito ? "Inscrição recebida — obrigado!" : "A sua inscrição está em análise"}</h3>
            <p>A nossa equipa está a verificar os seus dados (NIF, experiência e comprovativo). Normalmente demora até 48 horas. Quando for aprovado, os trabalhos atribuídos aparecem aqui.</p>
            <a className="btn btn-outline-navy" href="https://wa.me/351928358968?text=Ol%C3%A1!%20Inscrevi-me%20como%20parceiro%20Pintura360." target="_blank" rel="noopener noreferrer">Falar connosco no WhatsApp</a>
          </div>
        )}

        {pro?.status === "rejeitado" && (
          <div className="conta-estado-box">
            <h3>Inscrição não aprovada</h3>
            <p>Neste momento não foi possível aprovar a sua inscrição. Se quiser completar dados ou esclarecer alguma questão, fale connosco.</p>
            <a className="btn btn-outline-navy" href="https://wa.me/351928358968?text=Ol%C3%A1!%20Gostava%20de%20falar%20sobre%20a%20minha%20inscri%C3%A7%C3%A3o%20de%20parceiro." target="_blank" rel="noopener noreferrer">Falar connosco no WhatsApp</a>
          </div>
        )}

        {pro?.status === "aprovado" && (
          <>
            <div className="conta-ok">✓ Parceiro verificado · Zona: {pro.concelhos.join(", ")}</div>
            <h3 className="conta-h3">Os meus trabalhos</h3>
            {trabalhos.length === 0 ? (
              <div className="conta-vazio">
                <strong>Ainda não tem trabalhos atribuídos.</strong>
                <p>Quando atribuirmos um pedido na sua zona, recebe uma mensagem nossa e os detalhes aparecem aqui.</p>
              </div>
            ) : (
              <div className="conta-pedidos">
                {trabalhos.map((t) => {
                  const divs = Object.entries(t.divisoes_detalhe ?? {}).filter(([, v]) => v > 0).map(([k, v]) => `${v} ${DIV[k] ?? k}`).join(" · ");
                  const fotos = fotosPorPedido.get(t.id) ?? [];
                  const local = [t.morada, t.andar, t.codigo_postal, t.concelho].filter(Boolean).join(", ");
                  return (
                    <div className="conta-pedido" key={t.id}>
                      <div className="conta-pedido-top">
                        <div>
                          <span className="conta-ref">{t.referencia}</span>
                          <strong>{t.servico} · {t.area_faturavel ?? "—"} m²</strong>
                          <small>{t.concelho} · atribuído a partir de {fmt.format(new Date(t.created_at))}</small>
                        </div>
                        <span className={`conta-badge s-${t.status}`}>{ESTADO_TRABALHO[t.status] ?? t.status}</span>
                      </div>
                      <div className="conta-dl">
                        <div><span>Plano</span><strong>{t.plano ? t.plano[0].toUpperCase() + t.plano.slice(1) : "—"}</strong></div>
                        <div><span>Materiais</span><strong>{t.materials_included ? "Fornecidos pela Pintura360" : "Fornecidos pelo cliente"}</strong></div>
                        <div><span>Divisões</span><strong>{divs || "—"}</strong></div>
                        <div><span>Superfícies</span><strong>{t.estado_superficie ?? "—"}</strong></div>
                        <div><span>Imóvel</span><strong>{t.ocupacao ?? "—"}</strong></div>
                        <div><span>Prazo</span><strong>{t.prazo ?? "—"}{t.data_preferencial ? ` · ${fmt.format(new Date(t.data_preferencial))}` : ""}</strong></div>
                        <div><span>Morada</span><strong>{local || "—"}</strong></div>
                        <div><span>Elevador</span><strong>{t.elevador ?? "—"}</strong></div>
                        <div><span>Cliente</span><strong>{t.nome} · {t.telefone}</strong></div>
                      </div>
                      {fotos.length > 0 && (
                        <div className="conta-fotos">
                          {fotos.map((u, i) => <a key={u} href={u} target="_blank" rel="noopener noreferrer"><img src={u} alt={`Fotografia ${i + 1}`} /></a>)}
                        </div>
                      )}
                      <div className="conta-acoes-linha">
                        {local && <a href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(local + ", Portugal")}`} target="_blank" rel="noopener noreferrer">Abrir no mapa →</a>}
                        <a href={`https://wa.me/351928358968?text=${encodeURIComponent(`Olá! Sobre o trabalho ${t.referencia}:`)}`} target="_blank" rel="noopener noreferrer">Falar com a Pintura360 →</a>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </>
        )}

        <p className="conta-nota" style={{ marginTop: 30 }}>
          Dúvidas sobre como funciona a parceria? Veja <Link href="/trabalhe-connosco">Para Profissionais</Link>.
        </p>
      </div>
    </section>
  );
}
