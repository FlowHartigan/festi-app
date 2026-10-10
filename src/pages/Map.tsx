import { useState } from 'react';
import { useFestival } from '../components/Layout';
import { FestivalMapArtwork, mapSpaces } from '../components/FestivalMapArtwork';
import { Minus, Plus, RotateCcw } from 'lucide-react';

export function MapPage() {
  const { places } = useFestival();
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [zoom, setZoom] = useState(1);
  const allPlaces = [...mapSpaces.map(space => ({ ...space, description: places.find(place => place.id === space.id)?.description ?? '' })), ...places.filter(place => !mapSpaces.some(space => space.id === place.id))];
  const selected = allPlaces.find(place => place.id === selectedId);
  return <section className="page"><h1>Le plan du festival</h1><p className="intro">Un petit monde à découvrir, à votre rythme.</p>
    <div className="map-toolbar" role="group" aria-label="Zoom du plan">
      <button aria-label="Réduire le plan" disabled={zoom === 1} onClick={() => setZoom(value => Math.max(1, value - .5))}><Minus size={19} aria-hidden="true" /></button>
      <output aria-live="polite">{Math.round(zoom * 100)} %</output>
      <button aria-label="Agrandir le plan" disabled={zoom === 3} onClick={() => setZoom(value => Math.min(3, value + .5))}><Plus size={19} aria-hidden="true" /></button>
      <button aria-label="Voir tout le plan" onClick={() => setZoom(1)}><RotateCcw size={18} aria-hidden="true" /></button>
    </div>
    <div className="map-scroll" tabIndex={0} role="region" aria-label="Plan du festival, agrandissez puis faites défiler pour explorer">
      <div className="map-canvas" style={{ width: `${zoom * 100}%` }}>
        <FestivalMapArtwork selectedId={selectedId} onSelect={setSelectedId} />
        {places.filter(place => !mapSpaces.some(space => space.id === place.id)).map(place => <button key={place.id} className="map-marker" style={{ left: `${place.x}%`, top: `${place.y}%` }} aria-label={place.name} aria-pressed={selectedId === place.id} onClick={() => setSelectedId(place.id)}>●</button>)}
      </div>
    </div>
    <ul className="place-list" aria-label="Lieux du festival">{allPlaces.map(place => <li key={place.id}><button onClick={() => setSelectedId(place.id)} aria-pressed={selectedId === place.id}>{place.name}</button></li>)}</ul>
    <div aria-live="polite">{selected && <section className="place-detail"><h2>{selected.name}</h2><p>{selected.description || 'Les informations de cet espace seront ajoutées prochainement.'}</p><button onClick={() => setSelectedId(null)}>Fermer</button></section>}</div>
  </section>;
}
