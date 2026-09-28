'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { TIPOS_SANGUINEOS } from '@/lib/regras';
import CampoCep from './CampoCep';

const vaziosIniciais = {
  nome: '',
  tipoSanguineo: '',
  sexo: '',
  cep: '',
  bairro: '',
  telefoneContato: '',
  ultimaDoacao: '',
  disponivel: true,
};

/**
 * Formulário completo de doador.
 * - modo 'criar'  → POST   /api/doadores        (CREATE)
 * - modo 'editar' → PUT    /api/doadores/[id]   (UPDATE)
 */
export default function FormularioDoador({ modo = 'criar', doadorInicial = null, idDoador = null }) {
  const router = useRouter();
  const [valores, setValores] = useState(() => (doadorInicial ? { ...vaziosIniciais, ...doadorInicial } : vaziosIniciais));
  const [enviando, setEnviando] = useState(false);
  const [erro, setErro] = useState('');

  function atualizar(novos) {
    setValores((atuais) => ({ ...atuais, ...novos }));
  }

  async function enviar(evento) {
    evento.preventDefault();
    setErro('');
    setEnviando(true);

    try {
      const url = modo === 'editar' ? `/api/doadores/${idDoador}` : '/api/doadores';
      const resposta = await fetch(url, {
        method: modo === 'editar' ? 'PUT' : 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          nome: valores.nome,
          tipoSanguineo: valores.tipoSanguineo,
          sexo: valores.sexo,
          cep: valores.cep,
          bairro: valores.bairro,
          telefoneContato: valores.telefoneContato,
          ultimaDoacao: valores.ultimaDoacao || null,
          disponivel: valores.disponivel,
        }),
      });

      const dados = await resposta.json();
      if (!resposta.ok) throw new Error(dados.erro || 'Falha ao salvar.');

      alert(
        modo === 'editar'
          ? 'Dados atualizados com sucesso!'
          : `Cadastro criado! Seu código para edição é: ${dados.id}`
      );
      router.push('/doadores');
    } catch (e) {
      setErro(e.message);
    } finally {
      setEnviando(false);
    }
  }

  return (
    <form className="formulario" onSubmit={enviar}>
      <div className="linha">
        <div className="campo campo-largo">
          <label htmlFor="nome">Nome completo *</label>
          <input
            id="nome"
            name="nome"
            value={valores.nome}
            onChange={(e) => atualizar({ nome: e.target.value })}
            placeholder="Ex.: Maria Silva"
            required
            minLength={3}
          />
        </div>
      </div>

      <div className="linha linha-3">
        <div className="campo">
          <label htmlFor="tipoSanguineo">Seu tipo sanguíneo *</label>
          <select
            id="tipoSanguineo"
            name="tipoSanguineo"
            value={valores.tipoSanguineo}
            onChange={(e) => atualizar({ tipoSanguineo: e.target.value })}
            required
          >
            <option value="">Selecione…</option>
            {TIPOS_SANGUINEOS.map((t) => (
              <option key={t} value={t}>{t}</option>
            ))}
          </select>
        </div>

        <div className="campo">
          <label htmlFor="sexo">Sexo (para a carência)</label>
          <select id="sexo" name="sexo" value={valores.sexo} onChange={(e) => atualizar({ sexo: e.target.value })}>
            <option value="">Prefiro não informar</option>
            <option value="masculino">Masculino</option>
            <option value="feminino">Feminino</option>
          </select>
        </div>

        <CampoCep value={valores.cep} onChange={atualizar} />
      </div>

      <div className="linha linha-2">
        <div className="campo">
          <label htmlFor="bairro">Bairro</label>
          <input
            id="bairro"
            name="bairro"
            value={valores.bairro}
            onChange={(e) => atualizar({ bairro: e.target.value })}
            placeholder="Preenchido pelo ViaCEP — pode ajustar"
          />
        </div>

        <div className="campo">
          <label htmlFor="telefoneContato">Telefone / WhatsApp *</label>
          <input
            id="telefoneContato"
            name="telefoneContato"
            inputMode="tel"
            value={valores.telefoneContato}
            onChange={(e) => atualizar({ telefoneContato: e.target.value })}
            placeholder="(81) 99999-9999"
            required
          />
        </div>
      </div>

      <div className="linha linha-2">
        <div className="campo">
          <label htmlFor="ultimaDoacao">Data da última doação</label>
          <input
            id="ultimaDoacao"
            name="ultimaDoacao"
            type="date"
            value={valores.ultimaDoacao}
            onChange={(e) => atualizar({ ultimaDoacao: e.target.value })}
          />
          <small className="dica">Deixe vazio se nunca doou.</small>
        </div>

        <div className="campo campo-check">
          <label className="rotulo-check">
            <input
              type="checkbox"
              checked={valores.disponivel}
              onChange={(e) => atualizar({ disponivel: e.target.checked })}
            />
            Estou disponível para doar
          </label>
          <small className="dica">
            Mesmo marcando “disponível”, você fica oculto nas buscas durante o período de
            carência (60 dias homens / 90 dias mulheres) após a última doação.
          </small>
        </div>
      </div>

      {erro && <p className="alerta-erro" role="alert">{erro}</p>}

      <div className="acoes-form">
        <button className="btn btn-primario" type="submit" disabled={enviando}>
          {enviando ? 'Salvando…' : modo === 'editar' ? 'Salvar alterações' : 'Cadastrar como doador'}
        </button>
      </div>
    </form>
  );
}
