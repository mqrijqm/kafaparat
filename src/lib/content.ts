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

export const NAV_HREFS = ['#anatomy', '#materials', '#atelier', '#caye'] as const
export const PARTNER_HREF = '#partnership'
export const PARTNER_EMAIL = 'partneri@kafaparat.ba'

export const ANATOMY_PARTS = {
  // part = key of a grinder module (see three/grinder.ts)
  left: ['crank', 'bearingB', 'body', 'spring', 'carrier'],
  right: ['bezel', 'cup', 'outerBurr', 'innerBurr', 'dial', 'lid'],
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
  total: 612,
  items: [
    { grams: 238, accent: 'pewter', swatch: '/media/swatch-steel.webp', part: 'outerBurr' },
    { grams: 196, accent: 'stone', swatch: '/media/swatch-graphite.webp', part: 'body' },
    { grams: 102, accent: 'brass', swatch: '/media/swatch-brass.webp', part: 'dial' },
    { grams: 42, accent: 'bone', swatch: '/media/swatch-steel.webp', part: 'bearingA' },
    { grams: 34, accent: 'copper', swatch: '/media/swatch-walnut.webp', part: 'crank' },
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
    title: 'Kafaparat No.1 — Precizni ručni mlin',
    description: 'Precizni ručni mlin za kafu od čelika, mesinga i oraha. Četrdeset i jedan dio, jedan pokret.',
  },
  nav: ['Anatomija', 'Materijali', 'Atelje', 'CAYE'],
  partner: { short: 'Partnerstvo', long: 'Postanite partner' },
  langLabel: 'Jezik',
  hero: {
    title: ['Precizan', 'instrument', 'za mljevenje'],
    lead: 'Ručni mlin od čelika, mesinga i oraha, podešen za',
    words: ['espresso', 'pour-over', 'džezvu', 'cold brew', 'svako zrno'],
    price: 'No.1 — €340',
    add: 'Dodaj u rezervaciju',
    discover: 'Otkrij',
    hallmark: 'Ručno žigosano',
  },
  anatomy: {
    title: ['Četrdeset i jedan dio.', 'Jedan pokret.'],
    lead: 'Svaki dio je mašinski obrađen, ručno završen i zamjenjiv. Ništa zalijepljeno, ništa skriveno.',
    left: ['ručica', 'ležajevi', 'drška', 'opruga', 'nosač'],
    right: ['prsten', 'posuda', 'vanjski žrvanj', 'unutrašnji žrvanj', 'skala', 'poklopac'],
  },
  features: {
    burrs: {
      title: '48 mm žrvnjevi',
      lead: 'Heptagonalni konusni žrvnjevi od kaljenog nehrđajućeg čelika, za savršeno ujednačenu česticu.',
      bullets: ['Heptagonalna geometrija', 'Kaljeno na 60 HRC', 'Gotovo bez zadržavanja'],
      spec: [['žrvanj', '48 mm konusni'], ['čelik', '420 kaljeni'], ['rez', 'heptagonalni'], ['zadržavanje', '< 0,1 g']],
    },
    dial: {
      title: 'Fina skala',
      lead: 'Vanjski mesingani prsten pomjera žrvanj 12,5 mikrona po kliku. Osjetite ga, pa mu vjerujte.',
      bullets: ['12,5 µm po kliku', 'Vanjsko podešavanje', 'Gravirani indeks'],
      spec: [['korak', '12,5 µm'], ['raspon', '0 — 1500 µm'], ['prsten', 'puni mesing'], ['klikovi', '120 / krug']],
    },
    spectrum: {
      title: 'Svako mljevenje',
      lead: 'Od praha za džezvu do krupnog zrna za cold brew, jednom rukom i jednim prstenom.',
      bullets: ['Od džezve do cold brewa', 'Ponovljive postavke', 'Ujednačena čestica'],
      spec: [['džezva', '100 µm'], ['espresso', '250 µm'], ['filter', '650 µm'], ['cold brew', '1300 µm']],
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
    lead: 'Čelik gdje reže, mesing gdje dodirujete, orah gdje držite. Svaki gram ima razlog.',
    names: ['Čelik', 'Aluminij', 'Mesing', 'Keramika', 'Orah'],
    total: 'Ukupna težina',
  },
  atelier: {
    title: ['Sporo napravljeno.', 'U malim serijama.'],
    lead: 'Tokaren, narezan i sklopljen u jednoj radionici, rukama četiri osobe. Svaki mlin nosi žig ruku koje su ga završile.',
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
    lead: 'Mlin ostaje jutarnji ritual. Za gužvu od stotinu šoljica partnerima isporučujemo CAYE, profesionalni superautomat koji postavljamo, podešavamo i servisiramo.',
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
  footer: {
    cols: [
      { h: 'Proizvod', links: ['Kafaparat No.1', 'Putna futrola', 'Rezervni žrvnjevi', 'Poklon kartica'] },
      { h: 'Atelje', links: ['O nama', 'Radionica', 'Žurnal', 'Prodajna mjesta'] },
      { h: 'Podrška', links: ['Njega', 'Garancija', 'Dostava', 'Kontakt'] },
    ],
    partner: {
      h: 'Partnerstvo',
      lead: 'Za kafiće, pržionice i hotele koji žele Kafaparat na svom šanku.',
    },
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
    title: 'Kafaparat No.1 — Precision hand grinder',
    description: 'A precision hand coffee grinder machined from steel, brass and walnut. Forty-one parts, one gesture.',
  },
  nav: ['Anatomy', 'Materials', 'Atelier', 'CAYE'],
  partner: { short: 'Partnership', long: 'Become a partner' },
  langLabel: 'Language',
  hero: {
    title: ['Precision', 'grinding', 'instrument'],
    lead: 'A hand grinder machined from steel, brass and walnut, tuned for',
    words: ['espresso', 'pour-over', 'moka', 'cold brew', 'every bean'],
    price: 'No.1 — €340',
    add: 'Add to reservation',
    discover: 'Discover',
    hallmark: 'Hallmarked by hand',
  },
  anatomy: {
    title: ['Forty-one parts.', 'One gesture.'],
    lead: 'Every component is machined, hand-finished and replaceable. Nothing glued, nothing hidden.',
    left: ['crank', 'bearings', 'grip', 'spring', 'carrier'],
    right: ['bezel', 'catch cup', 'outer burr', 'inner burr', 'dial', 'lid'],
  },
  features: {
    burrs: {
      title: '48 mm burrs',
      lead: 'Heptagonal conical burrs, cut from hardened stainless steel for a razor-even particle.',
      bullets: ['Heptagonal geometry', 'Hardened to 60 HRC', 'Near-zero retention'],
      spec: [['burr', '48 mm conical'], ['steel', '420 hardened'], ['cut', 'heptagonal'], ['retention', '< 0.1 g']],
    },
    dial: {
      title: 'Stepless dial',
      lead: 'An external brass ring moves the burr 12.5 microns per click. Feel it, then trust it.',
      bullets: ['12.5 µm per click', 'External adjustment', 'Engraved index'],
      spec: [['step', '12.5 µm'], ['range', '0 — 1500 µm'], ['ring', 'solid brass'], ['clicks', '120 / turn']],
    },
    spectrum: {
      title: 'Every grind',
      lead: 'From powder-fine Turkish to cold brew gravel, with one hand and one ring.',
      bullets: ['Turkish to cold brew', 'Repeatable settings', 'Uniform particle'],
      spec: [['turkish', '100 µm'], ['espresso', '250 µm'], ['filter', '650 µm'], ['cold brew', '1300 µm']],
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
    lead: 'Steel where it cuts, brass where you touch, walnut where you hold. Every gram has a reason.',
    names: ['Steel', 'Aluminium', 'Brass', 'Ceramic', 'Walnut'],
    total: 'Total weight',
  },
  atelier: {
    title: ['Made slowly.', 'In small batches.'],
    lead: 'Turned, knurled and assembled by four people in one workshop. Every grinder is hallmarked by the hands that finished it.',
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
    lead: 'The grinder stays the morning ritual. For a rush of a hundred cups we supply partners with CAYE, a professional super-automatic we install, tune and service.',
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
  footer: {
    cols: [
      { h: 'Product', links: ['Kafaparat No.1', 'Travel roll', 'Spare burrs', 'Gift card'] },
      { h: 'Atelier', links: ['About', 'Workshop', 'Journal', 'Stockists'] },
      { h: 'Support', links: ['Care guide', 'Warranty', 'Shipping', 'Contact'] },
    ],
    partner: {
      h: 'Partnership',
      lead: 'For cafés, roasters and hotels who want Kafaparat on their bar.',
    },
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
