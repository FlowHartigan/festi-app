import { memo, type ReactNode } from 'react';

// Positions traced from assets/plan-mariage.png, in its original 1536 × 1024 frame.
export const mapSpaces = [
  { id: 'activities', name: 'Activités' }, { id: 'chill', name: 'Coin chill' },
  { id: 'photomaton', name: 'Photomaton' }, { id: 'food', name: 'Stands nourriture' },
  { id: 'toilets', name: 'Toilettes' }, { id: 'stage', name: 'Scène' },
  { id: 'bar', name: 'Bar' }, { id: 'vans', name: 'Espace van dodo' },
  { id: 'parking', name: 'Parking' }, { id: 'entrance', name: 'Entrée' },
  { id: 'lake', name: 'Étang' },
] as const;
export type MapSpaceId = typeof mapSpaces[number]['id'];

function Sign({ x, y, width, children, rotate = 0 }: { x: number; y: number; width: number; children: ReactNode; rotate?: number }) {
  return <g transform={`translate(${x} ${y}) rotate(${rotate})`} className="illustrated-sign">
    <path d={`M8 30v34M${width - 8} 30v34`} stroke="#705039" strokeWidth="4" />
    <path d={`M0 2Q${width / 2} -5 ${width} 0L${width - 2} 39Q${width / 2} 35 2 42Z`} fill="url(#fm-sign)" stroke="#4c3528" strokeWidth="2.5" />
    <path d={`M5 7L${width - 6} 5M7 34L${width - 9} 32`} stroke="#bb8650" opacity=".4" />
    <text x={width / 2} y="27" textAnchor="middle" fill="#30271e" stroke="none" fontFamily="'Arial Narrow', 'Trebuchet MS', sans-serif" fontSize="21" fontWeight="700" letterSpacing="-.5">{children}</text>
  </g>;
}

function Lights({ points }: { points: [number, number][] }) {
  return <g aria-hidden="true">
    <path d={`M${points.map(([x, y]) => `${x} ${y}`).join(' L')}`} fill="none" stroke="#4c3528" strokeWidth="2" />
    {points.map(([x, y], i) => <g key={i}><circle cx={x} cy={y + 4} r="8" fill="#ffc36d" opacity=".18" /><circle cx={x} cy={y + 4} r="3" fill="#ffe3a1" stroke="#d48d38" strokeWidth=".6" /></g>)}
  </g>;
}

const Tree = ({ x, y, scale = 1, tone = 0 }: { x: number; y: number; scale?: number; tone?: number }) =>
  <use href="#fm-tree" transform={`translate(${x} ${y}) scale(${scale})`} color={['#4b5843', '#727044', '#919052', '#354b42'][tone % 4]} />;

const forestTrees = [
  [28,350,1.05,0],[62,322,1.12,1],[98,278,1.05,0],[126,244,1.1,2],[167,277,.9,3],
  [198,226,1.2,0],[236,254,1.08,2],[266,196,1.1,3],[283,157,1.12,0],[315,144,1.25,0],
  [313,218,1.25,2],[345,200,1.18,1],[374,166,1.2,0],[403,218,1.4,2],[440,189,1.18,0],
  [460,250,.98,2],[512,210,1.16,1],[550,240,1,0],[575,217,1.05,0],[641,246,1.2,1],
  [676,279,1.13,0],[704,302,.85,2],[365,336,1.2,2],[326,290,1,1],[83,365,1.1,2],
  [45,434,1.1,0],[188,400,1.1,1],[223,440,1.1,0],[306,450,.86,0],
  [601,408,1,1],[648,420,.9,0],[682,359,.9,2],[827,365,.96,1],[853,414,.91,2],
  [895,310,.82,1],[973,454,.93,1],[1004,431,1.18,0],[1079,456,1.2,1],
  [1058,524,1.03,0],[1034,569,1.02,1],[982,574,1.08,0],[930,568,1.18,1],
  [879,568,1.23,2],[835,547,1.06,0],[811,593,.83,1],[731,598,.94,0],
  [71,580,.94,0],[37,625,.95,0],[128,591,.84,1],[182,557,.79,0],[239,537,.83,1],
  [682,664,1.04,0],[1019,661,.81,1],[948,633,.66,0],[833,699,.74,0],
  [1135,775,.86,0],[1373,747,.88,1],[1421,812,.91,0],
  [27,936,1.7,3],[48,1013,1.7,0],[100,1041,1.43,3],[147,995,1.15,0],
  [244,866,1.16,1],[324,958,1.23,0],[387,1046,1.54,0],[477,1000,1.17,1],
  [552,1044,1.48,0],[593,1017,1.05,1],[1482,1013,1.64,0],[1403,1067,1.54,3],
  [1515,1100,1.7,3],[1328,1058,1.08,0],
] as const;

