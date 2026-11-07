import { Color3, Mesh, MeshBuilder, Quaternion, StandardMaterial, TransformNode, Vector3, type Scene } from '@babylonjs/core';
import type { HumanRig } from './CharacterLibrary';

/** Grounded squat, not a scaled standing body. Local +z is the hidden face. */
export function crouchingGhost(scene: Scene, low = false) {
  const root = new TransformNode('crouching-spirit', scene);
  const head = new TransformNode('veiled-head', scene); head.parent = root; head.position.set(0, 1.01, 0.12);
  const material = (name: string, color: string, alpha: number, shine: number) => {
    const cached = scene.getMaterialByName(name) as StandardMaterial | null; if (cached) return cached;
    const m = new StandardMaterial(name, scene); m.diffuseColor = Color3.FromHexString(color);
    m.specularColor.set(shine, shine, shine); m.specularPower = 42; m.alpha = alpha;
    m.backFaceCulling = false; m.needDepthPrePass = alpha < 1; return m;
  };
  const cloth = material('spirit-old-ivory', '#b8c4b9', .88, .025);
  const skin = material('spirit-cold-skin', '#7e918a', .9, .02);
  const hair = material('spirit-wet-black-hair', '#06080a', .98, .14);
  const glint = material('spirit-hair-fibres', '#172226', .98, .22);
  const groups = new Map<StandardMaterial, Mesh[]>();
  const add = (mesh: Mesh, mat: StandardMaterial, parent = root) => {
    mesh.parent = parent; mesh.material = mat; mesh.isPickable = false;
    const list = groups.get(mat) ?? []; list.push(mesh); groups.set(mat, list); return mesh;
  };
  const oval = (name: string, p: Vector3, scale: Vector3, mat: StandardMaterial, parent = root) => {
    const m = add(MeshBuilder.CreateSphere(name, { diameter: 1, segments: low ? 8 : 14 }, scene), mat, parent);
    m.position.copyFrom(p); m.scaling.copyFrom(scale); return m;
  };
  const limb = (name: string, a: Vector3, b: Vector3, width: number, mat: StandardMaterial) => {
    const d = b.subtract(a), m = oval(name, Vector3.Lerp(a, b, .5), new Vector3(width, d.length() + width * .35, width), mat);
    m.rotationQuaternion = Quaternion.FromUnitVectorsToRef(Vector3.Up(), d.normalize(), new Quaternion()); return m;
  };
  oval('folded-hip', new Vector3(0, .37, -.09), new Vector3(.48, .36, .37), cloth);
  const torso = oval('bent-baba-shirt', new Vector3(0, .68, -.025), new Vector3(.43, .62, .32), cloth); torso.rotation.x = .3;
  // Feet lie flat; thighs rise to the knees, calves fold back underneath.
  for (const side of [-1, 1]) {
    const knee = new Vector3(side * .25, .67, .3), hip = new Vector3(side * .14, .37, -.1), ankle = new Vector3(side * .26, .1, .02);
    limb('raised-thigh', hip, knee, .235, cloth); limb('folded-calf', knee, ankle, .16, cloth);
    oval('bare-foot', new Vector3(side * .26, .065, .16), new Vector3(.14, .12, .34), skin);
    const elbow = new Vector3(side * .34, .53, .35), hand = new Vector3(side * .17, .4, .43);
    limb('sleeve-upper', new Vector3(side * .2, .83, .025), elbow, .13, cloth);
    limb('forearm-around-knee', elbow, hand, .085, skin);
    oval('hand', hand, new Vector3(.1, .14, .055), skin);
    for (let f = 0; f < (low ? 3 : 4); f++) {
      const a = hand.add(new Vector3((f - 1.5) * .022, -.04, .018));
      limb('long-finger', a, a.add(new Vector3(side * -.015, -.105, .012)), .014, skin);
    }
    // Shirt seams and compressed folds make the pose legible at torch distance.
    for (let f = 0; f < 4; f++) limb('shirt-fold', new Vector3(side * (.12 + f * .027), .72 - f * .08, -.17), new Vector3(side * (.2 + f * .018), .67 - f * .08, -.12), .013, cloth);
  }
  oval('bowed-head', Vector3.Zero(), new Vector3(.28, .35, .27), skin, head);
  oval('black-crown', new Vector3(0, .06, -.02), new Vector3(.32, .31, .3), hair, head);
  const locks = low ? 18 : 32;
  for (let k = 0; k < locks; k++) {
    const angle = k / locks * Math.PI * 2, width = Math.PI * 2 / locks * .64;
    const paths: Vector3[][] = [];
    for (const edge of [-1, 1]) {
      const path: Vector3[] = [];
      for (let j = 0; j <= 7; j++) {
        const t = j / 7, a = angle + edge * width * (1 - .78 * t ** 5);
        const radius = .04 + .14 * Math.sin(Math.min(1, t * 3) * Math.PI / 2) + .018 * Math.sin(t * 8 + k);
        path.push(new Vector3(Math.sin(a) * radius, .19 - t * (.82 + .055 * Math.sin(k * 2.3)), Math.cos(a) * radius + t * .035));
      }
      paths.push(path);
    }
    add(MeshBuilder.CreateRibbon('face-covering-lock', { pathArray: paths, sideOrientation: Mesh.DOUBLESIDE }, scene), hair, head);
    if (!low && k % 2 === 0) add(MeshBuilder.CreateTube('wet-strand-highlight', { path: paths[0], radius: .0016, tessellation: 3 }, scene), glint, head);
  }
  // Keep separate batches for head motion and the crouched body; at most five meshes.
  const meshes: Mesh[] = [];
  for (const [mat, parts] of groups) for (const parent of [root, head]) {
    const selected = parts.filter(p => p.parent === parent); if (!selected.length) continue;
    // Bake in the parent's local frame, preserving a movable head pivot after merging.
    for (const p of selected) p.parent = null;
    const m = Mesh.MergeMeshes(selected, true, true)!; m.name = `crouching-${mat.name}-${parent === head ? 'head' : 'body'}`;
    m.parent = parent; m.material = mat; m.isPickable = false; meshes.push(m);
  }
  return { root, head, meshes, animate(time: number) {
    head.rotation.x = .13 + Math.sin(time * .65) * .025;
    head.rotation.z = Math.sin(time * .47) * .025;
    root.scaling.y = 1 + Math.sin(time * 1.2) * .006;
  } };
}

/** Preserve the existing rig's gameplay identity/disposal while replacing its visual silhouette. */
export function dressCrouchingGhost(scene: Scene, rig: HumanRig, low = false) {
  if (rig.updateGhostPose) return;
  for (const m of rig.meshes) m.setEnabled(false);
  const pose = crouchingGhost(scene, low); pose.root.parent = rig.root;
  rig.meshes.splice(0, rig.meshes.length, ...pose.meshes);
  rig.nodes.set('Head', pose.head); rig.updateGhostPose = pose.animate;
}
