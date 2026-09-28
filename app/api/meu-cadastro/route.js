/**
 * API — localiza o cadastro do próprio doador pelo telefone.
 * GET /api/meu-cadastro?telefone=81999990001
 *
 * Permite que o doador encontre seu registro sem precisar do ID:
 * o telefone é normalizado (só dígitos) e comparado com o campo
 * "telefoneDigits" persistido no cadastro.
 */
import { NextResponse } from 'next/server';
import Parse, { CLASSE_DOADOR, parseParaObjeto } from '@/lib/back4app-server';

export async function GET(requisicao) {
  try {
    const { searchParams } = new URL(requisicao.url);
    const digitos = (searchParams.get('telefone') || '').replace(/\D/g, '');

    if (digitos.length < 10 || digitos.length > 13) {
      return NextResponse.json(
        { erro: 'Informe um telefone com DDD (10 ou 11 dígitos).' },
        { status: 400 }
      );
    }

    // Cobre variações: com/sem DDI 55, com/sem o 9 adicional do celular.
    const candidatos = new Set([digitos]);
    if (digitos.startsWith('55') && digitos.length > 11) {
      candidatos.add(digitos.slice(2)); // remove DDI
    } else {
      candidatos.add(`55${digitos}`); // adiciona DDI
    }

    const query = new Parse.Query(CLASSE_DOADOR);
    query.containedIn('telefoneDigits', Array.from(candidatos));
    query.descending('createdAt');

    const encontrados = await query.find();

    return NextResponse.json({
      ok: true,
      doadores: encontrados.map(parseParaObjeto),
    });
  } catch (erro) {
    console.error('[API /meu-cadastro GET]', erro);
    return NextResponse.json(
      { erro: 'Erro ao buscar cadastro: ' + erro.message },
      { status: 500 }
    );
  }
}
