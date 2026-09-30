/**
 * Cliente Parse Server configurado para o Back4App — versão para SERVIDOR (Node).
 * Usado apenas dentro das rotas de API (app/api/**), que rodam em Node
 * e não possuem `localStorage`, ao contrário do navegador.
 *
 * Credenciais: Dashboard Back4App > App Settings > Security & Encryption.
 */
import Parse from 'parse/node';

const APP_ID = process.env.NEXT_PUBLIC_BACK4APP_APP_ID;
const JS_KEY = process.env.NEXT_PUBLIC_BACK4APP_JAVASCRIPT_KEY;

if (!APP_ID || !JS_KEY) {
  // Aviso explícito: sem as chaves, o app roda mas o CRUD falhará.
  console.warn(
    '[Back4App] Variáveis NEXT_PUBLIC_BACK4APP_APP_ID e NEXT_PUBLIC_BACK4APP_JAVASCRIPT_KEY não configuradas. ' +
      'Crie o arquivo .env.local a partir do .env.example.'
  );
}

Parse.initialize(APP_ID, JS_KEY);
Parse.serverURL = process.env.PARSE_SERVER_URL || 'https://parseapi.back4app.com/';

export default Parse;

/** Nome da classe (tabela) no Back4App que armazena os doadores. */
export const CLASSE_DOADOR = 'Doador';

/**
 * Converte um objeto Parse em um objeto JavaScript simples.
 *
 * PRIVACIDADE: por padrão a resposta mostra só o que é público — nome, tipo,
 * bairro, cidade e situação. O CEP e as coordenadas NUNCA saem daqui (ficam só
 * no banco, para achar o bairro e calcular distância no servidor), porque
 * revelariam a rua da pessoa.
 *   - email: incluído só quando a busca é de quem precisa de sangue;
 *   - cep:   incluído só para o próprio doador editar o cadastro.
 */
export function parseParaObjeto(obj, { email = false, cep = false } = {}) {
  if (!obj) return null;
  const ultima = obj.get('ultimaDoacao');
  const publico = {
    id: obj.id,
    nome: obj.get('nome') || '',
    tipoSanguineo: obj.get('tipoSanguineo') || '',
    sexo: obj.get('sexo') || '',
    cidade: obj.get('cidade') || '',
    bairro: obj.get('bairro') || '',
    uf: obj.get('uf') || '',
    ultimaDoacao: ultima ? ultima.toISOString().slice(0, 10) : null,
    disponivel: obj.get('disponivel') === true,
    dataCadastro: obj.createdAt ? obj.createdAt.toISOString() : null,
  };
  if (email) publico.email = obj.get('email') || '';
  if (cep) publico.cep = obj.get('cep') || '';
  return publico;
}

/** Coordenadas guardadas no cadastro — uso interno do servidor (cálculo de distância). */
export function coordenadasDe(obj) {
  const latitude = obj.get('latitude');
  const longitude = obj.get('longitude');
  return typeof latitude === 'number' && typeof longitude === 'number' ? { latitude, longitude } : null;
}
