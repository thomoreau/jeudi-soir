/* ===== Décor animé (Paris de nuit + circuit), particules et sons ===== */
const WORLD = { speed: .35, target: .35, scene: "dusk", rain: 0, rainTarget: 0, hero: false, heroLane: 0 };

const FX = (() => {
  const bg = document.querySelector("#world"), fg = document.querySelector("#fx");
  const g = bg.getContext("2d"), f = fg.getContext("2d");
  let W, H, HZ, stars = [], towers = [], drops = [], parts = [], offset = 0, last = 0, fireUntil = 0, nextFire = 0;
  const SKY = {
    dusk:  ["#0b1033", "#3a1d5c", "#e0556b"],
    night: ["#02030b", "#0a1030", "#31235e"],
    party: ["#060218", "#25104f", "#8a1f5a"]
  };
  const sky = SKY.dusk.map(hex);
  function hex(h) { return [1, 3, 5].map(i => parseInt(h.slice(i, i + 2), 16)); }
  const rgb = c => `rgb(${c[0] | 0},${c[1] | 0},${c[2] | 0})`;
  const rnd = (a, b) => a + Math.random() * (b - a);

  const rivals = [
    { z: 3, lane: -.45, v: .52, c: "#1e7bff" }, { z: 7, lane: .42, v: .3, c: "#ffd02b" },
    { z: 13, lane: -.2, v: .42, c: "#23d18b" }, { z: 20, lane: .25, v: .2, c: "#f4f4f8" }
  ];

  function resize() {
    const d = Math.min(2, devicePixelRatio || 1);
    W = innerWidth; H = innerHeight; HZ = H * .42;
    [bg, fg].forEach(c => { c.width = W * d; c.height = H * d; c.getContext("2d").setTransform(d, 0, 0, d, 0, 0); });
    stars = Array.from({ length: 90 }, () => ({ x: rnd(0, W), y: rnd(0, HZ * .8), r: rnd(.3, 1.3), p: rnd(0, 6) }));
    towers = [];
    for (let x = -10; x < W + 10;) {
      const w = rnd(24, 58), h = rnd(22, 70), win = [];
      for (let wy = 8; wy < h - 4; wy += 9) for (let wx = 5; wx < w - 5; wx += 8) if (Math.random() < .35) win.push([wx, wy]);
      towers.push({ x, w, h, win }); x += w + 1;
    }
    drops = Array.from({ length: 170 }, () => ({ x: rnd(0, W * 1.3), y: rnd(-H, H), l: rnd(10, 24), v: rnd(700, 1100) }));
  }

  function eiffel(t) {
    const x = W * .74, base = HZ, h = Math.min(H * .27, 230), w = h * .46;
    g.save(); g.translate(x, base);
    g.shadowColor = "#ffb52e"; g.shadowBlur = 18; g.strokeStyle = "#ffc65c"; g.lineWidth = 2;
    g.beginPath();
    g.moveTo(-w / 2, 0); g.quadraticCurveTo(-w * .12, -h * .35, -w * .035, -h * .93); g.lineTo(0, -h);
    g.lineTo(w * .035, -h * .93); g.quadraticCurveTo(w * .12, -h * .35, w / 2, 0);
    g.moveTo(-w * .28, 0); g.quadraticCurveTo(0, -h * .24, w * .28, 0);
    [[.23, .26], [.45, .14], [.78, .06]].forEach(([y, s]) => { g.moveTo(-w * s, -h * y); g.lineTo(w * s, -h * y); });
    for (let i = 0; i < 6; i++) {
      const a = .24 + i * .09, s = .2 * (1 - a) + .02, s2 = .2 * (1 - a - .09) + .02;
      g.moveTo(-w * s, -h * a); g.lineTo(w * s2, -h * (a + .09)); g.moveTo(w * s, -h * a); g.lineTo(-w * s2, -h * (a + .09));
    }
    g.stroke();
    g.fillStyle = "#fff";
    for (let i = 0; i < 16; i++) {
      const k = (i * .618) % 1, sp = Math.sin(t * 6 + i * 2.7);
      if (sp > .75) { g.globalAlpha = (sp - .75) * 4; g.fillRect((Math.sin(i * 9) * .2) * w * (1 - k) - 1, -h * k - 1, 2.5, 2.5); }
    }
    g.globalAlpha = .22; g.shadowBlur = 0;
    const a = Math.sin(t * .5) * .9, beam = g.createLinearGradient(0, -h, Math.sin(a) * W, -h - W * .25);
    beam.addColorStop(0, "#fff3c4"); beam.addColorStop(1, "#fff3c400"); g.fillStyle = beam;
    g.beginPath(); g.moveTo(0, -h * .97); g.lineTo(Math.sin(a) * W, -h - 60); g.lineTo(Math.sin(a) * W, -h + 10); g.fill();
    g.restore();
  }

  function kart(x, y, s, color, t) {
    g.save(); g.translate(x, y + Math.sin(t * 30 + x) * s * .008);
    const rr = (rx, ry, w, h, r) => { g.beginPath(); g.roundRect ? g.roundRect(rx, ry, w, h, r) : g.rect(rx, ry, w, h); g.fill(); };
    g.fillStyle = "#0008"; g.beginPath(); g.ellipse(0, 0, s * .62, s * .09, 0, 0, 6.29); g.fill();
    g.fillStyle = "#0c0c10"; rr(-s * .6, -s * .34, s * .26, s * .34, s * .07); rr(s * .34, -s * .34, s * .26, s * .34, s * .07);
    g.fillStyle = color; rr(-s * .36, -s * .35, s * .72, s * .24, s * .08);
    g.fillStyle = "#15151b"; rr(-s * .52, -s * .46, s * 1.04, s * .08, s * .03);
    g.fillStyle = color; rr(-s * .18, -s * .62, s * .36, s * .3, s * .12);
    g.beginPath(); g.arc(0, -s * .7, s * .17, 0, 6.29); g.fill();
    g.fillStyle = "#fff9"; g.fillRect(-s * .13, -s * .76, s * .26, s * .035);
    g.shadowColor = "#ff2233"; g.shadowBlur = s * .18; g.fillStyle = "#ff3b46";
    rr(-s * .3, -s * .27, s * .12, s * .06, 2); rr(s * .18, -s * .27, s * .12, s * .06, 2);
    if (WORLD.speed > .8) { g.shadowColor = "#4cc9ff"; g.fillStyle = "#8fe3ff"; g.beginPath(); g.ellipse(0, -s * .1, s * .05, s * rnd(.06, .16), 0, 0, 6.29); g.fill(); }
    g.restore();
  }

  const proj = z => { const p = 1.15 / z; return { p, y: HZ + (H - HZ) * p, hw: W * .62 * p }; };

  function scene(t, dt) {
    const target = SKY[WORLD.scene].map(hex);
    sky.forEach((c, i) => c.forEach((_, k) => c[k] += (target[i][k] - c[k]) * Math.min(1, dt * 2)));
    const gr = g.createLinearGradient(0, 0, 0, HZ);
    gr.addColorStop(0, rgb(sky[0])); gr.addColorStop(.62, rgb(sky[1])); gr.addColorStop(1, rgb(sky[2]));
    g.fillStyle = gr; g.fillRect(0, 0, W, HZ + 1);
    g.fillStyle = "#fff";
    stars.forEach(s => { g.globalAlpha = (.2 + .6 * Math.abs(Math.sin(t + s.p))) * (1 - WORLD.rain); g.beginPath(); g.arc(s.x, s.y, s.r, 0, 6.29); g.fill(); });
    g.globalAlpha = 1;
    towers.forEach(b => {
      g.fillStyle = "#080a1a"; g.fillRect(b.x, HZ - b.h, b.w, b.h);
      g.fillStyle = "#ffcf7088"; b.win.forEach(([x, y]) => g.fillRect(b.x + x, HZ - b.h + y, 3, 4));
    });
    eiffel(t);
    g.fillStyle = "#07080f"; g.fillRect(0, HZ, W, H - HZ);

    offset = (offset + dt * WORLD.speed * 14) % 1000;
    const cx = W / 2, frac = offset % 1, base = Math.floor(offset);
    for (let i = 24; i >= 0; i--) {
      const z1 = Math.max(.9, i + 1 - frac), z2 = i + 2 - frac, a = proj(z1), b = proj(z2), alt = (i + base) % 2;
      const quad = (l1, r1, l2, r2, col) => { g.fillStyle = col; g.beginPath(); g.moveTo(cx + l2, b.y); g.lineTo(cx + r2, b.y); g.lineTo(cx + r1, a.y + 1); g.lineTo(cx + l1, a.y + 1); g.fill(); };
      quad(-a.hw, a.hw, -b.hw, b.hw, alt ? "#1b1c26" : "#202230");
      [-1, 1].forEach(s => quad(s * a.hw, s * a.hw * 1.13, s * b.hw, s * b.hw * 1.13, alt ? "#e10620" : "#f1f1f4"));
      if (alt) quad(-a.hw * .012, a.hw * .012, -b.hw * .012, b.hw * .012, "#ffffff99");
    }
    for (let i = 20; i >= 0; i--) {
      if ((i + base) % 4) continue;
      const z = i + 1.4 - frac; if (z < 1.2) continue;
      const q = proj(z), ph = H * .55 * q.p;
      [-1, 1].forEach(s => {
        const x = cx + s * q.hw * 1.35;
        g.strokeStyle = "#2b2e45"; g.lineWidth = Math.max(1, 7 * q.p); g.beginPath(); g.moveTo(x, q.y); g.lineTo(x, q.y - ph); g.lineTo(x - s * ph * .18, q.y - ph); g.stroke();
        g.save(); g.shadowColor = "#ffd27a"; g.shadowBlur = 30 * q.p + 4; g.fillStyle = "#ffe7b0"; g.beginPath(); g.arc(x - s * ph * .18, q.y - ph, Math.max(1, 8 * q.p), 0, 6.29); g.fill(); g.restore();
      });
    }
    rivals.slice().sort((a, b) => b.z - a.z).forEach(r => {
      r.z += (r.v - WORLD.speed) * dt * 6;
      if (r.z > 24) { r.z = 1.35; r.lane = (Math.random() < .5 ? -1 : 1) * rnd(.25, .6); }
      if (r.z < 1.3) { r.z = 22; r.lane = rnd(-.6, .6); }
      const q = proj(r.z); kart(cx + r.lane * q.hw, q.y, q.hw * .42, r.c, t);
    });
    if (WORLD.hero) kart(cx + WORLD.heroLane * W * .2 + Math.sin(t * 2.2) * W * .05, H * .74, Math.min(W * .32, 150), "#ff2740", t);

    if (WORLD.speed > .7) {
      g.strokeStyle = "#ffffff"; g.lineWidth = 1.5;
      for (let i = 0; i < 26 * WORLD.speed; i++) {
        const an = rnd(0, 6.29), r1 = rnd(W * .35, W), r2 = r1 + rnd(30, 120) * WORLD.speed;
        g.globalAlpha = rnd(.06, .3); g.beginPath(); g.moveTo(cx + Math.cos(an) * r1, HZ + Math.sin(an) * r1); g.lineTo(cx + Math.cos(an) * r2, HZ + Math.sin(an) * r2); g.stroke();
      }
      g.globalAlpha = 1;
    }
    if (WORLD.rain > .02) {
      g.fillStyle = `rgba(40,80,150,${.22 * WORLD.rain})`; g.fillRect(0, 0, W, H);
      g.strokeStyle = `rgba(180,215,255,${.55 * WORLD.rain})`; g.lineWidth = 1.2; g.beginPath();
      drops.forEach(d => { d.y += d.v * dt; d.x -= d.v * dt * .22; if (d.y > H) { d.y = -20; d.x = rnd(0, W * 1.3); } g.moveTo(d.x, d.y); g.lineTo(d.x - d.l * .22, d.y + d.l); });
      g.stroke();
    }
  }

  function particles(now, dt) {
    f.clearRect(0, 0, W, H);
    if (now < fireUntil && now > nextFire) { firework(rnd(W * .15, W * .85), rnd(H * .08, H * .42)); nextFire = now + rnd(260, 600); }
    parts = parts.filter(p => (p.life -= dt) > 0 && p.y < H + 40);
    parts.forEach(p => {
      p.vy += p.grav * dt; p.vx *= p.drag; p.vy *= p.drag; p.x += p.vx * dt; p.y += p.vy * dt; p.r += p.vr * dt;
      f.globalAlpha = Math.min(1, p.life * 1.6); f.fillStyle = p.c;
      if (p.round) { f.beginPath(); f.arc(p.x, p.y, p.s / 2, 0, 6.29); f.fill(); }
      else { f.save(); f.translate(p.x, p.y); f.rotate(p.r); f.fillRect(-p.s / 2, -p.s / 4, p.s, p.s / 2 * Math.abs(Math.cos(p.r * 2)) + 1); f.restore(); }
    });
    f.globalAlpha = 1;
  }
  const add = o => { if (parts.length < 700) parts.push({ r: 0, vr: 0, drag: .99, grav: 500, round: false, ...o }); };
  function firework(x, y) {
    const c = ["#ffd447", "#ff3b53", "#ffffff", "#4cc9f0"][Math.random() * 4 | 0];
    for (let i = 0; i < 46; i++) { const a = i / 46 * 6.29, v = rnd(60, 210); add({ x, y, vx: Math.cos(a) * v, vy: Math.sin(a) * v, life: rnd(.8, 1.5), s: rnd(2, 4.5), c, round: true, grav: 110, drag: .965 }); }
    AUDIO.boom();
  }

  function loop(now) {
    const dt = Math.min(.05, (now - last) / 1000 || .016); last = now;
    WORLD.speed += (WORLD.target - WORLD.speed) * Math.min(1, dt * 2.5);
    WORLD.rain += (WORLD.rainTarget - WORLD.rain) * Math.min(1, dt * 2);
    scene(now / 1000, dt); particles(now, dt);
    requestAnimationFrame(loop);
  }
  resize(); addEventListener("resize", resize); requestAnimationFrame(loop);

  return {
    sparks(x, y, c = "#ffd447") { for (let i = 0; i < 28; i++) { const a = rnd(0, 6.29), v = rnd(80, 330); add({ x, y, vx: Math.cos(a) * v, vy: Math.sin(a) * v - 80, life: rnd(.3, .8), s: rnd(2, 4), c, round: true }); } },
    confetti(n = 140) { for (let i = 0; i < n; i++) add({ x: rnd(0, W), y: rnd(-H * .5, 0), vx: rnd(-60, 60), vy: rnd(60, 220), life: rnd(2.5, 4.5), s: rnd(6, 12), c: ["#ffd447", "#e10620", "#ffffff"][i % 3], r: rnd(0, 6), vr: rnd(-7, 7), grav: 60 }); },
    champagne() { for (let i = 0; i < 220; i++) { const left = i % 2; add({ x: left ? 0 : W, y: H * .8, vx: (left ? 1 : -1) * rnd(60, W * 1.1), vy: -rnd(250, 760), life: rnd(1, 2.4), s: rnd(2, 6), c: ["#fff6d0", "#ffe38a", "#ffffff"][i % 3], round: true }); } },
    fireworks(ms) { fireUntil = performance.now() + ms; nextFire = 0; }
  };
})();

