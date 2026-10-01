'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import FormularioDoador from '@/components/FormularioDoador';
import Aviso from '@/components/Aviso';
import { salvarAviso } from '@/lib/aviso';

export default function EditarDoador() {
  const { id } = useParams();
  const router = useRouter();
  const [doador, setDoador] = useState(null); // null = carregando
  const [erro, setErro] = useState('');
  const [confirmando, setConfirmando] = useState(false);
  const [excluindo, setExcluindo] = useState(false);
  const [erroExclusao, setErroExclusao] = useState('');
  const [admin, setAdmin] = useState(false);
  const [emailAcesso, setEmailAcesso] = useState('');

  useEffect(() => {
    let ativo = true;
    let acesso = '';
    try {
      acesso = sessionStorage.getItem('ss:acesso') || '';
    } catch {}
    setEmailAcesso(acesso);
    fetch('/api/admin')
      .then((r) => r.json())
      .then((d) => ativo && setAdmin(d.admin === true))
      .catch(() => {});
    fetch(`/api/doadores/${id}`, { headers: acesso ? { 'x-email-acesso': acesso } : {} })
      .then((r) => r.json())
      .then((dados) => {
        if (!ativo) return;
        if (!dados.ok) throw new Error(dados.erro || 'Cadastro não encontrado. Ele pode ter sido excluído.');
        setDoador(dados.doador);
      })
      .catch((e) => setErro(e.message));
    return () => {
      ativo = false;
    };
  }, [id]);

  async function excluirAgora() {
    setExcluindo(true);
    setErroExclusao('');
    try {
      const resposta = await fetch(`/api/doadores/${id}`, { method: 'DELETE' });
      const dados = await resposta.json();
      if (!resposta.ok) throw new Error(dados.erro || 'Não foi possível excluir o cadastro.');
      salvarAviso({ tipo: 'ok', texto: 'Cadastro excluído.' });
      router.push('/doadores');
    } catch (e) {
      setErroExclusao(e.message);
      setExcluindo(false);
      setConfirmando(false);
    }
  }

  if (erro) {
    return (
      <div className="vazio">
        <p>
          <strong>{erro}</strong>
        </p>
      </div>
    );
  }

  if (!doador) {
    return <p>Carregando os dados…</p>;
  }

  return (
    <div>
      <div className="titulo-pagina">
        <h1>Editar cadastro</h1>
        <p>Mude seus dados ou avise que está indisponível depois de doar.</p>
      </div>

      <FormularioDoador modo="editar" idDoador={id} doadorInicial={doador} emailAcesso={emailAcesso} />

      {admin && (
      <section className="secao">
        <h2>Excluir cadastro (administrador)</h2>
        {erroExclusao && <Aviso aviso={{ tipo: 'erro', texto: erroExclusao }} />}

        {confirmando ? (
          <div className="confirmar" role="group" aria-label="Confirmar exclusão">
            <p>
              <strong>Excluir este cadastro?</strong> Isso não pode ser desfeito.
            </p>
            <div className="acoes">
              <button type="button" className="btn" onClick={excluirAgora} disabled={excluindo}>
                {excluindo ? 'Excluindo…' : 'Sim, excluir'}
              </button>
              <button
                type="button"
                className="btn btn-neutro"
                onClick={() => setConfirmando(false)}
                disabled={excluindo}
              >
                Não, voltar
              </button>
            </div>
          </div>
        ) : (
          <>
            <p>Se não quiser mais aparecer nas buscas, você pode apagar o cadastro.</p>
            <button type="button" className="btn btn-secundario" onClick={() => setConfirmando(true)}>
              Excluir este cadastro
            </button>
          </>
        )}
      </section>
      )}
    </div>
  );
}
