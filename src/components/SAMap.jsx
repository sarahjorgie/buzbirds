// SA province map — SVG paths based on geographic coordinates
// Projection: x = (lon - 16.0) / 17.5 * 500,  y = (|lat| - 21.5) / 14.0 * 420
// Viewbox 500×420

const PROVINCES = [
  {
    key: 'limpopo',
    name: 'Limpopo',
    abbr: 'LP',
    // Northern strip: Botswana/Zimbabwe/Mozambique borders, ~22–26S, ~27–33E
    path: 'M286,105 L314,30 L486,15 L486,135 L429,135 L371,120 Z',
    labelX: 410, labelY: 72,
  },
  {
    key: 'mpumalanga',
    name: 'Mpumalanga',
    abbr: 'MP',
    path: 'M371,120 L429,135 L486,135 L486,195 L429,195 L400,165 L371,165 Z',
    labelX: 450, labelY: 158,
  },
  {
    key: 'gauteng',
    name: 'Gauteng',
    abbr: 'GP',
    path: 'M286,105 L371,120 L371,165 L286,165 Z',
    labelX: 326, labelY: 140,
  },
  {
    key: 'northwest',
    name: 'North West',
    abbr: 'NW',
    // Diagonal Botswana border in the north
    path: 'M114,150 L314,30 L286,105 L286,165 L171,165 Z',
    labelX: 218, labelY: 132,
  },
  {
    key: 'freestate',
    name: 'Free State',
    abbr: 'FS',
    path: 'M171,165 L286,165 L371,165 L400,165 L371,285 L229,285 L171,255 Z',
    labelX: 288, labelY: 222,
  },
  {
    key: 'kwazulunatal',
    name: 'KwaZulu-Natal',
    abbr: 'KZN',
    // East coast strip from ~27S down to ~31S
    path: 'M400,165 L429,195 L486,195 L486,330 L457,360 L400,405 L371,285 Z',
    labelX: 458, labelY: 268,
  },
  {
    key: 'northerncape',
    name: 'Northern Cape',
    abbr: 'NC',
    // Huge western province — Namibia/Botswana borders in NW, EC/WC/FS in east/south
    path: 'M14,225 L114,150 L171,165 L171,255 L229,285 L171,345 L14,315 Z',
    labelX: 90, labelY: 248,
  },
  {
    key: 'easterncape',
    name: 'Eastern Cape',
    abbr: 'EC',
    path: 'M229,285 L371,285 L400,405 L257,420 L114,405 L171,345 Z',
    labelX: 272, labelY: 358,
  },
  {
    key: 'westerncape',
    name: 'Western Cape',
    abbr: 'WC',
    // SW corner — shares NC border from 171,255 to 171,345 and coast
    path: 'M14,315 L171,345 L114,405 L57,390 L14,375 Z',
    labelX: 72, labelY: 368,
  },
]

export default function SAMap({ selectedKey, onSelect }) {
  return (
    <div className="w-full">
      <svg
        viewBox="0 0 500 420"
        className="w-full h-auto drop-shadow-lg"
        style={{ maxHeight: '280px' }}
      >
        <rect width="500" height="420" fill="#0c2340" rx="8" />

        {PROVINCES.map(prov => {
          const isSelected = selectedKey === prov.key
          const isAll = selectedKey === 'all'
          const dimmed = !isAll && !isSelected

          return (
            <g
              key={prov.key}
              onClick={() => onSelect(prov.key === selectedKey ? 'all' : prov.key)}
              className="cursor-pointer"
            >
              <path
                d={prov.path}
                fill={isSelected ? '#10b981' : dimmed ? '#1f4028' : '#1a5c38'}
                stroke="#0c2340"
                strokeWidth="2"
                opacity={dimmed ? 0.5 : 1}
                style={{ transition: 'fill 0.2s, opacity 0.2s' }}
              />
              <path
                d={prov.path}
                fill="white"
                opacity="0"
                className="hover:opacity-10 transition-opacity"
              />
              <text
                x={prov.labelX}
                y={prov.labelY}
                textAnchor="middle"
                dominantBaseline="middle"
                fill={isSelected ? 'white' : dimmed ? '#4b7a5a' : '#86efac'}
                fontSize={prov.key === 'gauteng' ? '10' : prov.key === 'mpumalanga' ? '11' : '13'}
                fontWeight={isSelected ? '700' : '500'}
                style={{ pointerEvents: 'none', transition: 'fill 0.2s' }}
              >
                {prov.abbr}
              </text>
            </g>
          )
        })}

        <text x="16" y="20" fill="#4b7a5a" fontSize="11" fontFamily="sans-serif">N↑</text>
      </svg>

      <p className="text-center text-green-300 text-sm mt-2 font-medium">
        {selectedKey === 'all' || !selectedKey
          ? 'Tap a province to filter'
          : PROVINCES.find(p => p.key === selectedKey)?.name}
      </p>
    </div>
  )
}
