/**
 * API Node — CREATE e READ da entidade Doador.
 *
 * POST /api/doadores
 *   Cadastra um novo doador: valida os dados, consulta o ViaCEP (API
 *   externa) para padronizar cidade/bairro/UF e persiste no Back4App.
 *
 * GET /api/doadores?tipoReceptor=A+&cidade=Recife&bairro=Boa%20Viagem&apenasDisponiveis=true&cepOrigem=01001000
 *   Lista doadores com filtros opcionais. Quando "tipoReceptor" é informado,
 *   aplica o fluxo do receptor (passo 3 da especificação):
 *     a) consulta a tabela fixa de compatibilidade e obtém os tipos aceitos;
 *     b) filtra no Back4App: tipoSanguineo IN tipos e disponivel = true,
 *        com a carência pós-doação verificada no servidor;
 *     c) aplica filtro de localização (cidade/bairro).
 */
import { NextResponse } from 'next/server';
import Parse, { CLASSE_DOADOR, parseParaObjeto } from '@/lib/back4app-server';
import { TIPOS_SANGUINEOS, tiposCompativeisCom, doadorDisponivel } from '@/lib/regras';
import { cepEhValido, consultarCep } from '@/lib/viacep';
import { geocodificarCep, distanciaKm } from '@/lib/geolocalizacao';

// ---------------------------------------------------------------- CREATE
export async function POST(requisicao) {
  try {
    const corpo = await requisicao.json();

    // ---- Validações ----
    const nome = String(corpo.nome || '').trim();
    if (nome.length < 3) {
      return NextResponse.json({ erro: 'Informe o nome completo (mínimo 3 letras).' }, { status: 400 });
    }

    const tipoSanguineo = String(corpo.tipoSanguineo || '').toUpperCase().trim();
    if (!TIPOS_SANGUINEOS.includes(tipoSanguineo)) {
      return NextResponse.json({ erro: 'Tipo sanguíneo inválido.' }, { status: 400 });
    }

    const telefoneContato = String(corpo.telefoneContato || '').trim();
    if (telefoneContato.replace(/\D/g, '').length < 10) {
      return NextResponse.json({ erro: 'Informe um telefone válido com DDD.' }, { status: 400 });
    }

    const cep = String(corpo.cep || '').trim();
    if (!cepEhValido(cep)) {
      return NextResponse.json({ erro: 'CEP inválido — deve conter 8 dígitos.' }, { status: 400 });
    }

    // ---- API externa (ViaCEP): padroniza cidade/bairro/UF ----
    const endereco = await consultarCep(cep);
    if (!endereco.ok) {
      return NextResponse.json({ erro: endereco.erro }, { status: 400 });
    }

    // ---- Persistência no Back4App (CREATE) ----
    const Doador = Parse.Object.extend(CLASSE_DOADOR);
    const doador = new Doador();
    doador.set('nome', nome);
    doador.set('tipoSanguineo', tipoSanguineo);
    doador.set('sexo', String(corpo.sexo || '').toLowerCase());
    doador.set('cep', endereco.cep);
    doador.set('cidade', endereco.cidade);
    doador.set('bairro', String(corpo.bairro || '').trim() || endereco.bairro);
    doador.set('uf', endereco.uf);
    doador.set('telefoneContato', telefoneContato);
    doador.set('telefoneDigits', telefoneContato.replace(/\D/g, '')); // índice p/ "Meu cadastro"
    doador.set('disponivel', corpo.disponivel !== false); // padrão: true
    doador.set('ultimaDoacao', corpo.ultimaDoacao ? new Date(corpo.ultimaDoacao) : null);

    // Geocodificação opcional (Nominatim): guarda coordenadas do CEP no registro.
    try {
      const ponto = await geocodificarCep(endereco.cep);
      if (ponto) {
        doador.set('latitude', ponto.latitude);
        doador.set('longitude', ponto.longitude);
      }
    } catch {
      // Falha de geocodificação não bloqueia o cadastro.
    }

    const salvo = await doador.save();

    return NextResponse.json(
      { ok: true, id: salvo.id, mensagem: 'Doador cadastrado com sucesso!' },
      { status: 201 }
    );
  } catch (erro) {
    console.error('[API /doadores POST]', erro);
    return NextResponse.json(
      { erro: 'Erro ao cadastrar doador: ' + erro.message },
      { status: 500 }
    );
  }
}

