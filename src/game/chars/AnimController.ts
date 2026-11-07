import type { AnimationGroup } from '@babylonjs/core';

/**
 * Cross-fading animation player on top of Babylon AnimationGroups.
 * Visual only: gameplay timing (hit windows, i-frames) stays in the fixed-step sim (01 §4 / 04 animation rules).
 */
export class AnimController {
  private current: { name: string; g: AnimationGroup } | null = null;
  private fading: { g: AnimationGroup; w: number }[] = [];
  private curW = 1;
  private fade = 0.15;

  constructor(readonly groups: Map<string, AnimationGroup>) {}

  has(name: string) { return this.groups.has(name); }

  get playing() { return this.current?.name ?? null; }

  /**
   * Loop clips keep running; one-shots play once and hold the last frame.
   * duration (s) rescales the clip to fit a gameplay action's length.
   */
  play(name: string, opts: { loop?: boolean; speed?: number; duration?: number; fade?: number; restart?: boolean; from?: number } = {}) {
    const g = this.groups.get(name);
    if (!g) return;
    const loop = opts.loop ?? true;
    if (this.current?.name === name && !opts.restart) {
      if (opts.speed) g.speedRatio = opts.speed;
      return;
    }
    const first = this.current === null;
    const gait = /^(Walk_Loop|Jog_Fwd_Loop|Sprint_Loop|Crouch_Fwd_Loop)$/;
    const previous = this.current;
    const phase = previous && gait.test(previous.name) && gait.test(name)
      ? (previous.g.getCurrentFrame() - previous.g.from) / Math.max(1, previous.g.to - previous.g.from) : null;
    if (this.current) {
      const old = this.current.g;
      this.fading = this.fading.filter((f) => f.g !== old && f.g !== g);
      this.fading.push({ g: old, w: old.weight });
    }
    this.fading = this.fading.filter((f) => f.g !== g);
    const clipLen = (g.to - g.from) / 60; // normalized groups use 60 fps frames
    let speed = opts.speed ?? 1;
    if (opts.duration && clipLen > 0) speed = clipLen / opts.duration;
    g.stop();
    g.start(loop, speed, opts.from !== undefined ? g.from + (g.to - g.from) * opts.from : g.from, g.to);
    if (phase !== null) g.goToFrame(g.from + ((phase % 1 + 1) % 1) * (g.to - g.from));
    g.weight = first ? 1 : 0;
    this.fade = opts.fade ?? 0.15;
    this.curW = first ? 1 : 0;
    this.current = { name, g };
  }

  update(dt: number) {
    const step = this.fade > 0 ? dt / this.fade : 1;
    if (this.current) {
      this.curW = Math.min(1, this.curW + step);
      this.current.g.weight = this.curW;
    }
    for (const f of this.fading) {
      f.w = Math.max(0, f.w - step);
      f.g.weight = f.w;
      if (f.w <= 0) f.g.stop();
    }
    this.fading = this.fading.filter((f) => f.w > 0);
    // Interrupted blends can leave several outgoing clips. Keep the pose weights
    // normalized so rapid walk/run/idle changes cannot pull the rig toward bind pose.
    const total = this.curW + this.fading.reduce((sum, f) => sum + f.w, 0);
    if (total > 0) {
      if (this.current) this.current.g.weight = this.curW / total;
      for (const f of this.fading) f.g.weight = f.w / total;
    }
  }

  stop() {
    for(const g of this.groups.values())g.stop();
    this.current=null;this.fading=[];this.curW=1;
  }

  dispose() {
    for (const g of this.groups.values()) g.dispose();
  }
}
