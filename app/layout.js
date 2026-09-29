import './globals.css';
import BarraAcessibilidade from '@/components/BarraAcessibilidade';
import Header from '@/components/Header';
import Footer from '@/components/Footer';

export const metadata = {
  title: 'Sangue Solidário — encontre um doador compatível',
  description:
    'Quem precisa de sangue escolhe o tipo sanguíneo e vê quem pode doar. Quem quer ajudar faz um cadastro simples.',
};

export const viewport = {
  width: 'device-width',
  initialScale: 1,
  themeColor: '#a01717',
};

// Aplica o tamanho de letra e o contraste guardados ANTES de a página aparecer,
// para não "piscar" quando a pessoa volta ao site.
const aplicarPreferencias = `try{var d=document.documentElement,t=localStorage.getItem('ss:tamanho'),c=localStorage.getItem('ss:contraste');if(t==='2'||t==='3')d.dataset.tamanho=t;if(c==='alto')d.dataset.contraste='alto';}catch(e){}`;

export default function RootLayout({ children }) {
  return (
    <html lang="pt-BR" suppressHydrationWarning>
      <head>
        <script dangerouslySetInnerHTML={{ __html: aplicarPreferencias }} />
        {/* Fonte: Atkinson Hyperlegible, criada pelo Braille Institute para facilitar a leitura */}
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          rel="stylesheet"
          href="https://fonts.googleapis.com/css2?family=Atkinson+Hyperlegible:wght@400;700&display=swap"
        />
      </head>
      <body>
        <a className="pular" href="#conteudo">
          Ir para o conteúdo
        </a>
        <BarraAcessibilidade />
        <Header />
        <main id="conteudo" className="container main">
          {children}
        </main>
        <Footer />
      </body>
    </html>
  );
}