// ------------------------------------------------------------------ READ
export async function GET(requisicao) {
  try {
    const { searchParams } = new URL(requisicao.url);
    const tipoReceptor = (searchParams.get('tipoReceptor') || '').toUpperCase().trim();
    const cidade = (searchParams.get('cidade') || '').trim();
    const bairro = (searchParams.get('bairro') || '').trim();
    const apenasDisponiveis = searchParams.get('apenasDisponiveis') === 'true';
    const cepOrigem = (searchParams.get('cepOrigem') || '').replace(/\D/g, '');
    const modoBusca = tipoReceptor || apenasDisponiveis; // busca de receptor aplica carência

    const query = new Parse.Query(CLASSE_DOADOR);
    query.limit(500);
    query.descending('createdAt');

    // a) Compatibilidade sanguínea (estrutura fixa no código).
    if (tipoReceptor) {
      if (!TIPOS_SANGUINEOS.includes(tipoReceptor)) {
        return NextResponse.json({ erro: 'Tipo sanguíneo do receptor inválido.' }, { status: 400 });
      }
      query.containedIn('tipoSanguineo', tiposCompativeisCom(tipoReceptor));
    }

    // b) disponivel = true (a carência é verificada no servidor, abaixo,
    //    pois o Parse não calcula diferença de datas dentro da query).
    if (modoBusca) query.equalTo('disponivel', true);

    // c) Filtro de localização (cidade exata — dados padronizados pelo ViaCEP).
    if (cidade) query.equalTo('cidade', cidade);

    const resultados = await query.find();
    let doadores = resultados.map(parseParaObjeto);

    // Carência entre doações: 60 dias (homens) / 90 dias (mulheres).
    // O doador não aparece como disponível mesmo que o campo manual seja true.
    if (modoBusca) doadores = doadores.filter((d) => doadorDisponivel(d));

    // Bairro: filtro parcial, case-insensitive.
    if (bairro) {
      const alvo = bairro.toLowerCase();
      doadores = doadores.filter((d) => (d.bairro || '').toLowerCase().includes(alvo));
    }

    // Geolocalização: com CEP de origem, calcula a distância real (Haversine)
    // até cada doador e ordena os mais próximos primeiro.
    // A origem pode vir do GPS do navegador (lat/lng) ou do CEP.
    const latOrigem = parseFloat(searchParams.get('lat'));
    const lngOrigem = parseFloat(searchParams.get('lng'));
    const temGps =
      Number.isFinite(latOrigem) && Number.isFinite(lngOrigem) && Math.abs(latOrigem) <= 90 && Math.abs(lngOrigem) <= 180;

    if (temGps || cepOrigem.length === 8) {
      const origem = temGps
        ? { latitude: latOrigem, longitude: lngOrigem }
        : await geocodificarCep(cepOrigem);
      if (origem) {
        doadores = doadores
          .map((d) => ({
            ...d,
            distanciaKm:
              d.latitude != null && d.longitude != null
                ? Math.round(distanciaKm(origem.latitude, origem.longitude, d.latitude, d.longitude) * 10) / 10
                : null,
          }))
          .sort((a, b) => {
            if (a.distanciaKm == null && b.distanciaKm == null) return 0;
            if (a.distanciaKm == null) return 1; // sem coordenadas vai para o fim
            if (b.distanciaKm == null) return -1;
            return a.distanciaKm - b.distanciaKm;
          });
      }
    }

    return NextResponse.json({ ok: true, doadores });
  } catch (erro) {
    console.error('[API /doadores GET]', erro);
    return NextResponse.json(
      { erro: 'Erro ao listar doadores: ' + erro.message },
      { status: 500 }
    );
  }
}
