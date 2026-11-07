/**
 * An Lien sanctuary soundscape: serene loop music, wind chimes everywhere, the great bell (đại hồng chung)
 * tolling in slow rounds, and chanting from the main hall / under the Bodhi tree. `k` 0..1 fades it in as the
 * player walks through the gate (the night ambience fades out the other way, see NightAmbient.day).
 */
type Loader = (name: string) => Promise<AudioBuffer | undefined>;
export interface ChantSource { name: string; x: number; z: number; range: number; vol: number }

export class TempleSound {
  private loops = new Map<string, { src: AudioBufferSourceNode; g: GainNode; p?: StereoPannerNode }>();
  private wanted = new Set<string>();
  private bellT = 6;
  private bellLeft = 0;
  private k = 0;
  /** 0 outside → 1 inside the main hall: there only the wooden fish (mõ) and the small bell (chuông gia trì) are heard. */
  private hall = 0;
  private moT = 1;
  private moBeat = 0;

  constructor(private ctx: AudioContext, private music: AudioNode, private amb: AudioNode, private load: Loader, private chants: ChantSource[] = []) {}

  private loop(name: string, bus: AudioNode, pan = false) {
    const have = this.loops.get(name); if (have) return have;
    if (this.wanted.has(name)) return undefined;
    this.wanted.add(name);
    void this.load(name).then((b) => {
      if (!b) return;
      const src = this.ctx.createBufferSource(); src.buffer = b; src.loop = true;
      const g = this.ctx.createGain(); g.gain.value = 0;
      if (pan) { const p = this.ctx.createStereoPanner(); src.connect(g).connect(p).connect(bus); this.loops.set(name, { src, g, p }); }
      else { src.connect(g).connect(bus); this.loops.set(name, { src, g }); }
      src.start(0, Math.random() * b.duration * .9);
    });
    return undefined;
  }

  private one(name: string, vol: number) {
    if (vol <= 0) return;
    void this.load(name).then((b) => {
      if (!b || this.k < .2) return;
      const s = this.ctx.createBufferSource(); s.buffer = b;
      const g = this.ctx.createGain(); g.gain.value = vol * this.k;
      s.connect(g).connect(this.amb); s.start();
    });
  }

  /** k: 0 outside → 1 inside the campus. listener in world metres + yaw. */
  update(dt: number, k: number, lx: number, lz: number, yaw: number, inHall = false) {
    this.k = k;
    this.hall += ((inHall ? 1 : 0) - this.hall) * Math.min(1, dt * 1.5);
    const out = 1 - this.hall;
    const now = this.ctx.currentTime, on = k > .001;
    const set = (name: string, bus: AudioNode, v: number) => { const l = on ? this.loop(name, bus) ?? this.loops.get(name) : this.loops.get(name); l?.g.gain.setTargetAtTime(v, now, .8); };
    // anh Thanh 2026-11-05: in the main hall no music and no wind chimes — only the wooden fish and the bell, for stillness
    set('chua_music', this.music, .55 * k * out);
    set('chua_chimes', this.amb, .32 * k * out);
    if (this.hall > .5) {
      this.moT -= dt;
      if (this.moT <= 0) {
        this.one('chua_mo_tram', .6 * this.hall); // mõ A (anh Thanh 2026-11-05): the stroke pitched down ~30%, softer top, a little hall echo
        this.moBeat++;
        if (this.moBeat % 12 === 0) this.one('chua_khanh', .7 * this.hall);
        this.moT = 1.15;
      }
    } else { this.moT = 1; this.moBeat = 0; }
    for (const c of this.chants) {
      const d = Math.hypot(c.x - lx, c.z - lz), near = on && d < c.range * 1.4;
      const l = near ? this.loop(c.name, this.amb, true) ?? this.loops.get(c.name) : this.loops.get(c.name);
      if (!l) continue;
      const gain = k * c.vol * Math.max(0, 1 - d / c.range) ** 1.4;
      l.g.gain.setTargetAtTime(gain, now, .6);
      const ang = Math.atan2(c.x - lx, c.z - lz) - yaw;
      l.p?.pan.setTargetAtTime(Math.max(-.8, Math.min(.8, Math.sin(ang))), now, .3);
    }
    // the great bell: a round of three slow strokes every couple of minutes while inside
    if (k > .6 && this.hall < .5) {
      this.bellT -= dt;
      if (this.bellT <= 0) {
        if (this.bellLeft <= 0) this.bellLeft = 3;
        this.one('chua_bell', .9);
        this.bellLeft--;
        this.bellT = this.bellLeft > 0 ? 11 : 95 + Math.random() * 60;
      }
    } else { this.bellT = Math.min(this.bellT, 5); this.bellLeft = 0; }
  }
}
