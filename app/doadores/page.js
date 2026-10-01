'use client';

import { useCallback, useEffect, useState } from 'react';
import Link from 'next/link';
import DoadorCard from '@/components/DoadorCard';
import Aviso from '@/components/Aviso';
import { lerAvisoSalvo } from '@/lib/aviso';
import { TIPOS_SANGUINEOS } from '@/lib/regras';

export default function ListaDoadores() {
  const [doadores, setDoadores] = useState(null); // null = carregando
  const [aviso, setAviso] = useState(null);
  const [tipoFiltro, setTipoFiltro] = useState('');
  const [cidadeFiltro, setCidadeFiltro] = useState('');
  const [busca, setBusca] = useState('');
  const [admin, setAdmin] = useState(false);

  const carregar = useCallback(async () => {
    try {
      const resposta = await fetch('/api/doadores');
      const dados = await resposta.json();
      if (!resposta.ok) throw new Error(dados.erro || 'Não foi possível carregar a lista.');
      setDoadores(dados.doadores);
    } catch (e) {
      setAviso({ tipo: 'erro', texto: e.message });
      setDoadores([]);
    }
  }, []);

  useEffect(() => {
    // Aviso deixado por outra tela (ex.: "Cadastro removido.").
    const salvo = lerAvisoSalvo();
    if (salvo) setAviso(salvo);
    carregar();
    fetch('/api/admin')
      .then((r) => r.json())
      .then((d) => setAdmin(d.admin === true))
      .catch(() => {});
  }, [carregar]);

  function aoExcluir(id) {
    setDoadores((atuais) => (atuais || []).filter((d) => d.id !== id));
    setAviso({ tipo: 'ok', texto: 'Cadastro excluído.' });
  }

  if (doadores === null) {
    return <p>Carregando a lista…</p>;
  }

  // Os filtros funcionam na hora, enquanto a pessoa digita.
  const filtrados = doadores.filter((d) => {
    if (tipoFiltro && d.tipoSanguineo !== tipoFiltro) return false;
    if (cidadeFiltro && !(d.cidade || '').toLowerCase().includes(cidadeFiltro.toLowerCase())) return false;
    if (busca && !`${d.nome} ${d.bairro || ''}`.toLowerCase().includes(busca.toLowerCase())) return false;
    return true;
  });

  return (
    <div>
      <div className="titulo-pagina">
        <h1>Doadores cadastrados</h1>
        <p>
          Veja quem já se cadastrou. Para falar com alguém, use a página “Preciso de sangue”.
        </p>
      </div>

      <div className="botoes" style={{ marginTop: 0, marginBottom: '1.8rem' }}>
        <Link className="btn" href="/cadastro">
          Cadastrar um doador
        </Link>
      </div>

      <Aviso aviso={aviso} aoFechar={() => setAviso(null)} />

      <div className="filtros">
        <div className="campo">
          <label htmlFor="busca">Nome ou bairro</label>
          <input
            id="busca"
            value={busca}
            onChange={(e) => setBusca(e.target.value)}
            placeholder="Digite parte do nome"
          />
        </div>
        <div className="campo">
          <label htmlFor="filtroTipo">Tipo sanguíneo</label>
          <select id="filtroTipo" value={tipoFiltro} onChange={(e) => setTipoFiltro(e.target.value)}>
            <option value="">Todos os tipos</option>
            {TIPOS_SANGUINEOS.map((t) => (
              <option key={t} value={t}>
                {t}
              </option>
            ))}
          </select>
        </div>
        <div className="campo">
          <label htmlFor="filtroCidade">Cidade</label>
          <input
            id="filtroCidade"
            value={cidadeFiltro}
            onChange={(e) => setCidadeFiltro(e.target.value)}
            placeholder="Ex.: Recife"
          />
        </div>
      </div>

      <p aria-live="polite">
        <strong>
          Mostrando {filtrados.length} de {doadores.length}
        </strong>{' '}
        {doadores.length === 1 ? 'cadastro' : 'cadastros'}.
      </p>

      {filtrados.length === 0 ? (
        <div className="vazio">
          <p>
            <strong>Ninguém encontrado com esses filtros.</strong>
          </p>
          <p>
            Apague os filtros ou <Link href="/cadastro">faça o primeiro cadastro</Link>.
          </p>
        </div>
      ) : (
        <div className="lista-doadores">
          {filtrados.map((d) => (
            <DoadorCard
              key={d.id}
              doador={d}
              podeGerenciar={admin}
              podeExcluir={admin}
              mostrarContato={false}
              aoExcluir={aoExcluir}
              aoErro={(texto) => setAviso({ tipo: 'erro', texto })}
            />
          ))}
        </div>
      )}
    </div>
  );
}
