import { Color3, RawTexture, Texture, type StandardMaterial, type Scene } from '@babylonjs/core';

export type SurfaceKind = 'wood' | 'cement' | 'ceramic' | 'brass' | 'earth' | 'cloth';
const tau = Math.PI * 2;
/** Periodic fields: no random seams, baked shadows or repeating hard black stripes. */
export function surfacePixels(kind: SurfaceKind, size: number) {
  const heights = new Float32Array(size * size), diffuse = new Uint8Array(size * size * 4), normal = new Uint8Array(diffuse.length);
  for (let y = 0; y < size; y++) for (let x = 0; x < size; x++) {
    const u = x / size * tau, v = y / size * tau;
    const coarse = Math.sin(u * 3 + Math.sin(v * 2)) * Math.cos(v * 4 - Math.sin(u * 2));
    const fine = Math.sin(u * 47 + v * 31) * Math.cos(v * 43 - u * 13);
    const grain = Math.sin(u * 25 + Math.sin(v * 2) * .6 + Math.sin(u * 3) * .8);
    const h = kind === 'wood' ? .5 + grain * .12 + coarse * .06 + fine * .025
      : kind === 'cloth' ? .5 + Math.sin(u * 64) * Math.sin(v * 64) * .11
      : kind === 'brass' ? .5 + Math.sin(v * 53 + Math.sin(u * 3)) * .018 + coarse * .02
      : kind === 'ceramic' ? .5 + coarse * .018 + fine * .008
      : .5 + coarse * .13 + fine * .07;
    heights[y * size + x] = h;
    const value = kind === 'wood' ? 220 + grain * 13 + coarse * 9 : kind === 'brass' ? 232 + coarse * 12 : kind === 'ceramic' ? 245 + coarse * 5 : 228 + coarse * 15 + fine * 9;
    const i = (y * size + x) * 4;
    diffuse.set([value, value, value - (kind === 'wood' ? 6 : 0), 255], i);
  }
  const at = (x: number, y: number) => heights[((y + size) % size) * size + (x + size) % size];
  for (let y = 0; y < size; y++) for (let x = 0; x < size; x++) {
    const dx = (at(x + 1, y) - at(x - 1, y)) * 1.8, dy = (at(x, y + 1) - at(x, y - 1)) * 1.8;
    const len = Math.hypot(dx, dy, 1), i = (y * size + x) * 4;
    normal.set([Math.round(127.5 - dx / len * 127.5), Math.round(127.5 + dy / len * 127.5), Math.round(127.5 + 127.5 / len), 255], i);
  }
  return { diffuse, normal };
}
const cache = new WeakMap<Scene, Map<string, { diffuse: RawTexture; normal: RawTexture }>>();
export function surfaceTextures(scene: Scene, kind: SurfaceKind, low: boolean, repeatU = 1, repeatV = repeatU) {
  const textures = cache.get(scene) ?? new Map(); cache.set(scene, textures);
  const key = `${kind}:${low}:${repeatU}:${repeatV}`; let result = textures.get(key); if (result) return result;
  const size = low ? 128 : 256, pixels = surfacePixels(kind, size);
  const make = (bytes: Uint8Array, normal: boolean) => {
    const t = RawTexture.CreateRGBATexture(bytes, size, size, scene, true, false, Texture.TRILINEAR_SAMPLINGMODE);
    t.name = `${key}-${normal ? 'normal' : 'albedo'}`; t.gammaSpace = !normal; t.wrapU = t.wrapV = Texture.WRAP_ADDRESSMODE; t.uScale = repeatU; t.vScale = repeatV; t.anisotropicFilteringLevel = low ? 4 : 8; return t;
  };
  result = { diffuse: make(pixels.diffuse, false), normal: make(pixels.normal, true) }; textures.set(key, result); return result;
}
export function finishSurface(mat: StandardMaterial, kind: SurfaceKind, low: boolean, albedo = true) {
  const textures = surfaceTextures(mat.getScene(), kind, low);
  if (albedo) mat.diffuseTexture = textures.diffuse;
  mat.bumpTexture = textures.normal;
  mat.specularColor = Color3.FromHexString(kind === 'brass' ? '#796d4c' : kind === 'ceramic' ? '#5b6063' : kind === 'wood' ? '#24251f' : '#101410');
  mat.specularPower = kind === 'ceramic' ? 100 : kind === 'brass' ? 80 : kind === 'wood' ? 48 : 18;
}
