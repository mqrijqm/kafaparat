// All copy + structure in one place, so the use-case can be re-skinned for another brand.
// Structure (ids, accents, parts, grams, images) is language-neutral; every visible string lives in COPY[lang].

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

export const LANGS = ['bs', 'en'] as const
export type Lang = (typeof LANGS)[number]

export const NAV_HREFS = ['#anatomy', '#materials', '#caye', '#shop'] as const
export const PARTNER_HREF = '#partnership'
export const PARTNER_EMAIL = 'partneri@kafaparat.ba'

export const ANATOMY_PARTS = {
  // part = key of a grinder module (see three/grinder.ts)
  left: ['base', 'motor', 'driveGear', 'bearing', 'carrier'],
  right: ['inlet', 'adjustRing', 'housing', 'upperBurr', 'lowerBurr', 'chute'],
}

export type Feature = { id: string; accent: Accent; image: string }

export const FEATURES: Feature[] = [
  { id: 'burrs', accent: 'brass', image: '/media/burr-macro.webp' },
  { id: 'dial', accent: 'champagne', image: '/media/dial-macro.webp' },
  { id: 'spectrum', accent: 'copper', image: '/media/grind-spectrum.webp' },
  { id: 'drive', accent: 'sand', image: '/media/drive-gears.webp' },
  { id: 'bearings', accent: 'sage', image: '/media/bearings.webp' },
  { id: 'dosing', accent: 'stone', image: '/media/dosing-chute.webp' },
  { id: 'cooling', accent: 'pewter', image: '/media/cooling-fins.webp' },
  { id: 'module', accent: 'bone', image: '/media/grind-module.webp' },
]

export const MATERIALS = {
  total: 1454,
  items: [
    { grams: 524, accent: 'copper', swatch: '/media/swatch-copper.webp', part: 'motor' },
    { grams: 412, accent: 'pewter', swatch: '/media/swatch-graphite.webp', part: 'housing' },
    { grams: 268, accent: 'stone', swatch: '/media/swatch-steel.webp', part: 'carrier' },
    { grams: 186, accent: 'bone', swatch: '/media/swatch-ceramic.webp', part: 'upperBurr' },
    { grams: 64, accent: 'sand', swatch: '/media/swatch-graphite.webp', part: 'inlet' },
  ] as { grams: number; accent: Accent; swatch: string; part: string }[],
}

/** CAYE Professional: the bar machine Kafaparat supplies to partners (section after the partnership band). */
export const CAYE = {
  logo: '/brand/caye-logo.svg',
  hero: '/media/caye-hero.webp',
  pour: '/media/caye-pour.webp',
  milk: '/media/caye-milkpour.webp',
  // stills + loop cut from the official CAYE film (media-src/caye-video/hero-en.mp4)
  spacesVideo: '/media/caye-double.mp4',
  spacesPoster: '/media/caye-double-poster.webp',
  details: ['/media/caye-v-burrs.webp', '/media/caye-v-beans.webp', '/media/caye-v-inside.webp', '/media/caye-v-milk.webp'],
}

/** Golden Standard product page (coffee, hygiene) */
const GS_PRODUCTS = 'https://www.goldenstandard.eu/proizvodi'

/** Shop: one machine with options + accessories. Prices in EUR (placeholders until the real price list). */
export const SHOP = {
  freeShipping: 150,
  machine: {
    id: 'caye-smart-x',
    price: 8950,
    lease: 249,
    finishes: [
      { id: 'silver', swatch: 'linear-gradient(135deg,#e9e6e1,#9a9894)' },
      { id: 'graphite', swatch: 'linear-gradient(135deg,#55514c,#1d1b19)' },
    ],
    // extra price per configuration (single / twin hopper)
    configs: [0, 900],
  },
  // Golden Standard coffee, milk and hygiene (real product names from goldenstandard.eu, prices are placeholders)
  accessories: [
    { id: 'gs-signature', cat: 'coffee', price: 29, image: '/media/gs-signature.webp', link: GS_PRODUCTS },
    { id: 'gs-crema', cat: 'coffee', price: 27, image: '/media/gs-crema.webp', link: GS_PRODUCTS },
    { id: 'gs-milk', cat: 'milk', price: 18, image: '/media/gs-milk.webp' },
    { id: 'gs-oat', cat: 'milk', price: 24, image: '/media/gs-oat.webp' },
    { id: 'gs-filter', cat: 'hygiene', price: 89, image: '/media/gs-filter.webp', link: GS_PRODUCTS },
    { id: 'gs-tablets', cat: 'hygiene', price: 24, image: '/media/gs-tablets.webp', link: GS_PRODUCTS },
  ] as { id: string; cat: 'coffee' | 'milk' | 'hygiene'; price: number; image: string; link?: string }[],
  categories: ['all', 'coffee', 'milk', 'hygiene'] as const,
}

