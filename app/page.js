import Link from 'next/link';
import { COMPATIBILIDADE_RECEPTOR } from '@/lib/regras';

export default function Home() {
  return (
    <div>
      <section className="abertura">
        <h1>Encontre um doador de sangue compatível.</h1>
        <p className="lede">
          Quem precisa de sangue escolhe o tipo sanguíneo e vê quem pode ajudar. Quem quer ajudar faz
          um cadastro simples.
        </p>
        <div className="botoes">
          <Link href="/buscar" className="btn btn-grande">
            Preciso de sangue
          </Link>
          <Link href="/cadastro" className="btn btn-secundario btn-grande">
            Quero ser doador
          </Link>
        </div>
      </section>

      <section className="secao">
        <h2>Como funciona</h2>
        <ol className="passos">
          <li>Escolha o tipo sanguíneo de quem vai receber o sangue.</li>
          <li>Veja a lista de pessoas que podem doar.</li>
          <li>Envie um e-mail para a pessoa pedindo ajuda.</li>
        </ol>
      </section>

      <section className="secao">
        <h2>Bom saber</h2>
        <ul className="lista-simples">
          <li>
            Quem doou há pouco tempo não aparece na busca. O intervalo é de 60 dias para homens e de 90
            dias para mulheres.
          </li>
          <li>Nem todo tipo sanguíneo pode doar para todos os outros. O site já faz essa conta para você.</li>
          <li>
            Sua privacidade é protegida: só aparecem o seu bairro e o seu e-mail. Rua, CEP e telefone
            nunca são mostrados.
          </li>
          <li>
            O site só aproxima as pessoas. A doação deve ser feita em hemocentros e bancos de sangue
            credenciados.
          </li>
        </ul>

        <details className="detalhes">
          <summary>Ver quem pode doar para quem</summary>
          <div className="rolagem">
            <table className="compat-tabela">
              <thead>
                <tr>
                  <th scope="col">Quem vai receber</th>
                  <th scope="col">Pode receber sangue de</th>
                </tr>
              </thead>
              <tbody>
                {Object.entries(COMPATIBILIDADE_RECEPTOR).map(([receptor, doadores]) => (
                  <tr key={receptor}>
                    <th scope="row" className="compat-tipo">
                      {receptor}
                    </th>
                    <td>{doadores.join(', ')}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </details>
      </section>
    </div>
  );
}
