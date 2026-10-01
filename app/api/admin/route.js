/**
 * Sessão de administrador.
 * GET    /api/admin  → { admin: true|false }
 * POST   /api/admin  { senha } → entra (cookie httpOnly)
 * DELETE /api/admin  → sai
 */
import { NextResponse } from 'next/server';
import { COOKIE_ADMIN, DURACAO_SEGUNDOS, criarToken, ehAdmin, senhaCorreta } from '@/lib/admin';

export const dynamic = 'force-dynamic';

export async function GET(requisicao) {
  return NextResponse.json({ admin: ehAdmin(requisicao) });
}

export async function POST(requisicao) {
  let corpo = {};
  try {
    corpo = await requisicao.json();
  } catch {}

  if (!process.env.ADMIN_SENHA) {
    return NextResponse.json(
      { erro: 'O acesso de administrador não está configurado neste site.' },
      { status: 503 }
    );
  }
  if (!senhaCorreta(corpo.senha)) {
    return NextResponse.json({ erro: 'Senha incorreta.' }, { status: 401 });
  }

  const resposta = NextResponse.json({ ok: true, admin: true });
  resposta.cookies.set(COOKIE_ADMIN, criarToken(), {
    httpOnly: true,
    sameSite: 'strict',
    secure: process.env.NODE_ENV === 'production',
    path: '/',
    maxAge: DURACAO_SEGUNDOS,
  });
  return resposta;
}

export async function DELETE() {
  const resposta = NextResponse.json({ ok: true, admin: false });
  resposta.cookies.set(COOKIE_ADMIN, '', { httpOnly: true, path: '/', maxAge: 0 });
  return resposta;
}
