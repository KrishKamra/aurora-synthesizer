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
  uDensity: { value: number }
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
 * Shader is the single source of visual truth — React only passes field uniforms.
 */
export function AuroraPlane() {
  const matRef = useRef<THREE.ShaderMaterial>(null)
  const { viewport } = useThree()

  const uniforms = useMemo<AuroraUniforms>(() => {
    const f = useAuroraStore.getState().field
    return {
      uTime: { value: 0 },
      uKp: { value: f.kp },
      uBz: { value: f.bz },
      uSolarWindSpeed: { value: f.solarWindSpeed },
      uDensity: { value: f.solarWindDensity },
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
    }
  }, [])

  // Read store every frame so sliders update the aurora without React re-render lag
  useFrame(({ clock }) => {
    const m = matRef.current
    if (!m) return
    const { field, interaction, reducedMotion, fpsDegraded } = useAuroraStore.getState()
    const u = m.uniforms as unknown as AuroraUniforms
    u.uTime.value = clock.elapsedTime
    u.uKp.value = field.kp
    u.uBz.value = field.bz
    u.uSolarWindSpeed.value = field.solarWindSpeed
    u.uDensity.value = field.solarWindDensity
    u.uAspect.value = viewport.aspect
    u.uReducedMotion.value = reducedMotion ? 1 : 0
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
