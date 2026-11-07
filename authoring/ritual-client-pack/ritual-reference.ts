// ============================================================================
// ritual-reference.ts — REFERENCE implementation for the temple game's ritual
// feature: gõ mõ (wooden fish) / gõ chuông (singing bowl) / lần chuỗi hạt
// (prayer beads). Each tap = +1 merit (công đức), server-enforced.
//
// STATUS: reference code for Claude to adapt into the Babylon.js client.
// It is NOT a drop-in file: the marked ASSUMPTION points must be matched to
// the real client's scene / send / sound / UI helpers before use.
//
// SOUND CHOICES (decided by the game owner — do not swap silently):
//   - mõ      -> the game's REAL file /assets/amb/chua_mo_tram.mp3
//                (deep knock, 1.0 s; alternate: chua_mo.mp3, brighter, 0.65 s)
//   - chuông  -> the game's REAL file /assets/amb/chua_bell.mp3
//                (40 s long bell ambience — see fade-out note in playBell())
//   - beads   -> bead-tick.mp3 (SYNTHESIZED tick, shipped in this pack —
//                the game has NO real bead-tick file; this is the only tick
//                available. Do NOT reuse chua_mo_tram.mp3 for the beads.)
// The synthesized mo.mp3 / chuong.mp3 in sounds/ are SUPERSEDED and must
// NOT be used — the game's real files above replace them.
//
// MODELS (GLB, Y-up, meters, PBR, in /assets/sanctuary/ritual/):
//   chuong_v2.glb      golden singing bowl, Ø 0.43 m, 0.223 m tall
//   mo_v2.glb          carved wooden fish, 0.356 x 0.230 x 0.283 m (long on X)
//   goi_v2.glb         red cushion w/ gold lotus, Ø 0.458 m, 0.134 m tall
//   dui_chuong_v2.glb  dark handle + YELLOW padded head, 0.366 m long
//   dui_mo_v2.glb      light handle + WOODEN ball head, 0.357 m long
//   chuoi_v2.glb       108 dark beads Ø 12 mm, flat oval loop 0.272 x 0.287 m,
//                      gold guru bead + red tassel; loop in XZ plane
//   (Origins: bowl/mõ/cushion = bottom center; mallets = handle end, head
//   toward +Z in model space; beads = loop center, tassel toward -Z, loop
//   center offset ~0.05 m toward +Z from the GLB origin.)
//
// SERVER CONTRACT (server patch written separately by Muse):
//   client -> server: { t: 'ritual', kind: 'mo' | 'chuong' | 'chuoi' }
//   server -> client: { t: 'merit', m, note }   (+1 merit; note e.g.
//                     '+1 công đức · gõ mõ') — already handled by the
//                     existing client merit handler, no new code needed.
//   server -> client: { t: 'notice', text }     (2 s shared cooldown, or
//                     player not in the main hall) — already handled by the
//                     existing client notice handler.
//   Client ALSO throttles locally (2 s, shared across kinds) so a tap on
//   cooldown shows a local notice instead of spamming the socket.
// ============================================================================

import { Scene } from "@babylonjs/core/scene";
import { TransformNode } from "@babylonjs/core/Meshes/transformNode";
import { AbstractMesh } from "@babylonjs/core/Meshes/abstractMesh";
import { Vector3 } from "@babylonjs/core/Maths/math.vector";
import { ArcRotateCamera } from "@babylonjs/core/Cameras/arcRotateCamera";
import { Animation } from "@babylonjs/core/Animations/animation";
import { CubicEase, EasingFunction } from "@babylonjs/core/Animations/easing";
import { SceneLoader } from "@babylonjs/core/Loading/sceneLoader";
import { Sound } from "@babylonjs/core/Audio/sound";
import { MeshBuilder } from "@babylonjs/core/Meshes/meshBuilder";
import { StandardMaterial } from "@babylonjs/core/Materials/standardMaterial";
import { Color3 } from "@babylonjs/core/Maths/math.color";
import { ActionManager } from "@babylonjs/core/Actions/actionManager";
import { ExecuteCodeAction } from "@babylonjs/core/Actions/directActions";
// ASSUMPTION (imports): the client may import Babylon through its own
// wrappers (thinEngine / .pure modules) instead of "@babylonjs/core".
// Adapt the import paths; the API calls below are standard Babylon.js.

