'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import FormularioDoador from '@/components/FormularioDoador';

export default function EditarDoador() {
  const { id } = useParams();
  const router = useRouter();
  const [doador, setDoador] = useState(null); // null = carregando
  const [erro, setErro] = useState('');

  useEffect(() => {
    let ativo = true;
    fetch('/api/doadores')
      .then((r) => r.json())
      .then((dados) => {
        if (!ativo) return;
        if (!dados.ok) throw new Error(dados.erro || 'Falha ao carregar.');
        const encontrado = (dados.doadores || []).find((d) => d.id === id);
        if (!encontrado) throw new Error('Doador não encontrado — o cadastro pode ter sido removido.');
        setDoador(encontrado);
      })
      .catch((e) => setErro(e.message));
    return () => {
      ativo = false;
    };
  }, [id]);

  async function excluirCadastro() {
    const confirmou = window.confirm(
      'Excluir definitivamente este cadastro? Esta ação não pode ser desfeita.'
    );
    if (!confirmou) return;

    const resposta = await fetch(`/api/doadores/${id}`, { method: 'DELETE' });
    const dados = await resposta.json();
    if (resposta.ok) {
      alert('Cadastro removido com sucesso.');
      router.push('/doadores');
    } else {
      alert(dados.erro || 'Falha ao remover o cadastro.');
    }
  }

  if (erro) {
    return (
      <div className="vazio">
        <p><strong>{erro}</strong></p>
      </div>
    );
  }

  if (!doador) {
    return <p className="contador-resultados">Carregando dados do doador…</p>;
  }

  return (
    <div>
      <div className="cabecalho-pagina">
        <div>
          <h1>Editar cadastro</h1>
          <p>
            Atualize seus dados, marque-se como indisponível após doar ou exclua seu
            cadastro. Guardamos o ID <code>{id}</code>.
          </p>
        </div>
        <button type="button" className="btn btn-perigo" onClick={excluirCadastro}>
          Excluir meu cadastro
        </button>
      </div>

      <div className="card">
        <FormularioDoador modo="editar" idDoador={id} doadorInicial={doador} />
      </div>
    </div>
  );
}
