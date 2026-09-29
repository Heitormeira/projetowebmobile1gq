'use client';

import { useEffect, useState } from 'react';

/**
 * Lista de hemocentros perto de quem está buscando.
 * origem: { lat, lng } (localização do aparelho) ou { cep } (8 dígitos) ou null.
 * Consulta /api/hemocentros, que usa o OpenStreetMap (Overpass API).
 */
export default function Hemocentros({ origem }) {
  const [estado, setEstado] = useState({ carregando: false, erro: '', lista: null, fonte: '' });

  const chave = origem ? (origem.cep ? `cep:${origem.cep}` : `gps:${origem.lat},${origem.lng}`) : '';

  useEffect(() => {
    if (!origem) {
      setEstado({ carregando: false, erro: '', lista: null, fonte: '' });
      return undefined;
    }

    let ativo = true;
    setEstado({ carregando: true, erro: '', lista: null, fonte: '' });

    const parametros = origem.cep
      ? `cep=${origem.cep}`
      : `lat=${origem.lat}&lng=${origem.lng}`;

    fetch(`/api/hemocentros?${parametros}`)
      .then(async (r) => {
        const dados = await r.json();
        if (!r.ok) throw new Error(dados.erro || 'Não foi possível buscar os hemocentros agora.');
        return dados;
      })
      .then(
        (dados) =>
          ativo && setEstado({ carregando: false, erro: '', lista: dados.hemocentros, fonte: dados.fonte })
      )
      .catch((e) => ativo && setEstado({ carregando: false, erro: e.message, lista: null, fonte: '' }));

    return () => {
      ativo = false;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [chave]);

  return (
    <section className="secao" aria-live="polite">
      <h2>Hemocentros perto de você</h2>

      {!origem && (
        <p className="dica">
          Para ver os hemocentros mais próximos, digite o seu CEP ou toque em “Usar minha
          localização” e busque de novo.
        </p>
      )}

      {estado.carregando && <p>Procurando hemocentros…</p>}

      {estado.erro && (
        <div className="vazio">
          <p>
            <strong>{estado.erro}</strong>
          </p>
        </div>
      )}

      {estado.lista && estado.lista.length === 0 && estado.fonte === 'indisponivel' && (
        <div className="vazio">
          <p>
            <strong>Não conseguimos consultar o mapa agora.</strong>
          </p>
          <p>Espere um pouco e busque de novo.</p>
        </div>
      )}

      {estado.lista && estado.lista.length === 0 && estado.fonte !== 'indisponivel' && (
        <div className="vazio">
          <p>
            <strong>Não encontramos hemocentros cadastrados no mapa perto de você.</strong>
          </p>
          <p>
            Procure no{' '}
            <a
              href="https://www.openstreetmap.org/search?query=hemocentro"
              target="_blank"
              rel="noopener noreferrer"
            >
              mapa
            </a>{' '}
            ou pergunte no posto de saúde da sua região.
          </p>
        </div>
      )}

      {estado.lista && estado.lista.length > 0 && (
        <>
          <div className="lista-doadores">
            {estado.lista.map((h, i) => (
              <article className="doador" key={`${h.latitude},${h.longitude},${i}`}>
                <h3 className="doador-nome">{h.nome}</h3>
                <dl className="dados">
                  <div>
                    <dt>Distância</dt>
                    <dd>cerca de {String(h.distanciaKm).replace('.', ',')} km</dd>
                  </div>
                  {h.endereco && (
                    <div>
                      <dt>Endereço</dt>
                      <dd>{h.endereco}</dd>
                    </div>
                  )}
                  {h.horario && (
                    <div>
                      <dt>Horário</dt>
                      <dd>{h.horario}</dd>
                    </div>
                  )}
                  {h.telefone && (
                    <div>
                      <dt>Telefone</dt>
                      <dd className="telefone">{h.telefone}</dd>
                    </div>
                  )}
                </dl>
                <div className="acoes">
                  <a className="btn btn-neutro" href={h.linkMapa} target="_blank" rel="noopener noreferrer">
                    Ver no mapa
                  </a>
                  {h.telefone && (
                    <a className="btn btn-neutro" href={`tel:${h.telefone.replace(/[^\d+]/g, '')}`}>
                      Ligar agora
                    </a>
                  )}
                </div>
              </article>
            ))}
          </div>
          <p className="dica" style={{ marginTop: '1rem' }}>
            Dados do OpenStreetMap, feitos pela comunidade. Confirme o endereço e o horário por
            telefone antes de ir.
          </p>
        </>
      )}
    </section>
  );
}
