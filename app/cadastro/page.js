import FormularioDoador from '@/components/FormularioDoador';

export const metadata = { title: 'Quero ser doador — Sangue Solidário' };

export default function CadastroDoador() {
  return (
    <div>
      <div className="cabecalho-pagina">
        <div>
          <h1>❤️ Quero ser doador</h1>
          <p>
            Preencha seus dados para aparecer nas buscas de receptores compatíveis.
            Após doar, volte aqui e atualize a data da última doação.
          </p>
        </div>
      </div>

      <div className="card">
        <FormularioDoador modo="criar" />
      </div>
    </div>
  );
}
