import { Scene, DynamicTexture, Texture } from '@babylonjs/core';

/**
 * One painted atlas for every building surface (one material → one draw call per town chunk).
 * 4×4 cells. Painted walls are light grey so vertex colours can tint them (vàng, xanh, hồng…).
 */
export const CELL = {
  plaster: 0, plasterWin: 1, shopFront: 2, upperFront: 3, houseFront: 4, roofTile: 5, roofTin: 6, thatch: 7,
  palmWall: 8, tinWall: 9, brick: 10, concrete: 11, signsA: 12, signsB: 13, glow: 14, altar: 15,
} as const;
export type CellName = keyof typeof CELL;

/** UV rectangle [u0, v0, u1, v1] of a cell (v up). */
export function cellUV(c: number, sub?: [number, number, number, number]): [number, number, number, number] {
  const cx = c % 4, cy = Math.floor(c / 4);
  const u0 = cx / 4, v1 = 1 - cy / 4, v0 = v1 - 0.25;
  if (!sub) return [u0 + 0.002, v0 + 0.002, u0 + 0.248, v1 - 0.002];
  const [a, b, c2, d] = sub;
  return [u0 + a * 0.25, v0 + b * 0.25, u0 + c2 * 0.25, v0 + d * 0.25];
}

const SIGNS = [
  ['TẠP HÓA', 'Cô Ba'], ['CÀ PHÊ', 'Võng Mắc Ca'], ['TIỆM VÀNG', 'Kim Phát'], ['NHÀ THUỐC', 'Tây Y'],
  ['SỬA XE', 'Honda - Yamaha'], ['HỦ TIẾU', 'Mỹ Tho'], ['VẬT LIỆU XÂY DỰNG', 'Hai Lúa'], ['TIỆM MAY', 'Áo dài'],
];

const rng = (seed: number) => () => { seed = (seed * 1664525 + 1013904223) >>> 0; return seed / 4294967296; };

