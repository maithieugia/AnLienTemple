import {Scene,Mesh,VertexData,StandardMaterial,Color3} from '@babylonjs/core';
import {CELL,cellUV} from './BuildingAtlas';
type V3=[number,number,number];type UV=[number,number,number,number];
export class BAcc {
  P: number[] = []; N: number[] = []; UVs: number[] = []; C: number[] = []; I: number[] = [];
  x = 0; z = 0; y = 0; cos = 1; sin = 0;
  at(x: number, y: number, z: number, yaw: number) { this.x = x; this.y = y; this.z = z; this.cos = Math.cos(yaw); this.sin = Math.sin(yaw); }
  private w([lx, ly, lz]: V3): V3 { return [this.x + lx * this.cos + lz * this.sin, this.y + ly, this.z - lx * this.sin + lz * this.cos]; }
  /** Quad a→b→c→d counter-clockwise seen from the front; uv maps a=(u0,v0) b=(u1,v0) c=(u1,v1) d=(u0,v1). */
  quad(a: V3, b: V3, c: V3, d: V3, uv: UV, col: Color3) {
    const A = this.w(a), B = this.w(b), Cc = this.w(c), D = this.w(d);
    const e1 = [B[0] - A[0], B[1] - A[1], B[2] - A[2]], e2 = [D[0] - A[0], D[1] - A[1], D[2] - A[2]];
    let nx = e1[1] * e2[2] - e1[2] * e2[1], ny = e1[2] * e2[0] - e1[0] * e2[2], nz = e1[0] * e2[1] - e1[1] * e2[0];
    const l = Math.hypot(nx, ny, nz) || 1; nx = -nx / l; ny = -ny / l; nz = -nz / l;
    const base = this.P.length / 3;
    for (const [p, u, v] of [[A, uv[0], uv[1]], [B, uv[2], uv[1]], [Cc, uv[2], uv[3]], [D, uv[0], uv[3]]] as [V3, number, number][]) {
      this.P.push(p[0], p[1], p[2]); this.N.push(nx, ny, nz); this.UVs.push(u, v); this.C.push(col.r, col.g, col.b, 1);
    }
    this.I.push(base, base + 2, base + 1, base, base + 3, base + 2);
  }
  /** Wall from (x0,z0) to (x1,z1), y0..y1, tiled with a cell every unitW × unitH metres. Facing: left of the direction. */
  wall(x0: number, z0: number, x1: number, z1: number, y0: number, y1: number, cell: number, col: Color3, unitW = 3.4, unitH = 3.4) {
    const L = Math.hypot(x1 - x0, z1 - z0);
    const nu = Math.max(1, Math.round(L / unitW)), nv = Math.max(1, Math.round((y1 - y0) / unitH));
    for (let i = 0; i < nu; i++) for (let j = 0; j < nv; j++) {
      const t0 = i / nu, t1 = (i + 1) / nu, ya = y0 + ((y1 - y0) * j) / nv, yb = y0 + ((y1 - y0) * (j + 1)) / nv;
      this.quad([x0 + (x1 - x0) * t0, ya, z0 + (z1 - z0) * t0], [x0 + (x1 - x0) * t1, ya, z0 + (z1 - z0) * t1], [x0 + (x1 - x0) * t1, yb, z0 + (z1 - z0) * t1], [x0 + (x1 - x0) * t0, yb, z0 + (z1 - z0) * t0], cellUV(cell), col);
    }
  }
  /** Closed box; front (−z) face can use a different cell. */
  box(x0: number, x1: number, y0: number, y1: number, z0: number, z1: number, cell: number, col: Color3, top = CELL.concrete) {
    this.wall(x0, z0, x1, z0, y0, y1, cell, col, 3.4, 3.4); // front (−z)
    this.wall(x1, z1, x0, z1, y0, y1, cell, col); // back
    this.wall(x0, z1, x0, z0, y0, y1, cell, col); // left
    this.wall(x1, z0, x1, z1, y0, y1, cell, col); // right
    this.quad([x0, y1, z0], [x1, y1, z0], [x1, y1, z1], [x0, y1, z1], cellUV(top), col);
  }
  /** Gable roof with the ridge along z (slopes face ±x) and gable triangles. */
  gableZ(w: number, d: number, y: number, rise: number, over: number, cell: number, col: Color3, gableCell: number, gableCol: Color3) {
    const hw = w / 2 + over, z0 = -over, z1 = d + over, uv = cellUV(cell);
    const reps = (n: number): UV => [uv[0], uv[1], uv[0] + (uv[2] - uv[0]) * Math.min(1, n), uv[3]];
    this.quad([-hw, y, z0], [-hw, y, z1], [0, y + rise, z1], [0, y + rise, z0], reps(1), col);
    this.quad([hw, y, z1], [hw, y, z0], [0, y + rise, z0], [0, y + rise, z1], reps(1), col);
    const g = cellUV(gableCell);
    for (const zz of [0, d]) {
      const front = zz === 0;
      const a: V3 = [front ? -w / 2 : w / 2, y, zz], b: V3 = [front ? w / 2 : -w / 2, y, zz], c: V3 = [0, y + rise * (w / 2) / hw, zz];
      this.quad(a, b, c, c, [g[0], g[1], g[2], g[1] + (g[3] - g[1]) * 0.5], gableCol);
    }
  }
  /** Hip roof (mái Thái): four slopes, ridge along the longer side. */
  hip(w: number, d: number, y: number, rise: number, over: number, cell: number, col: Color3) {
    const x0 = -w / 2 - over, x1 = w / 2 + over, z0 = -over, z1 = d + over;
    const along = d >= w;
    const inset = (along ? x1 - x0 : z1 - z0) / 2;
    const uv = cellUV(cell);
    if (along) {
      const r0: V3 = [0, y + rise, z0 + inset], r1: V3 = [0, y + rise, z1 - inset];
      this.quad([x0, y, z0], [x1, y, z0], [r0[0], r0[1], r0[2]], r0, uv, col); // front triangle
      this.quad([x1, y, z1], [x0, y, z1], r1, r1, uv, col);
      this.quad([x1, y, z0], [x1, y, z1], r1, r0, uv, col);
      this.quad([x0, y, z1], [x0, y, z0], r0, r1, uv, col);
    } else {
      const r0: V3 = [x0 + inset, y + rise, (z0 + z1) / 2], r1: V3 = [x1 - inset, y + rise, (z0 + z1) / 2];
      this.quad([x0, y, z0], [x1, y, z0], r1, r0, uv, col);
      this.quad([x1, y, z1], [x0, y, z1], r0, r1, uv, col);
      this.quad([x1, y, z0], [x1, y, z1], r1, r1, uv, col);
      this.quad([x0, y, z1], [x0, y, z0], r0, r0, uv, col);
    }
  }
  cylinder(cx: number, cz: number, y0: number, y1: number, r: number, cell: number, col: Color3, seg = 8) {
    for (let i = 0; i < seg; i++) {
      const a0 = (i / seg) * Math.PI * 2, a1 = ((i + 1) / seg) * Math.PI * 2;
      const p0: V3 = [cx + Math.cos(a0) * r, y0, cz + Math.sin(a0) * r], p1: V3 = [cx + Math.cos(a1) * r, y0, cz + Math.sin(a1) * r];
      this.quad(p0, p1, [p1[0], y1, p1[2]], [p0[0], y1, p0[2]], cellUV(cell), col);
    }
  }
  build(name: string, scene: Scene, mat: StandardMaterial): Mesh | null {
    if (!this.I.length) return null;
    const m = new Mesh(name, scene);
    // Babylon retains these CPU buffers. Avoid keeping boxed number arrays for
    // every vertex of the town; index width must still support large chunks.
    const vd = new VertexData();
    vd.positions = new Float32Array(this.P); vd.normals = new Float32Array(this.N);
    vd.uvs = new Float32Array(this.UVs); vd.colors = new Float32Array(this.C);
    vd.indices = this.P.length / 3 <= 65536 ? new Uint16Array(this.I) : new Uint32Array(this.I);
    vd.applyToMesh(m);
    m.material = mat; m.isPickable = false; m.freezeWorldMatrix();
    return m;
  }
}

