// Simplified SA province map using approximate SVG paths
// Based on decimal degree coordinates mapped to a 500×420 viewBox:
//   x = (lon - 16.0) / 17.5 * 500   (lon range 16–33.5E)
//   y = (lat - 21.5) / 14.0 * 420   (lat range 21.5–35.5S)

const PROVINCES = [
  {
    key: 'limpopo',
    name: 'Limpopo',
    abbr: 'LP',
    // North strip: borders Zimbabwe/Bots/Mozambique
    path: 'M271,15 L486,15 L486,148 L429,148 L386,118 L314,104 L271,89 Z',
    labelX: 370, labelY: 65,
  },
  {
    key: 'mpumalanga',
    name: 'Mpumalanga',
    abbr: 'MP',
    // East of Gauteng, south of Limpopo
    path: 'M386,118 L486,118 L486,178 L429,178 L386,148 Z',
    labelX: 448, labelY: 148,
  },
  {
    key: 'gauteng',
    name: 'Gauteng',
    abbr: 'GP',
    // Tiny province, center-northeast
    path: 'M314,104 L386,104 L386,148 L314,148 Z',
    labelX: 350, labelY: 126,
  },
  {
    key: 'northwest',
    name: 'North West',
    abbr: 'NW',
    // Left of Gauteng, south of Limpopo
    path: 'M171,74 L314,74 L314,104 L314,148 L257,163 L200,163 L171,140 Z',
    labelX: 240, labelY: 115,
  },
  {
    key: 'freestate',
    name: 'Free State',
    abbr: 'FS',
    // Central province
    path: 'M171,163 L314,148 L386,148 L386,222 L371,252 L257,252 L171,237 Z',
    labelX: 278, labelY: 200,
  },
  {
    key: 'kwazulunatal',
    name: 'KwaZulu-Natal',
    abbr: 'KZN',
    // East coast, long strip south
    path: 'M386,148 L486,148 L486,326 L429,340 L371,296 L371,252 L386,222 Z',
    labelX: 448, labelY: 240,
  },
  {
    key: 'northerncape',
    name: 'Northern Cape',
    abbr: 'NC',
    // Huge western province
    path: 'M0,133 L171,133 L171,163 L171,237 L144,296 L86,340 L0,326 Z',
    labelX: 75, labelY: 225,
  },
  {
    key: 'easterncape',
    name: 'Eastern Cape',
    abbr: 'EC',
    // Southeastern, large
    path: 'M144,252 L371,252 L429,340 L371,400 L200,415 L86,400 L86,340 L144,296 Z',
    labelX: 255, labelY: 330,
  },
  {
    key: 'westerncape',
    name: 'Western Cape',
    abbr: 'WC',
    // Southwest corner
    path: 'M0,296 L144,296 L86,340 L86,400 L29,400 L0,370 Z',
    labelX: 58, labelY: 355,
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
        {/* Ocean background */}
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
              {/* Hover highlight overlay */}
              <path
                d={prov.path}
                fill="white"
                opacity="0"
                className="hover:opacity-10 transition-opacity"
              />
              {/* Province label */}
              <text
                x={prov.labelX}
                y={prov.labelY}
                textAnchor="middle"
                dominantBaseline="middle"
                fill={isSelected ? 'white' : dimmed ? '#4b7a5a' : '#86efac'}
                fontSize={prov.key === 'gauteng' || prov.key === 'mpumalanga' ? '11' : '13'}
                fontWeight={isSelected ? '700' : '500'}
                style={{ pointerEvents: 'none', transition: 'fill 0.2s' }}
              >
                {prov.abbr}
              </text>
            </g>
          )
        })}

        {/* Compass indicator */}
        <text x="16" y="20" fill="#4b7a5a" fontSize="11" fontFamily="sans-serif">N↑</text>
      </svg>

      {/* Selected province label */}
      <p className="text-center text-green-300 text-sm mt-2 font-medium">
        {selectedKey === 'all' || !selectedKey
          ? 'Tap a province to filter'
          : PROVINCES.find(p => p.key === selectedKey)?.name}
      </p>
    </div>
  )
}