/** Product photos for the chosen finish + hopper configuration: five views of that exact machine. */
export function machineGallery(finish: number, config: number) {
  const f = SHOP.machine.finishes[finish]?.id ?? 'silver'
  const h = config === 0 ? 1 : 2
  return (['3q', 'front', 'side', 'top', 'back'] as const).map((v) => `/media/smartx-${f}-${h}-${v}.webp`)
}

export const GOLDEN_STANDARD = {
  // the site picks the visitor's language itself; /bs would redirect to German
  url: { bs: 'https://www.goldenstandard.eu/', en: 'https://www.goldenstandard.eu/en' },
  wordmark: '/brand/golden-standard-wordmark.webp',
  mark: '/brand/golden-standard-mark.webp',
}

export const ATELIER_IMAGES = ['/media/crema-swirl.webp', '/media/crema-grain.webp', '/media/burr-top.webp']

export const BREWS: { microns: number; accent: Accent }[] = [
  { microns: 100, accent: 'brass' },
  { microns: 250, accent: 'champagne' },
  { microns: 400, accent: 'copper' },
  { microns: 500, accent: 'copper' },
  { microns: 600, accent: 'sand' },
  { microns: 650, accent: 'sand' },
  { microns: 750, accent: 'sage' },
  { microns: 700, accent: 'sage' },
  { microns: 800, accent: 'stone' },
  { microns: 1000, accent: 'pewter' },
  { microns: 900, accent: 'pewter' },
  { microns: 1300, accent: 'bone' },
]

export const CHAPTERS = ['intro', 'anatomy', ...FEATURES.map((f) => f.id), 'materials', 'atelier', 'start']

type FeatureCopy = { title: string; lead: string; bullets: string[]; spec: [string, string][] }

