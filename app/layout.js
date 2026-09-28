import './globals.css';
import Header from '@/components/Header';
import Footer from '@/components/Footer';

export const metadata = {
  title: 'Sangue Solidário — conectando doadores e receptores',
  description:
    'Plataforma colaborativa que conecta pessoas que precisam de sangue a doadores compatíveis e disponíveis em sua cidade.',
};

export default function RootLayout({ children }) {
  return (
    <html lang="pt-BR">
      <body>
        <Header />
        <main className="container main">{children}</main>
        <Footer />
      </body>
    </html>
  );
}
