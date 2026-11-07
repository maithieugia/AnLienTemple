import {buildAvatar,type AvatarAsset} from './AvatarV2';
import {readAvatar,type AvatarProfile} from './AvatarProfile';
import {
  LoadAssetContainerAsync, Scene, AssetContainer, TransformNode, Mesh, AbstractMesh, AnimationGroup, VertexBuffer, VertexData,
  StandardMaterial, Color3, MeshBuilder, Vector3, Matrix, Quaternion, type Skeleton, type Material, PBRMaterial, Texture, SceneLoader, RegisterSceneLoaderPlugin,
} from '@babylonjs/core';
import { GLTFFileLoader } from '@babylonjs/loaders/glTF';
import { AnimController } from './AnimController';
import { dressCrouchingGhost } from './CrouchingGhost';
import { dressMinh, refineMinhFace, softenMinhNormals } from './MinhAppearance';

/**
 * Loads CC0 character assets once (Quaternius UAL + Universal Base Characters + Animal Pack, see ASSETS.md)
 * and builds per-character instances: retargeted animation groups, generated outfit layer, hair, props.
 */

export type HairStyle = 'buns' | 'long' | 'short' | 'none';
export interface OutfitStyle {
  robe: string;      // outer robe
  inner: string;     // inner layer at the chest
  trousers: string;
  belt: string;
  trim: string;      // cuffs / hem
  boots: string;
  /** Long skirt panel hanging to the knees (cultivator robe). */
  skirt: boolean;
  /** Garment cut: Vietnamese áo dài, áo bà ba, or a cultivator robe. */
  style?: 'aodai' | 'baba' | 'robe' | 'shirt' | 'tee';
  skin?: string;     // tint multiplier for skin texture
}
export interface HumanOptions {
  id: string;
  appearance?: 'minh'|'minh-v2';
  avatar?:AvatarProfile;
  /** Dedicated skinned costume for the fictional ritual master. */
  ritualMaster?:boolean;
  female?: boolean;
  outfit: OutfitStyle;
  hair: HairStyle;
  beard?: boolean;
  hairColor?: string;
  hat?: 'conical' | 'cap' | null;
  /** Cultivator topknot (búi tóc) with a hairpin. */
  topknot?: boolean;
  hatColor?: string;
  sword?: boolean;
  /** Small flashlight held in the right hand (beam origin exposed as flashTip). */
  flashlight?: boolean;
  height?: number; // metres
}

export interface HumanRig {
  root: TransformNode;
  swordBase?: TransformNode;
  swordTip?: TransformNode;
  flashTip?: TransformNode;
  anim: AnimController;
  nodes: Map<string, TransformNode>;
  meshes: AbstractMesh[];
  updateGhostPose?: (time: number) => void;
  dispose(): void;
}

export interface WolfRig {
  root: TransformNode;
  anim: AnimController;
  meshes: AbstractMesh[];
  dispose(): void;
}

const BASE = `${import.meta.env.BASE_URL}assets/chars/`;
const HAIR_FILES: Record<Exclude<HairStyle, 'none'>, string> = { buns: 'hair_buns.glb', long: 'hair_long.glb', short: 'hair_short.glb' };

export class CharacterLibrary {
  private avatarV2?:AvatarAsset;
  private hero!: AssetContainer;
  private heroine!: AssetContainer;
  private anims!: AssetContainer;
  private wolf!: AssetContainer;
  private hair = new Map<string, AssetContainer>();
  private beard!: AssetContainer;
  private matCache = new Map<string, Material>();
  private counter = 0;

  constructor(private scene: Scene, private low = false) {}

  async load() {
    // Register with the exact core instance used below; a stale dev dependency
    // graph must not silently fall back to the .babylon text loader for GLBs.
    if(!SceneLoader.IsPluginForExtensionAvailable('.glb'))RegisterSceneLoaderPlugin(new GLTFFileLoader());
    const load = async (f: string) => {
      const response=await fetch(BASE+f);
      if(!response.ok)throw new Error(`Không tải được nhân vật ${f} (HTTP ${response.status})`);
      const bytes=new Uint8Array(await response.arrayBuffer());
      if(bytes.length<12||new DataView(bytes.buffer).getUint32(0,true)!==0x46546c67)throw new Error(`Dữ liệu nhân vật ${f} không phải GLB`);
      const container=await LoadAssetContainerAsync(bytes,this.scene,{pluginExtension:'.glb',rootUrl:BASE});
      if(f==='anims.glb'?!container.animationGroups.length:!container.meshes.length)throw new Error(`Mô hình ${f} tải về rỗng`);
      return container;
    };
    const [hero, heroine, anims, wolf, beard, ...hairs] = await Promise.all([
      load('hero.glb'), load('heroine.glb'), load('anims.glb'), load('wolf.glb'), load('beard.glb'),
      ...Object.values(HAIR_FILES).map(load),
    ]);
    // An Liên: the Minh v2 avatar (3 MB) is not used by temple pilgrims, so it is not loaded.
    this.hero = hero; this.heroine = heroine; this.anims = anims; this.wolf = wolf; this.beard = beard;
    Object.keys(HAIR_FILES).forEach((k, i) => this.hair.set(k, hairs[i]));
    // Lights in this scene are classic (no IBL), so PBR from glTF would render dark: swap to Standard.
    for (const c of [hero, heroine, wolf, beard, ...hairs]) for (const m of c.meshes) if (m.material) m.material = this.toStandard(m.material);
  }

  async loadAvatarV2(file='minh-v2.json'){
    if(this.avatarV2)return this.avatarV2;
    const response=await fetch(BASE+file);if(!response.ok)throw new Error('Không tải được bề mặt nhân vật nhà sư');
    this.avatarV2=await response.json() as AvatarAsset;return this.avatarV2;
  }

