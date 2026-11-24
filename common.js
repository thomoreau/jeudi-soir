// ====== À PERSONNALISER ======
const CONFIG = {
  MOI: "Thomas",   // ton prénom (apparaît dans les textes)
  EMAIL: "moreauthomas15@gmail.com",       // ton e-mail (optionnel) pour le bouton "Répondre par e-mail"
  TEL: ""        // ton numéro pour recevoir sa réponse sur WhatsApp, format international sans + (ex: "33612345678"). Vide = elle utilise le menu "Partager".
};
// Astuce : ajoute ?nom=Julie à l'adresse du site pour personnaliser avec son prénom.
// =============================

const params = new URLSearchParams(location.search);
const PRENOM = (params.get("nom") || "").trim();
const $ = (s, r = document) => r.querySelector(s);
const $$ = (s, r = document) => [...r.querySelectorAll(s)];

function jeudi() {
  const d = new Date();
  d.setDate(d.getDate() + ((4 - d.getDay()) + 7) % 7);
  return d.toLocaleDateString("fr-FR", { weekday: "long", day: "numeric", month: "long" });
}

function show(id) {
  $$(".screen").forEach(s => s.classList.toggle("on", s.id === id));
  window.scrollTo(0, 0);
}

function confetti(n = 160) {
  let c = $("#confetti");
  if (!c) { c = document.createElement("canvas"); c.id = "confetti"; document.body.appendChild(c); }
  const x = c.getContext("2d");
  c.width = innerWidth; c.height = innerHeight;
  const cols = ["#ff4d6d", "#ffd166", "#06d6a0", "#4cc9f0", "#b388ff", "#ffffff"];
  const ps = Array.from({ length: n }, () => ({
    x: innerWidth / 2, y: innerHeight * 0.6,
    vx: (Math.random() - .5) * 16, vy: -Math.random() * 16 - 4,
    s: 5 + Math.random() * 7, c: cols[Math.random() * cols.length | 0],
    r: Math.random() * 6, vr: (Math.random() - .5) * .4
  }));
  let t = 0;
  (function f() {
    x.clearRect(0, 0, c.width, c.height);
    ps.forEach(p => {
      p.vy += .35; p.x += p.vx; p.y += p.vy; p.r += p.vr;
      x.save(); x.translate(p.x, p.y); x.rotate(p.r);
      x.fillStyle = p.c; x.fillRect(-p.s / 2, -p.s / 2, p.s, p.s * .6); x.restore();
    });
    if (++t < 150) requestAnimationFrame(f); else x.clearRect(0, 0, c.width, c.height);
  })();
  if (navigator.vibrate) navigator.vibrate([40, 30, 40]);
}

function envoyer(msg) {
  const old = $("#sendbox"); if (old) old.remove();
  const box = document.createElement("div");
  box.id = "sendbox";
  box.style.cssText = "position:fixed;inset:0;background:#000a;z-index:100;display:flex;align-items:flex-end;justify-content:center;padding:12px";
  const enc = encodeURIComponent(msg);
  const wa = CONFIG.TEL ? `https://wa.me/${CONFIG.TEL}?text=${enc}` : `https://wa.me/?text=${enc}`;
  const sms = `sms:${CONFIG.TEL ? "+" + CONFIG.TEL : ""}?&body=${enc}`;
  const link = "display:block;text-align:center;text-decoration:none;font-weight:700;padding:14px;border-radius:14px;color:#fff;";
  box.innerHTML = `<div style="background:#fff;color:#222;border-radius:20px;padding:18px;width:100%;max-width:460px;display:flex;flex-direction:column;gap:10px;font-family:system-ui,sans-serif">
    <b>Ta réponse est prête 💌</b>
    <div id="sendtxt" style="background:#f2f2f2;border-radius:12px;padding:12px;font-size:.95rem;line-height:1.4;white-space:pre-wrap;max-height:30vh;overflow:auto"></div>
    <a href="${wa}" target="_blank" rel="noopener" style="${link}background:#25d366">Envoyer par WhatsApp</a>
    <a href="${sms}" style="${link}background:#3478f6">Envoyer par SMS</a>
    <a href="mailto:${CONFIG.EMAIL || ""}?subject=${encodeURIComponent("Confirmation du rendez-vous ✅")}&body=${enc}" style="${link}background:#8e5cf7">Répondre par e-mail</a>
    <button id="sendcopy" style="font:inherit;font-weight:700;padding:14px;border-radius:14px;border:2px solid #ddd;background:#fff;color:#222">Copier le message</button>
    <button id="sendclose" style="font:inherit;border:0;background:none;color:#888;padding:6px">Fermer</button></div>`;
  document.body.appendChild(box);
  $("#sendtxt", box).textContent = msg;
  $("#sendclose", box).onclick = () => box.remove();
  $("#sendcopy", box).onclick = e => {
    const b = e.currentTarget;
    const ok = () => { b.textContent = "Copié ✅"; };
    if (navigator.clipboard) navigator.clipboard.writeText(msg).then(ok, () => { b.textContent = "Sélectionne le texte ci-dessus et copie-le"; });
    else b.textContent = "Sélectionne le texte ci-dessus et copie-le";
  };
}
