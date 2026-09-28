'use client';

import { useState } from 'react';
import Link from 'next/link';
import { TIPOS_SANGUINEOS, tiposCompativeisCom } from '@/lib/regras';
import DoadorCard from '@/components/DoadorCard';

export default function BuscarDoadores() {
  const [tipoReceptor, setTipoReceptor] = useState('');
  const [cidade, setCidade] = useState('');
  const [bairro, setBairro] = useState('');
  const [cepOrigem, setCepOrigem] = useState('');
  const [resultados, setResultados] = useState(null); // null = ainda não buscou
  const [carregando, setCarregando] = useState(false);
  const [erro, setErro] = useState('');

  async function buscar(evento) {
    evento.preventDefault();
    setErro('');
    setCarregando(true);

    try {
      const parametros = new URLSearchParams();
      if (tipoReceptor) parametros.set('tipoReceptor', tipoReceptor);
      if (cidade.trim()) parametros.set('cidade', cidade.trim());
      if (bairro.trim()) parametros.set('bairro', bairro.trim());
      if (cepOrigem.replace(/\D/g, '').length === 8) {
        parametros.set('cepOrigem', cepOrigem.replace(/\D/g, ''));
      }
      parametros.set('apenasDisponiveis', 'true');

      const resposta = await fetch(`/api/doadores?${parametros.toString()}`);
      const dados = await resposta.json();
      if (!resposta.ok) throw new Error(dados.erro || 'Falha na busca.');

      setResultados(dados.doadores);
    } catch (e) {
      setErro(e.message);
      setResultados(null);
    } finally {
      setCarregando(false);
    }
  }

  const compativeis = tipoReceptor ? tiposCompativeisCom(tipoReceptor) : null;
  const maisProximo = resultados && resultados.length > 0 ? resultados[0] : null;
  const temDistancias = resultados?.some((d) => d.distanciaKm != null);

  return (
    <div>
      <div className="cabecalho-pagina">
        <div>
          <h1>🩸 Preciso de sangue</h1>
          <p>Informe o tipo que você precisa receber e onde procura o doador.</p>
        </div>
      </div>

      <form className="card formulario" onSubmit={buscar}>
        <div className="busca-grid">
          <div className="campo">
            <label htmlFor="tipoReceptor">Seu tipo sanguíneo (receptor) *</label>
            <select
              id="tipoReceptor"
              value={tipoReceptor}
              onChange={(e) => setTipoReceptor(e.target.value)}
              required
            >
              <option value="">Selecione…</option>
              {TIPOS_SANGUINEOS.map((t) => (
                <option key={t} value={t}>{t}</option>
              ))}
            </select>
          </div>

          <div className="campo">
            <label htmlFor="cepOrigem">Seu CEP (opcional)</label>
            <input
              id="cepOrigem"
              inputMode="numeric"
              value={cepOrigem}
              onChange={(e) => setCepOrigem(e.target.value)}
              placeholder="00000-000 — ordena por distância"
            />
            <small className="dica">Usa Nominatim/OpenStreetMap + fórmula de Haversine.</small>
          </div>

          <div className="campo">
            <label htmlFor="cidade">Cidade</label>
            <input
              id="cidade"
              value={cidade}
              onChange={(e) => setCidade(e.target.value)}
              placeholder="Ex.: Recife (opcional)"
            />
          </div>

          <div className="campo">
            <label htmlFor="bairro">Bairro</label>
            <input
              id="bairro"
              value={bairro}
              onChange={(e) => setBairro(e.target.value)}
              placeholder="Filtro opcional"
            />
          </div>

          <div className="campo">
            <button className="btn btn-primario" type="submit" disabled={carregando}>
              {carregando ? 'Buscando…' : 'Buscar doadores'}
            </button>
          </div>
        </div>

        {compativeis && (
          <p className="alerta-info" style={{ margin: 0 }}>
            Compatíveis com <strong>{tipoReceptor}</strong>: {compativeis.join(', ')} —
            a busca já considera disponibilidade e carência entre doações.
          </p>
        )}

        {erro && <p className="alerta-erro" role="alert">{erro}</p>}
      </form>

      {resultados !== null && (
        <>
          <p className="contador-resultados">
            {resultados.length === 0
              ? 'Nenhum doador encontrado'
              : `${resultados.length} doador(es) compatível(is) e disponível(is)`}
            {cidade.trim() ? ` em ${cidade.trim()}` : ''}
            {temDistancias ? ' — ordenados pela distância do seu CEP' : ''}.
          </p>

          {maisProximo && maisProximo.latitude != null && (
            <div className="card mapa-card">
              <h2>Doador mais próximo{maisProximo.distanciaKm != null ? ` (~${maisProximo.distanciaKm} km)` : ''}</h2>
              <iframe
                title="Mapa do doador mais próximo (OpenStreetMap)"
                className="mapa-embed"
                src={`https://www.openstreetmap.org/export/embed.html?bbox=${
                  maisProximo.longitude - 0.02
                }%2C${maisProximo.latitude - 0.02}%2C${maisProximo.longitude + 0.02}%2C${
                  maisProximo.latitude + 0.02
                }&layer=mapnik&marker=${maisProximo.latitude}%2C${maisProximo.longitude}`}
                loading="lazy"
              />
            </div>
          )}

          {resultados.length === 0 ? (
            <div className="vazio">
              <p><strong>Nenhum doador compatível encontrado agora.</strong></p>
              <p>Tente remover o filtro de cidade/bairro para ampliar a busca.</p>
            </div>
          ) : (
            <div className="grade-resultados">
              {resultados.map((d) => (
                <DoadorCard key={d.id} doador={d} />
              ))}
            </div>
          )}
        </>
      )}

      {resultados === null && !carregando && (
        <div className="vazio">
          <p>Selecione seu tipo sanguíneo e clique em <strong>Buscar doadores</strong>.</p>
          <p>
            É doador e quer aparecer nas buscas?{' '}
            <Link href="/cadastro">Cadastre-se aqui</Link>.
          </p>
        </div>
      )}
    </div>
  );
}