  private toStandard(src: Material): Material {
    const hit = this.matCache.get(src.uniqueId + '');
    if (hit) return hit;
    const m = new StandardMaterial(`std_${src.name}`, this.scene);
    if (src instanceof PBRMaterial) {
      m.diffuseTexture = src.albedoTexture as Texture | null;
      m.diffuseColor = src.albedoColor.clone();
      if (src.bumpTexture) { m.bumpTexture = src.bumpTexture; m.invertNormalMapX = false; }
      m.useAlphaFromDiffuseTexture = src.transparencyMode !== null && src.transparencyMode !== 0;
      if (m.diffuseTexture && src.needAlphaTesting()) { m.diffuseTexture.hasAlpha = true; m.useAlphaFromDiffuseTexture = false; }
      m.backFaceCulling = src.backFaceCulling;
    }
    m.specularColor = new Color3(0.08, 0.08, 0.08);
    m.specularPower = 24;
    this.matCache.set(src.uniqueId + '', m);
    return m;
  }

  private retarget(ctrlName: string, groups: AnimationGroup[], nodes: Map<string, TransformNode>, strip: (n: string) => string): Map<string, AnimationGroup> {
    const out = new Map<string, AnimationGroup>();
    for (const g of groups) {
      const ng = new AnimationGroup(`${ctrlName}:${g.name}`, this.scene);
      for (const ta of g.targetedAnimations) {
        const t = nodes.get(strip((ta.target as TransformNode).name));
        if (t) ng.addTargetedAnimation(ta.animation, t);
      }
      ng.normalize(g.from, g.to);
      out.set(g.name.replace(/^.*\|/, ''), ng);
    }
    return out;
  }

