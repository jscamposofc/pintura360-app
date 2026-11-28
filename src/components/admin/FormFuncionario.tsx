"use client";

import { useState } from "react";
import { CARGOS, PERMISSOES, TODAS, type Permissao } from "@/lib/equipa";
import { criarFuncionario } from "@/lib/actions/equipa";

// Novo funcionário: escolher um cargo marca as funções sugeridas; pode ajustá-las à mão.
export default function FormFuncionario() {
  const [cargo, setCargo] = useState(CARGOS[2].cargo);
  const [personalizado, setPersonalizado] = useState("");
  const [perms, setPerms] = useState<Permissao[]>(CARGOS[2].permissoes);

  function escolherCargo(c: string) {
    setCargo(c);
    const preset = CARGOS.find((x) => x.cargo === c);
    if (preset) setPerms(preset.permissoes);
  }
  function alternar(p: Permissao) {
    setPerms((atual) => (atual.includes(p) ? atual.filter((x) => x !== p) : [...atual, p]));
  }
  const cargoFinal = cargo === "__outro" ? personalizado : cargo;

  return (
    <form action={criarFuncionario} className="adm-card adm-form">
      <h2>Novo funcionário</h2>
      <div className="adm-grid-2">
        <div><label htmlFor="f-nome">Nome</label><input id="f-nome" name="nome" required /></div>
        <div><label htmlFor="f-tel">Telemóvel (opcional)</label><input id="f-tel" name="telefone" type="tel" /></div>
      </div>
      <div className="adm-grid-2">
        <div><label htmlFor="f-email">Email de acesso</label><input id="f-email" name="email" type="email" autoComplete="off" required /></div>
        <div><label htmlFor="f-pass">Palavra-passe inicial (mín. 10)</label><input id="f-pass" name="password" type="text" autoComplete="new-password" minLength={10} required /></div>
      </div>

      <label>Cargo</label>
      <div className="adm-cargos">
        {CARGOS.map((c) => (
          <button type="button" key={c.cargo} className={cargo === c.cargo ? "on" : ""} onClick={() => escolherCargo(c.cargo)}>
            <strong>{c.cargo}</strong>
            <small>{c.desc}</small>
          </button>
        ))}
        <button type="button" className={cargo === "__outro" ? "on" : ""} onClick={() => setCargo("__outro")}>
          <strong>Outro cargo</strong>
          <small>Escreva o nome do cargo e escolha as funções.</small>
        </button>
      </div>
      {cargo === "__outro" && (
        <input placeholder="Nome do cargo (ex.: Coordenador de obra)" value={personalizado} onChange={(e) => setPersonalizado(e.target.value)} required />
      )}
      <input type="hidden" name="cargo" value={cargoFinal} />

      <label>Funções</label>
      <div className="adm-perms">
        {TODAS.map((p) => (
          <label key={p} className={perms.includes(p) ? "on" : ""}>
            <input type="checkbox" name="permissoes" value={p} checked={perms.includes(p)} onChange={() => alternar(p)} />
            <span><strong>{PERMISSOES[p].label}</strong><small>{PERMISSOES[p].desc}</small></span>
          </label>
        ))}
      </div>
      <button type="submit" className="btn btn-orange">Criar funcionário</button>
      <p className="adm-muted" style={{ marginTop: 10, fontSize: 12 }}>
        O funcionário entra em <strong>/admin/login</strong> com este email e palavra-passe, e depois pode alterá-la em &ldquo;A minha conta&rdquo;.
      </p>
    </form>
  );
}
