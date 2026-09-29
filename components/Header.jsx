'use client';

import { useEffect, useState } from 'react';
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
  const [aberto, setAberto] = useState(false);

  // Fecha o menu do celular ao trocar de página.
  useEffect(() => {
    setAberto(false);
  }, [pathname]);

  const ativo = (href) => (href === '/' ? pathname === '/' : pathname.startsWith(href));

  return (
    <header className="cabecalho">
      <div className="container">
        <div className="cabecalho-topo">
          <Link href="/" className="logo">
            Sangue <span>Solidário</span>
          </Link>

          {/* Botão com texto (e não só ícone) para ficar claro para todos. */}
          <button
            type="button"
            className="menu-botao"
            aria-expanded={aberto}
            aria-controls="menu-principal"
            onClick={() => setAberto((v) => !v)}
          >
            {aberto ? 'Fechar menu' : 'Menu'}
          </button>
        </div>

        <nav id="menu-principal" className={`nav${aberto ? ' nav-aberto' : ''}`} aria-label="Menu principal">
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
