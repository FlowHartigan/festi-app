import { MapPlaceIcon, MapPlaceMarker, mapPlaceAnchors } from '../components/MapPlaceMarker';
import { HeadingArtwork } from '../components/HeadingArtwork';
import { FestivalVenueMap } from '../components/FestivalVenueMap';
import { useRef, useState } from 'react';
import { useFestival } from '../components/Layout';
import { mapSpaces } from '../components/FestivalMapArtwork';
import { FestivalFlower } from '../components/FestivalFlower';
import { Minus, Plus, X } from 'lucide-react';

const placeOrder = ['stage', 'bar', 'food', 'chill', 'activities', 'photomaton', 'toilets', 'vans', 'parking', 'entrance', 'lake'];

export function MapPage() {
  const lastSelection = useRef<HTMLElement | SVGElement | null>(null);
  const selectPlace = (id: string) => { lastSelection.current = (document.activeElement instanceof HTMLElement || document.activeElement instanceof SVGElement) ? document.activeElement : null; setSelectedId(id); };
  const closePlace = () => { setSelectedId(null); lastSelection.current?.focus(); };
  const { places } = useFestival();
  const [selectedId, setSelectedId] = useState<string | null>('stage');
  const [zoom, setZoom] = useState(1);
  const allPlaces = [...mapSpaces.map(space => ({ ...space, ...mapPlaceAnchors[space.id], description: places.find(place => place.id === space.id)?.description ?? (space.id === 'stage' ? 'Le lieu du DJ set.' : '') })), ...places.filter(place => !mapSpaces.some(space => space.id === place.id))];
  const selected = allPlaces.find(place => place.id === selectedId);
  const orderedPlaces = [...allPlaces].sort((a, b) => {
    const aIndex = placeOrder.indexOf(a.id);
    const bIndex = placeOrder.indexOf(b.id);
    return (aIndex === -1 ? placeOrder.length : aIndex) - (bIndex === -1 ? placeOrder.length : bIndex);
  });
  return <section className="page map-page"><div className="page-heading"><h1><HeadingArtwork kind="map" label="Le plan" /></h1><FestivalFlower /></div><p className="intro">Trouve ton coin de fête.</p>
    <div className="map-explorer">
    <div className="map-toolbar" role="group" aria-label="Zoom du plan">
      <button aria-label="Agrandir le plan" disabled={zoom === 3} onClick={() => setZoom(value => Math.min(3, value + .5))}><Plus size={19} aria-hidden="true" /></button>
      <button className="map-zoom-value" aria-label="Voir tout le plan" onClick={() => setZoom(1)}><output aria-live="polite">{Math.round(zoom * 100)} %</output></button>
      <button aria-label="Réduire le plan" disabled={zoom === 1} onClick={() => setZoom(value => Math.max(1, value - .5))}><Minus size={19} aria-hidden="true" /></button>
    </div>
    <div className="map-scroll" tabIndex={0} role="region" aria-label="Plan du festival, agrandissez puis faites défiler pour explorer">
      <div className="map-canvas" style={{ height: zoom * 350, width: `${zoom * 100}%` }}>
        <FestivalVenueMap selectedId={selectedId} onSelect={selectPlace} />
        {allPlaces.filter(place => place.id !== 'lake' && place.id !== 'entrance').map(place => <MapPlaceMarker key={place.id} id={place.id} name={place.name} x={place.x} y={place.y} selected={selectedId === place.id} onSelect={selectPlace} />)}
      </div>
    </div>
    </div>
    <section className="map-place-cards" aria-labelledby="map-places-heading">
      <h2 id="map-places-heading">Les coins du festival</h2>
      <ul className="map-place-grid">
        {orderedPlaces.map(place => <li key={place.id}>
          <button onClick={() => selectPlace(place.id)} aria-pressed={selectedId === place.id} aria-controls="map-place-description">
            <MapPlaceIcon id={place.id} size={20} />
            <span>{place.name}</span>
          </button>
        </li>)}
      </ul>
      <div id="map-place-description" aria-live="polite">{selected && <section className="map-place-description"><div><h3>{selected.name}</h3><p>{selected.description || 'Les informations de cet espace seront ajoutées prochainement.'}</p></div><button aria-label="Fermer les détails du lieu" onClick={closePlace}><X size={20} aria-hidden="true" /></button></section>}</div>
    </section>
  </section>;
}
