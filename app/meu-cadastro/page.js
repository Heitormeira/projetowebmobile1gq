'use client';

import { useState } from 'react';
import Link from 'next/link';
import DoadorCard from '@/components/DoadorCard';

/**
 * Área do doador: encontra o próprio cadastro pelo telefone
 * e acessa edição/exclusão sem depender de login.
 */
export default function MeuCadastro() {
  const [telefone, setTelefone] = useState('');
  const [resultados, setResultados] = useState(null); // null = ainda não buscou
  const [carregando, setCarregando] = useState(false);
  const [erro, setErro] = useState('');

  async function buscar(evento) {
    evento.preventDefault();
    setErro('');
    setCarregando(true);

    try {
      const resposta = await fetch(`/api/meu-cadastro?telefone=${encodeURIComponent(telefone)}`);
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

  return (
    <div>
      <div className="cabecalho-pagina">
        <div>
          <h1>🔑 Meu cadastro</h1>
          <p>
            Informe o telefone usado no cadastro para gerenciar seus dados:
            marcar-se como indisponível, atualizar a última doação, editar contato
            ou excluir seu registro.
          </p>
        </div>
      </div>

      <form className="card formulario" onSubmit={buscar}>
        <div className="busca-grid">
          <div className="campo">
            <label htmlFor="telefone">Telefone com DDD *</label>
            <input
              id="telefone"
              inputMode="tel"
              value={telefone}
              onChange={(e) => setTelefone(e.target.value)}
              placeholder="(81) 99999-9999"
              required
            />
            <small className="dica">Use o mesmo telefone informado no cadastro.</small>
          </div>
          <div className="campo">
            <button className="btn btn-primario" type="submit" disabled={carregando}>
              {carregando ? 'Buscando…' : 'Encontrar meu cadastro'}
            </button>
          </div>
        </div>
        {erro && <p className="alerta-erro" role="alert">{erro}</p>}
      </form>

      {resultados !== null && resultados.length === 0 && (
        <div className="vazio">
          <p><strong>Nenhum cadastro encontrado com esse telefone.</strong></p>
          <p>
            Ainda não é doador? <Link href="/cadastro">Cadastre-se aqui</Link>.
          </p>
        </div>
      )}

      {resultados !== null && resultados.length > 0 && (
        <>
          <p className="contador-resultados">
            {resultados.length} cadastro(s) encontrado(s) — gerencie pelo card abaixo.
          </p>
          <div className="grade-resultados">
            {resultados.map((d) => (
              <DoadorCard key={d.id} doador={d} podeGerenciar />
            ))}
          </div>
        </>
      )}
    </div>
  );
}