export type RitualKind = "mo" | "chuong" | "chuoi";

/** Hooks the host client must provide. */
export interface RitualDeps {
  /** The Babylon scene the ritual view lives in. */
  scene: Scene;
  /** Send a message on the existing game WebSocket. */
  send: (msg: unknown) => void;
  /** Show a short toast/notice to the player (reuse the client's own). */
  showToast: (text: string) => void;
  /** Optional: lock/unlock player movement while the overlay is open. */
  setPlayerControlsEnabled?: (enabled: boolean) => void;
  /** Optional: called when the player asks to close the ritual view. */
  onClose?: () => void;
}

// --- TUNING constants (verify in the live scene; values below are from the
// model specs + the reference photo layout, not measured in-game) ----------
const MODEL_DIR = "/assets/sanctuary/ritual/";
const SOUND_MO = "/assets/amb/chua_mo_tram.mp3"; // deep knock (alt: chua_mo.mp3)
const SOUND_CHUONG = "/assets/amb/chua_bell.mp3"; // 40 s — fades out (see below)
const SOUND_BEAD = "/assets/sanctuary/ritual/bead-tick.mp3"; // synthesized tick
const THROTTLE_MS = 2000; // must match the server's shared cooldown
const BEAD_COUNT = 108;

const TABLE_Y = 0; // altar table top in ritual-view local space
const CUSHION_H = 0.134;
const BOWL_POS = new Vector3(-0.38, TABLE_Y + CUSHION_H, 0);
const MO_POS = new Vector3(0.38, TABLE_Y + CUSHION_H, 0);
const BEADS_POS = new Vector3(0, TABLE_Y + 0.012, 0.42);
// Bead loop ellipse (from chuoi_v2 spec) + the GLB's center offset.
const BEAD_RX = 0.136;
const BEAD_RZ = 0.1435;
const BEAD_CENTER_OFFSET_Z = 0.05;
const BELL_FADE_AFTER_MS = 6000; // start fading the 40 s bell file after 6 s
const BELL_FADE_MS = 1500;

export class RitualView {
  private deps: RitualDeps;
  private root: TransformNode;
  private camera: ArcRotateCamera;
  private prevCamera: unknown = null;
  private loaded = false;
  private open_ = false;
  private lastSent = 0;
  private beadIndex = 0;
  private beadMarker: AbstractMesh | null = null;
  private malletMo: TransformNode | null = null; // swing pivot, handle-end origin
  private malletChuong: TransformNode | null = null;
  private bowlMesh: AbstractMesh | null = null;
  private moMesh: AbstractMesh | null = null;
  private sounds = new Map<string, Sound>();
  private striking = false;

  constructor(deps: RitualDeps) {
    this.deps = deps;
    this.root = new TransformNode("ritualRoot", deps.scene);
    this.root.setEnabled(false);
    // Close-up camera for the ritual view (front-on, slightly above).
    this.camera = new ArcRotateCamera(
      "ritualCamera",
      0, // alpha: straight in front (+Z looking toward -Z)
      1.05, // beta: slightly above horizontal
      1.15, // radius
      new Vector3(0, 0.22, 0.1),
      deps.scene,
    );
    this.camera.lowerRadiusLimit = 0.6;
    this.camera.upperRadiusLimit = 1.8;
  }

