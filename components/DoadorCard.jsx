'use client';

import Link from 'next/link';
import { useState } from 'react';
import { CARENCIA_DIAS, CARENCIA_PADRAO_DIAS, diasDesde, doadorDisponivel } from '@/lib/regras';
import { comDdi, descreverTipo, formatarData, formatarTelefone } from '@/lib/formatar';

const MENSAGEM_WHATSAPP =
  'Olá! Vi seu cadastro no Sangue Solidário e estou procurando um doador de sangue. Você poderia me ajudar?';

/** Situação do doador em linguagem simples, usando as regras de carência do projeto. */
function situacaoDoDoador(doador) {
  if (!doador.disponivel) {
    return { ok: false, texto: 'Indisponível no momento' };
  }
  if (!doadorDisponivel(doador)) {
    const carencia = CARENCIA_DIAS[String(doador.sexo || '').toLowerCase()] || CARENCIA_PADRAO_DIAS;
    const restam = Math.max(carencia - (diasDesde(doador.ultimaDoacao) ?? 0), 1);
    return { ok: false, texto: `Descansando depois de doar — pode doar de novo em ${restam} dia(s)` };
  }
  return { ok: true, texto: 'Disponível para doar' };
}

/**
 * Cartão de doador.
 * - mostrarContato: telefone, WhatsApp e ligação. Nas listas públicas fica desligado,
 *   para não expor o telefone de todo mundo; na busca de quem precisa de sangue fica ligado.
 * - podeGerenciar: mostra Editar e Excluir (com confirmação na própria tela).
 * - aoErro(texto): avisa a página quando a exclusão falha.
 */
export default function DoadorCard({
  doador,
  podeGerenciar = false,
  mostrarContato = true,
  aoExcluir,
  aoErro,
}) {
  const [confirmando, setConfirmando] = useState(false);
  const [excluindo, setExcluindo] = useState(false);

  async function excluirAgora() {
    setExcluindo(true);
    try {
      const resposta = await fetch(`/api/doadores/${doador.id}`, { method: 'DELETE' });
      const dados = await resposta.json();
      if (!resposta.ok) throw new Error(dados.erro || 'Falha ao remover.');
      aoExcluir?.(doador.id);
    } catch (erro) {
      aoErro?.(`Não foi possível excluir: ${erro.message}`);
      setExcluindo(false);
      setConfirmando(false);
    }
  }

  const local = [doador.bairro, doador.cidade, doador.uf].filter(Boolean).join(', ');
  const temCoordenadas = doador.latitude != null && doador.longitude != null;
  const telefone = comDdi(doador.telefoneContato);
  const situacao = situacaoDoDoador(doador);

  return (
    <article className="doador">
      <div className="doador-topo">
        <span className="tipo-selo" aria-label={`Tipo sanguíneo ${descreverTipo(doador.tipoSanguineo)}`}>
          {doador.tipoSanguineo}
        </span>
        <h3 className="doador-nome">{doador.nome}</h3>
      </div>

      <dl className="dados">
        <div>
          <dt>Local</dt>
          <dd>
            {local || 'Não informado'}
            {doador.distanciaKm != null && (
              <> — a cerca de {String(doador.distanciaKm).replace('.', ',')} km de você</>
            )}
          </dd>
        </div>
        <div>
          <dt>Última doação</dt>
          <dd>{doador.ultimaDoacao ? formatarData(doador.ultimaDoacao) : 'Nunca doou'}</dd>
        </div>
        <div>
          <dt>Situação</dt>
          <dd className={situacao.ok ? 'situacao-ok' : 'situacao-nao'}>{situacao.texto}</dd>
        </div>
        {mostrarContato && (
          <div>
            <dt>Telefone</dt>
            <dd className="telefone">{formatarTelefone(doador.telefoneContato)}</dd>
          </div>
        )}
      </dl>

      {(mostrarContato || podeGerenciar) && !confirmando && (
        <div className="acoes">
          {mostrarContato && (
            <>
              <a
                className="btn btn-verde"
                href={`https://wa.me/${telefone}?text=${encodeURIComponent(MENSAGEM_WHATSAPP)}`}
                target="_blank"
                rel="noopener noreferrer"
              >
                Chamar no WhatsApp
              </a>
              <a className="btn btn-neutro" href={`tel:+${telefone}`}>
                Ligar agora
              </a>
              {temCoordenadas && (
                <a
                  className="btn btn-neutro"
                  href={`https://www.openstreetmap.org/?mlat=${doador.latitude}&mlon=${doador.longitude}#map=15/${doador.latitude}/${doador.longitude}`}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  Ver no mapa
                </a>
              )}
            </>
          )}

          {podeGerenciar && (
            <>
              <Link className="btn btn-neutro" href={`/doadores/${doador.id}/editar`}>
                Editar
              </Link>
              <button type="button" className="btn btn-secundario" onClick={() => setConfirmando(true)}>
                Excluir
              </button>
            </>
          )}
        </div>
      )}

      {confirmando && (
        <div className="confirmar" role="group" aria-label="Confirmar exclusão">
          <p>
            <strong>Excluir o cadastro de {doador.nome}?</strong> Isso não pode ser desfeito.
          </p>
          <div className="acoes">
            <button type="button" className="btn" onClick={excluirAgora} disabled={excluindo}>
              {excluindo ? 'Excluindo…' : 'Sim, excluir'}
            </button>
            <button type="button" className="btn btn-neutro" onClick={() => setConfirmando(false)} disabled={excluindo}>
              Não, voltar
            </button>
          </div>
        </div>
      )}
    </article>
  );
}
