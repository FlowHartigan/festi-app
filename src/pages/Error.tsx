export function ErrorPage({ notFound = false }: { notFound?: boolean }) {
  const Element = notFound ? 'section' : 'main';
  return <Element className="page error-page"><h1>{notFound ? 'Page introuvable' : 'Le festival revient bientôt'}</h1><p>{notFound ? 'Ce lien ne mène à aucune page.' : 'Les informations ne se chargent pas pour le moment. Vérifiez votre connexion et réessayez.'}</p><a className="action" href="/">{notFound ? 'Revenir à l’accueil' : 'Réessayer'}</a></Element>;
}
