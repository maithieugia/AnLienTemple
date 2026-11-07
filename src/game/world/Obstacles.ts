/**
 * Static 2D obstacles (houses, tombs, poles, tree trunks) on a uniform grid.
 * Bodies resolve circle-vs-rectangle overlaps; sight lines and the camera test segments against them.
 * Much cheaper than mesh collisions for thousands of procedural buildings.
 */
export interface Rect { cx: number; cz: number; hx: number; hz: number; yaw: number; h: number; base: number; sight: boolean; /** false: never stand/climb on it (graves, altars, coffins) */ climb?: boolean; step?: boolean; surface?: boolean; slope?: number }

const CELL = 16;
const cells = new Map<number, Rect[]>();
const key = (ix: number, iz: number) => (ix + 2000) * 8192 + (iz + 2000);

export function addObstacle(r: Rect) {
  const rad = Math.hypot(r.hx, r.hz);
  for (let i = Math.floor((r.cx - rad) / CELL); i <= Math.floor((r.cx + rad) / CELL); i++)
    for (let j = Math.floor((r.cz - rad) / CELL); j <= Math.floor((r.cz + rad) / CELL); j++) {
      const k = key(i, j);
      let l = cells.get(k); if (!l) { l = []; cells.set(k, l); }
      l.push(r);
    }
}

export function clearObstacles() { cells.clear(); }

/** Remove only this streamed prop, preserving all other world collision objects. */
export function removeObstacle(r: Rect) {
  const rad=Math.hypot(r.hx,r.hz);
  for(let i=Math.floor((r.cx-rad)/CELL);i<=Math.floor((r.cx+rad)/CELL);i++)
    for(let j=Math.floor((r.cz-rad)/CELL);j<=Math.floor((r.cz+rad)/CELL);j++){
      const k=key(i,j),list=cells.get(k);if(!list)continue;
      const kept=list.filter(o=>o!==r);if(kept.length)cells.set(k,kept);else cells.delete(k);
    }
}

function inside(r: Rect, x: number, z: number, margin: number) {
  const [lx, lz] = local(r, x, z);
  return Math.abs(lx) <= r.hx + margin && Math.abs(lz) <= r.hz + margin;
}

/** Highest walkable top under (x,z) that is no more than a step above the feet (hedges, jars, tables, low walls). */
export function supportHeight(x: number, z: number, footY: number): number {
  let best = -Infinity;
  for (const r of cells.get(key(Math.floor(x / CELL), Math.floor(z / CELL))) ?? []) {
    if (r.climb === false) continue;
    const top = r.base + r.h;
    if (top <= footY + (r.step ? .5 : .3) && top > best && inside(r, x, z, r.step || r.surface ? .01 : -.05)) best = top;
  }
  return best;
}

/** A ledge to climb at (x,z): the top of something 0.45–2.3 m above the feet. */
export function climbTarget(x: number, z: number, footY: number): number | null {
  let best: number | null = null;
  for (const r of cells.get(key(Math.floor(x / CELL), Math.floor(z / CELL))) ?? []) {
    if (r.climb === false || r.step || r.surface) continue;
    const top = r.base + r.h, rise = top - footY;
    if (rise >= 0.45 && rise <= 2.3 && inside(r, x, z, 0.1) && (best === null || top < best)) best = top;
  }
  return best;
}

/** Local coordinates of (x,z) in the rectangle frame. */
function local(r: Rect, x: number, z: number) {
  const dx = x - r.cx, dz = z - r.cz, c = Math.cos(-r.yaw), s = Math.sin(-r.yaw);
  return [dx * c + dz * s, -dx * s + dz * c];
}

