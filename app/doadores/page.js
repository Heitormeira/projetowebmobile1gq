'use client';

import { useCallback, useEffect, useState } from 'react';
import Link from 'next/link';
import DoadorCard, { BadgeTipo, BadgeDisponibilidade } from '@/components/DoadorCard';
import { TIPOS_SANGUINEOS } from '@/lib/regras';

export default function ListaDoadores() {
  const [doadores, setDoadores] = useState(null); // null = carregando
  const [erro, setErro] = useState('');
  const [tipoFiltro, setTipoFiltro] = useState('');
  const [cidadeFiltro, setCidadeFiltro] = useState('');
  const [busca, setBusca] = useState('');
  const [visao, setVisao] = useState('tabela'); // 'tabela' | 'cards'

  const carregar = useCallback(async () => {
    setErro('');
    try {
      const resposta = await fetch('/api/doadores');
      const dados = await resposta.json();
      if (!resposta.ok) throw new Error(dados.erro || 'Falha ao carregar doadores.');
      setDoadores(dados.doadores);
    } catch (e) {
      setErro(e.message);
      setDoadores([]);
    }
  }, []);

  useEffect(() => {
    carregar();
  }, [carregar]);

  function aoExcluir(id) {
    setDoadores((atuais) => (atuais || []).filter((d) => d.id !== id));
  }

  if (doadores === null) {
    return <p className="contador-resultados">Carregando doadores…</p>;
  }

  // Filtros client-side complementares (o READ completo vem da API).
  const filtrados = doadores.filter((d) => {
    if (tipoFiltro && d.tipoSanguineo !== tipoFiltro) return false;
    if (cidadeFiltro && !(d.cidade || '').toLowerCase().includes(cidadeFiltro.toLowerCase())) return false;
    if (busca && !`${d.nome} ${d.bairro || ''}`.toLowerCase().includes(busca.toLowerCase())) return false;
    return true;
  });

  return (
    <div>
      <div className="cabecalho-pagina">
        <div>
          <h1>Doadores cadastrados</h1>
          <p>Listagem completa — o “R” do CRUD, direto do Back4App.</p>
        </div>
        <Link className="btn btn-primario" href="/cadastro">+ Cadastrar doador</Link>
      </div>

      <div className="card formulario">
        <div className="busca-grid">
          <div className="campo">
            <label htmlFor="busca">Buscar por nome/bairro</label>
            <input
              id="busca"
              value={busca}
              onChange={(e) => setBusca(e.target.value)}
              placeholder="Digite parte do nome…"
            />
          </div>
          <div className="campo">
            <label htmlFor="filtroTipo">Tipo sanguíneo</label>
            <select id="filtroTipo" value={tipoFiltro} onChange={(e) => setTipoFiltro(e.target.value)}>
              <option value="">Todos</option>
              {TIPOS_SANGUINEOS.map((t) => (
                <option key={t} value={t}>{t}</option>
              ))}
            </select>
          </div>
          <div className="campo">
            <label htmlFor="filtroCidade">Cidade contém</label>
            <input
              id="filtroCidade"
              value={cidadeFiltro}
              onChange={(e) => setCidadeFiltro(e.target.value)}
              placeholder="Ex.: Recife"
            />
          </div>
          <div className="campo">
            <button
              type="button"
              className="btn btn-neutro"
              onClick={() => setVisao((v) => (v === 'tabela' ? 'cards' : 'tabela'))}
            >
              {visao === 'tabela' ? '▦ Ver como cards' : '☰ Ver como tabela'}
            </button>
            <button
              type="button"
              className="btn btn-neutro"
              onClick={carregar}
              title="Recarregar do Back4App"
            >
              ↻ Atualizar
            </button>
          </div>
        </div>
      </div>

      {erro && <p className="alerta-erro" role="alert">{erro}</p>}

      <p className="contador-resultados">
        {filtrados.length} de {doadores.length} doador(es) exibido(s).
      </p>

      {filtrados.length === 0 ? (
        <div className="vazio">
          <p><strong>Nenhum doador encontrado com esses filtros.</strong></p>
          <p>Limpe os filtros ou <Link href="/cadastro">cadastre o primeiro doador</Link>.</p>
        </div>
      ) : visao === 'tabela' ? (
        <div className="tabela-wrap">
          <table className="tabela">
            <thead>
              <tr>
                <th>Nome</th>
                <th>Tipo</th>
                <th>Sexo</th>
                <th>Cidade/UF</th>
                <th>Bairro</th>
                <th>Última doação</th>
                <th>Status</th>
                <th className="col-acoes">Ações</th>
              </tr>
            </thead>
            <tbody>
              {filtrados.map((d) => (
                <tr key={d.id}>
                  <td>{d.nome}</td>
                  <td><BadgeTipo tipo={d.tipoSanguineo} /></td>
                  <td>{d.sexo ? (d.sexo === 'masculino' ? 'M' : 'F') : '—'}</td>
                  <td>{[d.cidade, d.uf].filter(Boolean).join('/') || '—'}</td>
                  <td>{d.bairro || '—'}</td>
                  <td>{d.ultimaDoacao || '—'}</td>
                  <td><BadgeDisponibilidade doador={d} /></td>
                  <td className="col-acoes">
                    <Link className="btn btn-neutro" href={`/doadores/${d.id}/editar`}>Editar</Link>
                    <ExcluirBotao id={d.id} aoExcluir={aoExcluir} />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : (
        <div className="grade-resultados">
          {filtrados.map((d) => (
            <DoadorCard key={d.id} doador={d} podeGerenciar />
          ))}
        </div>
      )}
    </div>
  );
}

function ExcluirBotao({ id, aoExcluir }) {
  const [confirmando, setConfirmando] = useState(false);
  const [excluindo, setExcluindo] = useState(false);

  async function excluir() {
    if (!confirmando) {
      setConfirmando(true);
      return;
    }
    setExcluindo(true);
    try {
      const resposta = await fetch(`/api/doadores/${id}`, { method: 'DELETE' });
      const dados = await resposta.json();
      if (!resposta.ok) throw new Error(dados.erro || 'Falha ao remover.');
      aoExcluir(id);
    } catch (e) {
      alert(`Não foi possível remover: ${e.message}`);
      setExcluindo(false);
      setConfirmando(false);
    }
  }

  return (
    <button
      type="button"
      className={`btn ${confirmando ? 'btn-perigo' : 'btn-neutro'}`}
      onClick={excluir}
      disabled={excluindo}
    >
      {excluindo ? 'Removendo…' : confirmando ? 'Confirmar?' : 'Excluir'}
    </button>
  );
}