const bs = {
  meta: {
    title: 'Kafaparat — CAYE Smart X i keramički CPS mlin',
    description: 'Profesionalni CAYE aparati za kafu s ravnim keramičkim CPS žrvnjevima. Prodaja, instalacija i servis u BiH.',
  },
  nav: ['Anatomija', 'Materijali', 'CAYE', 'Prodavnica'],
  partner: { short: 'Partnerstvo', long: 'Postanite partner' },
  langLabel: 'Jezik',
  hero: {
    title: ['Precizan', 'instrument', 'za mljevenje'],
    lead: 'Keramičko CPS srce CAYE aparata, podešeno za',
    words: ['espresso', 'ristretto', 'lungo', 'flat white', 'svako zrno'],
    price: 'CAYE Smart X — €8.950',
    add: 'Dodaj u korpu',
    discover: 'Otkrij',
    hallmark: 'Ovlašteni CAYE partner',
  },
  anatomy: {
    title: ['Dvanaest modula.', 'Jedan rez.'],
    lead: 'Od ulaza zrna do izlaza mljevenja: keramika gdje reže, čelik gdje nosi, aluminij gdje hladi. Svaki modul je zamjenjiv.',
    left: ['nosač', 'motor', 'pogonski zupčanik', 'ležaj', 'rotor'],
    right: ['ulaz zrna', 'prsten za podešavanje', 'kućište', 'gornji žrvanj', 'donji žrvanj', 'izlaz mljevenja'],
  },
  features: {
    burrs: {
      title: 'Keramički CPS',
      lead: 'Dva ravna žrvnja od tehničke keramike drže istu veličinu čestice od prve do desethiljadite šoljice. Constant Particle Size.',
      bullets: ['Ravni keramički par', 'Ne grije zrno', 'Ista čestica, svaki put'],
      spec: [['žrvanj', '64 mm ravni'], ['materijal', 'cirkonij keramika'], ['rez', 'CPS radijalni'], ['vijek', '300 000 šoljica']],
    },
    dial: {
      title: 'Podešavanje s ekrana',
      lead: 'Mali koračni motor okreće zupčasti prsten oko kućišta i pomjera gornji žrvanj po 5 mikrona. Postavka se mijenja dodirom, ne ključem.',
      bullets: ['5 µm po koraku', 'Koračni motor', 'Profil za svako zrno'],
      spec: [['korak', '5 µm'], ['raspon', '150 — 1200 µm'], ['pogon', 'koračni motor'], ['profili', '2 × spremnik']],
    },
    spectrum: {
      title: 'Svako mljevenje',
      lead: 'Od ristretta do dugog filtera, isti keramički par i jedan dodir na ekranu.',
      bullets: ['Od ristretta do filtera', 'Ponovljive postavke', 'Ujednačena čestica'],
      spec: [['ristretto', '180 µm'], ['espresso', '250 µm'], ['lungo', '400 µm'], ['filter', '650 µm']],
    },
    drive: {
      title: 'Tihi pogon',
      lead: 'Motor s reduktorom okreće žrvanj sporo i snažno. Zrno se reže, ne gnječi, i ostaje hladno.',
      bullets: ['Zavojni reduktor', 'Sporih 400 o/min', 'Tiši od razgovora'],
      spec: [['motor', 'DC bez četkica'], ['brzina', '400 o/min'], ['reduktor', '1:12 zavojni'], ['buka', '< 55 dB']],
    },
    bearings: {
      title: 'Dvostruki ležajevi',
      lead: 'Dva zatvorena ležaja drže osovinu tačno u centru. Bez klimanja, bez pomjeranja, bez buke.',
      bullets: ['Dvostruko zatvoreni', 'Osovina bez zazora', 'Tiha rotacija'],
      spec: [['ležajevi', '2 × zatvoreni'], ['osovina', '7 mm čelik'], ['odstupanje', '< 5 µm'], ['servis', 'doživotni']],
    },
    dosing: {
      title: 'Tačna doza',
      lead: 'Samljevena kafa pada pravo u komoru za doziranje koja je mjeri na desetinu grama. Svaki espresso počinje isto.',
      bullets: ['Vaga u komori', 'Tačnost 0,1 g', 'Bez prosipanja'],
      spec: [['doza', '7 — 22 g'], ['tačnost', '± 0,1 g'], ['komora', 'nehrđajući čelik'], ['statika', 'ionizator']],
    },
    cooling: {
      title: 'Hladan rez',
      lead: 'Rebrasto aluminijsko kućište odvodi toplotu od žrvnjeva, pa i u najvećoj gužvi aroma ostaje u zrnu.',
      bullets: ['Rebrasto kućište', 'Bez pregrijavanja', 'Stabilna aroma'],
      spec: [['kućište', 'aluminij 6061'], ['rebra', '24'], ['zagrijavanje', 'maks. + 2 °C'], ['rad', 'cijela smjena']],
    },
    module: {
      title: 'Modul za minut',
      lead: 'Cijeli mehanizam izlazi iz mašine kao jedan uložak. Servis bez alata, šank bez pauze.',
      bullets: ['Jedan uložak', 'Zamjena bez alata', 'Servis za 60 sekundi'],
      spec: [['zamjena', '60 sekundi'], ['alat', 'nije potreban'], ['žrvnjevi', 'zamjenjivi'], ['garancija', '5 godina']],
    },
  } as Record<string, FeatureCopy>,
  materials: {
    title: ['Pet materijala.', 'Ništa više.'],
    lead: 'Bakar gdje pokreće, aluminij gdje hladi, čelik gdje nosi, keramika gdje reže. Svaki gram ima razlog.',
    names: ['Bakar', 'Aluminij', 'Čelik', 'Keramika', 'Polimer'],
    total: 'Ukupna težina',
  },
  atelier: {
    title: ['Kalibrirano rukom.', 'Prije vašeg šanka.'],
    lead: 'Svaki CAYE koji isporučimo prolazi kroz našu radionicu u Sarajevu: žrvnjevi, doza i temperatura podese se za vaše zrno, pa tek onda idu na šank.',
    captions: ['Krema', 'Vrtlog', 'Srce mlina'],
  },
  start: {
    title: 'Počnite mljeti',
    lead: 'Pronađite postavku za svaki napitak.',
    brews: ['Džezva', 'Espresso', 'Moka', 'AeroPress', 'V60', 'Kalita wave', 'Chemex', 'Sifon', 'Clever', 'French press', 'Kupiranje', 'Cold brew'],
  },
  caye: {
    eyebrow: 'Kafaparat × CAYE Professional',
    title: ['Za šank', 'koji ne staje.'],
    lead: 'Keramičko srce koje ste upravo rastavili kuca u CAYE, profesionalnom superautomatu koji partnerima isporučujemo, postavljamo, podešavamo i servisiramo.',
    model: {
      left: [
        ['Dva spremnika', 'Dvije kafe u zrnu, dva profila prženja, jedan dodir.'],
        ['Ekran osjetljiv na dodir', 'Meni napitaka složen po vašem šanku.'],
      ],
      right: [
        ['Precizni žrvnjevi', 'Svježe mljevenje za svaku šoljicu.'],
        ['Dvostruki izlaz', 'Dva espressa odjednom, u ritmu šanka.'],
      ],
    },
    finale: {
      title: ['Vrhunska kafa.', 'Svaki put.'],
      lead: 'Prva šoljica u smjeni i hiljadita imaju isti ukus.',
    },
    hero: {
      label: 'Oblik',
      title: 'Arhitektura od čelika.',
      lead: 'Fasetirano kućište i trouglasti bočni panel: mašina koja se prepoznaje s druge strane sale, i kad ništa ne radi.',
    },
    pour: {
      label: 'Ekstrakcija',
      title: 'Krema kao iz ruku baristke.',
      lead: 'Temperatura, pritisak i doza drže se isto od prve do posljednje šoljice u smjeni. Flat white, espresso ili lungo, na jedan dodir.',
      captions: ['Espresso', 'Mlijeko'],
    },
    spaces: {
      title: ['Jedna mašina.', 'Tri šanka.'],
      items: [
        ['Kafić', 'Jutarnji špic bez reda i bez čekanja.'],
        ['Hotel', 'Doručak za stotinu gostiju, šoljica po šoljica.'],
        ['Pržionica', 'Degustacija svake nove serije, tačno kako je pržena.'],
      ],
    },
    details: {
      title: ['Detalji', 'koji rade tiho.'],
      lead: 'Keramički žrvnjevi, svježe zrno i mlijeko koje se pjeni samo. Sve ostalo radi iza čelika.',
      items: ['Žrvnjevi', 'Zrno', 'Unutrašnjost', 'Mlijeko'],
    },
    beans: {
      line: 'Od zrna do šoljice',
      place: 'Kafaparat × CAYE, Sarajevo',
    },
    cta: {
      title: 'CAYE na vašem šanku.',
      lead: 'Isporuka, postavka, obuka osoblja i servis, iz jedne ruke.',
      button: 'Zatražite ponudu',
    },
  },
  shop: {
    eyebrow: 'Prodavnica',
    title: ['Ponesite srce', 'na svoj šank.'],
    name: 'CAYE Smart X',
    tagline: 'Profesionalni superautomat s keramičkim CPS mlinom',
    rating: '4,9',
    reviews: '128 recenzija',
    lease: 'ili od €{n} mjesečno, 36 rata bez kamate',
    finish: 'Završna obrada',
    finishes: ['Srebrna', 'Grafit'],
    config: 'Mlinovi',
    configs: [
      ['Jedan spremnik', '1 × CPS mlin'],
      ['Dva spremnika', '2 × CPS mlin'],
    ],
    qty: 'Količina',
    add: 'Dodaj u korpu',
    added: 'Dodano',
    quote: 'Zatražite ponudu',
    stock: 'Na stanju · isporuka i instalacija za 5 – 7 dana',
    perks: ['Besplatna dostava i instalacija u BiH', '5 godina garancije na CPS žrvnjeve', 'Obuka osoblja uključena'],
    tabs: [
      {
        h: 'Specifikacije',
        rows: [
          ['Mlin', '2 × 64 mm keramički CPS'],
          ['Kapacitet', '258 šotova / sat'],
          ['Vaga za prah', '± 0,1 g'],
          ['Širina', '430 mm'],
          ['Napajanje', '400 V · 6,8 kW'],
        ],
      },
      {
        h: 'U kutiji',
        rows: [
          ['Aparat', 'CAYE Smart X'],
          ['Mlijeko', 'Posuda 4 l + crijevo'],
          ['Voda', 'Filter s ugradnjom'],
          ['Njega', '100 tableta za čišćenje'],
        ],
      },
      {
        h: 'Dostava i povrat',
        rows: [
          ['Dostava', 'Besplatno u BiH'],
          ['Instalacija', 'Naš tehničar, isti dan'],
          ['Povrat', '30 dana'],
          ['Servis', 'Dolazak za 48 sati'],
        ],
      },
    ],
    more: 'Naša kafa, mlijeko i higijena',
    moreLead: 'Sve kalibrirano za isti aparat: Golden Standard kafa u zrnu, barista mlijeko, filter i tablete za čišćenje.',
    quickAdd: 'Brzo dodaj',
    brand: 'Golden Standard',
    cats: { all: 'Sve', coffee: 'Kafa', milk: 'Mlijeko', hygiene: 'Higijena' } as Record<string, string>,
    accessories: {
      'gs-signature': ['Signature Roast', 'Kafa u zrnu, 1 kg'],
      'gs-crema': ['Barista Crema', 'Kafa u zrnu, 1 kg'],
      'gs-milk': ['Barista Premium Milk 3.8', 'Paket 6 × 1 l'],
      'gs-oat': ['Oat Barista', 'Paket 6 × 1 l'],
      'gs-filter': ['Filter za vodu', 'Zamjena svakih 6 mjeseci'],
      'gs-tablets': ['Tablete za čišćenje', '60 tableta'],
    } as Record<string, [string, string]>,
    badge: { 'gs-signature': 'Najprodavanije', 'gs-oat': 'Biljno' } as Record<string, string>,
    variant: 'Prikazano',
    details: 'Na goldenstandard.eu',
  },
  gs: {
    eyebrow: 'Zvanično zastupstvo · HR, SI, BiH, CG',
    title: ['Zlatni standard', 'u svakoj šoljici.'],
    lead: 'CAYE aparati, kafa, mlijeko i higijena na ovom sajtu dolaze kroz Golden Standard sistem.',
    cta: 'goldenstandard.eu',
    powered: 'Pokreće',
  },
  cart: {
    title: 'Korpa',
    open: 'Otvori korpu',
    close: 'Zatvori',
    empty: 'Korpa je još prazna.',
    browse: 'Pogledajte prodavnicu',
    subtotal: 'Međuzbir',
    shipping: 'Dostava',
    free: 'Besplatno',
    shippingFee: 'Računa se na plaćanju',
    freeLeft: 'Još €{n} do besplatne dostave',
    freeDone: 'Ostvarili ste besplatnu dostavu',
    checkout: 'Na plaćanje',
    note: 'PDV uključen. Plaćanje karticom, virmanom ili na rate.',
    remove: 'Ukloni',
    toast: 'Dodano u korpu',
    view: 'Pogledaj korpu',
  },
  footer: {
    cols: [
      { h: 'Prodavnica', links: ['CAYE Smart X', 'CPS žrvnjevi', 'Mlinski modul', 'Kafa u zrnu'] },
      { h: 'Atelje', links: ['O nama', 'Radionica', 'Žurnal', 'Prodajna mjesta'] },
      { h: 'Podrška', links: ['Njega', 'Garancija', 'Dostava', 'Kontakt'] },
    ],
    partner: {
      h: 'Partnerstvo',
      lead: 'Za kafiće, pržionice i hotele koji žele CAYE na svom šanku.',
    },
    trust: ['Besplatna dostava od €150', 'Plaćanje na rate', 'Servis za 48 sati'],
    news: {
      h: 'Bilješke iz ateljea',
      lead: 'Vodiči za pripremu i nove serije, četiri puta godišnje.',
      placeholder: 'E-mail adresa',
      submit: 'Prijava',
    },
    rights: '© 2026 Kafaparat Atelje',
  },
}

