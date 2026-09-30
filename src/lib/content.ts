// All copy + structure in one place, so the use-case can be re-skinned for another brand.

export const ACCENTS = {
  brass: '#c9a36a',
  champagne: '#e6cfa4',
  copper: '#c4876a',
  sand: '#cbb79b',
  sage: '#a3a893',
  stone: '#b1aca4',
  pewter: '#8f989d',
  bone: '#e9e3d8',
} as const

export type Accent = keyof typeof ACCENTS

// Order = clockwise ring segments from 12 o'clock = feature order
export const RING: Accent[] = ['brass', 'champagne', 'copper', 'sand', 'sage', 'stone', 'pewter', 'bone']

export const HERO = {
  title: ['Precision', 'grinding', 'instrument'],
  lead: 'A hand grinder machined from steel, brass and walnut, tuned for',
  words: ['espresso', 'pour-over', 'moka', 'cold brew', 'every bean'],
  price: 'No.1 — €340',
}

export const NAV = [
  { label: 'Anatomy', href: '#anatomy', icon: 'grid' },
  { label: 'Materials', href: '#materials', icon: 'layers' },
  { label: 'Atelier', href: '#atelier', icon: 'play' },
] as const

export const ANATOMY = {
  title: ['Forty-one parts.', 'One gesture.'],
  lead: 'Every component is machined, hand-finished and replaceable. Nothing glued, nothing hidden.',
  // part = key of a grinder module (see three/grinder.ts)
  left: [
    { label: 'crank', part: 'crank' },
    { label: 'bearings', part: 'bearingB' },
    { label: 'grip', part: 'body' },
    { label: 'spring', part: 'spring' },
    { label: 'carrier', part: 'carrier' },
  ],
  right: [
    { label: 'bezel', part: 'bezel' },
    { label: 'catch cup', part: 'cup' },
    { label: 'outer burr', part: 'outerBurr' },
    { label: 'inner burr', part: 'innerBurr' },
    { label: 'dial', part: 'dial' },
    { label: 'lid', part: 'lid' },
  ],
}

export type Feature = {
  id: string
  accent: Accent
  title: string
  lead: string
  bullets: string[]
  image: string
  spec: [string, string][]
}

export const FEATURES: Feature[] = [
  {
    id: 'burrs',
    accent: 'brass',
    title: '48 mm burrs',
    lead: 'Heptagonal conical burrs, cut from hardened stainless steel for a razor-even particle.',
    bullets: ['Heptagonal geometry', 'Hardened to 60 HRC', 'Near-zero retention'],
    image: '/media/burr-macro.webp',
    spec: [['burr', '48 mm conical'], ['steel', '420 hardened'], ['cut', 'heptagonal'], ['retention', '< 0.1 g']],
  },
  {
    id: 'dial',
    accent: 'champagne',
    title: 'Stepless dial',
    lead: 'An external brass ring moves the burr 12.5 microns per click. Feel it, then trust it.',
    bullets: ['12.5 µm per click', 'External adjustment', 'Engraved index'],
    image: '/media/dial-macro.webp',
    spec: [['step', '12.5 µm'], ['range', '0 — 1500 µm'], ['ring', 'solid brass'], ['clicks', '120 / turn']],
  },
  {
    id: 'spectrum',
    accent: 'copper',
    title: 'Every grind',
    lead: 'From powder-fine Turkish to cold brew gravel, with one hand and one ring.',
    bullets: ['Turkish to cold brew', 'Repeatable settings', 'Uniform particle'],
    image: '/media/grind-spectrum.webp',
    spec: [['turkish', '100 µm'], ['espresso', '250 µm'], ['filter', '650 µm'], ['cold brew', '1300 µm']],
  },
  {
    id: 'walnut',
    accent: 'sand',
    title: 'Walnut & steel',
    lead: 'A turned walnut knob on a folding steel arm. Warm where you hold it, rigid where it works.',
    bullets: ['Oiled American walnut', 'Folding crank arm', 'Hand-turned knob'],
    image: '/media/walnut-knob.webp',
    spec: [['knob', 'walnut, oiled'], ['arm', '304 stainless'], ['length', '96 mm'], ['fold', 'magnetic']],
  },
  {
    id: 'bearings',
    accent: 'sage',
    title: 'Twin bearings',
    lead: 'Two sealed bearings hold the shaft dead-center. No wobble, no drift, no noise.',
    bullets: ['Double sealed', 'Zero shaft play', 'Silent rotation'],
    image: '/media/bearings.webp',
    spec: [['bearings', '2 × sealed'], ['shaft', '7 mm steel'], ['runout', '< 5 µm'], ['service', 'lifetime']],
  },
  {
    id: 'cup',
    accent: 'stone',
    title: 'Magnetic cup',
    lead: 'The catch cup clicks on with six magnets and pours clean. Not a single ground lost.',
    bullets: ['Six N52 magnets', 'Anti-static finish', '40 g capacity'],
    image: '/media/catch-cup.webp',
    spec: [['magnets', '6 × N52'], ['capacity', '40 g'], ['finish', 'anodized'], ['static', 'none']],
  },
  {
    id: 'ritual',
    accent: 'pewter',
    title: 'The ritual',
    lead: 'Forty slow turns, twenty seconds of quiet. The best part of the morning is the first one.',
    bullets: ['40 turns per dose', '20 seconds', 'No cable, no hum'],
    image: '/media/ritual-hands.webp',
    spec: [['dose', '18 g'], ['turns', '≈ 40'], ['time', '≈ 20 s'], ['power', 'you']],
  },
  {
    id: 'travel',
    accent: 'bone',
    title: 'Everywhere',
    lead: '612 grams, a leather roll and no power outlet required. The café travels with you.',
    bullets: ['612 g', 'Leather travel roll', 'Fits an AeroPress'],
    image: '/media/travel-case.webp',
    spec: [['weight', '612 g'], ['height', '168 mm'], ['diameter', '52 mm'], ['case', 'vegetable leather']],
  },
]