  createHuman(o: HumanOptions): HumanRig {
    const tag = `${o.id}#${this.counter++}`;
    const source=o.female?this.heroine:this.hero;
    const inst = source.instantiateModelsToScene((n) => `${tag}:${n}`, false, { doNotInstantiate: true });
    const glRoot = inst.rootNodes[0] as TransformNode;
    if(!glRoot)throw new Error(`Character root missing: ${o.id}; meshes=${source.meshes.length}; transforms=${source.transformNodes.length}; parents=${source.meshes.slice(0,3).map(m=>m.parent?.name??'null').join(',')}`);
    const strip = (n: string) => n.slice(n.indexOf(':') + 1);
    const nodes = new Map<string, TransformNode>();
    const meshes: AbstractMesh[] = [];
    for (const d of glRoot.getDescendants(false)) {
      if (d instanceof AbstractMesh) meshes.push(d);
      if (d instanceof TransformNode) nodes.set(strip(d.name), d);
    }
    const body = meshes.find((m) => /^superhero_/i.test(strip(m.name))) as Mesh;
    if (o.appearance === 'minh') {
      const sourceId = body.geometry!.id;
      const original = this.bodyIdx.get(sourceId);
      body.makeGeometryUnique();
      if (this.slimmed.has(sourceId)) this.slimmed.add(body.geometry!.id);
      if (original) body.setIndices(original);
    }
    // baked COLOR_0 is an AO/mask channel that darkens the skin under classic lighting
    for (const m of meshes) (m as Mesh).useVertexColors = false;
    const skeleton = inst.skeletons[0];
    if(o.appearance==='minh-v2'){
      if(!this.avatarV2)throw new Error('Minh v2 geometry is not loaded');
      const profile=o.avatar??readAvatar();for(const m of meshes)m.setEnabled(false);
      const parts:AbstractMesh[]=buildAvatar(this.scene,body,skeleton,this.avatarV2,profile,this.low,o.ritualMaster);
      const head=nodes.get('Head')!;glRoot.computeWorldMatrix(true);glRoot.getDescendants(false).forEach(d=>(d as TransformNode).computeWorldMatrix?.(true));
      const hi=(profile.hair==='short'?undefined:this.hair.get(profile.hair))?.instantiateModelsToScene(n=>`${tag}:hair:${n}`,false,{doNotInstantiate:true});
      if(hi){const hr=hi.rootNodes[0]as TransformNode;hr.computeWorldMatrix(true);for(const m of hr.getChildMeshes(false)){m.computeWorldMatrix(true);m.material=this.tint(m.material,o.hairColor??'#130e0b');m.setParent(head);m.isPickable=false;parts.push(m as Mesh);}hr.dispose();}
      const root=new TransformNode(`${tag}:char`,this.scene);glRoot.parent=root;glRoot.scaling.scaleInPlace((o.height??1.7)/1.83);
      const groups=this.retarget(tag,this.anims.animationGroups,nodes,n=>n);let flashTip:TransformNode|undefined;
      if(o.flashlight){const g=groups.get('Idle_Loop')!;g.start(false,1,g.from,g.from);g.goToFrame(g.from);this.scene.incrementRenderId();root.computeWorldMatrix(true);root.getDescendants(false).forEach(d=>(d as TransformNode).computeWorldMatrix?.(true));const fl=this.attachFlashlight(nodes,tag);parts.push(...fl.meshes);flashTip=fl.tip;g.stop();}
      return{root,nodes,meshes:parts,anim:new AnimController(groups),flashTip,dispose:()=>{for(const g of groups.values())g.dispose();const owned=new Set(parts.filter(m=>m.metadata?.avatarV2).map(m=>m.material));for(const material of owned){if(material instanceof StandardMaterial){if(material.name==='minh-v2-continuous-skin'){material.bumpTexture?.dispose();material.diffuseTexture?.dispose();}if(material.name==='ritual-brocade')material.diffuseTexture?.dispose();if(material.name==='minh-v2-brown-eyes')material.diffuseTexture?.dispose();}material?.dispose(false,false);}root.dispose(false,false);skeleton.dispose();}};
    }
    const height = o.height ?? 1.78;
    // hair / beard: static meshes authored around the T-posed body; re-parent to the head bone keeping world pose
    const head = nodes.get('Head')!;
    glRoot.computeWorldMatrix(true);
    glRoot.getDescendants(false).forEach((d) => (d as TransformNode).computeWorldMatrix?.(true));
    const attachStatic = (c: AssetContainer, color: string) => {
      const hi = c.instantiateModelsToScene((n) => `${tag}:hair:${n}`, false, { doNotInstantiate: true });
      const hr = hi.rootNodes[0] as TransformNode;
      hr.computeWorldMatrix(true);
      for (const m of hr.getChildMeshes(false)) {
        m.computeWorldMatrix(true);
        const mat = this.tint(m.material, color);
        m.material = mat;
        m.setParent(head);
        meshes.push(m);
      }
      hr.dispose();
    };
    // the eye mesh's skin weights point at the wrong joint; make it rigid and ride the head bone instead
    const eyes = meshes.find((m) => strip(m.name).startsWith('Eyes')) as Mesh | undefined;
    if (eyes) {
      eyes.skeleton = null;
      eyes.computeWorldMatrix(true);
      eyes.setParent(head);
      // slightly smaller, narrower eyes read closer to an East-Asian face on this base mesh
      eyes.setPivotPoint(eyes.getBoundingInfo().boundingBox.center.clone());
      eyes.scaling.multiplyInPlace(new Vector3(0.9, 0.7, 0.85));
    }
    if (o.hair !== 'none') attachStatic(this.hair.get(o.hair)!, o.hairColor ?? '#1b1512');
    if (o.beard) attachStatic(this.beard, o.hairColor ?? '#1b1512');
    body.material = this.tint(body.material, o.outfit.skin ?? '#ffffff');
    // fair skin: the source texture is tan, so add a warm pale base on top of it
    // texture is pre-baked to a fair tone (tools: T_*_Fair.png); a little warm emissive keeps faces readable in shade
    (body.material as StandardMaterial).diffuseColor = new Color3(1, 1, 1);
    (body.material as StandardMaterial).emissiveColor = new Color3(0.14, 0.11, 0.1);
    (body.material as StandardMaterial).bumpTexture = null;
    if (o.appearance === 'minh') {
      // Per-player clone: NPC/ghost materials must retain their own look.
      const skin = (body.material as StandardMaterial).clone(`${tag}:warm-skin`);
      skin.diffuseColor = Color3.FromHexString(o.outfit.skin ?? '#d9b69b');
      skin.emissiveColor.set(.025, .018, .012);
      skin.twoSidedLighting=true;
      skin.specularColor.set(.055, .045, .035); skin.specularPower = 32;
      body.material = skin;
    }
    const brows = meshes.find((m) => strip(m.name).startsWith('Eyebrows'));
    if (brows) brows.material = this.tint(brows.material, o.hairColor ?? '#1b1512');

    const sourceSkinNormals=o.appearance==='minh'?Array.from(body.getVerticesData(VertexBuffer.NormalKind)??[]):null;
    if (!o.female) this.slimBody(body, skeleton);
    if (o.appearance === 'minh') { refineMinhFace(body, skeleton); softenMinhNormals(body); }
    const outfit = this.buildOutfit(body, skeleton, o.outfit, tag, o.appearance === 'minh');
    meshes.push(...outfit);
    if (o.appearance === 'minh') meshes.push(...dressMinh(this.scene, body, skeleton, outfit, this.low));
    if(sourceSkinNormals?.length)body.setVerticesData(VertexBuffer.NormalKind,sourceSkinNormals);

    // props on bones
    if (o.hat) meshes.push(this.attachHat(nodes, o.hat, o.hatColor ?? '#7a6a3a', tag));
    if (o.topknot) meshes.push(...this.attachTopknot(nodes, o.hairColor ?? '#15100d', tag));

    const root = new TransformNode(`${tag}:char`, this.scene);
    glRoot.parent = root;
    const s = height / (o.female ? 1.72 : 1.83);
    glRoot.scaling.scaleInPlace(s);
    for (const m of meshes) { m.isPickable = false; m.alwaysSelectAsActiveMesh = false; }

    const groups = this.retarget(tag, this.anims.animationGroups, nodes, (n) => n);
    if (o.sword) {
      // Attach in the sword-holding pose so the blade sits right for every sword clip.
      const g = groups.get('Sword_Idle')!;
      g.start(false, 1, g.from, g.from);
      g.goToFrame(g.from);
      this.scene.incrementRenderId();
      root.computeWorldMatrix(true);
      root.getDescendants(false).forEach((d) => (d as TransformNode).computeWorldMatrix?.(true));
      const sw = this.attachSword(nodes, tag);
      sw.forEach((m) => (m.isPickable = false));
      meshes.push(...sw);
      g.stop();
    }
    let flashTip: TransformNode | undefined;
    if (o.flashlight) {
      const g = groups.get('Idle_Loop')!;
      g.start(false, 1, g.from, g.from);
      g.goToFrame(g.from);
      this.scene.incrementRenderId();
      root.computeWorldMatrix(true);
      root.getDescendants(false).forEach((d) => (d as TransformNode).computeWorldMatrix?.(true));
      const fl = this.attachFlashlight(nodes, tag);
      meshes.push(...fl.meshes);
      flashTip = fl.tip;
      g.stop();
    }
    const anim = new AnimController(groups);
    const sword = o.sword ? this.lastSword : null;
    return {
      root, anim, nodes, meshes, swordBase: sword?.base, swordTip: sword?.tip, flashTip,
      dispose: () => { anim.dispose(); root.dispose(false, false); skeleton.dispose(); },
    };
  }

  createWolf(id: string, length = 1.7): WolfRig {
    const tag = `${id}#${this.counter++}`;
    const inst = this.wolf.instantiateModelsToScene((n) => `${tag}:${n}`, false, { doNotInstantiate: true });
    const glRoot = inst.rootNodes[0] as TransformNode;
    const nodes = new Map<string, TransformNode>();
    const meshes: AbstractMesh[] = [];
    for (const d of glRoot.getDescendants(false)) {
      if (d instanceof AbstractMesh) meshes.push(d);
      if (d instanceof TransformNode) nodes.set(d.name.slice(d.name.indexOf(':') + 1), d);
    }
    for (const m of meshes) { m.material = this.tint(m.material, '#5b6170'); m.isPickable = false; }
    const root = new TransformNode(`${tag}:char`, this.scene);
    const pivot = new TransformNode(`${tag}:pivot`, this.scene);
    pivot.parent = root;
    glRoot.parent = pivot;
    // normalise size and facing from the bind-pose bounds (FBX export units/axes vary)
    glRoot.computeWorldMatrix(true);
    const { min, max } = glRoot.getHierarchyBoundingVectors(true);
    const size = max.subtract(min);
    const longX = size.x >= size.z;
    const k = length / Math.max(size.x, size.z);
    pivot.scaling.setAll(k);
    pivot.rotation.y = longX ? -Math.PI / 2 : 0; // head direction verified visually (see WOLF_FACING)
    pivot.rotation.y += WOLF_FACING;
    pivot.position.y = -min.y * k;
    const groups = this.retarget(tag, this.wolf.animationGroups, nodes, (n) => n);
    const anim = new AnimController(groups);
    return { root, anim, meshes, dispose: () => { anim.dispose(); root.dispose(false, false); inst.skeletons.forEach((s) => s.dispose()); } };
  }

