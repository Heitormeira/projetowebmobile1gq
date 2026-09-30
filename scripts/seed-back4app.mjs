/**
 * Seed do Back4App — cria a classe "Doador" e popula com doadores de exemplo.
 *
 * Uso:
 *   1. Copie .env.example para .env.local e preencha as chaves do Back4App;
 *   2. npm install
 *   3. npm run seed
 *
 * As chaves ficam em: Dashboard Back4App > App Settings > Security & Encryption.
 */
import dotenv from 'dotenv';
dotenv.config({ path: '.env.local' });
dotenv.config({ path: '.env' });
import Parse from 'parse/node';
import { geocodificarCep } from '../lib/geolocalizacao.js';

const APP_ID = process.env.NEXT_PUBLIC_BACK4APP_APP_ID;
const JS_KEY = process.env.NEXT_PUBLIC_BACK4APP_JAVASCRIPT_KEY;

if (!APP_ID || !JS_KEY) {
  console.error(
    '✖ Configure NEXT_PUBLIC_BACK4APP_APP_ID e NEXT_PUBLIC_BACK4APP_JAVASCRIPT_KEY no arquivo .env.local (copie de .env.example).'
  );
  process.exit(1);
}

Parse.initialize(APP_ID, JS_KEY);
Parse.serverURL = 'https://parseapi.back4app.com/';

const DOADORES_EXEMPLO = [
  {
    nome: 'Maria Silva',
    tipoSanguineo: 'O-',
    sexo: 'feminino',
    cep: '50000-000',
    cidade: 'Recife',
    bairro: 'Boa Viagem',
    uf: 'PE',
    email: 'maria.silva@exemplo.com',
    ultimaDoacao: null, // nunca doou → disponível imediatamente
    disponivel: true,
  },
  {
    nome: 'João Pereira',
    tipoSanguineo: 'O+',
    sexo: 'masculino',
    cep: '01001-000',
    cidade: 'São Paulo',
    bairro: 'Centro',
    uf: 'SP',
    email: 'joao.pereira@exemplo.com',
    ultimaDoacao: new Date('2026-01-10'), // homem + 60 dias → disponível
    disponivel: true,
  },
  {
    nome: 'Ana Souza',
    tipoSanguineo: 'A+',
    sexo: 'feminino',
    cep: '20040-020',
    cidade: 'Rio de Janeiro',
    bairro: 'Centro',
    uf: 'RJ',
    email: 'ana.souza@exemplo.com',
    ultimaDoacao: new Date(), // doou hoje → indisponível pela carência
    disponivel: true,
  },
  {
    nome: 'Carlos Lima',
    tipoSanguineo: 'AB+',
    sexo: 'masculino',
    cep: '30112-000',
    cidade: 'Belo Horizonte',
    bairro: 'Centro',
    uf: 'MG',
    email: 'carlos.lima@exemplo.com',
    ultimaDoacao: null,
    disponivel: false, // marcado manualmente como indisponível
  },
  {
    nome: 'Fernanda Costa',
    tipoSanguineo: 'B+',
    sexo: 'feminino',
    cep: '80010-010',
    cidade: 'Curitiba',
    bairro: 'Centro',
    uf: 'PR',
    email: 'fernanda.costa@exemplo.com',
    ultimaDoacao: null,
    disponivel: true,
  },
];

async function main() {
  console.log('⏳ Criando doadores de exemplo no Back4App…');
  const Doador = Parse.Object.extend('Doador');

  for (const dados of DOADORES_EXEMPLO) {
    const obj = new Doador();
    obj.set('nome', dados.nome);
    obj.set('tipoSanguineo', dados.tipoSanguineo);
    obj.set('sexo', dados.sexo);
    obj.set('cep', dados.cep);
    obj.set('cidade', dados.cidade);
    obj.set('bairro', dados.bairro);
    obj.set('uf', dados.uf);
    obj.set('email', dados.email);
    obj.set('disponivel', dados.disponivel);
    obj.set('ultimaDoacao', dados.ultimaDoacao ?? null);

    // Geocodifica o CEP (Nominatim) para calcular a distância nas buscas (as coordenadas nunca são mostradas).
    try {
      const ponto = await geocodificarCep(dados.cep);
      if (ponto) {
        obj.set('latitude', ponto.latitude);
        obj.set('longitude', ponto.longitude);
        console.log(`    📍 ${dados.nome}: (${ponto.latitude}, ${ponto.longitude})`);
      }
    } catch {
      console.log(`    ⚠ sem coordenadas para ${dados.cep} (seguindo sem mapa)`);
    }

    const salvo = await obj.save();
    console.log(`  ✔ ${dados.nome} (${dados.tipoSanguineo}) → id ${salvo.id}`);
  }

  console.log('\n✅ Seed concluído! Abra /doadores para ver a listagem.');
}

main().catch((erro) => {
  console.error('✖ Falha no seed:', erro.message);
  process.exit(1);
});
