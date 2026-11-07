import { Vector3, type Mesh, type Scene } from '@babylonjs/core';

export interface Interior {
  id: string; x: number; z: number; yaw: number; halfWidth: number; halfDepth: number;
  floor: number; ceiling: number; roof?: Mesh; roofVisibility?: number; support?: boolean; priority?: number;
}
const rooms = new WeakMap<Scene, Interior[]>();
const roomGrid = new WeakMap<Scene, Map<string, Interior[]>>();
const key = (x: number, z: number) => `${Math.floor(x / 24)},${Math.floor(z / 24)}`;
export function registerInterior(scene: Scene, room: Interior) {
  // Roof undersides must remain visible when looking up inside a room.
  if (room.roof) {
    room.roof.visibility = 1; room.roofVisibility = 1;
    if (room.roof.material) room.roof.material.backFaceCulling = false;
  }
  const list = rooms.get(scene) ?? []; list.push(room); rooms.set(scene, list);
  const grid = roomGrid.get(scene) ?? new Map<string, Interior[]>(), radius = Math.hypot(room.halfWidth, room.halfDepth) + 1;
  for (let x = Math.floor((room.x - radius) / 24); x <= Math.floor((room.x + radius) / 24); x++) for (let z = Math.floor((room.z - radius) / 24); z <= Math.floor((room.z + radius) / 24); z++) {
    const k = `${x},${z}`, cell = grid.get(k) ?? []; cell.push(room); grid.set(k, cell);
  }
  roomGrid.set(scene, grid);
}
export function interiorAt(scene: Scene, p: Vector3, margin = 0): Interior | undefined {
  return roomGrid.get(scene)?.get(key(p.x, p.z))?.filter(r => interiorAtRoom(r, p, margin)).sort((a,b)=>(b.priority??0)-(a.priority??0)||b.floor-a.floor)[0];
}
const restoredRoofs = new WeakSet<Scene>();
/** Solid roofs in all views. CameraRig handles the indoor boom instead of removing architecture. */
export function updateInteriors(scene: Scene, _feet: Vector3, _camera: Vector3, _dt: number) {
  if (restoredRoofs.has(scene)) return;
  restoredRoofs.add(scene);
  for (const room of rooms.get(scene) ?? []) if (room.roof && room.roof.visibility !== 1) {
    room.roof.visibility = 1; room.roofVisibility = 1;
  }
}
function interiorAtRoom(r: Interior, p: Vector3, margin: number) {
  const dx = p.x - r.x, dz = p.z - r.z, c = Math.cos(r.yaw), s = Math.sin(r.yaw);
  return Math.abs(dx * c - dz * s) < r.halfWidth + margin && Math.abs(dx * s + dz * c) < r.halfDepth + margin
    && p.y >= r.floor - 0.6 && p.y < r.ceiling + 0.5;
}
