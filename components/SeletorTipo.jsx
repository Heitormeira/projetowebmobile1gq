'use client';

import { TIPOS_SANGUINEOS } from '@/lib/regras';
import { descreverTipo } from '@/lib/formatar';

/**
 * Oito botões grandes, um para cada tipo sanguíneo.
 * Mais fácil de tocar e de entender do que uma lista suspensa.
 */
export default function SeletorTipo({ valor, aoEscolher, legenda, dica }) {
  return (
    <fieldset>
      <legend>{legenda}</legend>
      {dica && <p className="dica">{dica}</p>}
      <div className="tipos">
        {TIPOS_SANGUINEOS.map((tipo) => (
          <button
            key={tipo}
            type="button"
            className="tipo-opcao"
            aria-pressed={valor === tipo}
            aria-label={`Tipo ${descreverTipo(tipo)}`}
            onClick={() => aoEscolher(tipo)}
          >
            {tipo}
          </button>
        ))}
      </div>
    </fieldset>
  );
}
