import { EffectComposer, Bloom } from '@react-three/postprocessing'
import { KernelSize } from 'postprocessing'
import { useAuroraStore } from '../../store/auroraStore'

/**
 * Real bloom / HDR-style glow via pmndrs postprocessing.
 * Threshold high enough that stars remain pinpoints; ribbons glow.
 */
export function PostFX() {
  const fpsDegraded = useAuroraStore((s) => s.fpsDegraded)
  const kp = useAuroraStore((s) => s.weather.kp)

  const strength = fpsDegraded ? 0.55 : 0.9 + (kp / 9) * 0.2
  // 0.65–0.75 range from brief — stars peak ~0.45 so they stay crisp
  const threshold = 0.68

  return (
    <EffectComposer multisampling={0} enableNormalPass={false}>
      <Bloom
        luminanceThreshold={threshold}
        luminanceSmoothing={0.4}
        intensity={strength}
        mipmapBlur
        radius={fpsDegraded ? 0.3 : 0.4}
        levels={fpsDegraded ? 4 : 5}
        kernelSize={fpsDegraded ? KernelSize.SMALL : KernelSize.MEDIUM}
      />
    </EffectComposer>
  )
}
