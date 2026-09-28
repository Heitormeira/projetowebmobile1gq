/**
 * API Node — UPDATE: atualiza um doador existente no Back4App.
 * PUT /api/doadores/[id]
 *
 * O doador pode editar seus próprios dados: marcar-se como indisponível,
 * atualizar a data da última doação, alterar contato/localização, etc.
 */
import { NextResponse } from 'next/server';
import Parse, { CLASSE_DOADOR, parseParaObjeto } from '@/lib/back4app-server';
import { TIPOS_SANGUINEOS } from '@/lib/regras';
import { cepEhValido, consultarCep } from '@/lib/viacep';
import { geocodificarCep } from '@/lib/geolocalizacao';

export async function PUT(requisicao, { params }) {
  try {
    const { id } = await params;
    if (!id) {
      return NextResponse.json({ erro: 'ID do doador é obrigatório.' }, { status: 400 });
    }

    const corpo = await requisicao.json();

    const query = new Parse.Query(CLASSE_DOADOR);
    const doador = await query.get(id);
    if (!doador) {
      return NextResponse.json({ erro: 'Doador não encontrado.' }, { status: 404 });
    }

    // ---- Campos simples ----
    if (corpo.nome !== undefined) {
      const nome = String(corpo.nome).trim();
      if (nome.length < 3) {
        return NextResponse.json({ erro: 'Nome deve ter ao menos 3 letras.' }, { status: 400 });
      }
      doador.set('nome', nome);
    }

    if (corpo.tipoSanguineo !== undefined) {
      const tipo = String(corpo.tipoSanguineo).toUpperCase().trim();
      if (!TIPOS_SANGUINEOS.includes(tipo)) {
        return NextResponse.json({ erro: 'Tipo sanguíneo inválido.' }, { status: 400 });
      }
      doador.set('tipoSanguineo', tipo);
    }

    if (corpo.sexo !== undefined) doador.set('sexo', String(corpo.sexo).toLowerCase());
    if (corpo.telefoneContato !== undefined) {
      const tel = String(corpo.telefoneContato).trim();
      if (tel.replace(/\D/g, '').length < 10) {
        return NextResponse.json({ erro: 'Telefone inválido — informe DDD + número.' }, { status: 400 });
      }
      doador.set('telefoneContato', tel);
      doador.set('telefoneDigits', tel.replace(/\D/g, ''));
    }
    if (corpo.bairro !== undefined) doador.set('bairro', String(corpo.bairro).trim());
    if (corpo.disponivel !== undefined) doador.set('disponivel', corpo.disponivel === true);
    if (corpo.ultimaDoacao !== undefined) {
      doador.set('ultimaDoacao', corpo.ultimaDoacao ? new Date(corpo.ultimaDoacao) : null);
    }

    // ---- CEP: consulta a API externa ViaCEP para padronizar o endereço ----
    if (corpo.cep !== undefined && String(corpo.cep).trim() !== '') {
      const cep = String(corpo.cep).trim();
      if (!cepEhValido(cep)) {
        return NextResponse.json({ erro: 'CEP inválido — deve conter 8 dígitos.' }, { status: 400 });
      }
      const endereco = await consultarCep(cep);
      if (!endereco.ok) {
        return NextResponse.json({ erro: endereco.erro }, { status: 400 });
      }
      doador.set('cep', endereco.cep);
      doador.set('cidade', endereco.cidade);
      doador.set('uf', endereco.uf);
      if (!corpo.bairro && endereco.bairro) doador.set('bairro', endereco.bairro);

      // Regeocodifica (Nominatim) quando o CEP muda; falha não bloqueia a edição.
      try {
        const ponto = await geocodificarCep(endereco.cep);
        if (ponto) {
          doador.set('latitude', ponto.latitude);
          doador.set('longitude', ponto.longitude);
        }
      } catch {
        // segue sem coordenadas
      }
    }

    await doador.save();
    return NextResponse.json({ ok: true, doador: parseParaObjeto(doador) });
  } catch (erro) {
    console.error('[API /doadores/:id PUT]', erro);
    return NextResponse.json(
      { erro: 'Erro ao atualizar doador: ' + erro.message },
      { status: 500 }
    );
  }
}

// ------------------------------------------------------------------ READ (um doador)
export async function GET(requisicao, { params }) {
  try {
    const { id } = await params;
    const doador = await new Parse.Query(CLASSE_DOADOR).get(id);
    return NextResponse.json({ ok: true, doador: parseParaObjeto(doador) });
  } catch (erro) {
    // Código 101 do Parse = objeto não encontrado.
    if (erro.code === 101) {
      return NextResponse.json({ erro: 'Doador não encontrado.' }, { status: 404 });
    }
    console.error('[API /doadores/:id GET]', erro);
    return NextResponse.json(
      { erro: 'Erro ao buscar doador: ' + erro.message },
      { status: 500 }
    );
  }
}

// ---------------------------------------------------------------- DELETE
export async function DELETE(requisicao, { params }) {
  try {
    const { id } = await params;
    if (!id) {
      return NextResponse.json({ erro: 'ID do doador é obrigatório.' }, { status: 400 });
    }

    const doador = await new Parse.Query(CLASSE_DOADOR).get(id);
    await doador.destroy();

    return NextResponse.json({ ok: true, mensagem: 'Cadastro removido com sucesso.' });
  } catch (erro) {
    // Código 101 do Parse = objeto não encontrado (já removido ou ID inválido).
    if (erro.code === 101) {
      return NextResponse.json({ erro: 'Doador não encontrado.' }, { status: 404 });
    }
    console.error('[API /doadores/:id DELETE]', erro);
    return NextResponse.json(
      { erro: 'Erro ao excluir doador: ' + erro.message },
      { status: 500 }
    );
  }
}
