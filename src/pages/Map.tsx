import { useState } from 'react';
import { useFestival } from '../components/Layout';

export function MapPage() {
  const { mapImage, places } = useFestival();
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const selected = places.find(place => place.id === selectedId);
  return <section className="page"><h1>Le plan du festival</h1><p className="intro">Un petit monde à découvrir, à votre rythme.</p>
    <div className="map-scroll" tabIndex={0} role="region" aria-label="Plan du festival, défilement horizontal disponible">
      <div className="map-canvas"><img src={mapImage} alt="Plan illustré du festival : scène, bar, nourriture, activités, détente, photomaton, toilettes, parking et espace vans." width={1536} height={1024} />
        {places.map(place => <button key={place.id} className="map-marker" style={{ left: `${place.x}%`, top: `${place.y}%` }} aria-label={place.name} aria-pressed={selectedId === place.id} onClick={() => setSelectedId(place.id)}>●</button>)}
      </div>
    </div>
    {places.length > 0 ? <><p className="quiet-note">Touchez un repère ou choisissez un lieu.</p><ul className="place-list">{places.map(place => <li key={place.id}><button onClick={() => setSelectedId(place.id)} aria-pressed={selectedId === place.id}>{place.name}</button></li>)}</ul></> : <p className="quiet-note">Les détails des espaces seront ajoutés prochainement. Faites glisser le plan pour l’explorer.</p>}
    {selected && <section className="place-detail" aria-live="polite"><h2>{selected.name}</h2><p>{selected.description}</p><button onClick={() => setSelectedId(null)}>Fermer</button></section>}
  </section>;
}