  private tint(src: Material | null, hex: string): Material {
    const key = `${src?.uniqueId}|${hex}`;
    const hit = this.matCache.get(key);
    if (hit) return hit;
    const m = (src as StandardMaterial).clone(`${src?.name}_${hex}`) as StandardMaterial;
    m.diffuseColor = Color3.FromHexString(hex);
    this.matCache.set(key, m);
    return m;
  }

  private lastSword: { base: TransformNode; tip: TransformNode } | null = null;
  private outfitMat?: StandardMaterial;
  private bodyIdx = new Map<string, number[]>();
  private bodyTrimmed = new Set<string>();

  /**
   * Builds the clothing layer: a copy of the body surface pushed out along its normals, sharing the body's
   * skin weights (so it deforms exactly with every animation), vertex-coloured by region, minus head/hands.
   * Cuts: 'aodai' (fitted tunic, standing collar, raglan seam, front/back flaps split at the hips, silk trousers),
   * 'baba' (hip-length blouse with front buttons, loose dark trousers), 'robe' (cultivator robe + long skirt).
   */
  private buildOutfit(body: Mesh, skeleton: Skeleton, st: OutfitStyle, tag: string, minh = false): Mesh[] {
    const style = st.style ?? 'robe';
    const pos = body.getVerticesData(VertexBuffer.PositionKind)!;
    const nrm = body.getVerticesData(VertexBuffer.NormalKind)!;
    const mi = body.getVerticesData(VertexBuffer.MatricesIndicesKind)!;
    const mw = body.getVerticesData(VertexBuffer.MatricesWeightsKind)!;
    const gid = body.geometry!.id;
    // body geometry is shared by every clone of the same base; keep its original index list once
    if (!this.bodyIdx.has(gid)) this.bodyIdx.set(gid, Array.from(body.getIndices()!));
    const idx = this.bodyIdx.get(gid)!;
    const boneName = (i: number) => skeleton.bones[i]?.name.slice(skeleton.bones[i].name.indexOf(':') + 1) ?? '';
    const n = pos.length / 3;
    let y0 = Infinity, y1 = -Infinity;
    for (let i = 0; i < n; i++) { y0 = Math.min(y0, pos[i * 3 + 1]); y1 = Math.max(y1, pos[i * 3 + 1]); }
    const H = y1 - y0;
    const u = H / 1.83; // proportion unit (female base is shorter)
    const c = (h: string) => Color3.FromHexString(h);
    const C = { robe: c(st.robe), inner: c(st.inner), trousers: c(st.trousers), belt: c(st.belt), trim: c(st.trim), boots: c(st.boots) };
    const keep = new Uint8Array(n);
    const cover = new Uint8Array(n); // skin under cloth that every style hides
    const P: number[] = [], N: number[] = [], COL: number[] = [], I: number[] = [], W: number[] = [];
    const remap = new Int32Array(n).fill(-1);
    const dominant = (i: number) => {
      let best = 0, bw = -1;
      for (let k = 0; k < 4; k++) if (mw[i * 4 + k] > bw) { bw = mw[i * 4 + k]; best = mi[i * 4 + k]; }
      return boneName(best);
    };
    let leftSum = 0;
    for (let i = 0; i < n; i++) if (dominant(i) === 'thigh_l') leftSum += pos[i * 3];
    const leftX = Math.sign(leftSum) || 1;
    const rightSign = -leftX; // x sign of the wearer's right side
    for (let i = 0; i < n; i++) {
      const b = dominant(i);
      const y = (pos[i * 3 + 1] - y0) / H; // 0 feet .. 1 top of head
      const x = pos[i * 3], z = pos[i * 3 + 2];
      const nz = nrm[i * 3 + 2];
      if (b === 'Head' || /^(hand|index|middle|pinky|ring|thumb)_/.test(b)) continue;
      const neck = b === 'neck_01';
      if (neck && (style !== 'aodai' || y > 0.865)) continue;
      const leg = /^(thigh|calf)_/.test(b);
      const foot = /^(foot|ball)_/.test(b);
      if (minh && foot) continue; // visible toes; separate soles and straps, not painted-on boots
      const arm = /arm/.test(b);
      let off = 0.03, col = C.robe;
      if (style === 'aodai') {
        off = arm ? 0.016 : 0.013;
        if (neck) { off = 0.012; col = y > 0.852 ? C.trim : C.robe; } // standing mandarin collar
        if (leg) { off = 0.045; col = y < 0.06 ? C.trim : C.trousers; } // loose silk trousers
        if (/^lowerarm_/.test(b) && Math.abs(x) > 0.6 * u) col = C.trim; // cuff
        // raglan seam: diagonal from the collar to the wearer's right armpit
        const rx = (x * rightSign) / u;
        if (nz > 0 && rx > 0 && y > 0.72 && y < 0.84 && !arm) {
          const t = (0.84 - y) / 0.12;
          const lineX = 0.03 + t * 0.16;
          if (Math.abs(rx - lineX) < 0.011) col = C.trim;
        }
      } else if (style === 'baba') {
        off = arm ? (/^lowerarm_/.test(b) ? 0.04 : 0.028) : 0.022;
        if (leg) { off = 0.05; col = y < 0.05 ? C.trim : C.trousers; }
        if (!leg && !arm && nz > 0.55 && Math.abs(x) < 0.018 * u && y > 0.6 && y < 0.83 && ((y * 100) % 4.5) < 1.1) col = C.trim; // buttons
        if (/^lowerarm_/.test(b) && Math.abs(x) > 0.62 * u) col = C.trim;
      } else if (style === 'tee') {
        // áo phông (plain T-shirt, short sleeves) + quần short above the knee, bare forearms and calves, dép
        if (/^lowerarm_/.test(b) || /^calf_/.test(b)) continue;
        if (leg && y < 0.36) continue; // shorts end just above the knee
        off = arm ? 0.02 : 0.015;
        if (leg) { off = 0.028; col = C.trousers; }
        if (!leg && !arm && y > 0.83 && y < 0.85 && nz > 0.1) col = C.trim; // crew neck rib
        if (!minh && !leg && !arm && nz > 0.7 && Math.abs(x) < 0.06 * u && y > 0.7 && y < 0.76) col = C.inner;
        if (minh) {
          // Loose cotton, with small compression folds; shoulders keep their original weights.
          off += leg ? .012 : .009;
          off += .0025 * Math.sin(y * 155 + x * 24) * Math.sin(y * 83 - z * 19);
          if (leg && y < .39) col = C.trousers.scale(.84); // turned shorts hem
        }
      } else if (style === 'shirt') {
        // short-sleeved shirt tucked into trousers, bare forearms, sandals
        if (/^lowerarm_/.test(b)) continue;
        off = arm ? 0.022 : 0.016;
        if (leg) { off = 0.03; col = C.trousers; }
        if (!leg && !arm && y > 0.555 && y < 0.585) { col = C.belt; off = 0.02; }
        if (!leg && !arm && nz > 0.55 && Math.abs(x) < 0.014 * u && y > 0.6 && y < 0.82 && ((y * 100) % 4.5) < 1.0) col = C.trim; // buttons
        if (!leg && y > 0.805 && y < 0.84 && nz > 0.15) col = C.trim; // collar
        if (!leg && ((Math.floor((x / u) * 38) + Math.floor(y * 70)) & 1)) col = col.scale(0.9); // faded check
      } else {
        if (/^calf_/.test(b)) { off = 0.03; col = y < 0.12 ? C.trim : C.trousers; }
        else if (/^thigh_/.test(b)) { off = 0.03; col = C.trousers; }
        else if (/^lowerarm_/.test(b)) { off = 0.05; col = C.robe; }
        else if (/^upperarm_/.test(b)) { off = 0.038; col = C.robe; }
        if (y > 0.566 && y < 0.6 && !arm) { col = C.belt; off = 0.034; }
        if (nz > 0.35 && !arm && y > 0.79 && y < 0.87) {
          const half = (y - 0.79) * 1.5;
          const ax = Math.abs(x) / u;
          if (ax < half) col = C.inner;
          else if (ax < half + 0.022) col = C.trim;
        }
      }
      if (foot) { off = 0.012; col = C.boots; }
      keep[i] = 1;
      if (!/^(lowerarm|calf|thigh)_/.test(b)) cover[i] = 1;
      remap[i] = P.length / 3;
      P.push(x + nrm[i * 3] * off, pos[i * 3 + 1] + nrm[i * 3 + 1] * off, z + nrm[i * 3 + 2] * off);
      N.push(nrm[i * 3], nrm[i * 3 + 1], nrm[i * 3 + 2]);
      const shade = minh ? .96 + .025 * Math.sin(x * 9 + y * 13) : 0.92 + 0.08 * Math.sin(x * 40 + y * 70);
      COL.push(col.r * shade, col.g * shade, col.b * shade, 1);
      for (let k = 0; k < 4; k++) { I.push(mi[i * 4 + k]); W.push(mw[i * 4 + k]); }
    }
    const tri: number[] = [];
    for (let t = 0; t < idx.length; t += 3) {
      const a = idx[t], b2 = idx[t + 1], d = idx[t + 2];
      if (keep[a] && keep[b2] && keep[d]) tri.push(remap[a], remap[b2], remap[d]);
    }
    // hide skin under the clothes (no poke-through, less overdraw); same rule for every clone of this body
    if (!this.bodyTrimmed.has(gid)) {
      const skin: number[] = [];
      for (let t = 0; t < idx.length; t += 3) if (!(cover[idx[t]] && cover[idx[t + 1]] && cover[idx[t + 2]])) skin.push(idx[t], idx[t + 1], idx[t + 2]);
      body.setIndices(skin);
      this.bodyTrimmed.add(gid);
    }
    const out = [this.skinnedMesh(`${tag}:outfit`, body, skeleton, P, N, COL, tri, I, W)];
    if (style === 'aodai') {
      // two flaps, front and back, split at the sides from the waist down to mid-calf
      out.push(this.buildPanel(body, skeleton, `${tag}:flapF`, y0, H, leftX, 0, 0.56, 0.17, 0.95, 0.75, C.robe));
      out.push(this.buildPanel(body, skeleton, `${tag}:flapB`, y0, H, leftX, Math.PI, 0.56, 0.17, 0.95, 0.75, C.robe));
    } else if (style === 'baba') {
      out.push(this.buildPanel(body, skeleton, `${tag}:hem`, y0, H, leftX, 0, 0.575, 0.48, Math.PI, 1.05, C.robe));
    } else if (st.skirt) {
      out.push(this.buildPanel(body, skeleton, `${tag}:skirt`, y0, H, leftX, 0, 0.56, 0.24, Math.PI, 1.0, C.robe));
    }
    if (import.meta.env.DEV) console.debug('[outfit]', tag, style, { verts: n, kept: P.length / 3, H });
    return out;
  }

