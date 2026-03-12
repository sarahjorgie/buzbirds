// SA province paths derived from real geographic SVG data
// Viewbox 500×420

const PROVINCES = [
  {
    key: 'limpopo',
    name: 'Limpopo',
    abbr: 'LP',
    path: 'M306.7,0.2 L344.6,4.5 L357.8,27.2 L343.4,29.3 L348.6,29.2 L348.2,42.8 L339.6,43.2 L332.5,34.9 L316.3,36.7 L308.5,46.1 L296.9,40.1 L281.7,42.9 L276.2,46.4 L283.0,46.9 L276.5,47.9 L265.5,42.2 L257.2,44.5 L245.6,38.7 L231.5,40.1 L247.9,20.8 L275.9,6.7 L306.1,0.0 Z',
    labelX: 300, labelY: 28,
  },
  {
    key: 'mpumalanga',
    name: 'Mpumalanga',
    abbr: 'MP',
    path: 'M357.8,27.4 L360.3,57.3 L344.9,54.2 L332.7,66.7 L344.2,77.1 L341.7,79.1 L323.1,77.4 L305.9,81.2 L292.3,73.8 L274.6,72.0 L287.8,64.4 L278.5,59.4 L287.3,58.4 L292.3,52.5 L283.3,53.3 L285.2,45.1 L276.1,45.5 L296.9,40.1 L308.5,46.1 L316.3,36.7 L332.5,34.9 L339.6,43.2 L348.2,42.8 L348.6,29.2 L343.4,29.3 L357.8,27.2 Z',
    labelX: 322, labelY: 60,
  },
  {
    key: 'gauteng',
    name: 'Gauteng',
    abbr: 'GP',
    path: 'M281.9,45.3 L285.9,46.1 L283.3,53.3 L292.3,52.5 L287.3,58.4 L278.5,59.4 L287.8,64.4 L274.6,72.0 L266.9,68.3 L257.1,69.9 L258.6,65.1 L249.5,66.0 L255.0,56.2 L266.2,55.7 L269.2,49.1 L282.7,46.3 Z',
    labelX: 272, labelY: 59,
  },
  {
    key: 'northwest',
    name: 'North West',
    abbr: 'NW',
    path: 'M230.8,37.4 L238.0,40.9 L245.6,38.7 L257.2,44.5 L269.9,42.9 L274.7,49.2 L251.0,60.6 L249.5,66.0 L258.6,65.1 L255.6,71.6 L235.9,73.5 L231.0,75.9 L233.4,79.4 L223.0,84.3 L216.8,82.3 L197.2,90.3 L194.2,87.4 L198.6,84.1 L190.9,83.3 L186.8,90.3 L184.5,83.9 L176.5,84.4 L174.8,78.2 L169.0,81.8 L152.4,76.7 L152.8,68.3 L144.7,66.7 L143.3,59.8 L152.1,47.3 L162.6,47.1 L183.7,54.5 L206.2,54.5 L222.0,38.7 Z',
    labelX: 208, labelY: 66,
  },
  {
    key: 'freestate',
    name: 'Free State',
    abbr: 'FS',
    path: 'M257.1,69.9 L266.9,68.3 L280.3,74.3 L290.9,73.4 L309.2,82.5 L304.9,92.6 L288.0,100.6 L283.0,97.7 L262.2,102.8 L245.4,114.0 L253.9,126.1 L241.2,130.9 L205.0,128.8 L182.9,114.6 L204.4,85.7 L217.3,82.3 L223.0,84.3 L233.4,79.4 L231.0,75.9 L235.9,73.5 L256.6,70.0 Z',
    labelX: 251, labelY: 98,
  },
  {
    key: 'kwazulunatal',
    name: 'KwaZulu-Natal',
    abbr: 'KZN',
    path: 'M363.3,70.5 L381.3,71.2 L373.5,91.1 L369.0,97.8 L345.2,110.4 L328.8,128.2 L318.8,137.3 L309.7,131.3 L285.9,128.0 L301.9,109.8 L288.7,99.3 L306.5,91.3 L310.7,79.3 L360.1,78.2 L363.3,70.5 Z',
    labelX: 338, labelY: 104,
  },
  {
    key: 'northerncape',
    name: 'Northern Cape',
    abbr: 'NC',
    path: 'M84.5,40.8 L101.6,57.4 L98.3,72.0 L121.6,71.2 L144.7,59.8 L144.7,66.7 L152.9,68.3 L151.6,75.8 L156.8,78.7 L169.0,81.8 L174.8,78.2 L176.5,84.4 L184.5,83.9 L186.8,90.3 L191.0,83.3 L199.0,84.2 L194.2,87.4 L198.5,90.6 L195.5,98.7 L183.0,114.6 L210.9,132.7 L207.1,139.4 L188.0,142.4 L186.7,147.3 L181.1,148.3 L161.2,146.9 L153.5,151.7 L135.4,145.1 L130.6,154.0 L112.3,158.0 L98.9,167.1 L86.3,164.3 L86.1,154.9 L71.1,162.8 L70.2,153.4 L59.7,150.3 L57.6,131.6 L44.6,127.3 L30.0,138.3 L0.0,98.7 L14.5,89.4 L21.4,93.4 L22.1,100.1 L39.9,103.1 L63.0,103.7 L72.1,97.1 L82.1,95.5 L84.5,40.8 Z',
    labelX: 115, labelY: 112,
  },
  {
    key: 'easterncape',
    name: 'Eastern Cape',
    abbr: 'EC',
    path: 'M291.8,120.1 L285.9,128.0 L309.7,131.3 L318.8,137.3 L280.7,161.3 L244.8,177.7 L216.4,180.5 L214.5,185.2 L199.0,184.3 L194.4,188.3 L170.3,184.9 L160.3,181.1 L166.9,179.1 L165.2,176.3 L145.5,173.6 L153.3,164.6 L160.3,165.5 L156.7,159.0 L177.8,154.1 L178.2,148.1 L186.7,147.3 L188.1,142.4 L207.1,139.4 L208.9,129.8 L225.1,127.8 L241.2,130.9 L255.7,125.1 L270.6,130.8 L277.1,122.5 L291.8,120.1 Z',
    labelX: 230, labelY: 158,
  },
  {
    key: 'westerncape',
    name: 'Western Cape',
    abbr: 'WC',
    path: 'M165.0,184.4 L134.1,185.7 L124.3,191.1 L103.2,190.9 L82.0,198.6 L65.7,195.3 L67.8,191.5 L55.0,191.2 L53.6,186.1 L46.0,186.9 L45.5,190.1 L45.9,179.7 L32.2,165.4 L42.9,161.5 L42.3,150.4 L30.0,138.3 L48.6,126.9 L57.6,131.6 L59.7,150.3 L70.2,153.4 L71.1,162.8 L86.0,154.9 L85.1,162.2 L92.0,167.3 L98.9,167.1 L117.9,155.7 L126.7,156.1 L135.3,145.1 L153.4,151.7 L161.1,146.9 L175.9,147.3 L177.7,154.1 L156.6,158.9 L160.2,165.5 L153.2,164.6 L145.5,173.6 L165.1,176.3 L166.9,179.1 L160.3,181.1 L167.7,182.6 L165.0,184.4 Z',
    labelX: 100, labelY: 170,
  },
]

export default function SAMap({ selectedKey, onSelect }) {
  return (
    <div className="w-full">
      <svg
        viewBox="-10 -5 405 215"
        className="w-full h-auto drop-shadow-lg"
        style={{ maxHeight: '280px' }}
      >
        <rect x="-10" y="-5" width="405" height="215" fill="#0c2340" rx="8" />

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
                strokeWidth="1.5"
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
                fontSize={prov.key === 'gauteng' ? '9' : prov.key === 'mpumalanga' ? '10' : '12'}
                fontWeight={isSelected ? '700' : '500'}
                style={{ pointerEvents: 'none', transition: 'fill 0.2s' }}
              >
                {prov.abbr}
              </text>
            </g>
          )
        })}

        <text x="16" y="16" fill="#4b7a5a" fontSize="10" fontFamily="sans-serif">N↑</text>
      </svg>

      <p className="text-center text-green-300 text-sm mt-2 font-medium">
        {selectedKey === 'all' || !selectedKey
          ? 'Tap a province to filter'
          : PROVINCES.find(p => p.key === selectedKey)?.name}
      </p>
    </div>
  )
}
