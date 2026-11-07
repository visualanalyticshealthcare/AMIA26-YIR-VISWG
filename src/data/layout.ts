/**
 * 3D path of the impress.js text slides. The camera dives along -z with a slight spiral,
 * so each slide sits deeper than the last.
 */
export const STAGE_DEPTH = 2600
export const STAGE_TWIST = 14 // degrees per slide

export function slidePose(i: number) {
  const angle = (i * STAGE_TWIST * Math.PI) / 180
  const drift = 220
  return {
    x: Math.round(Math.sin(angle) * drift),
    y: Math.round(-Math.cos(angle) * drift + drift),
    z: -STAGE_DEPTH * i,
    rotateZ: i * STAGE_TWIST,
  }
}