  private skinnedMesh(name: string, body: Mesh, skeleton: Skeleton, P: number[], N: number[], COL: number[], T: number[], I: number[], W: number[]): Mesh {
    const mesh = new Mesh(name, this.scene);
    const vd = new VertexData();
    vd.positions = P; vd.normals = N; vd.colors = COL; vd.indices = T; vd.matricesIndices = I; vd.matricesWeights = W;
    vd.applyToMesh(mesh);
    mesh.parent = body.parent;
    mesh.position.copyFrom(body.position);
    if (body.rotationQuaternion) mesh.rotationQuaternion = body.rotationQuaternion.clone();
    mesh.scaling.copyFrom(body.scaling);
    mesh.skeleton = skeleton;
    mesh.material = this.outfitMaterial();
    return mesh;
  }

  private outfitMaterial() {
    if (!this.outfitMat) {
      const m = new StandardMaterial('outfit', this.scene);
      m.diffuseColor = Color3.White();
      m.specularColor = new Color3(0.1, 0.1, 0.1);
      m.specularPower = 20;
      m.backFaceCulling = false;
      this.outfitMat = m;
    }
    return this.outfitMat;
  }

  /**
   * Hanging cloth panel (part of an elliptical cone) from `top` to `bottom` (fractions of height),
   * centred on angle `center` (0 = front) spanning ±halfArc. Skinned pelvis → thighs (→ calves at the hem).
   */
  private buildPanel(body: Mesh, skeleton: Skeleton, name: string, y0: number, H: number, leftX: number,
    center: number, top: number, bottom: number, halfArc: number, flare: number, col: Color3): Mesh {
    const bi = (nm: string) => skeleton.bones.findIndex((b) => b.name === nm || b.name.endsWith(`:${nm}`));
    const pelvis = bi('pelvis'), tl = bi('thigh_l'), tr = bi('thigh_r'), cl = bi('calf_l'), cr = bi('calf_r');
    const u = H / 1.83;
    const seg = 20, rows = 8;
    const yT = y0 + H * top, yB = y0 + H * bottom;
    const rTop = 0.165 * u, rBot = (0.165 + 0.13 * flare) * u;
    const P: number[] = [], N: number[] = [], COL: number[] = [], I: number[] = [], W: number[] = [], T: number[] = [];
    const trim = col.scale(1.3);
    for (let r = 0; r <= rows; r++) {
      const t = r / rows;
      const y = yT + (yB - yT) * t;
      const rad = rTop + (rBot - rTop) * t;
      for (let s = 0; s <= seg; s++) {
        const a = center + (s / seg - 0.5) * 2 * halfArc;
        const x = Math.sin(a) * rad, z = Math.cos(a) * rad * 0.8;
        P.push(x, y, z);
        N.push(Math.sin(a), 0.15, Math.cos(a));
        const cc = t > 0.92 ? trim : col;
        const shade = 0.88 + 0.12 * Math.abs(Math.sin(a * 5 + t));
        COL.push(cc.r * shade, cc.g * shade, cc.b * shade, 1);
        const side = Math.max(0, Math.min(1, 0.5 + (x * leftX) / (rad * 1.2))); // 1 → left leg
        const sideness = Math.abs(Math.sin(a));
        const legW = Math.min(1, t * 1.2) * (0.45 + 0.5 * sideness);
        const wc = Math.max(0, t - 0.75) * 0.5;
        I.push(pelvis, tl, tr, side > 0.5 ? cl : cr);
        W.push(Math.max(0, 1 - legW), legW * side * (1 - wc), legW * (1 - side) * (1 - wc), wc);
      }
    }
    for (let r = 0; r < rows; r++) for (let s = 0; s < seg; s++) {
      const a = r * (seg + 1) + s, b = a + seg + 1;
      T.push(a, b, a + 1, a + 1, b, b + 1);
    }
    for (let i = 0; i < W.length; i += 4) {
      const sum = W[i] + W[i + 1] + W[i + 2] + W[i + 3] || 1;
      for (let k = 0; k < 4; k++) W[i + k] /= sum;
    }
    return this.skinnedMesh(name, body, skeleton, P, N, COL, T, I, W);
  }

