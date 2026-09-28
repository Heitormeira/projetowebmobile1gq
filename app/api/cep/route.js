/**
 * API Node — proxy para a API externa ViaCEP.
 * GET /api/cep?cep=50000000
 *
 * Usado pelo front-end para preencher cidade/bairro/UF automaticamente
 * enquanto o usuário digita o CEP (melhor UX, dados padronizados).
 */
import { NextResponse } from 'next/server';
import { cepEhValido, consultarCep } from '@/lib/viacep';

export async function GET(requisicao) {
  const { searchParams } = new URL(requisicao.url);
  const cep = searchParams.get('cep') || '';

  if (!cepEhValido(cep)) {
    return NextResponse.json({ ok: false, erro: 'CEP inválido — deve conter 8 dígitos.' }, { status: 400 });
  }

  const endereco = await consultarCep(cep);
  return NextResponse.json(endereco, { status: endereco.ok ? 200 : 404 });
}
