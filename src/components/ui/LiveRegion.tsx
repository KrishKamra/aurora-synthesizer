import { useAuroraStore } from '../../store/auroraStore'

/**
 * Screen-reader live region — scientific data without the visualization.
 * Updates whenever Kp or major conditions change.
 */
export function LiveRegion() {
  const weather = useAuroraStore((s) => s.weather)
  const pollingStatus = useAuroraStore((s) => s.pollingStatus)

  const text =
    pollingStatus === 'loading' && weather.fetchedAt === 0
      ? 'Calibrating space weather instruments. Fetching live NOAA data.'
      : `Kp index ${weather.kp.toFixed(1)}, ${weather.activityLabel}. Aurora currently visible above approximately ${weather.auroraLatitude}° latitude. Solar wind speed ${Math.round(weather.solarWindSpeed)} kilometers per second. Bz ${weather.bz.toFixed(1)} nanotesla.`

  return (
    <div role="status" aria-live="polite" aria-atomic="true" className="sr-only">
      {text}
    </div>
  )
}