  /**
   * Parents `holder` to a bone so that, in the bind pose, the holder sits at `worldPos` with world rotation `worldRot`.
   * Props are then authored in plain metres / character axes (+Y up, +Z forward) regardless of bone axes.
   */
  private attachAtBind(bone: TransformNode, holder: TransformNode, worldPos: Vector3, worldRot: Quaternion) {
    bone.computeWorldMatrix(true);
    const desired = Matrix.Compose(new Vector3(1, 1, 1), worldRot, worldPos);
    const local = desired.multiply(bone.getWorldMatrix().clone().invert());
    const sc = new Vector3(), rq = new Quaternion(), tr = new Vector3();
    local.decompose(sc, rq, tr);
    holder.parent = bone;
    holder.scaling.copyFrom(sc);
    holder.rotationQuaternion = rq;
    holder.position.copyFrom(tr);
  }

  private attachSword(nodes: Map<string, TransformNode>, tag: string): AbstractMesh[] {
    const s = this.scene;
    const hand = nodes.get('hand_r')!, fore = nodes.get('lowerarm_r')!, mid = nodes.get('middle_01_r');
    [fore, hand, mid].forEach((n) => n?.computeWorldMatrix(true));
    const hp = hand.getAbsolutePosition().clone();
    const knuckle = (mid ?? hand).getAbsolutePosition();
    const armDir = hp.subtract(fore.getAbsolutePosition()).normalize();
    // grip sits in the palm, a bit past the wrist and below the knuckle line
    const grip = Vector3.Lerp(hp, knuckle, 0.6);
    const holder = new TransformNode(`${tag}:swordHolder`, s);
    // blade (+Y of the prop) points forward from the closed fist: rotate +Y → +Z
    // blade (+Y of the prop) points to the character's front (+Z in bind pose), tilted slightly up
    // character forward = +Z (root yaw 0); blade forward and raised like a guard stance
    const fwd = new Vector3(0, 0, 1);
    const q = new Quaternion();
    Quaternion.FromUnitVectorsToRef(Vector3.Up(), fwd.add(new Vector3(0, SWORD_LIFT, 0)).normalize(), q);
    void armDir;
    this.attachAtBind(hand, holder, grip, q);
    const mk = (name: string, w: number, h: number, d: number, y: number, hex: string, em = 0) => {
      const m = MeshBuilder.CreateBox(`${tag}:${name}`, { width: w, height: h, depth: d }, s);
      m.position.y = y;
      const mat = new StandardMaterial(`${name}${hex}`, s);
      mat.diffuseColor = Color3.FromHexString(hex);
      mat.specularColor = new Color3(0.7, 0.7, 0.7);
      mat.specularPower = 48;
      if (em) mat.emissiveColor = Color3.FromHexString(hex).scale(em);
      m.material = mat;
      m.parent = holder;
      return m;
    };
    const baseN = new TransformNode(`${tag}:swordBase`, s); baseN.parent = holder; baseN.position.y = 0.16;
    const tipN = new TransformNode(`${tag}:swordTip`, s); tipN.parent = holder; tipN.position.y = 0.98;
    this.lastSword = { base: baseN, tip: tipN };
    const tip = MeshBuilder.CreateCylinder(`${tag}:tip`, { diameterTop: 0, diameterBottom: 0.036, height: 0.08, tessellation: 4 }, s);
    tip.parent = holder; tip.position.y = 0.97; tip.scaling.z = 0.25;
    const blade = mk('blade', 0.036, 0.8, 0.009, 0.53, '#d6e6ea', 0.12);
    tip.material = blade.material;
    return [blade, tip,
      mk('guard', 0.12, 0.022, 0.035, 0.12, '#b08a3a'),
      mk('grip', 0.028, 0.16, 0.028, 0.03, '#2a1d14'),
      mk('pommel', 0.04, 0.03, 0.04, -0.06, '#b08a3a'),
    ];
  }

