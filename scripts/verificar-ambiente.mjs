/**
 * Verificação do ambiente — executa as regras de negócio sem precisar de rede.
 * Uso: npm run verificar-ambiente
 */
import assert from 'node:assert';
import { COMPATIBILIDADE_RECEPTOR, TIPOS_SANGUINEOS, tiposCompativeisCom, doadorDisponivel } from '../lib/regras.js';
import { distanciaKm, linkMapa, urlIframeMapa } from '../lib/geolocalizacao.js';

console.log('▶ Verificando tabela de compatibilidade…');
assert.deepStrictEqual(tiposCompativeisCom('O-'), ['O-']);
assert.deepStrictEqual(tiposCompativeisCom('AB+'), TIPOS_SANGUINEOS);
assert.deepStrictEqual(tiposCompativeisCom('A-'), ['O-', 'A-']);
assert.deepStrictEqual(tiposCompativeisCom('B+'), ['O-', 'O+', 'B-', 'B+']);
assert.deepStrictEqual(tiposCompativeisCom('AB-'), ['O-', 'A-', 'B-', 'AB-']);
console.log('  ✔ 8 tipos, tabela fixa conferida:', Object.keys(COMPATIBILIDADE_RECEPTOR).join(', '));

console.log('▶ Verificando carência entre doações…');
const hoje = new Date();

// Homem doou há 30 dias → indisponível (carência 60).
assert.strictEqual(
  doadorDisponivel({ disponivel: true, ultimaDoacao: new Date(hoje - 30 * 86400000).toISOString(), sexo: 'masculino' }),
  false
);
// Homem doou há 61 dias → disponível.
assert.strictEqual(
  doadorDisponivel({ disponivel: true, ultimaDoacao: new Date(hoje - 61 * 86400000).toISOString(), sexo: 'masculino' }),
  true
);
// Mulher doou há 60 dias → indisponível (carência 90).
assert.strictEqual(
  doadorDisponivel({ disponivel: true, ultimaDoacao: new Date(hoje - 60 * 86400000).toISOString(), sexo: 'feminino' }),
  false
);
// Mulher doou há 91 dias → disponível.
assert.strictEqual(
  doadorDisponivel({ disponivel: true, ultimaDoacao: new Date(hoje - 91 * 86400000).toISOString(), sexo: 'feminino' }),
  true
);
// Sem sexo informado → carência padrão de 90 dias.
assert.strictEqual(
  doadorDisponivel({ disponivel: true, ultimaDoacao: new Date(hoje - 89 * 86400000).toISOString(), sexo: '' }),
  false
);
// Nunca doou e marcado disponível → disponível.
assert.strictEqual(doadorDisponivel({ disponivel: true, ultimaDoacao: null }), true);
// Marcado indisponível manualmente → indisponível mesmo sem doação recente.
assert.strictEqual(doadorDisponivel({ disponivel: false, ultimaDoacao: null }), false);
console.log('  ✔ carência 60d (homens) / 90d (mulheres) / 90d padrão — todos os casos passaram');

console.log('▶ Verificando fórmula de Haversine…');
// Pares de referência: SP→RJ ≈ 361 km; mesmo ponto = 0; SP→Recife ≈ 2130 km.
const dSPRJ = distanciaKm(-23.55, -46.6333, -22.9068, -43.1729);
assert.ok(dSPRJ > 330 && dSPRJ < 390, `SP→RJ deveria ser ~361 km (obtido ${dSPRJ.toFixed(1)})`);
assert.strictEqual(distanciaKm(-23.55, -46.6333, -23.55, -46.6333), 0);
const dSPRecife = distanciaKm(-23.55, -46.6333, -8.0476, -34.877);
assert.ok(dSPRecife > 2000 && dSPRecife < 2250, `SP→Recife deveria ser ~2130 km (obtido ${dSPRecife.toFixed(0)})`);
console.log(`  ✔ distâncias conferidas (SP→RJ ${dSPRJ.toFixed(0)} km; SP→Recife ${dSPRecife.toFixed(0)} km)`);

console.log('▶ Verificando utilitários de mapa…');
assert.ok(linkMapa(-8.05, -34.9).includes('openstreetmap.org'));
assert.ok(urlIframeMapa(-8.05, -34.9).includes('export/embed.html'));
console.log('  ✔ links de mapa gerados');

console.log('\n✅ Regras de negócio verificadas com sucesso!');
