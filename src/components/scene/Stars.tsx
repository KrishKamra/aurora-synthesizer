import { useMemo, useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import * as THREE from 'three'

const STAR_COUNT = 650

/**
 * Sparse points behind the aurora.
 * Kept dim (below bloom threshold) so stars stay pinpoints, not bloated orbs.
 */
export function Stars() {
  const materialRef = useRef<THREE.ShaderMaterial>(null)

  const { positions, phases, sizes } = useMemo(() => {
    const pos = new Float32Array(STAR_COUNT * 3)
    const ph = new Float32Array(STAR_COUNT)
    const sz = new Float32Array(STAR_COUNT)
    for (let i = 0; i < STAR_COUNT; i++) {
      pos[i * 3] = (Math.random() - 0.5) * 18
      pos[i * 3 + 1] = (Math.random() - 0.5) * 11
      pos[i * 3 + 2] = -3 - Math.random() * 1.5
      ph[i] = Math.random() * Math.PI * 2
      // Mostly tiny; rare slightly larger
      sz[i] = Math.random() < 0.08 ? 1.6 + Math.random() : 0.7 + Math.random() * 0.6
    }
    return { positions: pos, phases: ph, sizes: sz }
  }, [])

  const geometry = useMemo(() => {
    const geo = new THREE.BufferGeometry()
    geo.setAttribute('position', new THREE.BufferAttribute(positions, 3))
    geo.setAttribute('aPhase', new THREE.BufferAttribute(phases, 1))
    geo.setAttribute('aSize', new THREE.BufferAttribute(sizes, 1))
    return geo
  }, [positions, phases, sizes])

  useFrame(({ clock }) => {
    const m = materialRef.current
    const u = m?.uniforms.uTime
    if (u) u.value = clock.elapsedTime
  })

  return (
    <points geometry={geometry} frustumCulled={false} renderOrder={-1}>
      <shaderMaterial
        ref={materialRef}
        transparent
        depthWrite={false}
        depthTest
        blending={THREE.NormalBlending}
        uniforms={{ uTime: { value: 0 } }}
        vertexShader={/* glsl */ `
          attribute float aPhase;
          attribute float aSize;
          varying float vTwinkle;
          uniform float uTime;
          void main() {
            // Subtle independent twinkle — never flashy
            vTwinkle = 0.72 + 0.28 * sin(uTime * 0.55 + aPhase);
            vec4 mv = modelViewMatrix * vec4(position, 1.0);
            // Orthographic-friendly fixed pixel size (no perspective blow-up)
            gl_PointSize = aSize * vTwinkle * 1.35;
            gl_Position = projectionMatrix * mv;
          }
        `}
        fragmentShader={/* glsl */ `
          varying float vTwinkle;
          void main() {
            vec2 c = gl_PointCoord - 0.5;
            float d = length(c);
            if (d > 0.5) discard;
            // Soft core, dim enough to stay under bloom threshold (~0.7)
            float core = smoothstep(0.5, 0.0, d);
            float a = core * core * vTwinkle * 0.55;
            // Peak RGB ~0.45 — below bloom threshold so no giant orbs
            vec3 col = vec3(0.72, 0.78, 0.88) * (0.35 + 0.25 * vTwinkle);
            gl_FragColor = vec4(col, a);
          }
        `}
      />
    </points>
  )
}
