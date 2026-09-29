/**
 * Hemocentros próximos — API externa do Sangue Solidário.
 *
 * Fonte principal: Overpass API (OpenStreetMap), que responde perguntas como
 * "quais pontos de doação de sangue existem num raio de X km deste ponto?".
 * Não precisa de chave. Os pontos vêm da comunidade do OpenStreetMap, então a
 * cobertura varia de cidade para cidade.
 *
 * Plano B: se a Overpass falhar ou demorar, tenta o Nominatim (também do OSM)
 * procurando por "hemocentro" perto do ponto.
 *
 * Nada aqui é inventado: se as duas fontes não responderem, a lista volta vazia
 * e a tela avisa a pessoa. Resultados ficam em cache por 6 horas para não
 * sobrecarregar os serviços gratuitos.
 */
import { distanciaKm, linkMapa } from '@/lib/geolocalizacao';

const URL_OVERPASS = process.env.OVERPASS_URL || 'https://overpass-api.de/api/interpreter';
const URL_NOMINATIM = process.env.NOMINATIM_URL || 'https://nominatim.openstreetmap.org/search';
const UA = 'SangueSolidario/1.0 (projeto academico)';
const TEMPO_LIMITE_MS = 12000;
const CACHE_MS = 6 * 60 * 60 * 1000;

const cache = new Map();

async function buscarJson(url, opcoes = {}) {
  const resposta = await fetch(url, {
    ...opcoes,
    headers: { 'User-Agent': UA, Accept: 'application/json', ...(opcoes.headers || {}) },
    signal: AbortSignal.timeout(TEMPO_LIMITE_MS),
  });
  if (!resposta.ok) throw new Error(`HTTP ${resposta.status}`);
  return resposta.json();
}

const DIAS = { Mo: 'Seg', Tu: 'Ter', We: 'Qua', Th: 'Qui', Fr: 'Sex', Sa: 'Sáb', Su: 'Dom', PH: 'feriados' };

/** O OpenStreetMap escreve horários em inglês ("Mo-Fr 07:00-18:00"); aqui viram português simples. */
export function traduzirHorario(texto) {
  return String(texto || '')
    .replace(/\b(Mo|Tu|We|Th|Fr|Sa|Su|PH)\b/g, (d) => DIAS[d])
    .replace(/\boff\b/gi, 'fechado')
    .replace(/\s*;\s*/g, '; ')
    .replace(/-/g, ' a ')
    .replace(/(\d{2}:\d{2}) a (\d{2}:\d{2})/g, '$1 às $2')
    .trim();
}

function montarEndereco(t = {}) {
  const rua = [t['addr:street'], t['addr:housenumber']].filter(Boolean).join(', ');
  return [rua, t['addr:suburb'], t['addr:city']].filter(Boolean).join(' - ');
}

function normalizar(item, origem) {
  if (item.latitude == null || item.longitude == null) return null;
  const km = distanciaKm(origem.latitude, origem.longitude, item.latitude, item.longitude);
  return {
    ...item,
    distanciaKm: Math.round(km * 10) / 10,
    linkMapa: linkMapa(item.latitude, item.longitude),
  };
}

async function viaOverpass(origem, raioKm) {
  const raio = Math.round(raioKm * 1000);
  const { latitude: la, longitude: lo } = origem;
  const consulta = `[out:json][timeout:10];
(
  nwr["healthcare"="blood_donation"](around:${raio},${la},${lo});
  nwr["amenity"="blood_donation"](around:${raio},${la},${lo});
);
out center tags 40;`;

  const dados = await buscarJson(URL_OVERPASS, {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: `data=${encodeURIComponent(consulta)}`,
  });

  return (dados.elements || []).map((el) => {
    const t = el.tags || {};
    return {
      nome: t.name || 'Ponto de doação de sangue',
      endereco: montarEndereco(t),
      telefone: t.phone || t['contact:phone'] || '',
      horario: traduzirHorario(t.opening_hours),
      latitude: el.lat ?? el.center?.lat ?? null,
      longitude: el.lon ?? el.center?.lon ?? null,
    };
  });
}

async function viaNominatim(origem, raioKm) {
  // Caixa em volta do ponto (1 grau de latitude ≈ 111 km).
  const dLat = raioKm / 111;
  const dLon = raioKm / (111 * Math.max(Math.cos((origem.latitude * Math.PI) / 180), 0.2));
  const viewbox = [
    origem.longitude - dLon,
    origem.latitude + dLat,
    origem.longitude + dLon,
    origem.latitude - dLat,
  ].join(',');

  const dados = await buscarJson(
    `${URL_NOMINATIM}?format=json&limit=10&addressdetails=0&bounded=1&viewbox=${viewbox}&q=${encodeURIComponent('hemocentro')}`
  );

  return (Array.isArray(dados) ? dados : []).map((d) => ({
    nome: String(d.name || d.display_name || 'Hemocentro').split(',')[0],
    endereco: String(d.display_name || '').split(',').slice(1, 4).join(',').trim(),
    telefone: '',
    horario: '',
    latitude: parseFloat(d.lat),
    longitude: parseFloat(d.lon),
  }));
}

/**
 * Procura hemocentros perto de { latitude, longitude }.
 * Devolve { fonte, hemocentros } — fonte: 'overpass' | 'nominatim' | 'indisponivel'.
 */
export async function buscarHemocentros(origem, { raioKm = 30, limite = 5 } = {}) {
  const chave = `${origem.latitude.toFixed(2)},${origem.longitude.toFixed(2)}:${raioKm}`;
  const guardado = cache.get(chave);
  if (guardado && Date.now() - guardado.quando < CACHE_MS) return guardado.resultado;

  let fonte = 'indisponivel';
  let itens = [];

  try {
    itens = await viaOverpass(origem, raioKm);
    fonte = 'overpass';
  } catch (erro) {
    console.warn('[hemocentros] Overpass falhou:', erro.message);
  }

  if (itens.length === 0) {
    try {
      itens = await viaNominatim(origem, raioKm);
      if (itens.length > 0) fonte = 'nominatim';
    } catch (erro) {
      console.warn('[hemocentros] Nominatim falhou:', erro.message);
    }
  }

  const hemocentros = itens
    .map((i) => normalizar(i, origem))
    .filter(Boolean)
    .sort((a, b) => a.distanciaKm - b.distanciaKm)
    .slice(0, limite);

  const resultado = { fonte, hemocentros };
  // Só guarda no cache quando houve resposta de verdade (falha temporária não fica presa).
  if (fonte !== 'indisponivel') cache.set(chave, { quando: Date.now(), resultado });
  return resultado;
}
