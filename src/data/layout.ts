/**
 * 3D layout of the funnel. The camera starts at the mouth of the funnel and dives along -z.
 * Each stage is rotated a little around z so the descent feels like a spiral.
 */
export const STAGE_DEPTH = 2600
export const STAGE_TWIST = 18 // degrees per stage

export function stagePose(i: number) {
  const angle = (i * STAGE_TWIST * Math.PI) / 180
  // Drift slightly off-axis so the next stage peeks in from the side.
  const drift = 260
  return {
    x: Math.round(Math.sin(angle) * drift),
    y: Math.round(-Math.cos(angle) * drift + drift),
    z: -STAGE_DEPTH * (i + 1),
    rotateZ: i * STAGE_TWIST,
  }
}

/** Funnel ring radius at a given stage index (wide at the top, narrow at the bottom). */
export function ringRadius(i: number, n: number) {
  const top = 2400
  const bottom = 900
  return Math.round(top - ((top - bottom) * i) / Math.max(1, n - 1))
}
