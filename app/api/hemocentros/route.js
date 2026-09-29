/**
 * API Node — hemocentros perto de você.
 *
 * GET /api/hemocentros?cep=50000000
 * GET /api/hemocentros?lat=-8.05&lng=-34.9
 *   1. descobre o ponto de partida (coordenadas do navegador ou CEP via Nominatim);
 *   2. consulta a Overpass API (OpenStreetMap) por pontos de doação de sangue;
 *   3. devolve os mais próximos, com distância calculada por Haversine.
 */
import { NextResponse } from 'next/server';
import { geocodificarCep } from '@/lib/geolocalizacao';
import { buscarHemocentros } from '@/lib/hemocentros';

export async function GET(requisicao) {
  try {
    const { searchParams } = new URL(requisicao.url);
    const lat = parseFloat(searchParams.get('lat'));
    const lng = parseFloat(searchParams.get('lng'));
    const cep = (searchParams.get('cep') || '').replace(/\D/g, '');

    let origem = null;
    if (Number.isFinite(lat) && Number.isFinite(lng) && Math.abs(lat) <= 90 && Math.abs(lng) <= 180) {
      origem = { latitude: lat, longitude: lng };
    } else if (cep.length === 8) {
      origem = await geocodificarCep(cep);
    } else {
      return NextResponse.json({ erro: 'Informe o CEP ou use a sua localização.' }, { status: 400 });
    }

    if (!origem) {
      return NextResponse.json(
        { erro: 'Não achamos esse CEP no mapa. Tente outro CEP ou use a sua localização.' },
        { status: 404 }
      );
    }

    const { fonte, hemocentros } = await buscarHemocentros(origem);
    return NextResponse.json({ ok: true, fonte, origem, hemocentros });
  } catch (erro) {
    console.error('[API /hemocentros GET]', erro);
    return NextResponse.json({ erro: 'Erro ao buscar hemocentros: ' + erro.message }, { status: 500 });
  }
}
