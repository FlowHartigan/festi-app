import { useRef, useState } from 'react';
import { useFestival } from '../components/Layout';
import { FestivalMapArtwork, mapSpaces } from '../components/FestivalMapArtwork';
import { FestivalFlower } from '../components/FestivalFlower';
import { List, MapPin, Minus, Plus, RotateCcw, X } from 'lucide-react';

export function MapPage() {
  const lastSelection = useRef<HTMLElement | SVGElement | null>(null);
  const selectPlace = (id: string) => { lastSelection.current = (document.activeElement instanceof HTMLElement || document.activeElement instanceof SVGElement) ? document.activeElement : null; setSelectedId(id); };
  const closePlace = () => { setSelectedId(null); lastSelection.current?.focus(); };
  const { places } = useFestival();
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [zoom, setZoom] = useState(1);
  const allPlaces = [...mapSpaces.map(space => ({ ...space, description: places.find(place => place.id === space.id)?.description ?? '' })), ...places.filter(place => !mapSpaces.some(space => space.id === place.id))];
  const selected = allPlaces.find(place => place.id === selectedId);
  return <section className="page map-page"><div className="page-heading"><h1>Le plan</h1><FestivalFlower /></div><p className="intro">Trouve ton coin de fête.</p>
    <div className="map-explorer">
    <div className="map-toolbar" role="group" aria-label="Zoom du plan">
      <button aria-label="Réduire le plan" disabled={zoom === 1} onClick={() => setZoom(value => Math.max(1, value - .5))}><Minus size={19} aria-hidden="true" /></button>
      <output aria-live="polite">{Math.round(zoom * 100)} %</output>
      <button aria-label="Agrandir le plan" disabled={zoom === 3} onClick={() => setZoom(value => Math.min(3, value + .5))}><Plus size={19} aria-hidden="true" /></button>
      <button aria-label="Voir tout le plan" onClick={() => setZoom(1)}><RotateCcw size={18} aria-hidden="true" /></button>
    </div>
    <div className="map-scroll" tabIndex={0} role="region" aria-label="Plan du festival, agrandissez puis faites défiler pour explorer">
      <div className="map-canvas" style={{ width: `${zoom * 100}%` }}>
        <FestivalMapArtwork selectedId={selectedId} onSelect={selectPlace} />
        {places.filter(place => !mapSpaces.some(space => space.id === place.id)).map(place => <button key={place.id} className="map-marker" style={{ left: `${place.x}%`, top: `${place.y}%` }} aria-label={place.name} aria-pressed={selectedId === place.id} onClick={() => selectPlace(place.id)}>●</button>)}
      </div>
    </div>
    </div>
    <div aria-live="polite">{selected && <section className="place-detail"><MapPin size={25} aria-hidden="true" /><div><h2>{selected.name}</h2><p>{selected.description || 'Les informations de cet espace seront ajoutées prochainement.'}</p></div><button aria-label="Fermer les détails du lieu" onClick={closePlace}><X size={20} aria-hidden="true" /></button></section>}</div>
    <details className="map-places"><summary><List size={20} aria-hidden="true" /> Voir tous les lieux</summary>
    <ul className="place-list" aria-label="Lieux du festival">{allPlaces.map(place => <li key={place.id}><button onClick={() => selectPlace(place.id)} aria-pressed={selectedId === place.id}>{place.name}</button></li>)}</ul>
    </details>
  </section>;
}