export type Copy = typeof bs

const en: Copy = {
  meta: {
    title: 'Kafaparat — CAYE Smart X and the ceramic CPS grinder',
    description: 'Professional CAYE coffee machines with flat ceramic CPS burrs. Sales, installation and service in Bosnia and Herzegovina.',
  },
  nav: ['Anatomy', 'Materials', 'CAYE', 'Shop'],
  partner: { short: 'Partnership', long: 'Become a partner' },
  langLabel: 'Language',
  hero: {
    title: ['Precision', 'grinding', 'instrument'],
    lead: 'The ceramic CPS heart of every CAYE machine, tuned for',
    words: ['espresso', 'ristretto', 'lungo', 'flat white', 'every bean'],
    price: 'CAYE Smart X — €8,950',
    add: 'Add to cart',
    discover: 'Discover',
    hallmark: 'Authorised CAYE partner',
  },
  anatomy: {
    title: ['Twelve modules.', 'One cut.'],
    lead: 'From bean inlet to grounds outlet: ceramic where it cuts, steel where it carries, aluminium where it cools. Every module is replaceable.',
    left: ['mounting plate', 'motor', 'drive gear', 'bearing', 'rotor'],
    right: ['bean inlet', 'adjustment ring', 'housing', 'upper burr', 'lower burr', 'grounds outlet'],
  },
  features: {
    burrs: {
      title: 'Ceramic CPS',
      lead: 'Two flat burrs of technical ceramic hold the same particle size from the first cup to the ten-thousandth. Constant Particle Size.',
      bullets: ['Flat ceramic pair', 'Never heats the bean', 'Same particle, every time'],
      spec: [['burr', '64 mm flat'], ['material', 'zirconia ceramic'], ['cut', 'CPS radial'], ['lifetime', '300,000 cups']],
    },
    dial: {
      title: 'Set from the screen',
      lead: 'A small stepper motor turns the gear ring around the housing and moves the upper burr 5 microns at a time. The setting changes with a touch, not a wrench.',
      bullets: ['5 µm per step', 'Stepper motor', 'A profile for every bean'],
      spec: [['step', '5 µm'], ['range', '150 — 1200 µm'], ['drive', 'stepper motor'], ['profiles', '2 × hopper']],
    },
    spectrum: {
      title: 'Every grind',
      lead: 'From ristretto to a long filter, the same ceramic pair and one touch on the screen.',
      bullets: ['Ristretto to filter', 'Repeatable settings', 'Uniform particle'],
      spec: [['ristretto', '180 µm'], ['espresso', '250 µm'], ['lungo', '400 µm'], ['filter', '650 µm']],
    },
    drive: {
      title: 'Quiet drive',
      lead: 'A geared motor turns the burr slowly and with force. The bean is cut, not crushed, and stays cool.',
      bullets: ['Helical reduction', 'A slow 400 rpm', 'Quieter than a conversation'],
      spec: [['motor', 'brushless DC'], ['speed', '400 rpm'], ['reduction', '1:12 helical'], ['noise', '< 55 dB']],
    },
    bearings: {
      title: 'Twin bearings',
      lead: 'Two sealed bearings hold the shaft dead-center. No wobble, no drift, no noise.',
      bullets: ['Double sealed', 'Zero shaft play', 'Silent rotation'],
      spec: [['bearings', '2 × sealed'], ['shaft', '7 mm steel'], ['runout', '< 5 µm'], ['service', 'lifetime']],
    },
    dosing: {
      title: 'Exact dose',
      lead: 'Ground coffee falls straight into a dosing chamber that weighs it to a tenth of a gram. Every espresso starts the same.',
      bullets: ['Scale in the chamber', 'Accurate to 0.1 g', 'No spills'],
      spec: [['dose', '7 — 22 g'], ['accuracy', '± 0.1 g'], ['chamber', 'stainless steel'], ['static', 'ionised']],
    },
    cooling: {
      title: 'Cool cut',
      lead: 'A finned aluminium housing draws heat away from the burrs, so even at the busiest hour the aroma stays in the bean.',
      bullets: ['Finned housing', 'No overheating', 'Stable aroma'],
      spec: [['housing', '6061 aluminium'], ['fins', '24'], ['heat rise', 'max + 2 °C'], ['duty', 'full shift']],
    },
    module: {
      title: 'A module in a minute',
      lead: 'The whole mechanism slides out of the machine as one cartridge. Service without tools, a bar without a pause.',
      bullets: ['One cartridge', 'Tool-free swap', 'Serviced in 60 seconds'],
      spec: [['swap', '60 seconds'], ['tools', 'none needed'], ['burrs', 'replaceable'], ['warranty', '5 years']],
    },
  },
  materials: {
    title: ['Five materials.', 'Nothing else.'],
    lead: 'Copper where it drives, aluminium where it cools, steel where it carries, ceramic where it cuts. Every gram has a reason.',
    names: ['Copper', 'Aluminium', 'Steel', 'Ceramic', 'Polymer'],
    total: 'Total weight',
  },
  atelier: {
    title: ['Calibrated by hand.', 'Before your bar.'],
    lead: 'Every CAYE we deliver passes through our Sarajevo workshop: burrs, dose and temperature are set for your bean before it ever reaches the bar.',
    captions: ['Crema', 'Swirl', 'The heart of it'],
  },
  start: {
    title: 'Start grinding',
    lead: 'Find your setting for every brew.',
    brews: ['Turkish', 'Espresso', 'Moka pot', 'AeroPress', 'V60', 'Kalita wave', 'Chemex', 'Siphon', 'Clever', 'French press', 'Cupping', 'Cold brew'],
  },
  caye: {
    eyebrow: 'Kafaparat × CAYE Professional',
    title: ['For the bar', 'that never stops.'],
    lead: 'The ceramic heart you just took apart beats inside CAYE, a professional super-automatic we deliver, install, tune and service for our partners.',
    model: {
      left: [
        ['Twin hoppers', 'Two beans, two roast profiles, one touch.'],
        ['Touchscreen', 'A drinks menu arranged around your bar.'],
      ],
      right: [
        ['Precision burrs', 'Freshly ground for every single cup.'],
        ['Double spout', 'Two espressos at once, at the pace of the bar.'],
      ],
    },
    finale: {
      title: ['Exceptional coffee.', 'Every time.'],
      lead: 'The first cup of the shift tastes like the thousandth.',
    },
    hero: {
      label: 'Form',
      title: 'Architecture in steel.',
      lead: 'A faceted body and a triangular side panel: a machine you recognise from across the room, even when it is resting.',
    },
    pour: {
      label: 'Extraction',
      title: 'Crema like a barista pulled it.',
      lead: 'Temperature, pressure and dose hold steady from the first cup of the shift to the last. Flat white, espresso or lungo, one touch.',
      captions: ['Espresso', 'Milk'],
    },
    spaces: {
      title: ['One machine.', 'Three bars.'],
      items: [
        ['Café', 'The morning rush without a queue.'],
        ['Hotel', 'Breakfast for a hundred guests, cup by cup.'],
        ['Roastery', 'Cupping every new batch exactly as it was roasted.'],
      ],
    },
    details: {
      title: ['Details', 'that work quietly.'],
      lead: 'Ceramic burrs, fresh beans and milk that froths itself. Everything else works behind steel.',
      items: ['Burrs', 'Beans', 'Inside', 'Milk'],
    },
    beans: {
      line: 'From bean to cup',
      place: 'Kafaparat × CAYE, Sarajevo',
    },
    cta: {
      title: 'CAYE on your bar.',
      lead: 'Delivery, installation, staff training and service, all from one hand.',
      button: 'Request a quote',
    },
  },
  shop: {
    eyebrow: 'Shop',
    title: ['Bring the heart', 'to your bar.'],
    name: 'CAYE Smart X',
    tagline: 'Professional super-automatic with a ceramic CPS grinder',
    rating: '4.9',
    reviews: '128 reviews',
    lease: 'or from €{n} a month, 36 interest-free instalments',
    finish: 'Finish',
    finishes: ['Silver', 'Graphite'],
    config: 'Grinders',
    configs: [
      ['Single hopper', '1 × CPS grinder'],
      ['Twin hopper', '2 × CPS grinder'],
    ],
    qty: 'Quantity',
    add: 'Add to cart',
    added: 'Added',
    quote: 'Request a quote',
    stock: 'In stock · delivered and installed in 5 – 7 days',
    perks: ['Free delivery and installation in BiH', '5-year warranty on the CPS burrs', 'Staff training included'],
    tabs: [
      {
        h: 'Specifications',
        rows: [
          ['Grinder', '2 × 64 mm ceramic CPS'],
          ['Capacity', '258 shots / hour'],
          ['Powder scale', '± 0.1 g'],
          ['Width', '430 mm'],
          ['Power', '400 V · 6.8 kW'],
        ],
      },
      {
        h: 'In the box',
        rows: [
          ['Machine', 'CAYE Smart X'],
          ['Milk', '4 l container + hose'],
          ['Water', 'Filter, fitted'],
          ['Care', '100 cleaning tablets'],
        ],
      },
      {
        h: 'Delivery & returns',
        rows: [
          ['Delivery', 'Free in BiH'],
          ['Installation', 'Our technician, same day'],
          ['Returns', '30 days'],
          ['Service', 'On site within 48 hours'],
        ],
      },
    ],
    more: 'Our coffee, milk and hygiene',
    moreLead: 'All calibrated for the same machine: Golden Standard whole beans, barista milk, water filter and cleaning tablets.',
    quickAdd: 'Quick add',
    brand: 'Golden Standard',
    cats: { all: 'All', coffee: 'Coffee', milk: 'Milk', hygiene: 'Hygiene' },
    accessories: {
      'gs-signature': ['Signature Roast', 'Whole beans, 1 kg'],
      'gs-crema': ['Barista Crema', 'Whole beans, 1 kg'],
      'gs-milk': ['Barista Premium Milk 3.8', 'Pack of 6 × 1 l'],
      'gs-oat': ['Oat Barista', 'Pack of 6 × 1 l'],
      'gs-filter': ['Water filter', 'Replace every 6 months'],
      'gs-tablets': ['Cleaning tablets', '60 tablets'],
    },
    badge: { 'gs-signature': 'Bestseller', 'gs-oat': 'Plant-based' },
    variant: 'Shown',
    details: 'On goldenstandard.eu',
  },
  gs: {
    eyebrow: 'Official representation · HR, SI, BiH, ME',
    title: ['The gold standard', 'in every cup.'],
    lead: 'The CAYE machines, coffee, milk and hygiene on this site come through the Golden Standard system.',
    cta: 'goldenstandard.eu',
    powered: 'Powered by',
  },
  cart: {
    title: 'Cart',
    open: 'Open cart',
    close: 'Close',
    empty: 'Your cart is still empty.',
    browse: 'Browse the shop',
    subtotal: 'Subtotal',
    shipping: 'Delivery',
    free: 'Free',
    shippingFee: 'Calculated at checkout',
    freeLeft: '€{n} more for free delivery',
    freeDone: 'You have free delivery',
    checkout: 'Checkout',
    note: 'VAT included. Pay by card, bank transfer or in instalments.',
    remove: 'Remove',
    toast: 'Added to cart',
    view: 'View cart',
  },
  footer: {
    cols: [
      { h: 'Shop', links: ['CAYE Smart X', 'CPS burrs', 'Grinding module', 'Coffee beans'] },
      { h: 'Atelier', links: ['About', 'Workshop', 'Journal', 'Stockists'] },
      { h: 'Support', links: ['Care guide', 'Warranty', 'Shipping', 'Contact'] },
    ],
    partner: {
      h: 'Partnership',
      lead: 'For cafés, roasters and hotels who want CAYE on their bar.',
    },
    trust: ['Free delivery over €150', 'Pay in instalments', '48-hour service'],
    news: {
      h: 'Notes from the atelier',
      lead: 'Brewing guides and new batches, four times a year.',
      placeholder: 'Email address',
      submit: 'Subscribe',
    },
    rights: '© 2026 Kafaparat Atelier',
  },
}

export const COPY: Record<Lang, Copy> = { bs, en }
