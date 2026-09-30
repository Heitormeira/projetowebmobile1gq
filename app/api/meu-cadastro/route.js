/**
 * API — localiza o cadastro do próprio doador pelo e-mail.
 * GET /api/meu-cadastro?email=nome@exemplo.com
 *
 * Permite que o doador encontre seu registro sem precisar do ID.
 * A resposta não traz CEP, coordenadas nem e-mail: só o necessário para
 * mostrar o cartão e abrir a edição (a tela de edição busca o resto por ID).
 */
import { NextResponse } from 'next/server';
import Parse, { CLASSE_DOADOR, parseParaObjeto } from '@/lib/back4app-server';
import { emailEhValido, normalizarEmail } from '@/lib/formatar';

export async function GET(requisicao) {
  try {
    const { searchParams } = new URL(requisicao.url);
    const email = normalizarEmail(searchParams.get('email'));

    if (!emailEhValido(email)) {
      return NextResponse.json(
        { erro: 'Informe o e-mail que você usou no cadastro. Exemplo: nome@exemplo.com' },
        { status: 400 }
      );
    }

    const query = new Parse.Query(CLASSE_DOADOR);
    query.equalTo('email', email);
    query.descending('createdAt');

    const encontrados = await query.find();

    return NextResponse.json({
      ok: true,
      doadores: encontrados.map((d) => parseParaObjeto(d)),
    });
  } catch (erro) {
    console.error('[API /meu-cadastro GET]', erro);
    return NextResponse.json(
      { erro: 'Erro ao buscar cadastro: ' + erro.message },
      { status: 500 }
    );
  }
}
