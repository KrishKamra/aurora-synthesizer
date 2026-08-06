/** Parse CSS hex (#rrggbb) to [r,g,b] in 0–1 for shader uniforms. */
export function hexToRgb01(hex: string): [number, number, number] {
  const h = hex.replace('#', '').trim()
  if (h.length !== 6) return [0, 0, 0]
  const r = parseInt(h.slice(0, 2), 16) / 255
  const g = parseInt(h.slice(2, 4), 16) / 255
  const b = parseInt(h.slice(4, 6), 16) / 255
  return [r, g, b]
}

/** Read a CSS custom property from :root (single source of truth). */
export function readCssColor(varName: string, fallback: string): [number, number, number] {
  if (typeof document === 'undefined') return hexToRgb01(fallback)
  const raw = getComputedStyle(document.documentElement)
    .getPropertyValue(varName)
    .trim()
  return hexToRgb01(raw || fallback)
}

export const PALETTE = {
  void: '#050608',
  green: '#4CFFB3',
  magenta: '#C64CFF',
  white: '#EAF2F2',
  amber: '#FFB454',
} as const