const Landscape = memo(function Landscape() {
  return <g aria-hidden="true">
    <rect width="1536" height="1024" fill="url(#fm-paper)" />
    <path d="M16 217L96 175Q158 128 192 147L298 111Q356 132 393 122L507 102L664 131Q697 115 800 168L914 180L1041 118Q1098 101 1162 129L1290 171L1390 188L1520 222V364H16Z" fill="#939784" stroke="#494a3c" strokeWidth="2" />
    <path d="M18 256Q179 204 328 229T580 216Q700 215 822 164T957 160Q1104 222 1325 190L1519 253V340H18Z" fill="#999879" stroke="#555443" strokeWidth="1.7" />
    <path d="M14 291Q211 233 380 251T731 229Q871 225 1044 269T1520 297L1536 1024H0Z" fill="url(#fm-grass)" />
    <path d="M14 291Q211 233 380 251T731 229Q871 225 1044 269T1520 297L1536 1024H0Z" fill="url(#fm-meadow)" opacity=".55" />
    <g fill="none" strokeLinecap="round" strokeLinejoin="round">
      <path d="M1457 1028Q1490 936 1480 820L1480 566Q1368 619 1280 604Q1153 594 1080 508Q986 413 800 384Q707 365 617 332Q521 299 418 334L249 361Q182 376 145 440L84 531Q38 576 107 621L225 666Q451 712 650 638L790 557" stroke="#d1a56c" strokeWidth="52" />
      <path d="M1457 1028Q1490 936 1480 820L1480 566Q1368 619 1280 604Q1153 594 1080 508Q986 413 800 384Q707 365 617 332Q521 299 418 334L249 361Q182 376 145 440L84 531Q38 576 107 621L225 666Q451 712 650 638L790 557" stroke="#edc893" strokeWidth="43" />
      <path d="M1110 481Q1138 543 1093 592Q1080 651 1203 666Q1370 685 1447 579M242 365Q242 457 302 490L616 513Q675 502 706 481M1165 465Q1191 400 1298 409T1462 448" stroke="#edc893" strokeWidth="34" />
      <path d="M1457 1028Q1490 936 1480 820L1480 566Q1368 619 1280 604Q1153 594 1080 508Q986 413 800 384Q707 365 617 332Q521 299 418 334L249 361Q182 376 145 440L84 531Q38 576 107 621L225 666Q451 712 650 638L790 557" stroke="#af875a" strokeWidth="1.5" strokeDasharray="5 11" />
    </g>
    <g fill="#433a2d" stroke="#433a2d" strokeWidth="2">
      <path d="M1328 35C1266 45 1286 127 1337 110L1357 92C1307 126 1295 63 1328 35Z" fill="#f3e0bb" />
      {[ [73,127], [776,74], [1199,58] ].map(([x,y]) => <path key={x} d={`M${x} ${y-19}l3 16 12 3-12 3-3 17-3-17-12-3 12-3Z`} fill="#dfb670" />)}
      {[[168,61],[560,47],[1438,132]].map(([x,y]) => <g key={x} stroke="#926343">{Array.from({length:8},(_,i)=><path key={i} d={`M${x} ${y-9}v-14`} transform={`rotate(${i*45} ${x} ${y})`} />)}</g>)}
    </g>
    {/* Individual distant trees follow the horizon of the reference illustration. */}
    {Array.from({length: 27}, (_, i) => <Tree key={i} x={733 + i * 29} y={248 + i * 1.9 + Math.sin(i * 2) * 14} scale={.36 + (i % 3) * .13} tone={i} />)}
    {forestTrees.map(([x,y,scale,tone],i) => <Tree key={i} x={x} y={y + (y < 220 ? 60 : y < 280 ? 30 : 0)} scale={scale} tone={tone} />)}
    {[[95,784],[168,765],[302,727],[357,752],[408,792],[493,775],[546,713],[589,800],[667,729],[731,777],[867,756],[973,742],[482,887],[184,811],[1137,535],[1202,563],[1350,566],[1491,521],[1500,386]].map(([x,y],i)=><Tree key={i} x={x} y={y} scale={.5+(i%3)*.13} tone={i} />)}
  </g>;
});

