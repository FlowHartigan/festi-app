import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { createBrowserRouter, RouterProvider } from 'react-router-dom';
import { Layout } from './components/Layout';
import { loadFestival } from './lib/api';
import { Home } from './pages/Home';
import { Lineup } from './pages/Lineup';
import { MapPage } from './pages/Map';
import { Information } from './pages/Information';
import { ErrorPage } from './pages/Error';
import './styles.css';

const router = createBrowserRouter([{
  path: '/', element: <Layout />, loader: loadFestival, errorElement: <ErrorPage />,
  hydrateFallbackElement: <main className="page" role="status">Chargement du festival…</main>,
  children: [
    { index: true, element: <Home /> },
    { path: 'line-up', element: <Lineup /> },
    { path: 'plan', element: <MapPage /> },
    { path: 'informations', element: <Information /> },
    { path: '*', element: <ErrorPage notFound /> },
  ],
}]);

createRoot(document.getElementById('root')!).render(
  <StrictMode><RouterProvider router={router} /></StrictMode>,
);
