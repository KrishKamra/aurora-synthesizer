import { useAuroraStore } from '../../store/auroraStore'
import { TickNumber } from './TickNumber'

/**
 * Compact status chip for small screens.
 * Tap to expand/collapse the full instrument panel so the aurora stays full-bleed.
 */
export function MobileChip() {
  const weather = useAuroraStore((s) => s.weather)
  const panelExpanded = useAuroraStore((s) => s.panelExpanded)
  const togglePanel = useAuroraStore((s) => s.togglePanel)
  const pollingStatus = useAuroraStore((s) => s.pollingStatus)

  return (
    <button
      type="button"
      onClick={(e) => {
        e.stopPropagation()
        togglePanel()
      }}
      className="flex items-center gap-2 rounded-full border border-[var(--panel-border)] bg-[var(--panel-bg)] px-3 py-1.5 font-mono text-xs text-[var(--instrument-white)] backdrop-blur-md"
      aria-expanded={panelExpanded}
      aria-controls="instrument-panel"
      data-testid="mobile-chip"
    >
      <span
        className="h-1.5 w-1.5 rounded-full"
        style={{
          background:
            pollingStatus === 'success' ? 'var(--amber)' : 'var(--instrument-white)',
          opacity: 0.9,
        }}
        aria-hidden
      />
      <span className="text-[var(--instrument-white)]/50">Kp</span>
      <span className="font-semibold text-[var(--aurora-green)]">
        <TickNumber value={weather.kp} decimals={1} />
      </span>
      <span className="text-[var(--instrument-white)]/40">
        {panelExpanded ? '▾' : '▴'}
      </span>
    </button>
  )
}
