/**
 * Cliente Parse Server configurado para o Back4App.
 * Usado tanto no servidor (rotas Node) quanto no navegador.
 *
 * Credenciais: Dashboard Back4App > App Settings > Security & Encryption.
 */
import Parse from 'parse/dist/parse.min.js';

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
  // Privacidade: sem CEP, telefone nem coordenadas (só bairro e cidade).
  if (!obj) return null;
  const ultima = obj.get('ultimaDoacao');
  return {
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
}
