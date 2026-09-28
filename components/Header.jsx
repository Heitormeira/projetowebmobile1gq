'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';

const links = [
  { href: '/', rotulo: 'Início' },
  { href: '/buscar', rotulo: 'Preciso de sangue' },
  { href: '/cadastro', rotulo: 'Quero ser doador' },
  { href: '/doadores', rotulo: 'Doadores' },
  { href: '/meu-cadastro', rotulo: 'Meu cadastro' },
];

export default function Header() {
  const pathname = usePathname();
  const ativo = (href) => (href === '/' ? pathname === '/' : pathname.startsWith(href));

  return (
    <header className="site-header">
      <div className="container header-inner">
        <Link href="/" className="logo" aria-label="Sangue Solidário — página inicial">
          <span className="logo-icone" aria-hidden="true">🩸</span>
          <span className="logo-texto">
            Sangue <strong>Solidário</strong>
          </span>
        </Link>

        <nav className="nav" aria-label="Navegação principal">
          {links.map((l) => (
            <Link
              key={l.href}
              href={l.href}
              className={`nav-link${ativo(l.href) ? ' nav-link-ativo' : ''}`}
              aria-current={ativo(l.href) ? 'page' : undefined}
            >
              {l.rotulo}
            </Link>
          ))}
        </nav>
      </div>
    </header>
  );
}