  private slimmed = new Set<string>();
  /**
   * The base male mesh is a bodybuilder. Pull every limb/torso vertex toward its bone's principal axis
   * (blended by skin weights so there are no seams) to get an ordinary slim Vietnamese build.
   * Shared geometry: done once per base mesh.
   */
  private slimBody(body: Mesh, skeleton: Skeleton) {
    const gid = body.geometry!.id;
    if (this.slimmed.has(gid)) return;
    this.slimmed.add(gid);
    const pos = Array.from(body.getVerticesData(VertexBuffer.PositionKind)!);
    const mi = body.getVerticesData(VertexBuffer.MatricesIndicesKind)!;
    const mw = body.getVerticesData(VertexBuffer.MatricesWeightsKind)!;
    const n = pos.length / 3, nb = skeleton.bones.length;
    const name = (i: number) => skeleton.bones[i]?.name.slice(skeleton.bones[i].name.indexOf(':') + 1) ?? '';
    const fac = (b: string): [number, number] => {
      if (/^upperarm_/.test(b)) return [0.62, 0.62];
      if (/^lowerarm_/.test(b)) return [0.72, 0.72];
      if (/^thigh_/.test(b)) return [0.8, 0.8];
      if (/^calf_/.test(b)) return [0.8, 0.8];
      if (/^spine_0[23]/.test(b)) return [0.78, 0.84];
      if (/^spine_01/.test(b)) return [0.84, 0.88];
      if (/^clavicle_/.test(b)) return [0.8, 0.86];
      if (b === 'neck_01') return [0.88, 0.88];
      if (b === 'pelvis') return [0.94, 0.95];
      return [1, 1];
    };
    const dom = new Int32Array(n);
    for (let i = 0; i < n; i++) {
      let best = 0, bw = -1;
      for (let k = 0; k < 4; k++) if (mw[i * 4 + k] > bw) { bw = mw[i * 4 + k]; best = mi[i * 4 + k]; }
      dom[i] = best;
    }
    const mean = new Float64Array(nb * 3), cnt = new Float64Array(nb);
    for (let i = 0; i < n; i++) { const b = dom[i]; cnt[b]++; for (let a = 0; a < 3; a++) mean[b * 3 + a] += pos[i * 3 + a]; }
    for (let b = 0; b < nb; b++) if (cnt[b]) for (let a = 0; a < 3; a++) mean[b * 3 + a] /= cnt[b];
    const cov = new Float64Array(nb * 9);
    for (let i = 0; i < n; i++) {
      const b = dom[i];
      const d = [pos[i * 3] - mean[b * 3], pos[i * 3 + 1] - mean[b * 3 + 1], pos[i * 3 + 2] - mean[b * 3 + 2]];
      for (let r = 0; r < 3; r++) for (let c = 0; c < 3; c++) cov[b * 9 + r * 3 + c] += d[r] * d[c];
    }
    const axis = new Float64Array(nb * 3);
    for (let b = 0; b < nb; b++) {
      let v = [0.3, 1, 0.2];
      for (let it = 0; it < 24; it++) {
        const w = [0, 1, 2].map((r) => cov[b * 9 + r * 3] * v[0] + cov[b * 9 + r * 3 + 1] * v[1] + cov[b * 9 + r * 3 + 2] * v[2]);
        const l = Math.hypot(w[0], w[1], w[2]) || 1;
        v = w.map((x) => x / l);
      }
      // torso: always pull toward a vertical line so the chest and belly stay upright
      if (/^(spine|pelvis|neck)/.test(name(b))) v = [0, 1, 0];
      axis.set(v, b * 3);
    }
    const out = pos.slice();
    for (let i = 0; i < n; i++) {
      let nx = 0, ny = 0, nz = 0, wsum = 0;
      for (let k = 0; k < 4; k++) {
        const w = mw[i * 4 + k];
        if (w <= 0) continue;
        const b = mi[i * 4 + k];
        const [fx, fz] = fac(name(b));
        const m = [mean[b * 3], mean[b * 3 + 1], mean[b * 3 + 2]], ax = [axis[b * 3], axis[b * 3 + 1], axis[b * 3 + 2]];
        const p = [pos[i * 3], pos[i * 3 + 1], pos[i * 3 + 2]];
        const t = (p[0] - m[0]) * ax[0] + (p[1] - m[1]) * ax[1] + (p[2] - m[2]) * ax[2];
        const c = [m[0] + ax[0] * t, m[1] + ax[1] * t, m[2] + ax[2] * t];
        nx += w * (c[0] + (p[0] - c[0]) * fx);
        ny += w * (c[1] + (p[1] - c[1]) * (fx + fz) / 2);
        nz += w * (c[2] + (p[2] - c[2]) * fz);
        wsum += w;
      }
      if (wsum > 0) { out[i * 3] = nx / wsum; out[i * 3 + 1] = ny / wsum; out[i * 3 + 2] = nz / wsum; }
    }
    body.geometry!.setVerticesData(VertexBuffer.PositionKind, out, false);
    body.refreshBoundingInfo();
  }

