'use client';

import { useEffect, useRef, useState } from 'react';
import Link from 'next/link';
import SeletorTipo from './SeletorTipo';
import CampoCep from './CampoCep';
import Aviso from './Aviso';

const vaziosIniciais = {
  nome: '',
  tipoSanguineo: '',
  sexo: '',
  cep: '',
  bairro: '',
  email: '',
  ultimaDoacao: '',
  disponivel: true,
};

const OPCOES_SEXO = [
  { valor: 'feminino', rotulo: 'Feminino' },
  { valor: 'masculino', rotulo: 'Masculino' },
  { valor: '', rotulo: 'Prefiro não informar' },
];

/**
 * Formulário completo de doador.
 * - modo 'criar'  → POST   /api/doadores        (CREATE)
 * - modo 'editar' → PUT    /api/doadores/[id]   (UPDATE)
 * Ao terminar, mostra uma tela de confirmação (em vez de um alert do navegador).
 */
export default function FormularioDoador({ modo = 'criar', doadorInicial = null, idDoador = null, emailAcesso = '' }) {
  const [valores, setValores] = useState(() =>
    doadorInicial ? { ...vaziosIniciais, ...doadorInicial, email: doadorInicial.email || '' } : vaziosIniciais
  );
  const [nuncaDoou, setNuncaDoou] = useState(() => !(doadorInicial && doadorInicial.ultimaDoacao));
  const [hoje, setHoje] = useState('');
  const [enviando, setEnviando] = useState(false);
  const [erro, setErro] = useState('');
  const [concluido, setConcluido] = useState(false);
  const painel = useRef(null);
  const areaErro = useRef(null);

  // A data de hoje é calculada no navegador (não na hora de gerar a página).
  useEffect(() => {
    setHoje(new Date().toLocaleDateString('en-CA'));
  }, []);

  useEffect(() => {
    if (concluido) painel.current?.focus();
  }, [concluido]);

  useEffect(() => {
    if (erro) areaErro.current?.scrollIntoView({ behavior: 'smooth', block: 'center' });
  }, [erro]);

  function atualizar(novos) {
    setValores((atuais) => ({ ...atuais, ...novos }));
  }

  function novoCadastro() {
    setValores(vaziosIniciais);
    setNuncaDoou(true);
    setConcluido(false);
  }

  async function enviar(evento) {
    evento.preventDefault();
    setErro('');

    if (!valores.tipoSanguineo) {
      setErro('Escolha o seu tipo sanguíneo.');
      return;
    }
    if (!nuncaDoou && !valores.ultimaDoacao) {
      setErro('Informe a data da última doação ou marque “Nunca doei sangue”.');
      return;
    }

    setEnviando(true);
    try {
      const url = modo === 'editar' ? `/api/doadores/${idDoador}` : '/api/doadores';
      const resposta = await fetch(url, {
        method: modo === 'editar' ? 'PUT' : 'POST',
        headers: { 'Content-Type': 'application/json', ...(emailAcesso ? { 'x-email-acesso': emailAcesso } : {}) },
        body: JSON.stringify({
          nome: valores.nome.trim(),
          tipoSanguineo: valores.tipoSanguineo,
          sexo: valores.sexo,
          cep: valores.cep,
          bairro: valores.bairro,
          email: valores.email.trim(),
          ultimaDoacao: nuncaDoou ? null : valores.ultimaDoacao,
          disponivel: valores.disponivel,
        }),
      });

      const dados = await resposta.json();
      if (!resposta.ok) throw new Error(dados.erro || 'Não foi possível salvar. Tente de novo.');
      setConcluido(true);
    } catch (e) {
      setErro(e.message);
    } finally {
      setEnviando(false);
    }
  }

  if (concluido) {
    return (
      <div className="sucesso" ref={painel} tabIndex={-1} role="status">
        <h2>{modo === 'editar' ? 'Dados atualizados!' : 'Cadastro feito!'}</h2>
        <p>
          {modo === 'editar'
            ? 'As mudanças já estão salvas.'
            : 'Obrigado por se colocar à disposição. Se precisar mudar algo depois, use “Meu cadastro” com o seu e-mail.'}
        </p>
        <div className="botoes">
          {modo === 'editar' ? (
            <Link className="btn" href="/doadores">
              Voltar para a lista
            </Link>
          ) : (
            <>
              <Link className="btn" href="/">
                Ir para o início
              </Link>
              <button type="button" className="btn btn-neutro" onClick={novoCadastro}>
                Cadastrar outra pessoa
              </button>
            </>
          )}
        </div>
      </div>
    );
  }

  return (
    <form className="formulario" onSubmit={enviar}>
      <div className="campo">
        <label htmlFor="nome">Nome completo</label>
        <input
          id="nome"
          name="nome"
          autoComplete="name"
          value={valores.nome}
          onChange={(e) => atualizar({ nome: e.target.value })}
          placeholder="Ex.: Maria Silva"
          required
          minLength={3}
        />
      </div>

      <SeletorTipo
        legenda="Qual é o seu tipo sanguíneo?"
        dica="Toque no seu tipo. Se não souber, veja no cartão de doador ou pergunte ao seu médico."
        valor={valores.tipoSanguineo}
        aoEscolher={(tipo) => atualizar({ tipoSanguineo: tipo })}
      />

      <fieldset>
        <legend>Sexo</legend>
        <p className="dica">Usado apenas para calcular o intervalo entre doações.</p>
        <div className="opcoes">
          {OPCOES_SEXO.map((o) => (
            <label className="opcao" key={o.rotulo}>
              <input
                type="radio"
                name="sexo"
                value={o.valor}
                checked={valores.sexo === o.valor}
                onChange={() => atualizar({ sexo: o.valor })}
              />
              <span>{o.rotulo}</span>
            </label>
          ))}
        </div>
      </fieldset>

      <div className="linha-2">
        <CampoCep value={valores.cep} onChange={atualizar} />

        <div className="campo">
          <label htmlFor="bairro">Bairro (opcional)</label>
          <input
            id="bairro"
            name="bairro"
            value={valores.bairro}
            onChange={(e) => atualizar({ bairro: e.target.value })}
            placeholder="Você pode corrigir"
          />
        </div>
      </div>

      <div className="campo">
        <label htmlFor="email">E-mail</label>
        <input
          id="email"
          name="email"
          type="email"
          inputMode="email"
          autoComplete="email"
          autoCapitalize="none"
          value={valores.email}
          onChange={(e) => atualizar({ email: e.target.value })}
          placeholder="nome@exemplo.com"
          required
        />
        <p className="dica">
          É o único contato que aparece, e só para quem está procurando um doador compatível. Seu
          endereço e seu telefone nunca são mostrados.
        </p>
      </div>

      <fieldset>
        <legend>Última doação de sangue</legend>
        <label className="caixa">
          <input type="checkbox" checked={nuncaDoou} onChange={(e) => setNuncaDoou(e.target.checked)} />
          <span>Nunca doei sangue</span>
        </label>
        {!nuncaDoou && (
          <div className="campo" style={{ marginTop: '1rem' }}>
            <label htmlFor="ultimaDoacao">Data da última doação</label>
            <input
              id="ultimaDoacao"
              name="ultimaDoacao"
              type="date"
              max={hoje || undefined}
              value={valores.ultimaDoacao}
              onChange={(e) => atualizar({ ultimaDoacao: e.target.value })}
            />
          </div>
        )}
      </fieldset>

      <fieldset>
        <legend>Disponibilidade</legend>
        <label className="caixa">
          <input
            type="checkbox"
            checked={valores.disponivel}
            onChange={(e) => atualizar({ disponivel: e.target.checked })}
          />
          <span>Estou disponível para doar</span>
        </label>
        <p className="dica">
          Mesmo disponível, você fica fora das buscas durante o intervalo entre doações: 60 dias para
          homens e 90 dias para mulheres.
        </p>
      </fieldset>

      <div ref={areaErro}>{erro && <Aviso aviso={{ tipo: 'erro', texto: erro }} />}</div>

      <button className="btn btn-grande" type="submit" disabled={enviando}>
        {enviando ? 'Salvando…' : modo === 'editar' ? 'Salvar alterações' : 'Cadastrar como doador'}
      </button>
    </form>
  );
}
