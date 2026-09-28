'use client';

import Link from 'next/link';
import { useState } from 'react';

export function BadgeTipo({ tipo }) {
  return <span className={`badge-tipo badge-${tipo.replace('+', 'p').replace('-', 'n')}`}>{tipo}</span>;
}

export function BadgeDisponibilidade({ doador }) {
  if (doador.disponivel) {
    return <span className="badge badge-ok">Disponível</span>;
  }
  return <span className="badge badge-motivo">Indisponível</span>;
}

function formatarTelefone(tel) {
  const d = String(tel || '').replace(/\D/g, '');
  if (d.length === 11) return `(${d.slice(0, 2)}) ${d.slice(2, 7)}-${d.slice(7)}`;
  if (d.length === 10) return `(${d.slice(0, 2)}) ${d.slice(2, 6)}-${d.slice(6)}`;
  return tel || '—';
}

function formatarData(iso) {
  if (!iso) return '—';
  const [ano, mes, dia] = String(iso).slice(0, 10).split('-');
  return `${dia}/${mes}/${ano}`;
}

export default function DoadorCard({ doador, podeGerenciar = false, aoExcluir }) {
  const [confirmando, setConfirmando] = useState(false);
  const [excluindo, setExcluindo] = useState(false);

  async function excluir() {
    if (!confirmando) {
      setConfirmando(true);
      return;
    }
    setExcluindo(true);
    try {
      const resposta = await fetch(`/api/doadores/${doador.id}`, { method: 'DELETE' });
      const dados = await resposta.json();
      if (!resposta.ok) throw new Error(dados.erro || 'Falha ao remover.');
      aoExcluir?.(doador.id);
    } catch (erro) {
      alert(`Não foi possível remover: ${erro.message}`);
      setExcluindo(false);
      setConfirmando(false);
    }
  }

  const local = [doador.bairro, doador.cidade, doador.uf].filter(Boolean).join(' · ');
  const temCoordenadas = doador.latitude != null && doador.longitude != null;

  return (
    <article className="card-doador">
      <div className="card-topo">
        <BadgeTipo tipo={doador.tipoSanguineo} />
        <BadgeDisponibilidade doador={doador} />
      </div>

      <h3 className="card-nome">{doador.nome}</h3>

      <ul className="card-info">
        <li>
          <span aria-hidden="true">📍</span> {local || 'Localização não informada'}
          {doador.distanciaKm != null && <strong> — ~{doador.distanciaKm} km de você</strong>}
        </li>
        <li>
          <span aria-hidden="true">📅</span> Última doação: {formatarData(doador.ultimaDoacao)}
        </li>
        <li>
          <span aria-hidden="true">☎️</span> {formatarTelefone(doador.telefoneContato)}
        </li>
      </ul>

      <div className="card-acoes">
        <a
          className="btn btn-whatsapp"
          href={`https://wa.me/55${String(doador.telefoneContato).replace(/\D/g, '')}`}
          target="_blank"
          rel="noopener noreferrer"
        >
          Chamar no WhatsApp
        </a>
        <a className="btn btn-secundario" href={`tel:+55${String(doador.telefoneContato).replace(/\D/g, '')}`}>
          Ligar
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

        {podeGerenciar && (
          <>
            <Link className="btn btn-neutro" href={`/doadores/${doador.id}/editar`}>
              Editar
            </Link>
            <button
              type="button"
              className={`btn ${confirmando ? 'btn-perigo' : 'btn-neutro'}`}
              onClick={excluir}
              disabled={excluindo}
            >
              {excluindo ? 'Removendo…' : confirmando ? 'Confirmar exclusão?' : 'Excluir'}
            </button>
          </>
        )}
      </div>
    </article>
  );
}
