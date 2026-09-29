'use client';

import { useState } from 'react';
import Link from 'next/link';
import DoadorCard from '@/components/DoadorCard';
import Aviso from '@/components/Aviso';
import { mascararTelefone } from '@/lib/formatar';

/**
 * Área do doador: encontra o próprio cadastro pelo telefone
 * e acessa edição/exclusão sem depender de login.
 */
export default function MeuCadastro() {
  const [telefone, setTelefone] = useState('');
  const [resultados, setResultados] = useState(null); // null = ainda não buscou
  const [carregando, setCarregando] = useState(false);
  const [aviso, setAviso] = useState(null);

  async function buscar(evento) {
    evento.preventDefault();
    setAviso(null);
    setCarregando(true);

    try {
      const resposta = await fetch(`/api/meu-cadastro?telefone=${encodeURIComponent(telefone)}`);
      const dados = await resposta.json();
      if (!resposta.ok) throw new Error(dados.erro || 'Não foi possível buscar agora. Tente de novo.');
      setResultados(dados.doadores);
    } catch (e) {
      setAviso({ tipo: 'erro', texto: e.message });
      setResultados(null);
    } finally {
      setCarregando(false);
    }
  }

  function aoExcluir(id) {
    setResultados((atuais) => (atuais || []).filter((d) => d.id !== id));
    setAviso({ tipo: 'ok', texto: 'Cadastro excluído.' });
  }

  return (
    <div>
      <div className="titulo-pagina">
        <h1>Meu cadastro</h1>
        <p>
          Digite o telefone que você usou no cadastro para mudar seus dados, avisar que está
          indisponível ou excluir o cadastro.
        </p>
      </div>

      <form className="formulario" onSubmit={buscar}>
        <div className="campo">
          <label htmlFor="telefone">Telefone com DDD</label>
          <input
            id="telefone"
            type="tel"
            inputMode="tel"
            autoComplete="tel-national"
            value={telefone}
            onChange={(e) => setTelefone(mascararTelefone(e.target.value))}
            placeholder="(81) 99999-9999"
            required
          />
          <p className="dica">O mesmo número informado no cadastro.</p>
        </div>

        <button className="btn btn-grande" type="submit" disabled={carregando}>
          {carregando ? 'Procurando…' : 'Encontrar meu cadastro'}
        </button>
      </form>

      <div style={{ marginTop: '1.8rem' }}>
        <Aviso aviso={aviso} aoFechar={() => setAviso(null)} />

        {resultados !== null && resultados.length === 0 && (
          <div className="vazio">
            <p>
              <strong>Não encontramos cadastro com esse telefone.</strong>
            </p>
            <p>
              Confira os números ou <Link href="/cadastro">faça seu cadastro</Link>.
            </p>
          </div>
        )}

        {resultados !== null && resultados.length > 0 && (
          <div className="lista-doadores">
            {resultados.map((d) => (
              <DoadorCard
                key={d.id}
                doador={d}
                podeGerenciar
                mostrarContato={false}
                aoExcluir={aoExcluir}
                aoErro={(texto) => setAviso({ tipo: 'erro', texto })}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