function Definitions() {
  return <defs>
    <linearGradient id="fm-paper" x2="0" y2="1"><stop stopColor="#f4e4c8" /><stop offset="1" stopColor="#e7cda1" /></linearGradient>
    <linearGradient id="fm-grass" x2="0" y2="1"><stop stopColor="#c7b575" /><stop offset="1" stopColor="#a89b60" /></linearGradient>
    <linearGradient id="fm-sign" x2="0" y2="1"><stop stopColor="#e9bd87" /><stop offset=".3" stopColor="#ffe4ba" /><stop offset=".8" stopColor="#f9d6a6" /><stop offset="1" stopColor="#d19c63" /></linearGradient>
    <linearGradient id="fm-water" x2=".2" y2="1"><stop stopColor="#526e6a" /><stop offset="1" stopColor="#829b91" /></linearGradient>
    <pattern id="fm-meadow" width="53" height="39" patternUnits="userSpaceOnUse"><path d="M3 12l2-4 1 4M28 26l2-5 2 4M44 9l1-3" fill="none" stroke="#7b7b4d" strokeWidth="1" /><path d="M8 31l4-1M36 5l3 1M21 15l2 1" stroke="#eee1af" strokeWidth="1.5" /><circle cx="14" cy="6" r="1" fill="#6e704b" /><circle cx="49" cy="30" r="1" fill="#e2cc8a" /></pattern>
    <pattern id="fm-roof" width="16" height="13" patternUnits="userSpaceOnUse" patternTransform="skewX(-22)"><rect width="16" height="13" fill="#635d61" /><path d="M0 0h16v13H0ZM8 0v13" fill="none" stroke="#393234" strokeWidth="1" /><path d="M2 2h4M10 3h4" stroke="#958a83" strokeWidth="1" /></pattern>
    <pattern id="fm-stone" width="31" height="25" patternUnits="userSpaceOnUse"><rect width="31" height="25" fill="#dec197" /><path d="M3 3h10v7H3ZM18 1h9v12h-9ZM6 16h16v7H6Z" fill="#a88e6d" stroke="#6e5840" strokeWidth=".8" /><path d="M4 4h7M19 3h6M7 17h12" stroke="#f7dfb3" /></pattern>
    <pattern id="fm-planks" width="12" height="70" patternUnits="userSpaceOnUse"><rect width="12" height="70" fill="#bd8858" /><path d="M0 0v70M4 8v33M8 48v16" stroke="#66472e" strokeWidth="1" /></pattern>
    <pattern id="fm-ripples" width="86" height="37" patternUnits="userSpaceOnUse"><path d="M4 9h14m9 17h22m13-21h16M53 15h9M5 34h8" stroke="#c4d0b7" opacity=".6" fill="none" /><path d="M17 18h12m23 16h20" stroke="#3f625e" opacity=".6" /></pattern>
    <filter id="fm-paper-grain"><feTurbulence type="fractalNoise" baseFrequency=".48" numOctaves="3" stitchTiles="stitch" /><feColorMatrix type="saturate" values="0" /><feComponentTransfer><feFuncA type="linear" slope=".11" /></feComponentTransfer><feBlend in="SourceGraphic" mode="multiply" /></filter>
    <g id="fm-tree" stroke="#363c2e" strokeWidth="1.8" strokeLinejoin="round">
      <ellipse cx="0" cy="1" rx="24" ry="7" fill="#565139" opacity=".16" stroke="none" />
      <path d="M-3 0l1-72h6L4 0Z" fill="#93673e" />
      <path d="M0-91C-12-113-15-98-12-88-29-106-30-87-20-78-43-91-40-70-26-65-48-70-48-49-29-48-43-29-28-23-13-39-17-20-2-19 4-34 17-18 29-31 22-42 43-30 44-48 29-53 49-55 41-73 27-68 41-87 25-93 17-81 27-103 9-108 7-90 9-116-5-119 0-91Z" fill="currentColor" />
      <path d="M0-2L1-83M0-29l-20-25M2-42l22-20M0-55l-15-17M2-65l12-16" fill="none" stroke="#aa8050" strokeWidth="3" />
      {Array.from({length:19},(_,i)=><ellipse key={i} cx={Math.sin(i*2.4)*(13+i%4*4)} cy={-39-(i*13%54)} rx="2.6" ry="5.3" transform={`rotate(${i%2?28:-28} ${Math.sin(i*2.4)*(13+i%4*4)} ${-39-(i*13%54)})`} fill={i%3===0?'#b4aa68':'#89905f'} stroke="none" opacity=".75" />)}
    </g>
    <g id="fm-barrel" stroke="#4b3525" strokeWidth="1.8"><path d="M-10-27Q-15-13-10 0Q0 6 10 0Q15-13 10-27Z" fill="#b17b42" /><ellipse cy="-27" rx="10" ry="4" fill="#d7a768" /><path d="M-12-21Q0-16 12-21M-12-7Q0-2 12-7M-4-24v23M4-24v23" fill="none" /></g>
    <g id="fm-van" stroke="#343832" strokeWidth="2.5" strokeLinejoin="round">
      <ellipse cx="44" cy="49" rx="49" ry="10" fill="#675636" opacity=".2" stroke="none" />
      <path d="M0 8L22-9H76L96 8V45L77 54H3Z" fill="currentColor" />
      <path d="M0 8h72L96 8 76-9H22Z" fill="#ede2c5" />
      <path d="M74 12h19v22H77ZM5 13h21v20H5ZM33 13h19v20H33ZM56 13h12v20H56Z" fill="#7c9da4" />
      <path d="M5 15l13-1M35 15h11M79 15h11" stroke="#d3e0d6" />
      <path d="M30 10v39M70 10v39M3 38h67M83 37h10" fill="none" />
      <ellipse cx="18" cy="49" rx="8" ry="11" fill="#313638" /><ellipse cx="65" cy="49" rx="8" ry="11" fill="#313638" /><ellipse cx="18" cy="49" rx="3" ry="5" fill="#aaac9c" /><ellipse cx="65" cy="49" rx="3" ry="5" fill="#aaac9c" />
      <path d="M77 44h7m4-1h7" stroke="#fce4a0" strokeWidth="4" />
    </g>
    <g id="fm-car" stroke="#303738" strokeWidth="2.4" strokeLinejoin="round"><ellipse cx="33" cy="32" rx="36" ry="8" fill="#665b44" stroke="none" opacity=".18" /><path d="M-2 18L15 0 47-5 65 5 70 25 56 34 0 32Z" fill="currentColor" /><path d="M17 2L7 17l28 2L44-3ZM46-2L38 18l24-5-4-10Z" fill="#869aa6" /><path d="M0 24l33 3 4-7M38 21l23-7" fill="none" /><ellipse cx="10" cy="32" rx="6" ry="7" fill="#303738" /><ellipse cx="53" cy="32" rx="6" ry="7" fill="#303738" /><path d="M1 26l6 1M26 28h6" stroke="#f6dd9f" strokeWidth="3" /></g>
    <g id="fm-stall" stroke="#4d3829" strokeWidth="2" strokeLinejoin="round"><path d="M0 20L68 12 85 22V78L15 88 0 79Z" fill="url(#fm-planks)" /><path d="M0 20L22 0 88 9 68 28Z" fill="#f6d29c" /><path d="M0 20L68 28 88 9 93 17 71 39-5 29Z" fill="#d99659" /><path d="M5 23l4 11 5-10 5 12 6-10 5 12 6-10 5 12 6-10 5 12 6-10" fill="#f8e0b1" /><path d="M8 37L63 42V63L8 59Z" fill="#644e32" /><path d="M7 59l58 5v8L7 67Z" fill="#d7a25f" /><path d="M3 30v51M69 37v47M82 28v49" strokeWidth="3" />{[17,29,43,54].map((x)=><path key={x} d={`M${x} 59v-6q5-9 8 1v5Z`} fill="#e4b863" />)}</g>
    <g id="fm-sofa" stroke="#493c2d" strokeWidth="2"><path d="M0 0q3-8 12-7h44q9 0 11 8v22H0Z" fill="currentColor" /><path d="M4 5v16h57V5M22-6v19M44-6v19M5 14h54M0 24h66M6 24v7M59 24v7" fill="none" /><rect x="-5" y="7" width="11" height="16" rx="4" fill="currentColor" /><rect x="60" y="7" width="11" height="16" rx="4" fill="currentColor" /></g>
  </defs>;
}

