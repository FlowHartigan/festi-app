import type { MapSpaceId } from './FestivalMapArtwork';
import { Armchair, Camera, Car, Caravan, DoorOpen, Gamepad2, MapPin, Martini, Music2, Toilet, Utensils, Waves, type LucideIcon } from 'lucide-react';

const placeIcons: Record<string, LucideIcon> = {
  activities: Gamepad2, chill: Armchair, photomaton: Camera, food: Utensils,
  toilets: Toilet, stage: Music2, bar: Martini, vans: Caravan,
  parking: Car, entrance: DoorOpen, lake: Waves,
};

// Percentage anchors follow the illustrated spaces, clear of the zoom controls.
export const mapPlaceAnchors: Record<MapSpaceId, { x: number; y: number }> = {
  activities: { x: 16, y: 32 }, chill: { x: 35, y: 27 },
  photomaton: { x: 50, y: 35 }, food: { x: 32, y: 45 },
  toilets: { x: 7, y: 49 }, stage: { x: 28, y: 61 },
  bar: { x: 52, y: 54 }, vans: { x: 81, y: 54 },
  parking: { x: 82, y: 69 }, entrance: { x: 93, y: 79 },
  lake: { x: 67, y: 91 },
};

export function MapPlaceIcon({ id, size = 20 }: { id: string; size?: number }) {
  const Icon = placeIcons[id] ?? MapPin;
  return <Icon size={size} aria-hidden="true" strokeWidth={1.8} />;
}

export function MapPlaceMarker({ id, name, x, y, selected, onSelect }: {
  id: string; name: string; x: number; y: number; selected: boolean;
  onSelect: (id: string) => void;
}) {
  return <button className="map-place-marker" style={{ left: x + '%', top: y + '%' }}
    aria-label={name} aria-pressed={selected} onClick={() => onSelect(id)}>
    <span className="map-place-pin"><MapPlaceIcon id={id} /></span>
  </button>;
}
