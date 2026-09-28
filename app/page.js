import Link from 'next/link';
import { COMPATIBILIDADE_RECEPTOR } from '@/lib/regras';

export default function Home() {
  return (
    <div>
      {/* ---------- Passo 1: explicação breve + chamada "Preciso de sangue" ---------- */}
      <section className="hero">
        <h1>Doar sangue é um ato solidário.<br />Encontrar um doador não deveria ser difícil.</h1>
        <p className="hero-sub">
          O <strong>Sangue Solidário</strong> conecta pessoas que precisam de sangue a
          doadores cadastrados que sejam <strong>sanguineamente compatíveis</strong> e
          estejam <strong>disponíveis</strong> na sua cidade — sem depender de correntes
          desorganizadas de mensagens.
        </p>
        <div className="hero-acoes">
          <Link href="/buscar" className="btn btn-branco btn-grande">🩸 Preciso de sangue</Link>
          <Link href="/cadastro" className="btn btn-secundario btn-grande">Quero ser doador</Link>
        </div>
      </section>

      <section className="destaques">
        <div className="destaque">
          <span className="destaque-icone" aria-hidden="true">🧬</span>
          <h3>Compatibilidade real</h3>
          <p>Busca baseada na tabela de compatibilidade por antígenos, do ponto de vista de quem recebe — não apenas tipo igual a tipo.</p>
        </div>
        <div className="destaque">
          <span className="destaque-icone" aria-hidden="true">🕒</span>
          <h3>Respeita a carência</h3>
          <p>Doador que doou há menos de 60 dias (homens) ou 90 dias (mulheres) não aparece como disponível nas buscas.</p>
        </div>
        <div className="destaque">
          <span className="destaque-icone" aria-hidden="true">📍</span>
          <h3>Localização por CEP</h3>
          <p>Integração com a API ViaCEP preenche cidade e bairro automaticamente, padronizando a busca por região.</p>
        </div>
        <div className="destaque">
          <span className="destaque-icone" aria-hidden="true">💬</span>
          <h3>Contato direto</h3>
          <p>Você fala direto com o doador por WhatsApp ou telefone. A plataforma não intermedeia a comunicação.</p>
        </div>
      </section>

      <section className="como-funciona card">
        <h2>Como funciona</h2>
        <ol className="passos">
          <li>Você informa <strong>seu tipo sanguíneo</strong> (o tipo que precisa receber) e a <strong>cidade ou CEP</strong>.</li>
          <li>O sistema calcula <strong>quais tipos você pode receber</strong> usando a tabela fixa de compatibilidade.</li>
          <li>Buscamos no banco de dados doadores <strong>compatíveis, disponíveis</strong> e fora do período de carência.</li>
          <li>Você vê a lista com nome, tipo, bairro/cidade e <strong>fala direto com o doador</strong>.</li>
        </ol>
      </section>

      <section className="como-funciona card">
        <h2>Tabela de compatibilidade (receptor → pode receber de)</h2>
        <p className="dica">
          Regra biológica imutável, implementada como estrutura fixa no código —
          por isso um receptor <strong>O−</strong> só recebe de <strong>O−</strong>, enquanto o
          receptor <strong>AB+</strong> pode receber de todos.
        </p>
        <div className="compat-tabela-wrap">
          <table className="compat-tabela">
            <thead>
              <tr>
                <th>Receptor</th>
                <th>Pode receber de</th>
              </tr>
            </thead>
            <tbody>
              {Object.entries(COMPATIBILIDADE_RECEPTOR).map(([receptor, doadores]) => (
                <tr key={receptor}>
                  <td className="compat-tipo">{receptor}</td>
                  <td>{doadores.join(', ')}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
}
