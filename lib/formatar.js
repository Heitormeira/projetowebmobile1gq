/**
 * Funções de formatação usadas nas telas.
 */

export function soDigitos(valor) {
  return String(valor || '').replace(/\D/g, '');
}

/** Formata enquanto a pessoa digita: 00000-000 */
export function mascararCep(valor) {
  const d = soDigitos(valor).slice(0, 8);
  return d.length > 5 ? `${d.slice(0, 5)}-${d.slice(5)}` : d;
}

/** Data para exibir: 31/12/2026 */
export function formatarData(iso) {
  if (!iso) return '—';
  const [ano, mes, dia] = String(iso).slice(0, 10).split('-');
  return `${dia}/${mes}/${ano}`;
}

/** "O+" vira "O positivo" (para leitores de tela). */
export function descreverTipo(tipo) {
  return String(tipo || '').replace('+', ' positivo').replace('-', ' negativo');
}

/** E-mail em minúsculas e sem espaços nas pontas. */
export function normalizarEmail(valor) {
  return String(valor || '').trim().toLowerCase();
}

/** Validação simples: algo@dominio.ext, sem espaços, até 120 caracteres. */
export function emailEhValido(valor) {
  const email = normalizarEmail(valor);
  return email.length <= 120 && /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(email);
}