  /** Load the 6 GLBs + 3 sounds. Call once at startup (or lazily on first open). */
  async load(): Promise<void> {
    if (this.loaded) return;
    const scene = this.deps.scene;
    const load = async (file: string): Promise<AbstractMesh> => {
      const r = await SceneLoader.ImportMeshAsync("", MODEL_DIR, file, scene);
      const m = r.meshes[0] as AbstractMesh;
      m.parent = this.root;
      return m;
    };

    // Cushions first (they sit on the table), then bowl / mõ on top.
    const cushionL = await load("goi_v2.glb");
    cushionL.position = new Vector3(-0.38, TABLE_Y, 0);
    const cushionR = await load("goi_v2.glb");
    cushionR.position = new Vector3(0.38, TABLE_Y, 0);

    this.bowlMesh = await load("chuong_v2.glb");
    this.bowlMesh.position = BOWL_POS;
    this.moMesh = await load("mo_v2.glb");
    this.moMesh.position = MO_POS;
    // The mõ is long on X with its slit mouth facing +Z (toward the camera).

    // Beads loop lying flat in front, tassel toward the camera (-Z in GLB
    // space becomes +Z after we rotate the root 180° — see note below).
    const beads = await load("chuoi_v2.glb");
    beads.position = BEADS_POS;
    // ASSUMPTION (beads orientation): the GLB loop lies in the XZ plane
    // with the tassel toward -Z. If the tassel points away from the camera
    // in-game, add beads.rotation.y = Math.PI.

    // Mallets: each under its own swing pivot at the handle end.
    // Rest pose = raised above its target ("held" pose); the swing rotates
    // the pivot down onto the target. (The reference photo shows the
    // mallets lying on the table — if Claude prefers that, add a quick
    // lift phase before the downswing; the hit timing below stays the same.)
    this.malletChuong = this.makeMalletPivot(
      await load("dui_chuong_v2.glb"),
      new Vector3(BOWL_POS.x + 0.34, BOWL_POS.y + 0.22 + 0.223, BOWL_POS.z),
      "chuong",
    );
    this.malletMo = this.makeMalletPivot(
      await load("dui_mo_v2.glb"),
      new Vector3(MO_POS.x + 0.34, MO_POS.y + 0.22 + 0.23, MO_POS.z),
      "mo",
    );

    // Bead highlight marker: a small glowing sphere that jumps to the
    // current bead. (The 108 beads are joined into ONE mesh in the GLB,
    // so per-bead emissive is not possible without rebuilding the model
    // with separate bead meshes — the marker is the simple robust way.)
    this.beadMarker = MeshBuilder.CreateSphere(
      "beadMarker",
      { diameter: 0.022 },
      scene,
    );
    const mat = new StandardMaterial("beadMarkerMat", scene);
    mat.emissiveColor = new Color3(1, 0.75, 0.2);
    mat.disableLighting = true;
    this.beadMarker.material = mat;
    this.beadMarker.parent = this.root;
    this.beadMarker.setEnabled(false);

    // Sounds (loaded once; the spatial modules attach them to meshes).
    this.sounds.set("mo", new Sound("sfxMo", SOUND_MO, scene, null, {
      loop: false, autoplay: false, volume: 1, spatialSound: true,
    }));
    this.sounds.set("chuong", new Sound("sfxChuong", SOUND_CHUONG, scene, null, {
      loop: false, autoplay: false, volume: 0.9, spatialSound: true,
    }));
    this.sounds.set("bead", new Sound("sfxBead", SOUND_BEAD, scene, null, {
      loop: false, autoplay: false, volume: 0.9, spatialSound: false,
    }));
    // ASSUMPTION (sound): if the client has its own spatial-audio helper
    // (webAudioSoundSource / spatialWebAudio modules), use that instead of
    // `new Sound` and attach each sound to its target mesh.

    this.loaded = true;
  }

  /** Attach a world mesh (e.g. the mõ/bowl in the main hall, or an invisible
   *  trigger box in front of the altar) so tapping it opens this view. */
  attachWorldTrigger(mesh: AbstractMesh): void {
    if (!mesh.actionManager) {
      mesh.actionManager = new ActionManager(this.deps.scene);
    }
    mesh.actionManager.registerAction(
      new ExecuteCodeAction(ActionManager.OnPickTrigger, () => void this.open()),
    );
  }