/** Push a circle (x,z,radius) out of all overlapping rectangles. Returns corrected position. */
export function resolveCircle(x: number, z: number, radius: number, footY: number, bodyHeight=1.7): [number, number] {
  for (let iter = 0; iter < 2; iter++) {
    const list = cells.get(key(Math.floor(x / CELL), Math.floor(z / CELL)));
    if (!list) break;
    let moved = false;
    for (const r of list) {
      const [lx, lz] = local(r, x, z);
      const base=r.base+(r.slope??0)*(lz+r.hz);
      if (footY + bodyHeight < base - .02 || footY > base + r.h - (r.step ? .5 : .3)) continue;
      const qx = Math.max(-r.hx, Math.min(r.hx, lx)), qz = Math.max(-r.hz, Math.min(r.hz, lz));
      let dx = lx - qx, dz = lz - qz;
      let d = Math.hypot(dx, dz);
      if (d >= radius) continue;
      if (d < 1e-5) { // centre inside: push along the shallowest axis
        const px = r.hx - Math.abs(lx), pz = r.hz - Math.abs(lz);
        if (px < pz) { dx = Math.sign(lx) || 1; dz = 0; d = 0; } else { dz = Math.sign(lz) || 1; dx = 0; d = 0; }
        const push = (px < pz ? px : pz) + radius;
        const nlx = lx + dx * push, nlz = lz + dz * push;
        [x, z] = toWorld(r, nlx, nlz);
      } else {
        const push = radius - d;
        [x, z] = toWorld(r, lx + (dx / d) * push, lz + (dz / d) * push);
      }
      moved = true;
    }
    if (!moved) break;
  }
  return [x, z];
}

function toWorld(r: Rect, lx: number, lz: number): [number, number] {
  const c = Math.cos(r.yaw), s = Math.sin(r.yaw);
  return [r.cx + lx * c + lz * s, r.cz - lx * s + lz * c];
}

/** Exact segment/rotated-box test. Grid sampling only collects candidates;
 * thin poles/walls must not fall between the old 0.8 m point samples. */
export function segmentBlocked(ax: number, ay: number, az: number, bx: number, by: number, bz: number): boolean {
  const L = Math.hypot(bx - ax, bz - az);
  const steps = Math.max(1, Math.ceil(L / 0.8));
  const seen = new Set<Rect>();
  for (let i = 0; i <= steps; i++) {
    const t = i / steps, x = ax + (bx - ax) * t, z = az + (bz - az) * t;
    const k = key(Math.floor(x / CELL), Math.floor(z / CELL));
    const list = cells.get(k);
    if (!list) continue;
    for (const r of list) {
      if (!r.sight || seen.has(r)) continue;
      seen.add(r);
      const [x0, z0] = local(r, ax, az), [x1, z1] = local(r, bx, bz);
      let enter = 0, exit = 1;
      for (const [start, end, min, max] of [[x0, x1, -r.hx, r.hx], [z0, z1, -r.hz, r.hz], [ay-(r.slope??0)*(z0+r.hz), by-(r.slope??0)*(z1+r.hz), r.base, r.base + r.h]]) {
        const delta = end - start;
        if (Math.abs(delta) < 1e-8) {
          if (start < min || start > max) { exit = -1; break; }
        } else {
          const a = (min - start) / delta, b = (max - start) / delta;
          enter = Math.max(enter, Math.min(a, b)); exit = Math.min(exit, Math.max(a, b));
          if (enter > exit) break;
        }
      }
      if (enter <= exit) return true;
    }
  }
  return false;
}

/** True when a solid obstacle at least `minH` tall covers (x, z) — used to fill only empty frontage. */
export function tallObstacleAt(x: number, z: number, minH = 1): boolean {
  const l = cells.get(key(Math.floor(x / CELL), Math.floor(z / CELL)));
  if (!l) return false;
  return l.some((r) => {
    if (r.h < minH || r.surface || r.step) return false;
    const dx = x - r.cx, dz = z - r.cz, c = Math.cos(r.yaw), s = Math.sin(r.yaw);
    return Math.abs(dx * c - dz * s) < r.hx && Math.abs(dx * s + dz * c) < r.hz;
  });
}

/** Debug/QA: every obstacle rectangle covering (x, z). */
export function obstaclesAt(x: number, z: number): Rect[] {
  return (cells.get(key(Math.floor(x / CELL), Math.floor(z / CELL))) ?? []).filter((r) => { const [lx, lz] = local(r, x, z); return Math.abs(lx) <= r.hx + .4 && Math.abs(lz) <= r.hz + .4; });
}
