import { Suspense, useEffect, useRef } from 'react'
import { Canvas, useFrame, useThree } from '@react-three/fiber'
import * as THREE from 'three'
import { AuroraPlane } from './AuroraPlane'
import { Stars } from './Stars'
import { PostFX } from './PostFX'
import { useAuroraStore } from '../../store/auroraStore'
import { PALETTE } from '../../utils/colors'

/** Caps pixel ratio for mid-range hardware budget. */
function PixelRatioCap() {
  const { gl } = useThree()
  const fpsDegraded = useAuroraStore((s) => s.fpsDegraded)

  useEffect(() => {
    const cap = fpsDegraded ? 1.25 : Math.min(window.devicePixelRatio, 1.75)
    gl.setPixelRatio(cap)
  }, [gl, fpsDegraded])

  return null
}

/** Sustained low FPS → graceful degradation (fewer octaves, lower PR). */
function FpsWatchdog() {
  const setFpsDegraded = useAuroraStore((s) => s.setFpsDegraded)
  const samples = useRef<number[]>([])
  const degraded = useRef(false)

  useFrame((_, delta) => {
    const fps = 1 / Math.max(delta, 1e-4)
    samples.current.push(fps)
    if (samples.current.length > 60) samples.current.shift()
    if (samples.current.length < 45) return
    const avg =
      samples.current.reduce((a, b) => a + b, 0) / samples.current.length
    if (!degraded.current && avg < 28) {
      degraded.current = true
      setFpsDegraded(true)
    } else if (degraded.current && avg > 50) {
      degraded.current = false
      setFpsDegraded(false)
    }
  })

  return null
}

function SceneContents() {
  return (
    <>
      <color attach="background" args={[PALETTE.void]} />
      <PixelRatioCap />
      <FpsWatchdog />
      {/* Stars first (behind); transparent aurora composites over them */}
      <Stars />
      <AuroraPlane />
      <PostFX />
    </>
  )
}

interface AuroraSceneProps {
  onCreated?: () => void
}

/**
 * Full-bleed WebGL canvas — the entire experience.
 * Orthographic camera keeps the aurora plane flat and instrument-like.
 */
export function AuroraScene({ onCreated }: AuroraSceneProps) {
  return (
    <Canvas
      orthographic
      camera={{ position: [0, 0, 5], zoom: 80, near: 0.1, far: 100 }}
      dpr={[1, 1.75]}
      gl={{
        antialias: false,
        powerPreference: 'high-performance',
        alpha: false,
        stencil: false,
        depth: true,
      }}
      style={{
        position: 'absolute',
        inset: 0,
        width: '100%',
        height: '100%',
        display: 'block',
        touchAction: 'none',
      }}
      onCreated={({ gl }) => {
        gl.setClearColor(new THREE.Color(PALETTE.void), 1)
        // No tone mapping crush — bloom + shader HDR cores own the glow
        gl.toneMapping = THREE.NoToneMapping
        gl.toneMappingExposure = 1.0
        onCreated?.()
      }}
    >
      <Suspense fallback={null}>
        <SceneContents />
      </Suspense>
    </Canvas>
  )
}
