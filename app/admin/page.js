'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import Aviso from '@/components/Aviso';

export default function Administrador() {
  const [admin, setAdmin] = useState(null); // null = verificando
  const [senha, setSenha] = useState('');
  const [erro, setErro] = useState('');
  const [enviando, setEnviando] = useState(false);

  useEffect(() => {
    fetch('/api/admin')
      .then((r) => r.json())
      .then((d) => setAdmin(d.admin === true))
      .catch(() => setAdmin(false));
  }, []);

  async function entrar(evento) {
    evento.preventDefault();
    setErro('');
    setEnviando(true);
    try {
      const resposta = await fetch('/api/admin', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ senha }),
      });
      const dados = await resposta.json();
      if (!resposta.ok) throw new Error(dados.erro || 'Não foi possível entrar.');
      setSenha('');
      setAdmin(true);
    } catch (e) {
      setErro(e.message);
    } finally {
      setEnviando(false);
    }
  }

  async function sair() {
    await fetch('/api/admin', { method: 'DELETE' });
    setAdmin(false);
  }

  if (admin === null) return <p>Verificando…</p>;

  return (
    <div>
      <div className="titulo-pagina">
        <h1>Área do administrador</h1>
        <p>Só o administrador pode excluir cadastros.</p>
      </div>

      {admin ? (
        <div className="sucesso" role="status">
          <h2>Você está como administrador</h2>
          <p>Agora o botão “Excluir” aparece na lista de doadores. A sessão termina em 8 horas.</p>
          <div className="botoes">
            <Link className="btn" href="/doadores">
              Ir para a lista de doadores
            </Link>
            <button type="button" className="btn btn-neutro" onClick={sair}>
              Sair
            </button>
          </div>
        </div>
      ) : (
        <form className="formulario" onSubmit={entrar}>
          <div className="campo">
            <label htmlFor="senha">Senha do administrador</label>
            <input
              id="senha"
              type="password"
              autoComplete="current-password"
              value={senha}
              onChange={(e) => setSenha(e.target.value)}
              required
            />
          </div>
          {erro && <Aviso aviso={{ tipo: 'erro', texto: erro }} />}
          <button className="btn btn-grande" type="submit" disabled={enviando}>
            {enviando ? 'Entrando…' : 'Entrar'}
          </button>
        </form>
      )}
    </div>
  );
}
