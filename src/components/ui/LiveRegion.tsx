import { useAuroraStore, useDisplayWeather } from '../../store/auroraStore'

/**
 * Screen-reader live region — scientific data without the visualization.
 * Reflects active field dials (live NOAA or manual scrub).
 */
export function LiveRegion() {
  const display = useDisplayWeather()
  const fieldSource = useAuroraStore((s) => s.fieldSource)
  const pollingStatus = useAuroraStore((s) => s.pollingStatus)

  const mode =
    fieldSource === 'manual'
      ? 'Manual field scrub mode.'
      : pollingStatus === 'loading' && display.fetchedAt === 0
        ? 'Calibrating space weather instruments. Fetching live NOAA data.'
        : 'Live NOAA field.'

  const text = `${mode} Kp index ${display.kp.toFixed(1)}, ${display.activityLabel}. Aurora currently visible above approximately ${display.auroraLatitude}° latitude. Solar wind speed ${Math.round(display.solarWindSpeed)} kilometers per second. Bz ${display.bz.toFixed(1)} nanotesla. Density ${display.solarWindDensity.toFixed(1)} per cubic centimeter.`

  return (
    <div role="status" aria-live="polite" aria-atomic="true" className="sr-only">
      {text}
    </div>
  )
}