  async open(): Promise<void> {
    await this.load();
    if (this.open_) return;
    this.open_ = true;
    this.root.setEnabled(true);
    this.prevCamera = this.deps.scene.activeCamera;
    this.deps.scene.activeCamera = this.camera;
    this.camera.attachControl(true);
    this.deps.setPlayerControlsEnabled?.(false);
  }

  close(): void {
    if (!this.open_) return;
    this.open_ = false;
    this.root.setEnabled(false);
    if (this.prevCamera) {
      this.deps.scene.activeCamera = this.prevCamera as never;
    }
    this.camera.detachControl();
    this.deps.setPlayerControlsEnabled?.(true);
    this.deps.onClose?.();
  }

  get isOpen(): boolean {
    return this.open_;
  }

  /** Tap the bowl or the mõ in the overlay: swing, sound on impact, +1 merit. */
  strike(kind: "mo" | "chuong"): void {
    if (!this.open_ || this.striking) return;
    if (!this.trySend(kind)) return; // throttled: local notice, no swing
    this.striking = true;
    const pivot = kind === "mo" ? this.malletMo : this.malletChuong;
    const target = kind === "mo" ? this.moMesh : this.bowlMesh;
    if (!pivot || !target) { this.striking = false; return; }

    // Swing: raised (+0.35 rad) -> hit (-0.65 rad) fast, sound EXACTLY at
    // impact, then return to raised. Angles are TUNING — verify the head
    // lands on the target top in the live scene.
    const REST = 0.35;
    const HIT = -0.65;
    pivot.rotation.z = REST;
    Animation.CreateAndStartAnimation(
      "malletDown", pivot, "rotation.z", 60, 8, REST, HIT,
      Animation.ANIMATIONLOOPMODE_CONSTANT,
      this.easeIn(),
      () => {
        this.playStrikeSound(kind, target);
        this.pulseTarget(target);
        Animation.CreateAndStartAnimation(
          "malletUp", pivot, "rotation.z", 60, 21, HIT, REST,
          Animation.ANIMATIONLOOPMODE_CONSTANT,
          this.easeOut(),
          () => { this.striking = false; },
        );
      },
    );
  }

  /** Tap the beads: advance exactly ONE bead, tick sound, +1 merit. */
  countBead(): void {
    if (!this.open_) return;
    if (!this.trySend("chuoi")) return; // throttled: local notice
    const pos = this.beadPosition(this.beadIndex);
    if (this.beadMarker) {
      this.beadMarker.position = pos;
      this.beadMarker.setEnabled(true);
      this.pulseMarker();
    }
    this.sounds.get("bead")?.play();
    this.beadIndex = (this.beadIndex + 1) % BEAD_COUNT;
    if (this.beadIndex === 0) {
      this.deps.showToast("Đã lần hết một vòng (108 hạt)");
    }
  }

  // --- internals ----------------------------------------------------------

  /** 2 s shared client-side throttle. Returns false when the tap is blocked. */
  private trySend(kind: RitualKind): boolean {
    const now = Date.now();
    if (now - this.lastSent < THROTTLE_MS) {
      this.deps.showToast("Xin chờ giây lát rồi gõ tiếp");
      return false;
    }
    this.lastSent = now;
    this.deps.send({ t: "ritual", kind });
    // Server is the authority: it replies {t:'merit',...} (+1) or
    // {t:'notice',...} (cooldown / not in main hall). The client's
    // existing handlers already display those — no new code needed here.
    return true;
  }