/* ===== Sons synthétisés (activés au premier appui) ===== */
const AUDIO = (() => {
  let ac = null, muted = false;
  const ctx = () => {
    if (muted) return null;
    try { ac = ac || new (window.AudioContext || window.webkitAudioContext)(); if (ac.state === "suspended") ac.resume(); } catch (e) { return null; }
    return ac;
  };
  function tone(type, from, to, dur, vol, cut, delay = 0) {
    const a = ctx(); if (!a) return;
    const t = a.currentTime + delay, o = a.createOscillator(), gn = a.createGain(), lp = a.createBiquadFilter();
    o.type = type; o.frequency.setValueAtTime(from, t); o.frequency.exponentialRampToValueAtTime(to, t + dur);
    lp.type = "lowpass"; lp.frequency.value = cut;
    gn.gain.setValueAtTime(.0001, t); gn.gain.exponentialRampToValueAtTime(vol, t + .02); gn.gain.exponentialRampToValueAtTime(.0001, t + dur);
    o.connect(lp).connect(gn).connect(a.destination); o.start(t); o.stop(t + dur + .05);
  }
  return {
    unlock: ctx,
    toggle() { muted = !muted; return muted; },
    light() { tone("square", 440, 440, .18, .07, 1800); },
    go() { tone("square", 880, 880, .35, .09, 3000); },
    good() { tone("triangle", 660, 660, .12, .16, 4000); tone("triangle", 990, 990, .22, .16, 4000, .1); },
    bad() { tone("sawtooth", 150, 70, .35, .14, 700); },
    rev(k = .5) { tone("sawtooth", 70 + k * 150, 130 + k * 330, .28, .1, 500 + k * 1500); },
    pass() { tone("sawtooth", 330, 70, .8, .12, 1100); tone("square", 165, 40, .8, .06, 600); },
    boom() { tone("sine", 140, 40, .35, .07, 500); },
    fanfare() { [523, 659, 784, 1047, 784, 1047].forEach((n, i) => tone("triangle", n, n, i > 4 ? .7 : .22, .15, 4500, i * .16)); }
  };
})();
