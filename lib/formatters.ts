export function metersToMiles(meters: number) {
	const miles = meters * 0.000621371;
	return miles;
}

export function secondsToHMS(total: number) {
  const h = Math.floor(total / 3600)
  const m = Math.floor((total % 3600) / 60)
  const s = total % 60

  if (h > 0) return `${h}h ${m}min`
  if (m > 0) return `${m}min`
  return `${s}s`
}

export function metersPerSecondToMinPerMile(mps: number) {
  if (!Number.isFinite(mps) || mps <= 0) return '—';
  const paceSeconds = 1609.344 / mps;           // exact sec/mi
  const total = Math.round(paceSeconds);        // one rounding only
  const minutes = Math.floor(total / 60);
  const seconds = total - minutes * 60;         // 0..59, no 60s
  return `${minutes}:${String(seconds).padStart(2, '0')}/mi`;
}

export function metersToFeet(meters: number) {
	const feet = meters * 3.28084;
	return feet;
}

export function round2Decimals(num: number) {
	return Math.round(num * 100) / 100
}
