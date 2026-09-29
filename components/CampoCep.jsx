'use client';

import { useEffect, useState } from 'react';
import { mascararCep } from '@/lib/formatar';

/**
 * Campo de CEP integrado à API externa ViaCEP:
 * ao completar 8 dígitos, preenche automaticamente cidade, bairro e UF.
 * Props: value, onChange(novosValores)
 */
export default function CampoCep({ value, onChange }) {
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
    setMensagem('Procurando o endereço…');

    fetch(`/api/cep?cep=${digitos}`)
      .then((r) => r.json())
      .then((dados) => {
        if (cancelado) return;
        if (dados.ok) {
          setStatus('ok');
          setMensagem(`Endereço encontrado: ${dados.cidade}/${dados.uf}${dados.bairro ? ` — ${dados.bairro}` : ''}`);
          onChange({ cidade: dados.cidade, bairro: dados.bairro, uf: dados.uf });
        } else {
          setStatus('erro');
          setMensagem(dados.erro || 'CEP não encontrado. Confira os números.');
        }
      })
      .catch(() => {
        if (!cancelado) {
          setStatus('erro');
          setMensagem('Não foi possível consultar o CEP agora. Tente de novo em instantes.');
        }
      });

    return () => {
      cancelado = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [value]);

  return (
    <div className="campo">
      <label htmlFor="cep">CEP</label>
      <input
        id="cep"
        name="cep"
        inputMode="numeric"
        autoComplete="postal-code"
        placeholder="00000-000"
        value={value}
        onChange={(e) => onChange({ cep: mascararCep(e.target.value) })}
        required
      />
      <p className="dica">A cidade e o bairro são preenchidos sozinhos.</p>
      {status && (
        <p className={`status-cep ${status === 'ok' ? 'ok' : status === 'erro' ? 'erro' : ''}`} aria-live="polite">
          {mensagem}
        </p>
      )}
    </div>
  );
}
