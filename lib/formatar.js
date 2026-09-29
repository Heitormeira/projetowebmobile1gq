/**
 * Funções de formatação usadas nas telas.
 */

export function soDigitos(valor) {
  return String(valor || '').replace(/\D/g, '');
}

/** Formata enquanto a pessoa digita: (81) 99999-9999 */
export function mascararTelefone(valor) {
  const d = soDigitos(valor).slice(0, 11);
  if (d.length === 0) return '';
  if (d.length <= 2) return `(${d}`;
  if (d.length <= 6) return `(${d.slice(0, 2)}) ${d.slice(2)}`;
  if (d.length <= 10) return `(${d.slice(0, 2)}) ${d.slice(2, 6)}-${d.slice(6)}`;
  return `(${d.slice(0, 2)}) ${d.slice(2, 7)}-${d.slice(7)}`;
}

/** Formata enquanto a pessoa digita: 00000-000 */
export function mascararCep(valor) {
  const d = soDigitos(valor).slice(0, 8);
  return d.length > 5 ? `${d.slice(0, 5)}-${d.slice(5)}` : d;
}

/** Tira o código do Brasil (55) de números já salvos com ele. */
export function removerDdi(telefone) {
  const d = soDigitos(telefone);
  return d.length > 11 && d.startsWith('55') ? d.slice(2) : d;
}

/** Telefone para exibir: (81) 99999-9999 */
export function formatarTelefone(telefone) {
  const d = removerDdi(telefone);
  if (d.length === 11) return `(${d.slice(0, 2)}) ${d.slice(2, 7)}-${d.slice(7)}`;
  if (d.length === 10) return `(${d.slice(0, 2)}) ${d.slice(2, 6)}-${d.slice(6)}`;
  return telefone || '—';
}

/** Data para exibir: 31/12/2026 */
export function formatarData(iso) {
  if (!iso) return '—';
  const [ano, mes, dia] = String(iso).slice(0, 10).split('-');
  return `${dia}/${mes}/${ano}`;
}

/** Número só com dígitos e com o código do Brasil na frente (para WhatsApp e ligação). */
export function comDdi(telefone) {
  return `55${removerDdi(telefone)}`;
}

/** "O+" vira "O positivo" (para leitores de tela). */
export function descreverTipo(tipo) {
  return String(tipo || '').replace('+', ' positivo').replace('-', ' negativo');
}
