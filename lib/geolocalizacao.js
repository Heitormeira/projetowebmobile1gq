/**
 * Geolocalização do Sangue Solidário.
 *
 * 1. Nominatim (OpenStreetMap) — converte CEP/endereço em coordenadas;
 * 2. Fórmula de Haversine — distância real em linha reta entre dois pontos.
 *
 * Usada na busca de doadores: quando o receptor informa o CEP de origem,
 * os resultados são ordenados pela distância real. Coordenadas são
 * persistidas no Back4App e cacheadas em memória para respeitar a política
 * de uso do Nominatim (máx. 1 requisição/segundo).
 */

const URL_NOMINATIM = 'https://nominatim.openstreetmap.org/search';
const UA = 'SangueSolidario/1.0 (projeto academico)';

// Cache em memória: evita repetir consultas de geocodificação na mesma execução.
const cacheCoordenadas = new Map();
let ultimaConsulta = 0;

async function respeitarRateLimit() {
  const agora = Date.now();
  const espera = 1100 - (agora - ultimaConsulta);
  if (espera > 0) await new Promise((r) => setTimeout(r, espera));
  ultimaConsulta = Date.now();
}

async function buscarNoNominatim(url) {
  try {
    await respeitarRateLimit();
    const resposta = await fetch(url, { headers: { 'User-Agent': UA, Accept: 'application/json' } });
    if (!resposta.ok) return null;
    const dados = await resposta.json();
    if (!Array.isArray(dados) || dados.length === 0) return null;

    const ponto = { latitude: parseFloat(dados[0].lat), longitude: parseFloat(dados[0].lon) };
    if (Number.isNaN(ponto.latitude) || Number.isNaN(ponto.longitude)) return null;
    return ponto;
  } catch {
    return null;
  }
}

/** Converte um endereço livre em { latitude, longitude } via Nominatim. */
export async function geocodificar(consulta) {
  const chave = `busca:${consulta}`;
  if (cacheCoordenadas.has(chave)) return cacheCoordenadas.get(chave);

  const ponto = await buscarNoNominatim(
    `${URL_NOMINATIM}?format=json&limit=1&countrycodes=br&q=${encodeURIComponent(consulta)}`
  );
  if (ponto) cacheCoordenadas.set(chave, ponto);
  return ponto;
}

/** Geocodifica um CEP brasileiro (8 dígitos). Tenta postalcode e cai para busca textual. */
export async function geocodificarCep(cep) {
  const digitos = String(cep || '').replace(/\D/g, '');
  if (digitos.length !== 8) return null;

  const chave = `cep:${digitos}`;
  if (cacheCoordenadas.has(chave)) return cacheCoordenadas.get(chave);

  // 1ª tentativa: busca estruturada por código postal.
  let ponto = await buscarNoNominatim(
    `${URL_NOMINATIM}?format=json&limit=1&countrycodes=br&postalcode=${digitos}`
  );

  // Fallback: consulta textual ("01001-000, Brasil") — cobertura variável do OSM.
  if (!ponto) ponto = await geocodificar(`${digitos}, Brasil`);

  if (ponto) cacheCoordenadas.set(chave, ponto);
  return ponto;
}

/**
 * Fórmula de Haversine — distância em quilômetros entre dois pontos.
 * https://pt.wikipedia.org/wiki/F%C3%B3rmula_de_haversine
 */
export function distanciaKm(lat1, lon1, lat2, lon2) {
  const R = 6371; // raio médio da Terra em km
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLon = ((lon2 - lon1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos((lat1 * Math.PI) / 180) * Math.cos((lat2 * Math.PI) / 180) * Math.sin(dLon / 2) ** 2;
  return 2 * R * Math.asin(Math.sqrt(a));
}

/** Link do OpenStreetMap centrado em um ponto (para "ver no mapa"). */
export function linkMapa(latitude, longitude, zoom = 15) {
  return `https://www.openstreetmap.org/?mlat=${latitude}&mlon=${longitude}#map=${zoom}/${latitude}/${longitude}`;
}

/** URL de iframe do OpenStreetMap (export/embed) centrada em um ponto. */
export function urlIframeMapa(latitude, longitude, zoom = 14) {
  const delta = 0.02;
  const bbox = [longitude - delta, latitude - delta, longitude + delta, latitude + delta].join('%2C');
  return `https://www.openstreetmap.org/export/embed.html?bbox=${bbox}&layer=mapnik&marker=${latitude}%2C${longitude}`;
}
