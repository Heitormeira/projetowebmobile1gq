'use client';

import { useEffect, useState } from 'react';

const TAMANHOS = [
  { valor: '1', rotulo: 'Normal' },
  { valor: '2', rotulo: 'Grande' },
  { valor: '3', rotulo: 'Enorme' },
];

function guardar(chave, valor) {
  try {
    localStorage.setItem(chave, valor);
  } catch {
    // sem storage: a escolha vale só até fechar a página
  }
}

/**
 * Barra no topo de todas as páginas: tamanho da letra e contraste alto.
 * A escolha é guardada no navegador e aplicada antes da página aparecer
 * (script em app/layout.js).
 */
export default function BarraAcessibilidade() {
  const [tamanho, setTamanho] = useState('1');
  const [contraste, setContraste] = useState(false);

  useEffect(() => {
    const raiz = document.documentElement;
    setTamanho(raiz.dataset.tamanho || '1');
    setContraste(raiz.dataset.contraste === 'alto');
  }, []);

  function escolherTamanho(valor) {
    setTamanho(valor);
    if (valor === '1') delete document.documentElement.dataset.tamanho;
    else document.documentElement.dataset.tamanho = valor;
    guardar('ss:tamanho', valor);
  }

  function alternarContraste() {
    const novo = !contraste;
    setContraste(novo);
    if (novo) document.documentElement.dataset.contraste = 'alto';
    else delete document.documentElement.dataset.contraste;
    guardar('ss:contraste', novo ? 'alto' : 'normal');
  }

  return (
    <div className="barra-acessibilidade">
      <div className="container barra-interna">
        <div className="barra-grupo" role="group" aria-label="Tamanho da letra">
          <span className="barra-rotulo">Letra:</span>
          {TAMANHOS.map((t) => (
            <button
              key={t.valor}
              type="button"
              className="barra-botao"
              aria-pressed={tamanho === t.valor}
              onClick={() => escolherTamanho(t.valor)}
            >
              {t.rotulo}
            </button>
          ))}
        </div>

        <button type="button" className="barra-botao" aria-pressed={contraste} onClick={alternarContraste}>
          Contraste alto
        </button>
      </div>
    </div>
  );
}
