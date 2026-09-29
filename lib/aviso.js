/**
 * Avisos que sobrevivem à troca de página (ex.: "Cadastro criado!").
 * Usam sessionStorage: quem grava é a tela de origem, quem lê é a tela de destino.
 * Todas as chamadas são protegidas: se o navegador bloquear o storage, o app segue normal.
 */
const CHAVE = 'sangue-solidario:aviso';

/** aviso = { tipo: 'ok' | 'erro' | 'info', texto: string } */
export function salvarAviso(aviso) {
  try {
    sessionStorage.setItem(CHAVE, JSON.stringify(aviso));
  } catch {
    // sem storage: o aviso simplesmente não aparece
  }
}

/** Lê e apaga o aviso salvo (aparece uma única vez). */
export function lerAvisoSalvo() {
  try {
    const valor = sessionStorage.getItem(CHAVE);
    if (!valor) return null;
    sessionStorage.removeItem(CHAVE);
    return JSON.parse(valor);
  } catch {
    return null;
  }
}
