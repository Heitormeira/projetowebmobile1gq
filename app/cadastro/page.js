import FormularioDoador from '@/components/FormularioDoador';

export const metadata = { title: 'Quero ser doador — Sangue Solidário' };

export default function CadastroDoador() {
  return (
    <div>
      <div className="titulo-pagina">
        <h1>Quero ser doador</h1>
        <p>
          Preencha seus dados para aparecer nas buscas de quem precisa de sangue do seu tipo. Depois de
          doar, volte e atualize a data da última doação.
        </p>
      </div>

      <FormularioDoador modo="criar" />
    </div>
  );
}
