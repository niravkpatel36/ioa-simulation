/* Three videos stacked on top of each other, all pre-loaded into memory and parked on frame 1.
   Switching = play the next one, and cut to it the moment its first frame is showing. No black, no ghosting. */
const FILES = { wait: 'wait.mp4', row: 'row.mp4', arrive: 'arrive.mp4' };
const CLIP = { WAITING: 'wait', ROWING: 'row', ARRIVING: 'arrive', ARRIVED: 'arrive' };
class Engine {
  constructor(root, audible) {
    this.audible = audible; this.state = 'WAITING'; this.sound = true; this.unlocked = false;
    this.token = 0; this.z = 1; this.errors = []; this.clips = {};
    for (const k in FILES) {
      const v = document.createElement('video');
      v.muted = true; v.playsInline = true; v.preload = 'auto'; v.loop = k !== 'arrive'; v.style.opacity = 0;
      v.disablePictureInPicture = true; root.appendChild(v);
      this.clips[k] = { el: v, ready: false, pct: 0, gain: 0 };
    }
    this.hold = document.createElement('canvas'); this.hold.className = 'hold'; root.appendChild(this.hold);
    this.clips.arrive.el.addEventListener('ended', () => this.arrived());
    setInterval(() => this.tick(), 40); setInterval(() => this.keepAlive(), 500);
    addEventListener('pointerdown', () => { this.unlocked = true; }, true);
  }
  async load() {
    await Promise.all(Object.keys(FILES).map(k => this.loadClip(k)));
    this.errors.length || this.cut('wait');
  }
  async loadClip(k) {
    const c = this.clips[k];
    try {
      const r = await fetch(FILES[k], { cache: 'force-cache' }); if (!r.ok) throw new Error('not found (' + r.status + ')');
      const total = +r.headers.get('content-length') || 0, parts = []; let got = 0, rd = r.body.getReader();
      for (;;) { const { done, value } = await rd.read(); if (done) break; parts.push(value); got += value.length; if (total) c.pct = got / total; }
      c.el.src = URL.createObjectURL(new Blob(parts, { type: 'video/mp4' }));
      await new Promise((ok, no) => { c.el.onloadeddata = ok; c.el.onerror = () => no(new Error('cannot be played')); });
      c.ready = true; c.pct = 1;
    } catch (e) { this.errors.push('Video "' + FILES[k] + '" problem: ' + e.message); }
  }
  ready() { return Object.values(this.clips).every(c => c.ready); }
  park(except) { for (const k in this.clips) if (k !== except && this.clips[k].ready) { const v = this.clips[k].el; v.pause(); v.style.opacity = 0; try { v.currentTime = 0; } catch (e) {} } }
  cut(k) {
    const v = this.clips[k].el, t = ++this.token; this.hold.style.display = 'none';
    if (v.currentTime > 0.05) try { v.currentTime = 0; } catch (e) {}
    let done = false; const go = () => { if (done || t !== this.token) return; done = true; v.style.zIndex = ++this.z; v.style.opacity = 1; setTimeout(() => t === this.token && this.park(k), 120); };
    v.play().catch(() => {});
    v.requestVideoFrameCallback ? v.requestVideoFrameCallback(go) : v.addEventListener('playing', go, { once: true });
    setTimeout(go, 300);
  }
  go(cmd) { // WAITING | ROWING | ARRIVING | RESET
    if (cmd === 'RESET') { this.state = 'WAITING'; this.cut('wait'); return; }
    if (this.state === 'ARRIVING' || this.state === 'ARRIVED' || cmd === this.state || !this.ready()) return;
    this.state = cmd; this.cut(CLIP[cmd]);
  }
  arrived() {
    if (this.state !== 'ARRIVING') return; const v = this.clips.arrive.el;
    try { this.hold.width = v.videoWidth; this.hold.height = v.videoHeight; this.hold.getContext('2d').drawImage(v, 0, 0); this.hold.style.display = 'block'; } catch (e) {}
    this.state = 'ARRIVED'; this.onArrived && this.onArrived();
  }
  keepAlive() { const c = this.clips[CLIP[this.state]]; if (this.state !== 'ARRIVED' && c.ready && c.el.paused) c.el.play().catch(() => {}); }
  tick() { // smooth sound fades between clips (audience window only)
    if (!this.audible) return; const on = this.unlocked && this.sound;
    for (const k in this.clips) { const c = this.clips[k]; c.gain += ((k === CLIP[this.state] ? 1 : 0) - c.gain) * 0.12; c.el.volume = Math.min(1, Math.max(0, c.gain)); c.el.muted = !(on && c.gain > 0.01); }
  }
}
