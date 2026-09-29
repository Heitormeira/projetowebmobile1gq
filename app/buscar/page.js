'use client';

import { useEffect, useRef, useState } from 'react';
import Link from 'next/link';
import { tiposCompativeisCom } from '@/lib/regras';
import { mascararCep } from '@/lib/formatar';
import DoadorCard from '@/components/DoadorCard';
import SeletorTipo from '@/components/SeletorTipo';
import Aviso from '@/components/Aviso';
import Hemocentros from '@/components/Hemocentros';

export default function BuscarDoadores() {
  const [tipoReceptor, setTipoReceptor] = useState('');
  const [cidade, setCidade] = useState('');
  const [cepOrigem, setCepOrigem] = useState('');
  const [resultados, setResultados] = useState(null); // null = ainda não buscou
  const [carregando, setCarregando] = useState(false);
  const [erro, setErro] = useState('');
  const [coords, setCoords] = useState(null); // { lat, lng } do aparelho
  const [statusLocal, setStatusLocal] = useState({ tipo: '', texto: '' });
  const [buscandoLocal, setBuscandoLocal] = useState(false);
  const [origemBusca, setOrigemBusca] = useState(null); // origem usada na última busca
  const tituloResultados = useRef(null);

  // Depois da busca, leva a pessoa direto ao resultado (a tela do celular é comprida).
  // O foco vai para o título (leitores de tela leem o resultado) e a tela rola até ele,
  // sem animação para quem pediu menos movimento no aparelho.
  useEffect(() => {
    const titulo = tituloResultados.current;
    if (resultados === null || !titulo) return;
    titulo.focus({ preventScroll: true });
    const menosMovimento = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    titulo.scrollIntoView({ behavior: menosMovimento ? 'auto' : 'smooth', block: 'start' });
  }, [resultados]);

  function usarMinhaLocalizacao() {
    if (!navigator.geolocation) {
      setStatusLocal({ tipo: 'erro', texto: 'Este aparelho não consegue informar a localização. Digite o CEP.' });
      return;
    }
    setBuscandoLocal(true);
    setStatusLocal({ tipo: '', texto: 'Procurando onde você está…' });
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setCoords({ lat: pos.coords.latitude, lng: pos.coords.longitude });
        setStatusLocal({ tipo: 'ok', texto: 'Localização encontrada. Agora é só buscar.' });
        setBuscandoLocal(false);
      },
      (falha) => {
        const negou = falha.code === 1;
        setStatusLocal({
          tipo: 'erro',
          texto: negou
            ? 'Você não permitiu a localização. Sem problema: digite o seu CEP.'
            : 'Não deu para descobrir onde você está. Digite o seu CEP.',
        });
        setBuscandoLocal(false);
      },
      { enableHighAccuracy: false, timeout: 15000, maximumAge: 300000 }
    );
  }

  function naoUsarLocalizacao() {
    setCoords(null);
    setStatusLocal({ tipo: '', texto: '' });
  }

  async function buscar(evento) {
    evento.preventDefault();
    setErro('');

    if (!tipoReceptor) {
      setErro('Escolha primeiro o tipo sanguíneo de quem vai receber o sangue.');
      return;
    }

    setCarregando(true);
    try {
      const parametros = new URLSearchParams();
      parametros.set('tipoReceptor', tipoReceptor);
      if (cidade.trim()) parametros.set('cidade', cidade.trim());
      const cepDigitos = cepOrigem.replace(/\D/g, '');
      let origem = null;
      if (coords) {
        parametros.set('lat', String(coords.lat));
        parametros.set('lng', String(coords.lng));
        origem = { lat: coords.lat, lng: coords.lng };
      } else if (cepDigitos.length === 8) {
        parametros.set('cepOrigem', cepDigitos);
        origem = { cep: cepDigitos };
      }
      parametros.set('apenasDisponiveis', 'true');

      const resposta = await fetch(`/api/doadores?${parametros.toString()}`);
      const dados = await resposta.json();
      if (!resposta.ok) throw new Error(dados.erro || 'Não foi possível buscar agora. Tente de novo.');

      setOrigemBusca(origem);
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
  const total = resultados ? resultados.length : 0;

  return (
    <div>
      <div className="titulo-pagina">
        <h1>Preciso de sangue</h1>
        <p>Responda os dois passos abaixo e veja quem pode ajudar.</p>
      </div>

      <form className="formulario" onSubmit={buscar}>
        <div>
          <SeletorTipo
            legenda="1. Qual é o tipo sanguíneo de quem vai receber?"
            valor={tipoReceptor}
            aoEscolher={setTipoReceptor}
          />
          {compativeis && (
            <div style={{ marginTop: '1rem' }}>
              <Aviso
                aviso={{
                  tipo: 'info',
                  texto: `Podem doar para quem tem sangue ${tipoReceptor}: ${compativeis.join(', ')}.`,
                }}
              />
            </div>
          )}
        </div>

        <fieldset>
          <legend>2. Onde procurar? (opcional)</legend>
          <div className="linha-2" style={{ marginTop: '0.6rem' }}>
            <div className="campo">
              <label htmlFor="cidade">Cidade</label>
              <input
                id="cidade"
                value={cidade}
                onChange={(e) => setCidade(e.target.value)}
                placeholder="Ex.: Recife"
              />
            </div>
            <div className="campo">
              <label htmlFor="cepOrigem">Seu CEP</label>
              <input
                id="cepOrigem"
                inputMode="numeric"
                autoComplete="postal-code"
                value={cepOrigem}
                onChange={(e) => setCepOrigem(mascararCep(e.target.value))}
                placeholder="00000-000"
              />
              <p className="dica">Com o CEP, os doadores aparecem do mais perto ao mais longe.</p>
            </div>
          </div>

          <div className="local-gps">
            {coords ? (
              <button type="button" className="btn btn-neutro" onClick={naoUsarLocalizacao}>
                Não usar minha localização
              </button>
            ) : (
              <button type="button" className="btn btn-neutro" onClick={usarMinhaLocalizacao} disabled={buscandoLocal}>
                {buscandoLocal ? 'Procurando…' : 'Usar minha localização'}
              </button>
            )}
            {statusLocal.texto && (
              <p
                className={`status-cep ${statusLocal.tipo}`}
                role={statusLocal.tipo === 'erro' ? 'alert' : 'status'}
              >
                {statusLocal.texto}
              </p>
            )}
          </div>
        </fieldset>

        {erro && <Aviso aviso={{ tipo: 'erro', texto: erro }} />}

        <button className="btn btn-grande" type="submit" disabled={carregando}>
          {carregando ? 'Buscando…' : 'Buscar doadores'}
        </button>
      </form>

      {resultados !== null && (
        <section aria-live="polite">
          <h2 className="contagem" ref={tituloResultados} tabIndex={-1}>
            {total === 0
              ? 'Ninguém encontrado agora'
              : `${total} ${total === 1 ? 'pessoa pode' : 'pessoas podem'} ajudar`}
            {cidade.trim() ? ` em ${cidade.trim()}` : ''}
          </h2>
          {total > 0 && temDistancias && (
            <p className="dica" style={{ marginBottom: '1rem' }}>
              Ordenados do mais perto ao mais longe do seu CEP.
            </p>
          )}

          {maisProximo && maisProximo.latitude != null && (
            <div className="mapa">
              <h3>
                Doador mais próximo
                {maisProximo.distanciaKm != null
                  ? `: cerca de ${String(maisProximo.distanciaKm).replace('.', ',')} km`
                  : ''}
              </h3>
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

          {total === 0 ? (
            <div className="vazio">
              <p>
                <strong>Nenhum doador compatível apareceu agora.</strong>
              </p>
              <p>Tente apagar a cidade para ampliar a busca.</p>
              <p>
                Conhece alguém que possa doar? <Link href="/cadastro">Peça para se cadastrar</Link>.
              </p>
            </div>
          ) : (
            <div className="lista-doadores">
              {resultados.map((d) => (
                <DoadorCard key={d.id} doador={d} />
              ))}
            </div>
          )}

          <Hemocentros origem={origemBusca} />
        </section>
      )}
    </div>
  );
}
