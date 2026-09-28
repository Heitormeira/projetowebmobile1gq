/**
 * Integração com a API externa ViaCEP (https://viacep.com.br/).
 * A partir de um CEP, preenche cidade, bairro e UF automaticamente.
 */

function soDigitos(cep) {
  return String(cep || '').replace(/\D/g, '');
}

export function cepEhValido(cep) {
  const d = soDigitos(cep);
  return d.length === 8;
}

/**
 * Consulta o ViaCEP e normaliza a resposta.
 * Retorna { ok, cep, cidade, bairro, uf } — ok=false quando o CEP não existe.
 */
export async function consultarCep(cep) {
  const digitos = soDigitos(cep);
  if (digitos.length !== 8) {
    return { ok: false, erro: 'CEP deve ter 8 dígitos.' };
  }

  try {
    const resposta = await fetch(`https://viacep.com.br/ws/${digitos}/json/`, {
      headers: { Accept: 'application/json' },
    });
    if (!resposta.ok) {
      return { ok: false, erro: `ViaCEP respondeu ${resposta.status}.` };
    }

    const dados = await resposta.json();
    if (dados.erro) {
      return { ok: false, erro: 'CEP não encontrado no ViaCEP.' };
    }

    return {
      ok: true,
      cep: dados.cep || `${digitos.slice(0, 5)}-${digitos.slice(5)}`,
      cidade: dados.localidade || '',
      bairro: dados.bairro || '',
      uf: dados.uf || '',
      logradouro: dados.logradouro || '',
    };
  } catch (erro) {
    return { ok: false, erro: `Falha ao consultar ViaCEP: ${erro.message}` };
  }
}
