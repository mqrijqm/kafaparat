# Use-case 01 — MOLA No.1 (product · exploded 3D · scrollytelling)

Rekreacija UX-a sa **animejs.com** (homepage), pretvorena u one-page sajt izmišljenog brenda
ručnih mlinova za kafu. Grana: `usecase/01-mola-product-3d`.

```
pnpm install
pnpm dev          # http://localhost:3000
```

## Šta je iskopirano sa reference

| Reference (animejs.com) | Ovde |
|---|---|
| 22 GLB modula složena duž jedne ose | proceduralni mlin (15 modula) u `src/three/grinder.ts`, bez spoljnih modela |
| Toon G-buffer + jedan outline shader (tamno: 3 tona + peach rim; svetlo: samo linije) | `src/three/materials.ts` — isti algoritam, boje u neutralnoj paleti |
| anime.js master timeline po poglavljima, skrol ga "vozi" | GSAP timeline u `src/three/choreography.ts`, jedan ScrollTrigger + Lenis |
| CSS3D "sočivo": prsten u 8 boja, 193 podeoka, easing platna | `src/components/Lens.tsx` (prsten u 8 neutralnih tonova) |
| Callout labele sa 45° linijama ka delovima | `Callouts` u `src/components/Overlays.tsx` |
| Timeline scrubber dole desno (65 podeoka, crvena glava) | `SubNav` — mesingana glava, klik/drag skroluje |
| Feature galerija: 8 sekcija, luk prstena = progress, code kartica | 8 sekcija sa Codex fotografijama u sočivu + spec kartica |
| Modules sekcija: delovi izlaze, "bundle size" graf | Materials: delovi izlaze sa oznakom materijala, graf težine |
| "Start animating" grid 12 linkova | "Start grinding" — 12 metoda pripreme sa µm |

## Kako ga iskoristiti za novi brend

1. **Tekst i struktura** — sve je u `src/lib/content.ts` (naslovi, feature sekcije, materijali, boje prstena).
2. **Boje** — `:root` u `src/app/globals.css` + `PALETTE_DARK / PALETTE_LIGHT` u `src/three/materials.ts`.
3. **Predmet** — zameni module u `src/three/grinder.ts` (svaki modul = grupa na osi Z; ključevi se koriste u labelama).
4. **Slike** — opiši ih u `scripts/media.json`, pa:
   ```
   node scripts/gen-media.mjs scripts/media.json      # Codex (gpt-5.6-sol, nikad Astra) -> media-src/
   node scripts/optimize-media.mjs                    # -> public/media/*.webp
   ```
   `--only ime1,ime2` generiše samo neke; `--force` pregazi postojeće.

## Performanse

- Three.js se učitava tek na klijentu (`next/dynamic`, `ssr: false`) — ~247 KB gzip.
- Supersampling 2× na jačim mašinama, 1.25–1.5× na slabijim/mobilnim (umesto antialiasinga, kao na referenci).
- `prefers-reduced-motion`: intro se preskače, idle rotacije stoje, skrol bez zaglađivanja.
