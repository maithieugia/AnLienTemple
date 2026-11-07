import {
  Color3, Mesh, MeshBuilder, RawTexture, StandardMaterial, Vector3, VertexBuffer, VertexData,
  type Scene, type Skeleton,
} from '@babylonjs/core';
import { finishSurface } from '../visual/Surfaces';

/** Authored in the CC0 base's bind coordinates (+Z face). No new rig or animation clips. */
export const MINH_DESIGN = {
  name: 'Minh', height: 1.7, shirt: '#394e55', shorts: '#76694f', skin: '#d9b69b',
  hair: '#100f0e', extraMeshes: 5,
} as const;

/** Small lower-face sculpt, leaving eyelids/eyes and all joints in their original bind pose. */
export function refineMinhFace(body: Mesh, skeleton: Skeleton) {
  const positions = Array.from(body.getVerticesData(VertexBuffer.PositionKind)!);
  const joints = body.getVerticesData(VertexBuffer.MatricesIndicesKind)!;
  const weights = body.getVerticesData(VertexBuffer.MatricesWeightsKind)!;
  const head = skeleton.bones.findIndex(b => b.name.split(':').pop() === 'Head');
  for (let i = 0; i < positions.length / 3; i++) {
    let influence = 0;
    for (let k = 0; k < 4; k++) if (joints[i * 4 + k] === head) influence += weights[i * 4 + k];
    const y = positions[i * 3 + 1], z = positions[i * 3 + 2];
    if (influence < .5 || y > 1.69 || y < 1.60) continue;
    const jaw = Math.sin((y - 1.60) / .09 * Math.PI) * influence;
    positions[i * 3] *= 1 - .075 * jaw;
    if (z > .035) positions[i * 3 + 2] += .003 * jaw;
  }
  body.setVerticesData(VertexBuffer.PositionKind, positions);
  body.refreshBoundingInfo();
}

function textile(scene: Scene, name: string, checks = false) {
  const size = 128, pixels = new Uint8Array(size * size * 4);
  for (let y = 0; y < size; y++) for (let x = 0; x < size; x++) {
    const i = (y * size + x) * 4;
    // Deterministic woven cotton; fine weave, larger yarn checks on the khăn rằn.
    const weave = ((x + y) % 2 ? 8 : -8) + ((x * 17 + y * 37) % 13 - 6);
    const check = checks ? ((x % 32 < 12 ? 1 : 0) + (y % 32 < 12 ? 1 : 0)) * 64 : 0;
    const value = (checks ? 220 : 230) - check + weave;
    pixels.set([value, value, value - (checks ? 9 : 0), 255], i);
  }
  const texture = RawTexture.CreateRGBATexture(pixels, size, size, scene, true, false);
  texture.name = name;
  return texture;
}

/** Recomputing normals matters: the original normals still described the muscular body. */
export function softenMinhNormals(mesh: Mesh) {
  const positions = mesh.getVerticesData(VertexBuffer.PositionKind), indices = mesh.getIndices();
  if (!positions || !indices) return;
  const normals: number[] = [];
  // These surfaces keep glTF's right-handed winding; its root performs handedness conversion.
  // Babylon's default left-handed normal would extrude clothing INTO the skin.
  VertexData.ComputeNormals(positions, indices, normals, { useRightHandedSystem: true });
  // glTF duplicates vertices at UV seams. Average coincident normals to avoid visible seams.
  const sums = new Map<string, number[]>();
  const key = (i: number) => `${Math.round(positions[i] * 100000)},${Math.round(positions[i + 1] * 100000)},${Math.round(positions[i + 2] * 100000)}`;
  for (let i = 0; i < positions.length; i += 3) {
    const k = key(i), n = sums.get(k) ?? [0, 0, 0];
    for (let a = 0; a < 3; a++) n[a] += normals[i + a];
    sums.set(k, n);
  }
  for (let i = 0; i < positions.length; i += 3) {
    const n = sums.get(key(i))!, length = Math.hypot(...n) || 1;
    for (let a = 0; a < 3; a++) normals[i + a] = n[a] / length;
  }
  mesh.setVerticesData(VertexBuffer.NormalKind, normals);
}

