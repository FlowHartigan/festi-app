import { useFestival } from '../components/Layout';

export function Lineup() {
  const { program } = useFestival();
  return <section className="page"><h1>Le line-up</h1><p className="intro">Les moments à partager, du premier sourire à la dernière danse.</p>
    <ol className="timeline">{[...program].sort((a, b) => a.time.localeCompare(b.time)).map(moment =>
      <li key={moment.id}><time>{moment.time.replace(':', ' h ')}</time><div><h2>{moment.title}</h2><p>{moment.description}</p><small>{moment.location}</small></div></li>
    )}</ol>
    <p className="quiet-note">La suite du programme sera dévoilée ici.</p>
  </section>;
}
