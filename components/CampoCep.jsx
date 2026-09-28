'use client';

import { useEffect, useState } from 'react';
import { cepEhValido } from '@/lib/viacep';

/**
 * Campo de CEP integrado à API externa ViaCEP:
 * ao completar 8 dígitos, preenche automaticamente cidade, bairro e UF.
 * Props: value, onChange(novosValores), erro
 */
export default function CampoCep({ value, onChange, erro }) {
  const [status, setStatus] = useState(null); // null | 'buscando' | 'ok' | 'erro'
  const [mensagem, setMensagem] = useState('');

  // Consulta o ViaCEP sempre que o CEP fica completo (via API Node /api/cep).
  useEffect(() => {
    const digitos = String(value || '').replace(/\D/g, '');
    if (digitos.length !== 8) {
      setStatus(null);
      setMensagem('');
      return;
    }

    let cancelado = false;
    setStatus('buscando');
    setMensagem('Consultando CEP…');

    fetch(`/api/cep?cep=${digitos}`)
      .then((r) => r.json())
      .then((dados) => {
        if (cancelado) return;
        if (dados.ok) {
          setStatus('ok');
          setMensagem(`${dados.cidade}/${dados.uf}${dados.bairro ? ` — ${dados.bairro}` : ''}`);
          onChange({ cidade: dados.cidade, bairro: dados.bairro, uf: dados.uf });
        } else {
          setStatus('erro');
          setMensagem(dados.erro || 'CEP não encontrado.');
        }
      })
      .catch(() => {
        if (!cancelado) {
          setStatus('erro');
          setMensagem('Falha ao consultar o ViaCEP.');
        }
      });

    return () => {
      cancelado = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [value]);

  function aoDigitar(evento) {
    const digitos = evento.target.value.replace(/\D/g, '').slice(0, 8);
    const formatado = digitos.length > 5 ? `${digitos.slice(0, 5)}-${digitos.slice(5)}` : digitos;
    onChange({ cep: formatado });
  }

  return (
    <div className="campo">
      <label htmlFor="cep">CEP *</label>
      <input
        id="cep"
        name="cep"
        inputMode="numeric"
        placeholder="00000-000"
        value={value}
        onChange={aoDigitar}
        required
      />
      {status && (
        <small className={`dica-cep ${status === 'erro' ? 'dica-erro' : 'dica-ok'}`} aria-live="polite">
          {status === 'buscando' ? '⏳ ' : status === 'ok' ? '✅ ' : '⚠️ '}
          {mensagem}
          {status === 'ok' ? ' (preenchido automaticamente pelo ViaCEP)' : ''}
        </small>
      )}
      {erro && <small className="dica-erro">{erro}</small>}
    </div>
  );
}
