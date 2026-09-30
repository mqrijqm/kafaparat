import * as THREE from 'three'

/*
  Two-pass "technical illustration" look (reverse-engineered from animejs.com):
  1. Every mesh renders a G-buffer: RGB = a flat per-part ID color (+ a bit of the normal),
     A = light tone (0 = shade, .6 = lit, 1 = rim highlight).
  2. A full-screen pass finds edges where the RGB changes and paints 3 flat tones + lines.
  Dark mode = tones are graphite/peach; light mode = all tones equal the page color, so only lines remain.
*/

// Shared by every part material; the engine updates it each frame (view-space light direction).
export const lightUniforms = {
  uLightDir: { value: new THREE.Vector3(-1, 0.6, -0.4).normalize() },
}

const idVertex = /* glsl */ `
  varying vec3 vN;
  varying vec3 vV;
  void main() {
    vec4 mv = modelViewMatrix * vec4(position, 1.0);
    vN = normalize(normalMatrix * normal);
    vV = normalize(-mv.xyz);
    gl_Position = projectionMatrix * mv;
  }
`

const idFragment = /* glsl */ `
  uniform vec3 uId;
  uniform vec3 uLightDir;
  varying vec3 vN;
  varying vec3 vV;
  void main() {
    vec3 n = normalize(vN);
    if (!gl_FrontFacing) n = -n;
    float ndl = dot(n, uLightDir);
    float rim = (1.0 - max(dot(vV, n), 0.0)) * max(ndl, 0.0);
    // specular glint: light bouncing straight toward the camera
    float spec = pow(max(dot(n, normalize(uLightDir + vV)), 0.0), 24.0);
    float glint = max(smoothstep(0.45, 0.85, rim), smoothstep(0.35, 0.9, spec));
    float tone = ndl < 0.0 ? 0.0 : (glint > 0.02 ? 0.8 + 0.2 * glint : 0.6);
    float nMix = 0.08 * clamp(gl_FragCoord.w * 10.0, 0.0, 1.0);
    gl_FragColor = vec4(mix(uId, n * 0.5 + 0.5, nMix), tone);
  }
`

let seed = 7
function rand() {
  seed = (seed * 16807) % 2147483647
  return (seed - 1) / 2147483646
}

/** One material per part: a unique ID color is what makes the edge detector draw its outline. */
export function partMaterial() {
  const id = new THREE.Color().setHSL(rand(), 0.55 + rand() * 0.4, 0.2 + rand() * 0.55)
  return new THREE.ShaderMaterial({
    uniforms: { uId: { value: new THREE.Vector3(id.r, id.g, id.b) }, ...lightUniforms },
    vertexShader: idVertex,
    fragmentShader: idFragment,
    blending: THREE.NoBlending,
    side: THREE.DoubleSide,
  })
}

// ───────────────────────── Outline / tone pass ─────────────────────────

const hex = (h: string) => {
  const c = new THREE.Color()
  c.setStyle(h, THREE.NoColorSpace) // keep raw sRGB values, we write them straight to screen
  return new THREE.Vector3(c.r, c.g, c.b)
}

export const PALETTE_DARK = {
  bg: '#1f1510',
  world: '#3b281c',
  shadow: '#170f0a',
  rim: '#d6aa5e',
  outline: '#0b0705',
  outlineBlend: 0.4,
  contourBlend: 0.65,
  sheen: 0.45,
}

export const PALETTE_LIGHT = {
  bg: '#dad5d0',
  world: '#dad5d0',
  shadow: '#dad5d0',
  rim: '#dad5d0',
  outline: '#000000',
  outlineBlend: 0.35,
  contourBlend: 0.35,
  sheen: 0,
}

export function createOutlineMaterial() {
  return new THREE.ShaderMaterial({
    uniforms: {
      tDiffuse: { value: null },
      uRes: { value: new THREE.Vector2(1, 1) },
      uThreshold: { value: 0.035 },
      uThickness: { value: 1 },
      uOutlineBlend: { value: PALETTE_DARK.outlineBlend },
      uContourBlend: { value: PALETTE_DARK.contourBlend },
      // start fully black: the intro "develops" the image
      uBg: { value: hex('#000000') },
      uWorld: { value: hex('#000000') },
      uShadow: { value: hex('#000000') },
      uRim: { value: hex('#000000') },
      uOutline: { value: hex('#000000') },
      uSheen: { value: 0 },
    },
    vertexShader: /* glsl */ `
      varying vec2 vUv;
      void main() { vUv = uv; gl_Position = vec4(position.xy, 0.0, 1.0); }
    `,
    fragmentShader: /* glsl */ `
      uniform sampler2D tDiffuse;
      uniform vec2 uRes;
      uniform float uThreshold, uThickness, uOutlineBlend, uContourBlend;
      uniform vec3 uBg, uWorld, uShadow, uRim, uOutline;
      uniform float uSheen;
      varying vec2 vUv;
      void main() {
        vec2 t = uThickness / uRes;
        vec4 c = texture2D(tDiffuse, vUv);
        vec3 s0 = texture2D(tDiffuse, vUv + vec2(-t.x,  t.y)).rgb;
        vec3 s1 = texture2D(tDiffuse, vUv + vec2( t.x, -t.y)).rgb;
        vec3 s2 = texture2D(tDiffuse, vUv + vec2( t.x,  t.y)).rgb;
        vec3 s3 = texture2D(tDiffuse, vUv + vec2(-t.x, -t.y)).rgb;
        vec3 d0 = s1 - s0;
        vec3 d1 = s3 - s2;
        float edge = sqrt(dot(d0, d0) + dot(d1, d1));
        float outline = edge > uThreshold ? 1.0 : 0.0;
        bool isBg = all(greaterThan(c.rgb, vec3(0.999)));
        vec3 col;
        if (isBg) {
          col = mix(uBg, mix(uOutline, uBg, uContourBlend), outline);
        } else {
          vec3 paint = uWorld;
          if (c.a >= 0.78) {
            float g = clamp((c.a - 0.8) / 0.2, 0.0, 1.0);
            paint = mix(uWorld, uRim, 0.3 + 0.7 * g);
          }
          else if (c.a <= 0.3) paint = uShadow;
          vec3 line = mix(uOutline, paint, uOutlineBlend);
          col = mix(paint, line, outline);
        }
        // warm sheen: soft lift upper-center, falling off to the edges (a lamp over espresso)
        float d = distance(vUv, vec2(0.55, 0.62));
        col *= 1.0 + uSheen * (0.16 - 0.32 * d * d);
        gl_FragColor = vec4(col, 1.0);
      }
    `,
    depthTest: false,
    depthWrite: false,
  })
}

export type Palette = typeof PALETTE_DARK

/** Plain object GSAP can tween; the engine copies it into the shader each frame. */
export function paletteState(p: Palette) {
  return { ...p }
}

export function applyPalette(mat: THREE.ShaderMaterial, p: Palette) {
  const u = mat.uniforms
  u.uBg.value.copy(hex(p.bg))
  u.uWorld.value.copy(hex(p.world))
  u.uShadow.value.copy(hex(p.shadow))
  u.uRim.value.copy(hex(p.rim))
  u.uOutline.value.copy(hex(p.outline))
  u.uOutlineBlend.value = p.outlineBlend
  u.uContourBlend.value = p.contourBlend
  u.uSheen.value = p.sheen
}
