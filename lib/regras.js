/**
 * Regras de negócio do Sangue Solidário.
 * Compatibilidade sanguínea (tabela imutável) + carência entre doações.
 */

// Tabela fixa de compatibilidade do ponto de vista do RECEPTOR:
// para cada tipo do receptor, quais tipos sanguíneos ele PODE RECEBER.
// Regra biológica imutável — não depende de API externa nem de cálculo dinâmico.
export const COMPATIBILIDADE_RECEPTOR = {
  'O-': ['O-'],
  'O+': ['O-', 'O+'],
  'A-': ['O-', 'A-'],
  'A+': ['O-', 'O+', 'A-', 'A+'],
  'B-': ['O-', 'B-'],
  'B+': ['O-', 'O+', 'B-', 'B+'],
  'AB-': ['O-', 'A-', 'B-', 'AB-'],
  'AB+': ['O-', 'O+', 'A-', 'A+', 'B-', 'B+', 'AB-', 'AB+'],
};

export const TIPOS_SANGUINEOS = Object.keys(COMPATIBILIDADE_RECEPTOR);

/** Retorna a lista de tipos que um receptor do tipo informado pode receber. */
export function tiposCompativeisCom(receptor) {
  return COMPATIBILIDADE_RECEPTOR[receptor] || [];
}

// Períodos de carência entre doações (base ANVISA/hemocentros), em dias.
export const CARENCIA_DIAS = {
  masculino: 60,
  feminino: 90,
};

export const CARENCIA_PADRAO_DIAS = 90;

export function diasDesde(dataISO) {
  if (!dataISO) return null;
  const data = new Date(dataISO);
  if (Number.isNaN(data.getTime())) return null;
  const hoje = new Date();
  return Math.floor((hoje.getTime() - data.getTime()) / 86400000);
}

/**
 * Um doador está realmente disponível quando:
 * 1. marcou-se manualmente como disponível; E
 * 2. não está dentro do período de carência da última doação
 *    (homens 60 dias, mulheres 90 dias — padrão 90 quando sexo não informado).
 */
export function doadorDisponivel(doador, agora = new Date()) {
  if (!doador.disponivel) return false;
  if (!doador.ultimaDoacao) return true;

  const ultima = new Date(doador.ultimaDoacao);
  if (Number.isNaN(ultima.getTime())) return true;

  const sexo = String(doador.sexo || '').toLowerCase();
  const carencia = CARENCIA_DIAS[sexo] || CARENCIA_PADRAO_DIAS;

  const dias = Math.floor((agora.getTime() - ultima.getTime()) / 86400000);
  return dias >= carencia;
}

/** Motivo pelo qual o doador está indisponível (ou null se disponível). */
export function motivoIndisponibilidade(doador, agora = new Date()) {
  if (!doador.disponivel) return 'Marcado como indisponível pelo doador';

  if (doador.ultimaDoacao) {
    const ultima = new Date(doador.ultimaDoacao);
    if (!Number.isNaN(ultima.getTime())) {
      const sexo = String(doador.sexo || '').toLowerCase();
      const carencia = CARENCIA_DIAS[sexo] || CARENCIA_PADRAO_DIAS;
      const dias = Math.floor((agora.getTime() - ultima.getTime()) / 86400000);
      if (dias < carencia) {
        const restam = carencia - dias;
        return `Em carência pós-doação (${sexo === 'masculino' ? 'homem' : 'padrão'}: ${carencia} dias) — libera em ~${restam} dia(s)`;
      }
    }
  }
  return null;
}

/** Diferença em dias entre duas datas (para exibir na UI). */
export function diferencaEmDias(dataISO, agora = new Date()) {
  const data = new Date(dataISO);
  if (Number.isNaN(data.getTime())) return null;
  return Math.floor((agora.getTime() - data.getTime()) / 86400000);
}