  private makeMalletPivot(
    mesh: AbstractMesh,
    pivotPos: Vector3,
    _kind: "mo" | "chuong",
  ): TransformNode {
    // Pivot at the handle end; the mallet head points toward -X (toward
    // its target) so rotation.z swings it down onto the target.
    const pivot = new TransformNode("malletPivot", this.deps.scene);
    pivot.parent = this.root;
    pivot.position = pivotPos;
    pivot.rotation.y = Math.PI; // flip local +X (head dir) to world -X
    mesh.parent = pivot;
    mesh.position = Vector3.Zero();
    mesh.rotation = Vector3.Zero();
    pivot.rotation.z = 0.35; // raised rest pose
    return pivot;
  }

  private playStrikeSound(kind: "mo" | "chuong", target: AbstractMesh): void {
    const s = this.sounds.get(kind);
    if (!s) return;
    // ASSUMPTION: attachToMesh exists on the client's Sound wrapper; if
    // not, skip it — the sound still plays, just not spatialized.
    (s as unknown as { attachToMesh?: (m: AbstractMesh) => void }).attachToMesh?.(target);
    s.play();
    if (kind === "chuong") {
      // chua_bell.mp3 is a 40 s ambience. Let it ring, then fade out so
      // repeated strikes don't stack into a 40 s wash of bell.
      window.setTimeout(() => this.fadeSound(s, BELL_FADE_MS), BELL_FADE_AFTER_MS);
    }
  }

  private fadeSound(s: Sound, ms: number): void {
    const steps = 15;
    const start = s.getVolume?.() ?? 0.9;
    let i = 0;
    const id = window.setInterval(() => {
      i += 1;
      s.setVolume?.(Math.max(0, start * (1 - i / steps)));
      if (i >= steps) {
        window.clearInterval(id);
        s.stop();
        s.setVolume?.(start);
      }
    }, ms / steps);
  }

  /** Small scale pulse on the struck target so the hit reads visually. */
  private pulseTarget(target: AbstractMesh): void {
    Animation.CreateAndStartAnimation(
      "hitPulse", target, "scaling", 60, 6,
      new Vector3(1, 1, 1), new Vector3(1.03, 1.03, 1.03),
      Animation.ANIMATIONLOOPMODE_CONSTANT, undefined,
      () => {
        Animation.CreateAndStartAnimation(
          "hitPulseBack", target, "scaling", 60, 10,
          new Vector3(1.03, 1.03, 1.03), new Vector3(1, 1, 1),
          Animation.ANIMATIONLOOPMODE_CONSTANT,
        );
      },
    );
  }

  private pulseMarker(): void {
    const m = this.beadMarker;
    if (!m) return;
    Animation.CreateAndStartAnimation(
      "beadPulse", m, "scaling", 60, 15,
      new Vector3(1, 1, 1), new Vector3(1.7, 1.7, 1.7),
      Animation.ANIMATIONLOOPMODE_CONSTANT, undefined,
      () => {
        Animation.CreateAndStartAnimation(
          "beadPulseBack", m, "scaling", 60, 10,
          new Vector3(1.7, 1.7, 1.7), new Vector3(1, 1, 1),
          Animation.ANIMATIONLOOPMODE_CONSTANT,
        );
      },
    );
  }

  /** Position of bead `index` on the flat oval loop (XZ plane). */
  private beadPosition(index: number): Vector3 {
    const a = (index / BEAD_COUNT) * Math.PI * 2;
    return new Vector3(
      BEADS_POS.x + BEAD_RX * Math.cos(a),
      BEADS_POS.y,
      BEADS_POS.z + BEAD_CENTER_OFFSET_Z + BEAD_RZ * Math.sin(a),
    );
  }

  private easeIn(): EasingFunction {
    const e = new CubicEase();
    e.setEasingMode(EasingFunction.EASINGMODE_EASEIN);
    return e;
  }

  private easeOut(): EasingFunction {
    const e = new CubicEase();
    e.setEasingMode(EasingFunction.EASINGMODE_EASEOUT);
    return e;
  }

  dispose(): void {
    this.root.dispose();
    this.sounds.forEach((s) => s.dispose());
    this.sounds.clear();
  }
}