export const MATERIALS = {
  title: ['Five materials.', 'Nothing else.'],
  lead: 'Steel where it cuts, brass where you touch, walnut where you hold. Every gram has a reason.',
  total: 612,
  items: [
    { name: 'Steel', grams: 238, accent: 'pewter', swatch: '/media/swatch-steel.webp', part: 'outerBurr' },
    { name: 'Aluminium', grams: 196, accent: 'stone', swatch: '/media/swatch-graphite.webp', part: 'body' },
    { name: 'Brass', grams: 102, accent: 'brass', swatch: '/media/swatch-brass.webp', part: 'dial' },
    { name: 'Ceramic', grams: 42, accent: 'bone', swatch: '/media/swatch-steel.webp', part: 'bearingA' },
    { name: 'Walnut', grams: 34, accent: 'copper', swatch: '/media/swatch-walnut.webp', part: 'crank' },
  ] as { name: string; grams: number; accent: Accent; swatch: string; part: string }[],
}

export const ATELIER = {
  title: ['Made slowly.', 'In small batches.'],
  lead: 'Turned, knurled and assembled by four people in one workshop. Every grinder is hallmarked by the hands that finished it.',
  images: [
    { src: '/media/workshop-lathe.webp', caption: 'Turning the body' },
    { src: '/media/craftsman-hands.webp', caption: 'Inspecting the dial' },
    { src: '/media/morning-table.webp', caption: 'At home' },
  ],
}

export const BREWS: { label: string; microns: number; accent: Accent }[] = [
  { label: 'Turkish', microns: 100, accent: 'brass' },
  { label: 'Espresso', microns: 250, accent: 'champagne' },
  { label: 'Moka pot', microns: 400, accent: 'copper' },
  { label: 'AeroPress', microns: 500, accent: 'copper' },
  { label: 'V60', microns: 600, accent: 'sand' },
  { label: 'Kalita wave', microns: 650, accent: 'sand' },
  { label: 'Chemex', microns: 750, accent: 'sage' },
  { label: 'Siphon', microns: 700, accent: 'sage' },
  { label: 'Clever', microns: 800, accent: 'stone' },
  { label: 'French press', microns: 1000, accent: 'pewter' },
  { label: 'Cupping', microns: 900, accent: 'pewter' },
  { label: 'Cold brew', microns: 1300, accent: 'bone' },
]

export const CHAPTERS = ['intro', 'anatomy', ...FEATURES.map((f) => f.id), 'materials', 'atelier', 'start']
