import { useAuroraStore } from '../../store/auroraStore'
import { KpReadout } from './KpReadout'
import { LegendPanel } from './LegendPanel'
import { MobileChip } from './MobileChip'

/**
 * Restrained HUD chrome over the full-bleed canvas.
 * Desktop: full readout bottom-left + legend top-right.
 * Mobile: compact chip; expand for full panel.
 */
export function InstrumentHUD() {
  const panelExpanded = useAuroraStore((s) => s.panelExpanded)
  const calibrated = useAuroraStore((s) => s.calibrated)

  if (!calibrated) return null

  return (
    <>
      {/* Desktop / tablet HUD */}
      <div className="pointer-events-none absolute inset-0 z-20 hidden sm:block">
        <div className="pointer-events-auto absolute right-4 top-4 md:right-6 md:top-6">
          <LegendPanel />
        </div>
        <div
          id="instrument-panel-desktop"
          className="pointer-events-auto absolute bottom-5 left-4 rounded-lg border border-[var(--panel-border)] bg-[var(--panel-bg)] p-4 backdrop-blur-md md:bottom-8 md:left-6 md:p-5"
        >
          <KpReadout />
          <p className="mt-3 text-[10px] uppercase tracking-[0.22em] text-[var(--instrument-white)]/35">
            trace the current
          </p>
        </div>
      </div>

      {/* Mobile: chip + expandable panel */}
      <div className="pointer-events-none absolute inset-0 z-20 sm:hidden">
        <div className="pointer-events-auto absolute left-1/2 top-3 z-30 -translate-x-1/2">
          <MobileChip />
        </div>
        {panelExpanded && (
          <div
            id="instrument-panel"
            className="pointer-events-auto absolute inset-x-0 bottom-0 z-30 max-h-[60vh] overflow-y-auto rounded-t-2xl border border-[var(--panel-border)] bg-[rgba(5,6,8,0.92)] p-4 pb-[max(1.5rem,env(safe-area-inset-bottom))] shadow-2xl backdrop-blur-md"
            data-selectable
          >
            <KpReadout />
            <div className="mt-4 border-t border-[var(--panel-border)] pt-3">
              <LegendPanel />
            </div>
            <p className="mt-3 text-center text-[10px] uppercase tracking-[0.22em] text-[var(--instrument-white)]/35">
              trace the current
            </p>
          </div>
        )}
      </div>
    </>
  )
}
