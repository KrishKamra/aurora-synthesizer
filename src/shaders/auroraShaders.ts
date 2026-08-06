/**
 * Custom GLSL aurora flow field.
 * Continuous domain-warped simplex + curl noise — no particle systems.
 * React only passes uniforms; this shader is the single source of visual truth.
 */

export const auroraVertexShader = /* glsl */ `
varying vec2 vUv;

void main() {
  vUv = uv;
  gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
}
`

export const auroraFragmentShader = /* glsl */ `
precision highp float;

varying vec2 vUv;

// --- Live NOAA-driven uniforms ---
uniform float uTime;
uniform float uKp;
uniform float uBz;
uniform float uSolarWindSpeed;
uniform float uAspect;
uniform float uReducedMotion;
uniform float uNoiseOctaves; // 1–4 performance dial

// Interaction (local curl offset only — never invents data)
uniform vec2 uPointer;       // UV 0–1
uniform float uPointerStrength;

// Palette (CSS custom properties as source of truth)
uniform vec3 uColorGreen;
uniform vec3 uColorMagenta;
uniform vec3 uColorVoid;

// ─── Simplex noise (Ashima / Ian McEwan, public domain) ───────────────────────

vec3 mod289(vec3 x) { return x - floor(x * (1.0 / 289.0)) * 289.0; }
vec4 mod289(vec4 x) { return x - floor(x * (1.0 / 289.0)) * 289.0; }
vec4 permute(vec4 x) { return mod289(((x * 34.0) + 1.0) * x); }
vec4 taylorInvSqrt(vec4 r) { return 1.79284291400159 - 0.85373472095314 * r; }

float snoise(vec3 v) {
  const vec2 C = vec2(1.0 / 6.0, 1.0 / 3.0);
  const vec4 D = vec4(0.0, 0.5, 1.0, 2.0);

  vec3 i  = floor(v + dot(v, C.yyy));
  vec3 x0 = v - i + dot(i, C.xxx);

  vec3 g = step(x0.yzx, x0.xyz);
  vec3 l = 1.0 - g;
  vec3 i1 = min(g.xyz, l.zxy);
  vec3 i2 = max(g.xyz, l.zxy);

  vec3 x1 = x0 - i1 + C.xxx;
  vec3 x2 = x0 - i2 + C.yyy;
  vec3 x3 = x0 - D.yyy;

  i = mod289(i);
  vec4 p = permute(permute(permute(
      i.z + vec4(0.0, i1.z, i2.z, 1.0))
    + i.y + vec4(0.0, i1.y, i2.y, 1.0))
    + i.x + vec4(0.0, i1.x, i2.x, 1.0));

  float n_ = 0.142857142857;
  vec3 ns = n_ * D.wyz - D.xzx;

  vec4 j = p - 49.0 * floor(p * ns.z * ns.z);

  vec4 x_ = floor(j * ns.z);
  vec4 y_ = floor(j - 7.0 * x_);

  vec4 x = x_ * ns.x + ns.yyyy;
  vec4 y = y_ * ns.x + ns.yyyy;
  vec4 h = 1.0 - abs(x) - abs(y);

  vec4 b0 = vec4(x.xy, y.xy);
  vec4 b1 = vec4(x.zw, y.zw);

  vec4 s0 = floor(b0) * 2.0 + 1.0;
  vec4 s1 = floor(b1) * 2.0 + 1.0;
  vec4 sh = -step(h, vec4(0.0));

  vec4 a0 = b0.xzyw + s0.xzyw * sh.xxyy;
  vec4 a1 = b1.xzyw + s1.xzyw * sh.zzww;

  vec3 p0 = vec3(a0.xy, h.x);
  vec3 p1 = vec3(a0.zw, h.y);
  vec3 p2 = vec3(a1.xy, h.z);
  vec3 p3 = vec3(a1.zw, h.w);

  vec4 norm = taylorInvSqrt(vec4(dot(p0, p0), dot(p1, p1), dot(p2, p2), dot(p3, p3)));
  p0 *= norm.x;
  p1 *= norm.y;
  p2 *= norm.z;
  p3 *= norm.w;

  vec4 m = max(0.6 - vec4(dot(x0, x0), dot(x1, x1), dot(x2, x2), dot(x3, x3)), 0.0);
  m = m * m;
  return 42.0 * dot(m * m, vec4(dot(p0, x0), dot(p1, x1), dot(p2, x2), dot(p3, x3)));
}

float fbm(vec3 p, float octaves) {
  float value = 0.0;
  float amp = 0.5;
  float freq = 1.0;
  for (int i = 0; i < 4; i++) {
    if (float(i) >= octaves) break;
    value += amp * snoise(p * freq);
    freq *= 2.03;
    amp *= 0.5;
  }
  return value;
}

vec2 curlNoise(vec2 p, float t, float scale) {
  float e = 0.012;
  float n1 = snoise(vec3((p + vec2(0.0, e)) * scale, t));
  float n2 = snoise(vec3((p - vec2(0.0, e)) * scale, t));
  float n3 = snoise(vec3((p + vec2(e, 0.0)) * scale, t));
  float n4 = snoise(vec3((p - vec2(e, 0.0)) * scale, t));
  float dx = (n1 - n2) / (2.0 * e);
  float dy = (n3 - n4) / (2.0 * e);
  return vec2(dx, -dy);
}

void main() {
  vec2 uv = vUv;
  vec2 p = (uv - 0.5) * vec2(uAspect, 1.0) + 0.5;

  // ── Data-driven parameters (brief starting values) ──
  float noiseScale = 0.85;
  float domainWarpStrength = 0.42;
  float timeScale = 0.08;

  float kpNorm = clamp(uKp / 9.0, 0.0, 1.0);
  float ribbonHeight = mix(0.22, 0.58, kpNorm);
  float latitudePush = mix(0.0, 0.28, kpNorm);

  float bzEnergy = clamp((-uBz) / 15.0, 0.0, 1.0);
  float energyMix = mix(0.12, 1.0, bzEnergy) * (0.4 + 0.6 * kpNorm);

  float windFactor = clamp((uSolarWindSpeed - 300.0) / 500.0, 0.0, 1.5);
  float flowSpeed = timeScale * (0.7 + windFactor * 1.4);
  flowSpeed *= mix(1.0, 0.12, uReducedMotion);

  float t = uTime * flowSpeed;

  // Interaction: local curl offset; zero when resting
  float interactionRadius = 0.24;
  float interactionStrength = 0.55 * (1.0 - uReducedMotion);
  vec2 pointerP = (uPointer - 0.5) * vec2(uAspect, 1.0) + 0.5;
  float dist = length(p - pointerP);
  float falloff = smoothstep(interactionRadius, 0.0, dist) * uPointerStrength;
  vec2 curlOffset = curlNoise(p * 2.2, t * 1.6, 1.15) * interactionStrength * falloff;

  // Domain warp: noise → noise for organic ribbon curl
  vec2 q = p * noiseScale;
  q += curlOffset;
  float warpT = t * 0.55;
  vec2 warp = vec2(
    fbm(vec3(q * 1.1, warpT), uNoiseOctaves),
    fbm(vec3(q * 1.1 + vec2(5.2, 1.3), warpT + 1.7), uNoiseOctaves)
  );
  vec2 warped = q + domainWarpStrength * warp;

  // Horizontal magnetic flow
  warped.x += t * 0.42;
  warped.y += snoise(vec3(warped * 0.55, t * 0.28)) * 0.1;

  // Band placement — upper sky, pushed equatorward with Kp
  float bandCenter = 0.58 - latitudePush * 0.32;
  float bandY = p.y - bandCenter;
  float halfH = ribbonHeight * 0.5;
  float envelope = exp(-pow(bandY / max(halfH, 0.01), 2.0) * 1.85);

  // Soft secondary sheet slightly above primary curtain
  float envelope2 = exp(-pow((p.y - (bandCenter + halfH * 0.55)) / max(halfH * 0.55, 0.01), 2.0) * 2.4);

  float n1 = fbm(vec3(warped * 1.55, t), uNoiseOctaves);
  float n2 = fbm(vec3(warped * 2.8 + 3.1, t * 1.15), max(uNoiseOctaves - 1.0, 1.0));
  float n3 = snoise(vec3(warped * 4.5, t * 1.7));

  // Vertical curtain striations
  float curtains = snoise(vec3(p.x * 10.0 + n1 * 2.0, p.y * 0.35 + t * 0.15, t * 0.4));
  curtains = smoothstep(-0.35, 0.55, curtains);

  // Sharp bright filaments along the flow
  float filaments = smoothstep(0.25, 0.75, n1 * 0.65 + n2 * 0.35);
  filaments = pow(filaments, 1.35);

  float field = envelope * (
    0.5 * filaments +
    0.32 * smoothstep(-0.05, 0.55, n2) +
    0.18 * smoothstep(0.05, 0.45, n3)
  );
  field += envelope2 * 0.35 * smoothstep(0.0, 0.5, n2);
  field *= mix(0.55, 1.15, curtains);

  // Keep sky dark outside the band so stars read through gaps
  float skyMask = smoothstep(0.08, 0.28, p.y) * smoothstep(0.98, 0.62, p.y);
  field *= skyMask;

  // Bioluminescent interaction pulse
  field += falloff * 0.55 * envelope;

  // Quiet Kp still reads as living aurora (honest, not storm-fake)
  float intensity = field * mix(1.05, 1.75, kpNorm);
  intensity = max(intensity, 0.0);

  // Color: altitude + energy (oxygen green → nitrogen magenta)
  float altitude = clamp((p.y - (bandCenter - halfH)) / max(ribbonHeight, 0.01), 0.0, 1.0);
  float greenWeight = 1.0 - energyMix * 0.7 * (0.35 + 0.65 * altitude);
  float magentaWeight = energyMix * (0.3 + 0.7 * altitude);
  magentaWeight += bzEnergy * 0.22 * smoothstep(0.15, 0.75, intensity);

  vec3 auroraCol = uColorGreen * greenWeight + uColorMagenta * magentaWeight;
  auroraCol = mix(auroraCol, vec3(0.78, 0.98, 0.9), smoothstep(0.65, 1.3, intensity) * 0.28);

  // Transparent gaps so stars behind remain visible — never a flat gradient plane
  float cover = smoothstep(0.03, 0.42, intensity);
  float glow = clamp(intensity * 1.35, 0.0, 2.2);

  // Soft vignette on the aurora contribution only
  float vig = 1.0 - 0.22 * pow(length((uv - 0.5) * vec2(1.15, 1.0)), 2.4);

  // HDR cores for bloom (ribbons only — stars stay dim separately)
  float bloomBoost = smoothstep(0.32, 0.9, intensity) * (0.75 + 0.95 * kpNorm);
  vec3 col = auroraCol * glow * vig;
  col += auroraCol * bloomBoost * 0.9;

  // Premultiplied-style alpha: cover drives visibility of ribbons over starfield
  float outAlpha = clamp(cover * (0.55 + 0.45 * clamp(intensity, 0.0, 1.0)), 0.0, 1.0);
  gl_FragColor = vec4(col, outAlpha);
}
`
