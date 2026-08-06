import { useMemo, useRef } from 'react'
import { useFrame, useThree } from '@react-three/fiber'
import * as THREE from 'three'
import { auroraFragmentShader, auroraVertexShader } from '../../shaders/auroraShaders'
import { useAuroraStore } from '../../store/auroraStore'
import { PALETTE, readCssColor } from '../../utils/colors'

type AuroraUniforms = {
  uTime: { value: number }
  uKp: { value: number }
  uBz: { value: number }
  uSolarWindSpeed: { value: number }
  uAspect: { value: number }
  uReducedMotion: { value: number }
  uNoiseOctaves: { value: number }
  uPointer: { value: THREE.Vector2 }
  uPointerStrength: { value: number }
  uColorGreen: { value: THREE.Color }
  uColorMagenta: { value: THREE.Color }
  uColorVoid: { value: THREE.Color }
}

/**
 * Full-screen aurora ribbon plane.
 * Shader is the single source of visual truth — React only computes uniforms.
 */
export function AuroraPlane() {
  const matRef = useRef<THREE.ShaderMaterial>(null)
  const { viewport } = useThree()

  const weather = useAuroraStore((s) => s.weather)
  const interaction = useAuroraStore((s) => s.interaction)
  const reducedMotion = useAuroraStore((s) => s.reducedMotion)
  const fpsDegraded = useAuroraStore((s) => s.fpsDegraded)

  const uniforms = useMemo<AuroraUniforms>(
    () => ({
      uTime: { value: 0 },
      uKp: { value: weather.kp },
      uBz: { value: weather.bz },
      uSolarWindSpeed: { value: weather.solarWindSpeed },
      uAspect: { value: 1 },
      uReducedMotion: { value: 0 },
      uNoiseOctaves: { value: 4 },
      uPointer: { value: new THREE.Vector2(0.5, 0.5) },
      uPointerStrength: { value: 0 },
      uColorGreen: { value: new THREE.Color(...readCssColor('--aurora-green', PALETTE.green)) },
      uColorMagenta: {
        value: new THREE.Color(...readCssColor('--aurora-magenta', PALETTE.magenta)),
      },
      uColorVoid: { value: new THREE.Color(...readCssColor('--void', PALETTE.void)) },
    }),
    // Colors + initial weather snapshotted once; live values updated in useFrame
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [],
  )

  useFrame(({ clock }) => {
    const m = matRef.current
    if (!m) return
    const u = m.uniforms as unknown as AuroraUniforms
    u.uTime.value = clock.elapsedTime
    u.uKp.value = weather.kp
    u.uBz.value = weather.bz
    u.uSolarWindSpeed.value = weather.solarWindSpeed
    u.uAspect.value = viewport.aspect
    u.uReducedMotion.value = reducedMotion ? 1 : 0
    // Prefer lower noise octaves over dropped frames
    u.uNoiseOctaves.value = fpsDegraded ? 2 : 4
    u.uPointer.value.set(interaction.x, interaction.y)
    u.uPointerStrength.value = interaction.strength
  })

  const w = viewport.width
  const h = viewport.height

  return (
    <mesh scale={[w, h, 1]} position={[0, 0, 0]} frustumCulled={false} renderOrder={1}>
      <planeGeometry args={[1, 1, 1, 1]} />
      <shaderMaterial
        ref={matRef}
        vertexShader={auroraVertexShader}
        fragmentShader={auroraFragmentShader}
        uniforms={uniforms}
        depthWrite={false}
        depthTest={false}
        transparent
        blending={THREE.AdditiveBlending}
      />
    </mesh>
  )
}