  /** Translucent, pale, hollow-eyed version of a character (ghosts). */
  ghostify(rig: HumanRig, alpha = 0.55, tint = '#dfe8ee', glow = new Color3(0.26, 0.31, 0.36)) {
    for (const m of rig.meshes) {
      const src = m.material as StandardMaterial | null;
      if (!src) continue;
      const eyes = /:Eyes/.test(m.name);
      const key = `${src.uniqueId}|ghost|${alpha}|${tint}|${eyes}`;
      let g = this.matCache.get(key) as StandardMaterial | undefined;
      if (!g) {
        g = src.clone(`${src.name}_ghost`) as StandardMaterial;
        g.alpha = eyes ? 1 : alpha;
        g.diffuseColor = eyes ? Color3.Black() : g.diffuseColor.multiply(Color3.FromHexString(tint));
        g.emissiveColor = eyes ? Color3.Black() : glow;
        g.specularColor = Color3.Black();
        g.needDepthPrePass = !eyes;
        g.backFaceCulling = false;
        this.matCache.set(key, g);
      }
      m.material = g;
    }
    dressCrouchingGhost(this.scene, rig, this.low);
  }

  /** Small torch in the right fist pointing forward/down; returns the lens node for the beam origin. */
  private attachFlashlight(nodes: Map<string, TransformNode>, tag: string): { meshes: AbstractMesh[]; tip: TransformNode } {
    const s = this.scene;
    const hand = nodes.get('hand_r')!, mid = nodes.get('middle_01_r');
    [hand, mid].forEach((n) => n?.computeWorldMatrix(true));
    const hp = hand.getAbsolutePosition().clone();
    const grip = Vector3.Lerp(hp, (mid ?? hand).getAbsolutePosition(), 0.55);
    const holder = new TransformNode(`${tag}:torchHolder`, s);
    const q = new Quaternion();
    Quaternion.FromUnitVectorsToRef(Vector3.Up(), new Vector3(0, -0.35, 1).normalize(), q);
    this.attachAtBind(hand, holder, grip, q);
    const mat = new StandardMaterial(`torch${tag}`, s);
    mat.diffuseColor = Color3.FromHexString('#2a2c30'); mat.specularColor = new Color3(0.5, 0.5, 0.5);
    const lensMat = new StandardMaterial(`torchLens${tag}`, s);
    lensMat.emissiveColor = new Color3(1, 0.95, 0.8); lensMat.disableLighting = true;
    const body = MeshBuilder.CreateCylinder(`${tag}:torch`, { diameter: 0.035, height: 0.17, tessellation: 10 }, s);
    body.position.y = 0.05; body.material = mat; body.parent = holder;
    const headM = MeshBuilder.CreateCylinder(`${tag}:torchHead`, { diameterTop: 0.055, diameterBottom: 0.038, height: 0.05, tessellation: 12 }, s);
    headM.position.y = 0.16; headM.material = mat; headM.parent = holder;
    const lens = MeshBuilder.CreateCylinder(`${tag}:torchLens`, { diameter: 0.048, height: 0.006, tessellation: 12 }, s);
    lens.position.y = 0.186; lens.material = lensMat; lens.parent = holder;
    const tip = new TransformNode(`${tag}:torchTip`, s); tip.parent = holder; tip.position.y = 0.2;
    return { meshes: [body, headM, lens], tip };
  }

  private attachTopknot(nodes: Map<string, TransformNode>, hex: string, tag: string): AbstractMesh[] {
    const s = this.scene;
    const head = nodes.get('Head')!;
    head.computeWorldMatrix(true);
    const holder = new TransformNode(`${tag}:knotHolder`, s);
    this.attachAtBind(head, holder, head.getAbsolutePosition().add(new Vector3(0, HAT_HEIGHT - 0.02, -0.03)), Quaternion.Identity());
    const bun = MeshBuilder.CreateSphere(`${tag}:bun`, { diameter: 0.11, segments: 10 }, s);
    bun.scaling.y = 0.8;
    const mat = new StandardMaterial(`bun${hex}`, s);
    mat.diffuseColor = Color3.FromHexString(hex);
    mat.specularColor = new Color3(0.15, 0.15, 0.15);
    bun.material = mat;
    bun.parent = holder;
    const pin = MeshBuilder.CreateCylinder(`${tag}:pin`, { diameter: 0.012, height: 0.2, tessellation: 6 }, s);
    pin.rotation.z = Math.PI / 2;
    const pm = new StandardMaterial('jadePin', s);
    pm.diffuseColor = Color3.FromHexString('#9fe0c4');
    pm.emissiveColor = Color3.FromHexString('#2a5a48');
    pin.material = pm;
    pin.parent = holder;
    return [bun, pin];
  }

  private attachHat(nodes: Map<string, TransformNode>, kind: 'conical' | 'cap', hex: string, tag: string): AbstractMesh {
    const s = this.scene;
    const head = nodes.get('Head')!;
    head.computeWorldMatrix(true);
    const top = head.getAbsolutePosition().add(new Vector3(0, HAT_HEIGHT, 0.01));
    const holder = new TransformNode(`${tag}:hatHolder`, s);
    this.attachAtBind(head, holder, top, Quaternion.Identity());
    const m = kind === 'conical'
      ? MeshBuilder.CreateCylinder(`${tag}:hat`, { diameterTop: 0, diameterBottom: 0.6, height: 0.2, tessellation: 20 }, s)
      : MeshBuilder.CreateCylinder(`${tag}:hat`, { diameterTop: 0.21, diameterBottom: 0.25, height: 0.12, tessellation: 16 }, s);
    const mat = new StandardMaterial(`hat${hex}`, s);
    mat.diffuseColor = Color3.FromHexString(hex);
    mat.specularColor = Color3.Black();
    mat.backFaceCulling = false;
    m.material = mat;
    m.parent = holder;
    return m;
  }
}

/** Hat sits this far above the head bone origin (bind pose, metres). */
export const HAT_HEIGHT = 0.17;
/** Upward tilt of the blade in the guard pose (0 = level, 1 = 45°). */
export const SWORD_LIFT = 0.2;
/** Extra yaw for the converted wolf model if its head points backwards. */
export const WOLF_FACING = 0;
