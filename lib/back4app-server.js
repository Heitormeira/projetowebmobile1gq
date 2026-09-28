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
Parse.serverURL = 'https://parseapi.back4app.com/';

export default Parse;

/** Nome da classe (tabela) no Back4App que armazena os doadores. */
export const CLASSE_DOADOR = 'Doador';

/**
 * Converte um objeto Parse em um objeto JavaScript simples,
 * mantendo apenas os campos utilizados pela aplicação.
 */
export function parseParaObjeto(obj) {
  if (!obj) return null;
  const ultima = obj.get('ultimaDoacao');
  return {
    id: obj.id,
    nome: obj.get('nome') || '',
    tipoSanguineo: obj.get('tipoSanguineo') || '',
    sexo: obj.get('sexo') || '',
    cep: obj.get('cep') || '',
    cidade: obj.get('cidade') || '',
    bairro: obj.get('bairro') || '',
    uf: obj.get('uf') || '',
    telefoneContato: obj.get('telefoneContato') || '',
    telefoneDigits: obj.get('telefoneDigits') || '',
    ultimaDoacao: ultima ? ultima.toISOString().slice(0, 10) : null,
    disponivel: obj.get('disponivel') === true,
    dataCadastro: obj.createdAt ? obj.createdAt.toISOString() : null,
    latitude: typeof obj.get('latitude') === 'number' ? obj.get('latitude') : null,
    longitude: typeof obj.get('longitude') === 'number' ? obj.get('longitude') : null,
  };
}
