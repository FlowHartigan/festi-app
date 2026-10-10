import { useFestival } from '../components/Layout';

export function Information() {
  const { information } = useFestival();
  return <section className="page"><h1>Les infos pratiques</h1><p className="intro">Tout pour profiter de la fête.</p>
    <div className="information-list">{information.map(item => <section key={item.id}><h2>{item.title}</h2><p>{item.body}</p></section>)}</div>
  </section>;
}
