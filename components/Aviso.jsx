/**
 * Faixa de aviso na tela (no lugar do alert() do navegador).
 * aviso = { tipo: 'ok' | 'erro' | 'info', texto }
 * O botão "Fechar" tem texto, não só um ícone.
 */
export default function Aviso({ aviso, aoFechar }) {
  if (!aviso) return null;

  const tipo = aviso.tipo || 'info';

  return (
    <div className={`aviso aviso-${tipo}`} role={tipo === 'erro' ? 'alert' : 'status'}>
      <p>{aviso.texto}</p>
      {aoFechar && (
        <button type="button" className="btn btn-neutro" onClick={aoFechar}>
          Fechar
        </button>
      )}
    </div>
  );
}
