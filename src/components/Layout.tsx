import { useEffect } from 'react';
import { Home, Music2, Map, Info } from 'lucide-react';
import { NavLink, Outlet, useLoaderData, useLocation, useOutletContext } from 'react-router-dom';
import type { Festival } from '../../shared/festival';

const destinations = [
  { to: '/', label: 'Accueil', icon: Home },
  { to: '/line-up', label: 'Line-up', icon: Music2 },
  { to: '/plan', label: 'Plan', icon: Map },
  { to: '/informations', label: 'Infos', icon: Info },
];

export function Layout() {
  const festival = useLoaderData() as Festival;
  const { pathname } = useLocation();
  useEffect(() => { window.scrollTo(0, 0); document.getElementById('main')?.focus(); }, [pathname]);
  return <div className="app-shell">
    <a className="skip-link" href="#main">Aller au contenu</a>
    <header className="app-header"><span>{festival.couple}</span><span>{new Intl.DateTimeFormat('fr-FR', { dateStyle: 'long', timeZone: festival.timezone }).format(new Date(`${festival.date}T12:00:00Z`))}</span></header>
    <main id="main" tabIndex={-1}><Outlet context={festival} /></main>
    <nav className="dock" aria-label="Navigation principale">
      {destinations.map(({ to, label, icon: Icon }) => <NavLink key={to} to={to} end>
        <Icon size={23} aria-hidden="true" strokeWidth={1.7} /><span>{label}</span>
      </NavLink>)}
    </nav>
  </div>;
}

export function useFestival() { return useOutletContext<Festival>(); }