function Zone({ id, children, selectedId, onSelect }: { id: MapSpaceId; children: ReactNode; selectedId: string | null; onSelect: (id: MapSpaceId) => void }) {
    const name = mapSpaces.find(space => space.id === id)!.name;
    return <g className={`map-zone${selectedId === id ? ' is-selected' : ''}`} role="button" tabIndex={0} aria-label={name} aria-pressed={selectedId === id} onClick={() => onSelect(id)} onKeyDown={event => { if (event.key === 'Enter' || event.key === ' ') { event.preventDefault(); onSelect(id); } }}>
      <title>{name}</title>{children}
    </g>;
}

export function FestivalMapArtwork({ selectedId, onSelect }: { selectedId: string | null; onSelect: (id: MapSpaceId) => void }) {
  return <svg className="festival-artwork" viewBox="0 0 1536 1024" xmlns="http://www.w3.org/2000/svg" aria-label="Plan illustré du festival" role="group">
    <Definitions /><Landscape />
    <g strokeLinejoin="round" strokeLinecap="round">
      <Zone selectedId={selectedId} onSelect={onSelect} id="activities">
        <path className="map-zone-hit" d="M155 224L333 201 351 353 172 375Z" />
        <path d="M170 287Q236 310 323 275" fill="none" stroke="#765032" strokeWidth="2" />
        {Array.from({length:12},(_,i)=><path key={i} d={`M${178+i*12} ${289+Math.sin(i/3)*9}l5 12 5-13Z`} fill={i%2?'#f2dab0':'#b47548'} stroke="#79553b" strokeWidth="1" />)}
        <path d="M191 307l-17 47m20-47 20 43m-18-40-1 47" stroke="#6b4b2e" strokeWidth="5" />
        <ellipse cx="195" cy="305" rx="19" ry="24" fill="#f4dcb0" stroke="#3f4133" strokeWidth="3" /><ellipse cx="195" cy="305" rx="12" ry="17" fill="#a85638" stroke="#3f4133" strokeWidth="2" /><ellipse cx="195" cy="305" rx="6" ry="9" fill="#f0dfb9" stroke="#35443d" strokeWidth="3" />
        {Array.from({length:9},(_,i)=><g key={i}><path d={`M254 ${339-i*6}l24-3v6l-24 3Z`} fill={i%2?'#c68a45':'#dfad63'} stroke="#654728" strokeWidth="1.4" /><path d={`M${262+i%2*5} ${339-i*6}v5M${271-i%2*5} ${338-i*6}v5`} stroke="#654728" /></g>)}
        <use href="#fm-barrel" transform="translate(232 352) scale(.65)" /><Sign x={172} y={238} width={133} rotate={-10}>ACTIVITÉS</Sign>
      </Zone>
      <Zone selectedId={selectedId} onSelect={onSelect} id="chill">
        <path className="map-zone-hit" d="M423 171L650 164 647 324 425 335Z" />
        <path d="M429 199v111M634 202v99" stroke="#74512f" strokeWidth="5" />
        <Lights points={[[430,213],[449,226],[470,235],[491,240],[513,243],[536,241],[558,236],[581,227],[606,217],[633,213]]} />
        <path d="M534 231Q563 285 606 243Q578 273 534 231Z" fill="#e9d1a4" stroke="#6d5338" strokeWidth="2" /><path d="M542 245q27 27 56 2" fill="none" stroke="#be8d52" />
        <use href="#fm-sofa" transform="translate(445 278) rotate(-5)" color="#b96f51" /><use href="#fm-sofa" transform="translate(562 291) scale(.85)" color="#8e8070" />
        <path d="M526 289l24-4 14 7-25 6Z M533 295v12m22-12v10" fill="#c79556" stroke="#6d482c" strokeWidth="2" /><use href="#fm-barrel" transform="translate(509 318) scale(.8)" />
        <Sign x={446} y={181} width={133} rotate={-5}>COIN CHILL</Sign>
      </Zone>
      <Zone selectedId={selectedId} onSelect={onSelect} id="photomaton">
        <path className="map-zone-hit" d="M697 261L825 249 827 379 692 384Z" />
        <path d="M746 309l36-12 24 13v56l-38 13-23-14Z" fill="url(#fm-planks)" stroke="#4a3728" strokeWidth="3" /><path d="M768 317l28-9v51l-28 10Z" fill="#916c4b" stroke="#4a3728" strokeWidth="2" /><path d="M774 322v39m7-42v39m7-41v39" stroke="#c5a782" strokeWidth="3" /><rect x="752" y="319" width="13" height="18" rx="2" fill="#ede1bd" stroke="#4a3728" /><circle cx="759" cy="326" r="4" fill="#8b9690" stroke="#4a3728" />
        <use href="#fm-barrel" transform="translate(711 369) scale(.8)" /><use href="#fm-barrel" transform="translate(735 373) scale(.85)" /><Sign x={706} y={275} width={111} rotate={-11}>PHOTOMATON</Sign>
      </Zone>
      <Zone selectedId={selectedId} onSelect={onSelect} id="food">
        <path className="map-zone-hit" d="M326 362L624 341 651 484 324 487Z" />
        <use href="#fm-stall" transform="translate(333 405)" /><use href="#fm-stall" transform="translate(449 386)" /><use href="#fm-stall" transform="translate(550 398) scale(.95)" />
        <Lights points={[[335,400],[363,397],[393,391],[423,386],[456,385],[488,385],[520,389],[552,395],[583,400],[615,403]]} />
        {[480,511].map(x=><g key={x} fill="#bd8b4d" stroke="#543c27" strokeWidth="2"><path d={`M${x-8} 472l-5 20m19-20 5 20m-10-18v16`} /><ellipse cx={x} cy="472" rx="15" ry="6" /></g>)}
        <path d="M550 466l-8 25 25 2-4-26Z" fill="#4c5750" stroke="#c69560" strokeWidth="3" /><Sign x={388} y={363} width={207} rotate={-5}>STANDS NOURRITURE</Sign>
      </Zone>
      <Zone selectedId={selectedId} onSelect={onSelect} id="toilets">
        <path className="map-zone-hit" d="M36 405L171 385 184 516 42 533Z" />
        <path d="M45 451l83-23 37 14v65l-89 23-29-15Z" fill="url(#fm-planks)" stroke="#513b2b" strokeWidth="3" /><path d="M36 448l93-32 43 21-98 28Z" fill="#ad8059" stroke="#513b2b" strokeWidth="3" />
        {[80,117].map(x=><g key={x}><path d={`M${x} 467l30-8v50l-30 8Z`} fill="url(#fm-planks)" stroke="#513b2b" strokeWidth="2" /><path d={`M${x+15} 479c-9-9-13 5 0 10 13-11 8-19 0-10Z`} fill="#e6c295" stroke="#60452e" /></g>)}
        <Sign x={48} y={403} width={102} rotate={-12}>toilettes</Sign>
      </Zone>
      <Zone selectedId={selectedId} onSelect={onSelect} id="stage">
        <path className="map-zone-hit" d="M188 477L632 477 650 664 186 680Z" />
        <ellipse cx="419" cy="629" rx="225" ry="52" fill="#d2aa74" opacity=".6" />
        <path d="M198 554L302 479Q357 512 437 476Q502 529 578 530L632 591 554 581 439 534 287 590Z" fill="#f4d5a0" stroke="#62452f" strokeWidth="2.5" />
        <path d="M302 479Q285 555 287 590M437 476Q434 510 439 534M578 530L554 581M198 554Q252 575 302 479M287 590Q369 572 437 476M437 476Q484 559 554 581M578 530Q584 579 632 591" fill="none" stroke="#b18b58" strokeWidth="1.5" />
        <path d="M198 554l-8 66m97-30-1 60m153-116-2 95m117-48 5 71m73-61 9 46" stroke="#5f452f" strokeWidth="4" /><path d="M302 477l-40 175M578 530l39 120" fill="none" stroke="#765838" strokeWidth="1.5" />
        <path d="M292 596l147-57 111 54v31l-128 39-130-39Z" fill="#956940" stroke="#4c3728" strokeWidth="2" /><path d="M292 596l146-43 112 40-128 42Z" fill="url(#fm-planks)" stroke="#4c3728" strokeWidth="2" />
        <Lights points={[[288,584],[314,572],[340,562],[366,552],[392,542],[416,535],[439,534],[464,545],[488,556],[512,567],[535,577],[555,583]]} />
        <path d="M437 477v51" stroke="#514333" strokeWidth="2" /><circle cx="437" cy="538" r="14" fill="#dad8c6" stroke="#44443d" strokeWidth="2" /><path d="M425 532h24m-25 6h27m-24 6h21m-15-19v26m7-26v26" stroke="#888c82" strokeWidth="1.4" />
        {[310,510].map(x=><g key={x} fill="#42433e" stroke="#292e2a" strokeWidth="2"><rect x={x} y="576" width="19" height="27" /><rect x={x-6} y="602" width="32" height="23" />{[584,595,613].map(y=><circle key={y} cx={x+9} cy={y} r={y===613?7:5} fill="#252e2d" stroke="#7b7861" />)}</g>)}
        {[230,337,490,590].map((x,i)=><g key={x} transform={`translate(${x} ${610+i%2*27})`} fill="#9a8e52" stroke="#4e482f" strokeWidth="2"><path d="M-19-8l32-4 11 9-35 6Z M-12 5v7m31-12v9" /><path d="M-19-8v13l7 7 35-9V-3" fill="none" /><path d="M-10-9v17M0-9v14M12-11V4" stroke="#c0a468" /></g>)}
        <Sign x={371} y={626} width={104} rotate={-3}>SCÈNE</Sign>
      </Zone>
      <Zone selectedId={selectedId} onSelect={onSelect} id="bar">
        <path className="map-zone-hit" d="M653 376L930 378 953 571 650 588Z" />
        <path d="M711 438l183 16 29-51 35 75-12 62-231-22Z" fill="url(#fm-stone)" stroke="#493d31" strokeWidth="3" />
        <path d="M681 446l39-76 181 18 22 15-35 66Z" fill="url(#fm-roof)" stroke="#3d3431" strokeWidth="3" />
        <path d="M913 403l35 75-60-9Z" fill="url(#fm-stone)" stroke="#514231" strokeWidth="2" />
        <path d="M910 397v-29l9 2v39" fill="#c5a679" stroke="#514231" strokeWidth="2" />
        <path d="M747 502l40-44 39 43v67l-78-4Z" fill="url(#fm-stone)" stroke="#473b2c" strokeWidth="3" /><path d="M738 503l48-53 47 49-9 5-38-43-39 44Z" fill="url(#fm-roof)" stroke="#473b2c" strokeWidth="2" />
        <path d="M767 562v-42q12-21 25 0v45Z" fill="#766246" stroke="#483c2e" strokeWidth="3" /><path d="M775 514v48m9-49v50" stroke="#b59361" />
        {[[725,460],[854,487],[925,477]].map(([x,y])=><g key={x}><rect x={x} y={y} width="12" height="21" rx="2" fill="#f8cf82" stroke="#705434" strokeWidth="3" /><path d={`M${x+6} ${y}v21m-6-10h12`} stroke="#705434" /></g>)}
        <path d="M658 486l60-12 32 12-69 17Z" fill="#e2bc83" stroke="#5a402b" strokeWidth="2" /><path d="M658 486v59m90-59v46m-65-28v44" stroke="#715132" strokeWidth="4" /><path d="M658 522l67-7 23 9-66 16Z M660 525v27l64 5 22-19v-14" fill="url(#fm-planks)" stroke="#5a402b" strokeWidth="2" />
        <Lights points={[[659,495],[679,500],[700,501],[721,496],[743,491]]} /><Sign x={658} y={529} width={82} rotate={3}>BAR</Sign>
      </Zone>
      <g aria-hidden="true"><Tree x={854} y={583} scale={.82} tone={1} /><Tree x={933} y={604} scale={.85} tone={0} /><Tree x={1034} y={595} scale={.83} tone={0} /><path d="M902 538Q937 612 977 538Q952 585 902 538Z" fill="#dca472" stroke="#6b4f31" strokeWidth="2" /><path d="M1006 515Q1013 584 1030 522Q1020 557 1006 515Z" fill="#efdaad" stroke="#6b4f31" strokeWidth="2" /><Lights points={[[858,508],[880,519],[905,525],[930,528],[955,522],[978,516],[1003,506],[1027,507]]} /></g>
      <Zone selectedId={selectedId} onSelect={onSelect} id="vans">
        <path className="map-zone-hit" d="M1150 338L1467 309 1518 486 1443 542 1147 500Z" />
        <path d="M1152 424v50m97-94v53m107-57v51m136-7v61" stroke="#7c5432" strokeWidth="4" /><Lights points={[[1153,425],[1177,431],[1200,421],[1225,400],[1249,380],[1275,392],[1303,395],[1330,389],[1356,376],[1380,394],[1408,402],[1437,407],[1463,418],[1492,420]]} />
        <use href="#fm-van" transform="translate(1169 416) rotate(-8) scale(.82)" color="#57857a" /><path d="M1180 410v-16l44-17 12 6v29l-29 9Z" fill="#e9d5af" stroke="#4c4131" strokeWidth="2" /><path d="M1182 395l26 8 26-18M1208 403v16" fill="none" stroke="#665640" strokeWidth="2" />
        <use href="#fm-van" transform="translate(1306 403) rotate(9) scale(.85)" color="#dfd9bb" /><use href="#fm-van" transform="translate(1410 436) rotate(7) scale(.8)" color="#617f78" /><use href="#fm-van" transform="translate(1263 458) rotate(11) scale(1.02)" color="#d69441" /><use href="#fm-van" transform="translate(1381 484) rotate(6) scale(.78)" color="#d8d7ba" />
        <Sign x={1187} y={340} width={267} rotate={-6}>ESPACE VAN DODO</Sign>
      </Zone>
      <Zone selectedId={selectedId} onSelect={onSelect} id="parking">
        <path className="map-zone-hit" d="M1122 550L1366 562 1403 661 1191 691 1120 632Z" />
        <use href="#fm-car" transform="translate(1137 574) rotate(-5)" color="#777773" /><use href="#fm-car" transform="translate(1213 591) rotate(-6)" color="#425875" /><use href="#fm-car" transform="translate(1288 610) rotate(-9)" color="#e4d8ba" />
        {Array.from({length:12},(_,i)=><path key={i} d={`M${1068+i*29} ${659+Math.sin(i/4)*32}v-17`} stroke="#65482e" strokeWidth="4" />)}
        <Sign x={1178} y={626} width={107} rotate={5}>Parking</Sign>
      </Zone>
      <Zone selectedId={selectedId} onSelect={onSelect} id="entrance">
        <path className="map-zone-hit" d="M1435 529H1527V827L1430 833Z" />
        <Sign x={1440} y={541} width={85} rotate={-6}>entrée</Sign>
        <path d="M1476 707v-42m-4 10 4-10 4 10m-8 23 4 10 4-10" fill="none" stroke="#393628" strokeWidth="2.5" />
        <text x="1470" y="876" transform="rotate(-86 1470 876)" fill="#393628" fontFamily="'Trebuchet MS', sans-serif" fontSize="20" fontStyle="italic">Chemin de l’étang</text>
        {Array.from({length:8},(_,i)=><path key={i} d={`M1438 ${606+i*34}v20M1505 ${589+i*34}v20`} stroke="#65482e" strokeWidth="4" />)}
      </Zone>
      <Zone selectedId={selectedId} onSelect={onSelect} id="lake">
        <path className="map-zone-hit" d="M651 907Q765 810 1018 804Q1230 778 1388 901L1340 977 1011 1010 686 978Z" />
        <path d="M651 926Q684 875 800 851Q954 790 1127 814Q1293 819 1381 899Q1442 967 1270 986Q1104 1011 856 987Q707 984 651 926Z" fill="#84764d" stroke="#4e513b" strokeWidth="3" />
        <path d="M673 927Q712 881 815 864Q961 806 1124 830Q1289 833 1366 908Q1423 954 1266 972Q1095 993 862 974Q731 973 673 927Z" fill="url(#fm-water)" stroke="#455953" strokeWidth="3" />
        <path d="M673 927Q712 881 815 864Q961 806 1124 830Q1289 833 1366 908Q1423 954 1266 972Q1095 993 862 974Q731 973 673 927Z" fill="url(#fm-ripples)" />
        {Array.from({length:68},(_,i)=>{const a=i/68*Math.PI*2; const x=1027+375*Math.cos(a);const y=906+87*Math.sin(a);return <g key={i} transform={`translate(${x} ${y})`} stroke="#756136" strokeWidth="1.8"><path d="M0 0q-15-22-19-32Q-8-23 0 0Q-8-37-4-48L2-2Q8-36 18-39L5 0" fill="#b09042" /><path d="M2-4l7-38m-10 37-7-31" fill="none" />{i%3===0&&<ellipse rx="14" ry="8" fill="#b1a080" stroke="#60563d" />}</g>})}
        <path d="M1245 910v26m49-14v26m43-11v25" stroke="#5f462e" strokeWidth="6" /><path d="M1237 906l37-25 104 22-29 32Z" fill="#bf8a58" stroke="#493d2d" strokeWidth="3" />
        {Array.from({length:10},(_,i)=><path key={i} d={`M${1247+i*10} ${909+i*2.3}l31-25`} stroke="#715034" strokeWidth="1.5" />)}
        <path d="M881 906q13-13 26 0-13 13-26 0l-5-6v13ZM990 943q12-10 24 0-12 11-24 0l-5-6v12Z" fill="#709490" stroke="#31585d" strokeWidth="2" />
      </Zone>
    </g>
    <rect width="1536" height="1024" fill="transparent" filter="url(#fm-paper-grain)" pointerEvents="none" opacity=".4" aria-hidden="true" />
  </svg>;
}
