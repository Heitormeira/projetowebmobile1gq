/**
 * Acesso de administrador (só no servidor).
 * A senha fica na variável de ambiente ADMIN_SENHA (Vercel → Settings → Environment Variables).
 * Ao entrar, o servidor grava um cookie httpOnly assinado (HMAC) que vale por 8 horas.
 * Sem ADMIN_SENHA definida, ninguém consegue entrar como administrador.
 */
import crypto from 'crypto';

export const COOKIE_ADMIN = 'ss_admin';
const DURACAO_MS = 8 * 60 * 60 * 1000;

function assinar(texto) {
  return crypto.createHmac('sha256', process.env.ADMIN_SENHA || '').update(texto).digest('hex');
}

function iguais(a, b) {
  const x = Buffer.from(String(a));
  const y = Buffer.from(String(b));
  return x.length === y.length && crypto.timingSafeEqual(x, y);
}

export function senhaCorreta(senha) {
  const esperada = process.env.ADMIN_SENHA;
  return Boolean(esperada) && iguais(String(senha || ''), esperada);
}

export function criarToken() {
  const validade = String(Date.now() + DURACAO_MS);
  return `${validade}.${assinar(validade)}`;
}

export function tokenValido(token) {
  if (!process.env.ADMIN_SENHA || !token) return false;
  const [validade, assinatura] = String(token).split('.');
  if (!validade || !assinatura) return false;
  if (!iguais(assinatura, assinar(validade))) return false;
  return Number(validade) > Date.now();
}

export function ehAdmin(requisicao) {
  return tokenValido(requisicao.cookies.get(COOKIE_ADMIN)?.value);
}

export const DURACAO_SEGUNDOS = DURACAO_MS / 1000;

export const CABECALHO_ACESSO = 'x-email-acesso';

/**
 * Quem pode ver/editar um cadastro por ID: o administrador, ou quem informa
 * o mesmo e-mail do cadastro (o mesmo e-mail usado em "Meu cadastro").
 */
export function podeAcessar(requisicao, doador) {
  if (ehAdmin(requisicao)) return true;
  const informado = String(requisicao.headers.get(CABECALHO_ACESSO) || '').trim().toLowerCase();
  const guardado = String(doador.get('email') || '').trim().toLowerCase();
  return Boolean(informado) && informado === guardado;
}