export function makeBuildingAtlas(scene: Scene, size: number): Texture {
  const t = new DynamicTexture('buildingAtlas', { width: size, height: size }, scene, true);
  const ctx = t.getContext() as CanvasRenderingContext2D;
  const S = size / 4;
  const r = rng(99);
  const cell = (c: number, draw: (c: CanvasRenderingContext2D, s: number) => void) => {
    ctx.save(); ctx.translate((c % 4) * S, Math.floor(c / 4) * S);
    ctx.beginPath(); ctx.rect(0, 0, S, S); ctx.clip();
    draw(ctx, S); ctx.restore();
  };
  const speckle = (c: CanvasRenderingContext2D, s: number, base: number, spread: number, n: number) => {
    for (let i = 0; i < n; i++) { const v = base + Math.floor(r() * spread); c.fillStyle = `rgb(${v},${v},${v})`; c.fillRect(r() * s, r() * s, 1 + r() * 2, 1 + r() * 2); }
  };
  const grime = (c: CanvasRenderingContext2D, s: number) => {
    // mould and rain streaks climbing from the base, darker at the top edge (rêu mốc)
    const g = c.createLinearGradient(0, s, 0, s * 0.55); g.addColorStop(0, 'rgba(40,50,35,0.55)'); g.addColorStop(1, 'rgba(40,50,35,0)');
    c.fillStyle = g; c.fillRect(0, 0, s, s);
    for (let i = 0; i < 26; i++) { const x = r() * s, w = 2 + r() * 6; const g2 = c.createLinearGradient(0, 0, 0, s * (0.2 + r() * 0.5)); g2.addColorStop(0, 'rgba(50,45,38,0.4)'); g2.addColorStop(1, 'rgba(50,45,38,0)'); c.fillStyle = g2; c.fillRect(x, 0, w, s); }
  };
  const windowBars = (c: CanvasRenderingContext2D, x: number, y: number, w: number, h: number) => {
    c.fillStyle = '#1c2024'; c.fillRect(x, y, w, h);
    c.fillStyle = 'rgba(120,140,150,0.25)'; c.fillRect(x + 3, y + 3, w - 6, h * 0.4); // glass glint
    c.strokeStyle = '#2b2b2b'; c.lineWidth = Math.max(2, w * 0.03);
    for (let i = 1; i < 6; i++) { c.beginPath(); c.moveTo(x + (w * i) / 6, y); c.lineTo(x + (w * i) / 6, y + h); c.stroke(); }
    c.strokeStyle = '#d8d2c4'; c.lineWidth = Math.max(3, w * 0.05); c.strokeRect(x, y, w, h);
  };

  cell(CELL.plaster, (c, s) => { c.fillStyle = '#d6d4cf'; c.fillRect(0, 0, s, s); speckle(c, s, 180, 60, s * 6); grime(c, s); });
  cell(CELL.plasterWin, (c, s) => { c.fillStyle = '#d6d4cf'; c.fillRect(0, 0, s, s); speckle(c, s, 180, 60, s * 5); windowBars(c, s * 0.28, s * 0.25, s * 0.44, s * 0.4); grime(c, s); });
  cell(CELL.shopFront, (c, s) => {
    c.fillStyle = '#c9c6bd'; c.fillRect(0, 0, s, s);
    // roller shutter (cửa cuốn) with horizontal slats, half rusty
    c.fillStyle = '#7f8487'; c.fillRect(s * 0.08, s * 0.12, s * 0.84, s * 0.88);
    for (let y = s * 0.12; y < s; y += 6) { c.fillStyle = y % 12 < 6 ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.15)'; c.fillRect(s * 0.08, y, s * 0.84, 3); }
    for (let i = 0; i < 12; i++) { c.fillStyle = 'rgba(120,70,30,0.25)'; c.fillRect(s * 0.08 + r() * s * 0.8, s * 0.6 + r() * s * 0.4, 8 + r() * 20, 4 + r() * 30); }
    c.fillStyle = '#4d4d4d'; c.fillRect(s * 0.08, s * 0.08, s * 0.84, s * 0.05); // shutter box
    grime(c, s);
  });
  cell(CELL.upperFront, (c, s) => {
    c.fillStyle = '#d6d4cf'; c.fillRect(0, 0, s, s); speckle(c, s, 180, 60, s * 5);
    // balcony doors (sliding glass with frame) behind a railing band
    c.fillStyle = '#20262b'; c.fillRect(s * 0.15, s * 0.12, s * 0.7, s * 0.62);
    c.strokeStyle = '#8a7a5a'; c.lineWidth = 5; c.strokeRect(s * 0.15, s * 0.12, s * 0.7, s * 0.62); c.beginPath(); c.moveTo(s * 0.5, s * 0.12); c.lineTo(s * 0.5, s * 0.74); c.stroke();
    c.fillStyle = 'rgba(160,170,175,0.2)'; c.fillRect(s * 0.18, s * 0.15, s * 0.28, s * 0.2);
    c.fillStyle = '#9a9a96'; c.fillRect(0, s * 0.74, s, s * 0.04);
    for (let x = 0; x < s; x += s / 14) { c.fillStyle = '#5e5e5a'; c.fillRect(x, s * 0.74, 3, s * 0.24); }
    c.fillStyle = '#6b6b67'; c.fillRect(0, s * 0.95, s, s * 0.05);
    grime(c, s);
  });
  cell(CELL.houseFront, (c, s) => {
    c.fillStyle = '#d6d4cf'; c.fillRect(0, 0, s, s); speckle(c, s, 180, 60, s * 5);
    // double wooden door (cửa gỗ) + two barred windows
    c.fillStyle = '#5b3a24'; c.fillRect(s * 0.36, s * 0.22, s * 0.28, s * 0.78);
    c.strokeStyle = '#3a2416'; c.lineWidth = 4; c.strokeRect(s * 0.36, s * 0.22, s * 0.28, s * 0.78); c.beginPath(); c.moveTo(s * 0.5, s * 0.22); c.lineTo(s * 0.5, s); c.stroke();
    for (const y of [0.32, 0.55, 0.78]) { c.strokeRect(s * 0.39, s * y, s * 0.08, s * 0.16); c.strokeRect(s * 0.53, s * y, s * 0.08, s * 0.16); }
    windowBars(c, s * 0.06, s * 0.32, s * 0.22, s * 0.32);
    windowBars(c, s * 0.72, s * 0.32, s * 0.22, s * 0.32);
    // a faded Tết couplet beside the door
    c.fillStyle = 'rgba(160,30,25,0.55)'; c.fillRect(s * 0.3, s * 0.25, s * 0.04, s * 0.5); c.fillRect(s * 0.66, s * 0.25, s * 0.04, s * 0.5);
    grime(c, s);
  });
  cell(CELL.roofTile, (c, s) => {
    c.fillStyle = '#7a3a26'; c.fillRect(0, 0, s, s);
    const rows = 10, cols = 12;
    for (let j = 0; j < rows; j++) for (let i = 0; i < cols; i++) {
      const x = (i + (j % 2) * 0.5) * (s / cols), y = j * (s / rows);
      const v = r();
      c.fillStyle = `rgb(${100 + v * 40},${45 + v * 25},${30 + v * 15})`;
      c.beginPath(); c.ellipse(x, y + s / rows * 0.6, s / cols * 0.48, s / rows * 0.55, 0, 0, Math.PI); c.fill();
      c.fillStyle = 'rgba(0,0,0,0.25)'; c.fillRect(x - s / cols * 0.48, y + s / rows * 0.55, s / cols * 0.96, 2);
    }
    for (let i = 0; i < 40; i++) { c.fillStyle = 'rgba(30,40,25,0.35)'; c.beginPath(); c.arc(r() * s, r() * s, 4 + r() * 18, 0, Math.PI * 2); c.fill(); } // moss
  });
  cell(CELL.roofTin, (c, s) => {
    for (let x = 0; x < s; x += s / 16) { const g = c.createLinearGradient(x, 0, x + s / 16, 0); g.addColorStop(0, '#6f7477'); g.addColorStop(0.5, '#a2a7a8'); g.addColorStop(1, '#5d6164'); c.fillStyle = g; c.fillRect(x, 0, s / 16, s); }
    for (let i = 0; i < 60; i++) { c.fillStyle = `rgba(${120 + r() * 40},${55 + r() * 20},25,${0.25 + r() * 0.4})`; const x = r() * s, y = r() * s; c.fillRect(x, y, 6 + r() * 30, 8 + r() * 60); } // rust
    c.fillStyle = 'rgba(0,0,0,0.25)'; for (let y = s / 6; y < s; y += s / 3) c.fillRect(0, y, s, 3);
  });
  cell(CELL.thatch, (c, s) => {
    c.fillStyle = '#6b5a3a'; c.fillRect(0, 0, s, s);
    for (let i = 0; i < 2600; i++) { const x = r() * s, y = r() * s; c.strokeStyle = r() < 0.5 ? 'rgba(150,125,80,0.6)' : 'rgba(70,55,35,0.6)'; c.lineWidth = 1 + r(); c.beginPath(); c.moveTo(x, y); c.lineTo(x + (r() - 0.5) * 6, y + 12 + r() * 20); c.stroke(); }
    for (let y = 0; y < s; y += s / 8) { c.fillStyle = 'rgba(40,30,18,0.4)'; c.fillRect(0, y, s, 3); }
  });
  cell(CELL.palmWall, (c, s) => {
    c.fillStyle = '#8a7650'; c.fillRect(0, 0, s, s);
    for (let y = 0; y < s; y += 10) for (let x = 0; x < s; x += 10) { c.fillStyle = (x + y) % 20 === 0 ? 'rgba(160,140,95,0.6)' : 'rgba(95,80,52,0.6)'; c.fillRect(x, y, 10, 10); } // woven
    c.fillStyle = '#4a3a26'; for (let x = 0; x < s; x += s / 3) c.fillRect(x, 0, 8, s); // bamboo frame
    c.fillStyle = 'rgba(10,8,6,0.85)'; c.fillRect(s * 0.4, s * 0.2, s * 0.22, s * 0.8); // dark doorway
  });
  cell(CELL.tinWall, (c, s) => {
    for (let x = 0; x < s; x += s / 20) { const g = c.createLinearGradient(x, 0, x + s / 20, 0); g.addColorStop(0, '#5a6a72'); g.addColorStop(0.5, '#8ea0a8'); g.addColorStop(1, '#4e5c63'); c.fillStyle = g; c.fillRect(x, 0, s / 20, s); }
    for (let i = 0; i < 40; i++) { c.fillStyle = `rgba(130,60,20,${0.2 + r() * 0.4})`; c.fillRect(r() * s, s * 0.6 + r() * s * 0.4, 4 + r() * 18, 6 + r() * 40); }
  });
  cell(CELL.brick, (c, s) => {
    c.fillStyle = '#7d7468'; c.fillRect(0, 0, s, s);
    for (let y = 0; y < s; y += s / 16) for (let x = 0; x < s; x += s / 8) { const o = (y / (s / 16)) % 2 ? s / 16 : 0; const v = r(); c.fillStyle = `rgb(${140 + v * 40},${70 + v * 25},${50 + v * 15})`; c.fillRect(x + o + 1, y + 1, s / 8 - 2, s / 16 - 2); }
    grime(c, s);
  });
  cell(CELL.concrete, (c, s) => { c.fillStyle = '#a7a59e'; c.fillRect(0, 0, s, s); speckle(c, s, 130, 70, s * 8); grime(c, s); });
  const signCell = (cIdx: number, list: string[][]) => cell(cIdx, (c, s) => {
    const colors = [['#c8261f', '#ffe36e'], ['#1f4fa8', '#ffffff'], ['#d9a400', '#7a1010'], ['#1d7a3a', '#ffffff']];
    list.forEach(([a, b], i) => {
      const y = (i * s) / 4, [bg, fg] = colors[i % 4];
      c.fillStyle = bg; c.fillRect(0, y, s, s / 4);
      c.strokeStyle = 'rgba(255,255,255,0.6)'; c.lineWidth = 3; c.strokeRect(4, y + 4, s - 8, s / 4 - 8);
      c.fillStyle = fg; c.textAlign = 'center'; c.textBaseline = 'middle';
      c.font = `bold ${Math.floor(s * 0.085)}px "Segoe UI", Arial, sans-serif`; c.fillText(a, s / 2, y + s * 0.1);
      c.font = `${Math.floor(s * 0.05)}px "Segoe UI", Arial, sans-serif`; c.fillText(b, s / 2, y + s * 0.19);
      for (let k = 0; k < 8; k++) { c.fillStyle = 'rgba(0,0,0,0.25)'; c.fillRect(r() * s, y + r() * s / 4, 6 + r() * 30, 2 + r() * 8); } // weathering
    });
  });
  signCell(CELL.signsA, SIGNS.slice(0, 4));
  signCell(CELL.signsB, SIGNS.slice(4, 8));
  cell(CELL.glow, (c, s) => {
    const g = c.createRadialGradient(s / 2, s * 0.6, 4, s / 2, s * 0.6, s * 0.7); g.addColorStop(0, '#ffe2a8'); g.addColorStop(1, '#b8743a');
    c.fillStyle = g; c.fillRect(0, 0, s, s);
    c.fillStyle = 'rgba(60,30,20,0.55)'; c.fillRect(0, 0, s * 0.18, s); c.fillRect(s * 0.82, 0, s * 0.18, s); // curtains
    c.strokeStyle = 'rgba(40,30,20,0.7)'; c.lineWidth = 6; c.beginPath(); c.moveTo(s / 2, 0); c.lineTo(s / 2, s); c.moveTo(0, s * 0.45); c.lineTo(s, s * 0.45); c.stroke();
  });
  cell(CELL.altar, (c, s) => {
    c.fillStyle = '#0d0605'; c.fillRect(0, 0, s, s);
    const g = c.createRadialGradient(s / 2, s * 0.45, 2, s / 2, s * 0.45, s * 0.45); g.addColorStop(0, 'rgba(255,60,40,0.95)'); g.addColorStop(1, 'rgba(120,10,10,0)');
    c.fillStyle = g; c.fillRect(0, 0, s, s);
    c.fillStyle = '#ff7a50'; c.fillRect(s * 0.42, s * 0.36, s * 0.04, s * 0.1); c.fillRect(s * 0.54, s * 0.36, s * 0.04, s * 0.1); // twin altar lamps
    c.fillStyle = 'rgba(200,160,90,0.5)'; c.fillRect(s * 0.44, s * 0.48, s * 0.12, s * 0.16); // portrait frame
  });
  t.update(true);
  t.anisotropicFilteringLevel = 8;
  return t;
}