export function dressMinh(scene: Scene, body: Mesh, skeleton: Skeleton, clothes: Mesh[], low: boolean): Mesh[] {
  const source = body.getVerticesData(VertexBuffer.PositionKind)!;
  const indices = body.getVerticesData(VertexBuffer.MatricesIndicesKind)!;
  const weights = body.getVerticesData(VertexBuffer.MatricesWeightsKind)!;
  const boneIndex = (name: string) => skeleton.bones.findIndex(b => b.name.split(':').pop() === name);
  const cloth = new StandardMaterial('minh-woven-cotton', scene);
  cloth.diffuseTexture = textile(scene, 'minh-cotton-128');
  finishSurface(cloth, 'cloth', low, false);
  cloth.specularColor.set(.025, .025, .025); cloth.backFaceCulling = false;
  for (const mesh of clothes) {
    mesh.material = cloth;
    const p = mesh.getVerticesData(VertexBuffer.PositionKind)!;
    const uv: number[] = [];
    for (let i = 0; i < p.length; i += 3) uv.push(p[i] * 9 + p[i + 2] * 3, p[i + 1] * 9);
    mesh.setVerticesData(VertexBuffer.UVKind, uv);
    softenMinhNormals(mesh);
  }
  const material = (name: string, hex: string, texture = false) => {
    const m = new StandardMaterial(`minh-${name}`, scene);
    m.diffuseColor = Color3.FromHexString(hex); m.specularColor.set(.025, .025, .025);
    if (texture) { m.diffuseTexture = cloth.diffuseTexture; finishSurface(m, 'cloth', low, false); }
    m.backFaceCulling = false;
    return m;
  };
  const seam = material('ribbed-hems', '#293b40', true);
  const canvas = material('worn-canvas', '#71664e', true);
  const stitch = material('stitching-leather', '#302b23');
  const scarf = material('khan-ran', '#aea99a'); scarf.diffuseTexture = textile(scene, 'minh-checks-128', true);
  finishSurface(scarf, 'cloth', low, false);
  const hair = material('hair-fibres', '#24211c'); hair.specularColor.set(.13, .12, .10);
  const batches = new Map<StandardMaterial, Mesh[]>();
  const add = (mesh: Mesh, mat: StandardMaterial, rigid?: string) => {
    mesh.material = mat;
    mesh.metadata = { rigidBone: rigid };
    const list = batches.get(mat) ?? []; list.push(mesh); batches.set(mat, list);
    return mesh;
  };
  const tube = (name: string, path: Vector3[], radius: number, mat: StandardMaterial, rigid?: string) =>
    add(MeshBuilder.CreateTube(`minh-${name}`, { path, radius, tessellation: low ? 4 : 6 }, scene), mat, rigid);
  const ellipse = (y: number, rx: number, rz: number, z = 0) => Array.from({ length: 33 }, (_, i) => {
    const a = i / 32 * Math.PI * 2; return new Vector3(Math.sin(a) * rx, y, Math.cos(a) * rz + z);
  });
  tube('crew-neck', ellipse(1.527, .079, .069, -.005), .009, seam);
  tube('shirt-hem', ellipse(1.015, .155, .116, -.012), .006, seam);
  for (const side of [-1, 1]) {
    const cuff = Array.from({ length: 25 }, (_, i) => {
      const a = i / 24 * Math.PI * 2;
      return new Vector3(side * .435, 1.445 + Math.sin(a) * .063, -.075 + Math.cos(a) * .062);
    });
    tube('sleeve-cuff', cuff, .004, seam);
    const pocket = [-1, 1].map(edge => [new Vector3(side * .182, .89, .009 + edge * .044), new Vector3(side * .178, .77, .009 + edge * .038)]);
    add(MeshBuilder.CreateRibbon('minh-cargo-pocket', { pathArray: pocket, sideOrientation: Mesh.DOUBLESIDE }, scene), canvas);
    tube('pocket-topstitch', [pocket[0][0], pocket[1][0]], .0025, stitch);
  }
  // Scarf drapes over the collar, with two unequal hanging ends, not a floating flat decal.
  tube('scarf-neck', ellipse(1.505, .094, .083), .014, scarf);
  for (const side of [-1, 1]) {
    const paths = [-1, 1].map(edge => Array.from({ length: 10 }, (_, j) => {
      const t = j / 9;
      return new Vector3(side * (.075 + .035 * t) + edge * .027, 1.49 - t * (side > 0 ? .27 : .20), .077 + Math.sin(t * Math.PI / 2) * .075 + .008 * Math.sin(t * 10));
    }));
    const end = add(MeshBuilder.CreateRibbon('minh-scarf-tail', { pathArray: paths, sideOrientation: Mesh.DOUBLESIDE }, scene), scarf);
    // Ribbon UVs preserve the checked yarn pattern at a useful scale.
    const uv = end.getVerticesData(VertexBuffer.UVKind)!;
    end.setVerticesData(VertexBuffer.UVKind, Array.from(uv, (v, i) => v * (i % 2 ? 2 : .55)));
    if (!low) for (let f = 0; f < 5; f++) {
      const a = paths[0][9].add(new Vector3(f * .013, 0, 0));
      tube('scarf-fringe', [a, a.add(new Vector3(.003, -.018, .003))], .0015, scarf);
    }
  }
  // Flattened canvas satchel on the back-left hip; all its parts follow pelvis rigidly.
  const pouch = add(MeshBuilder.CreateSphere('minh-satchel', { diameter: 1, segments: low ? 8 : 14 }, scene), canvas, 'pelvis');
  pouch.scaling.set(.26, .29, .105); pouch.position.set(-.17, 1.075, -.172);
  const flap = add(MeshBuilder.CreateBox('minh-bag-flap', { width: .21, height: .115, depth: .016 }, scene), canvas, 'pelvis');
  flap.position.set(-.17, 1.14, -.222); flap.rotation.z = -.06;
  tube('bag-stitch', [new Vector3(-.27, 1.09, -.235), new Vector3(-.17, 1.08, -.24), new Vector3(-.07, 1.10, -.235)], .002, stitch, 'pelvis');
  const buckle = add(MeshBuilder.CreateBox('minh-buckle', { width: .023, height: .038, depth: .012 }, scene), stitch, 'pelvis');
  buckle.position.set(-.17, 1.105, -.239);
  for (const sign of [-1, 1]) {
    const paths = [-1, 1].map(edge => Array.from({ length: 17 }, (_, j) => {
      const t = j / 16;
      return new Vector3(.17 - .35 * t + edge * .014, 1.49 - .43 * t, sign * (.10 + .044 * Math.sin(t * Math.PI)) - .015);
    }));
    add(MeshBuilder.CreateRibbon('minh-shoulder-strap', { pathArray: paths, sideOrientation: Mesh.DOUBLESIDE }, scene), canvas);
  }
  // Open sandals: toes remain visible. Each sole and V strap follows its own foot bone.
  for (const side of [-1, 1]) {
    const x = side * .114, foot = side > 0 ? 'foot_l' : 'foot_r';
    const sole = add(MeshBuilder.CreateBox('minh-sandal-sole', { width: .105, height: .018, depth: .252 }, scene), stitch, foot);
    sole.position.set(x, -.003, .008);
    tube('sandal-v', [new Vector3(x - .048, .037, -.01), new Vector3(x, .066, .075), new Vector3(x + .048, .037, -.01)], .009, stitch, foot);
  }
  // Subtle locks on the existing parted haircut: silhouette remains short and practical.
  if (!low) for (let k = 0; k < 13; k++) {
    const x = (k - 6) * .010;
    tube('parted-lock', [new Vector3(x, 1.806 - Math.abs(x) * .5, -.06), new Vector3(x - .012, 1.824 - Math.abs(x) * .55, -.005), new Vector3(x - .023, 1.798 - Math.abs(x) * .45, .052)], .0018, hair, 'Head');
  }
  const result: Mesh[] = [];
  for (const [mat, parts] of batches) {
    // Bake authored transforms, then copy weights from the closest body surface in bind space.
    // This makes scarf/straps deform with chest/shoulder blends instead of riding a root node.
    for (const part of parts) {
      part.bakeCurrentTransformIntoVertices();
      const p = part.getVerticesData(VertexBuffer.PositionKind)!;
      const mi: number[] = [], mw: number[] = [];
      const rigid = part.metadata?.rigidBone as string | undefined;
      const fixed = rigid ? boneIndex(rigid) : -1;
      for (let i = 0; i < p.length; i += 3) {
        let nearest = 0, distance = Infinity;
        if (fixed < 0) for (let j = 0; j < source.length; j += 3) {
          const d = (p[i] - source[j]) ** 2 + (p[i + 1] - source[j + 1]) ** 2 + (p[i + 2] - source[j + 2]) ** 2;
          if (d < distance) { distance = d; nearest = j / 3; }
        }
        for (let k = 0; k < 4; k++) {
          mi.push(fixed >= 0 ? (k === 0 ? fixed : 0) : indices[nearest * 4 + k]);
          mw.push(fixed >= 0 ? (k === 0 ? 1 : 0) : weights[nearest * 4 + k]);
        }
      }
      part.setVerticesData(VertexBuffer.MatricesIndicesKind, mi);
      part.setVerticesData(VertexBuffer.MatricesWeightsKind, mw);
    }
    const mesh = Mesh.MergeMeshes(parts, true, true)!;
    mesh.name = mat.name; mesh.material = mat; mesh.parent = body.parent;
    mesh.metadata = { minhDetail: true };
    mesh.position.copyFrom(body.position); mesh.scaling.copyFrom(body.scaling);
    if (body.rotationQuaternion) mesh.rotationQuaternion = body.rotationQuaternion.clone();
    mesh.skeleton = skeleton; mesh.isPickable = false; result.push(mesh);
  }
  return result;
}
