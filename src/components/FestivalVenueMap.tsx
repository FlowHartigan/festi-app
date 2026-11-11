import { type MapSpaceId } from './FestivalMapArtwork';
const zones = [{"id":"activities","path":"M155 224L333 201 351 353 172 375Z"},{"id":"chill","path":"M423 171L650 164 647 324 425 335Z"},{"id":"photomaton","path":"M697 261L825 249 827 379 692 384Z"},{"id":"food","path":"M326 362L624 341 651 484 324 487Z"},{"id":"toilets","path":"M36 405L171 385 184 516 42 533Z"},{"id":"stage","path":"M188 477L632 477 650 664 186 680Z"},{"id":"bar","path":"M653 376L930 378 953 571 650 588Z"},{"id":"vans","path":"M1150 338L1467 309 1518 486 1443 542 1147 500Z"},{"id":"parking","path":"M1122 550L1366 562 1403 661 1191 691 1120 632Z"},{"id":"entrance","path":"M1435 529H1527V827L1430 833Z"},{"id":"lake","path":"M651 907Q765 810 1018 804Q1230 778 1388 901L1340 977 1011 1010 686 978Z"}];
export function FestivalVenueMap({ selectedId, onSelect }: { selectedId: string | null; onSelect: (id: MapSpaceId) => void }) {
 return <svg className="festival-venue-map" viewBox="0 0 1536 1024" preserveAspectRatio="none" role="group" aria-label="Plan illustré du festival">
 <image href="/assets/identity/venue-map.webp" width="1536" height="1024" />
 <defs>
   <radialGradient id="venue-stage-sign">
     <stop stopColor="#ffedce" />
     <stop offset="1" stopColor="#e7b483" />
   </radialGradient>
 </defs>
 <g aria-hidden="true" transform="translate(424 641) rotate(-3)" pointerEvents="none">
   <path d="M-109 -21 Q0 -25 109 -21 L108 22 Q0 18 -108 22 Z" fill="url(#venue-stage-sign)" stroke="#4c3528" strokeWidth="2.5" />
   <text y="7" textAnchor="middle" fill="#30271e" fontFamily="'Arial Narrow', 'Trebuchet MS', sans-serif" fontSize="22" textLength="190" lengthAdjust="spacingAndGlyphs">CHAPITEAU PRINCIPAL</text>
 </g>
 {zones.map(zone => <g key={zone.id} className={'map-zone' + (selectedId === zone.id ? ' is-selected' : '')} aria-hidden="true" onClick={() => onSelect(zone.id as MapSpaceId)}><path className="map-zone-hit" d={zone.path} /></g>)}
 </svg>;
}
