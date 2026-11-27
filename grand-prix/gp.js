const NAME = "Klara", MOI = CONFIG.MOI, BASE = "1:12,904";
const stage = $("#stage");
const S = { penalite: 0, reaction: 0, fauxDeparts: 0, jour: "", heure: "", debut: 0 };
const JOURNAL = {}; // tout ce qu'elle fait, envoyé en récapitulatif à la fin

/* ---------- Utilitaires ---------- */
const secs = n => n.toFixed(3).replace(".", ",") + " s";
const depuis = t => ((performance.now() - t) / 1000).toFixed(1).replace(".", ",") + " s";
const maintenant = () => new Date().toLocaleTimeString("fr-FR");
const buzz = p => { try { navigator.vibrate && navigator.vibrate(p); } catch (e) {} };
const centre = el => { const r = el.getBoundingClientRect(); return [r.left + r.width / 2, r.top + r.height / 2]; };

function view(html) { stage.innerHTML = `<div class="view">${html}</div>`; window.scrollTo(0, 0); }
function hud(label, right, lap) {
  $("#hud").classList.toggle("hide", !label);
  $("#day").textContent = label || ""; $("#chrono").textContent = right || "";
  $$("#laps i").forEach((e, k) => e.classList.toggle("on", k < (lap || 0)));
}
function effet(type) {
  const f = $("#flash"); f.className = ""; void f.offsetWidth; f.className = type;
  if (type === "red") { const a = $(".app"); a.classList.remove("quake"); void a.offsetWidth; a.classList.add("quake"); }
}

/* Kart de profil (SVG) */
function kartSVG(color = "#e10620", num = 1) {
  const roue = (x, y, r) => `<g class="wheel"><circle cx="${x}" cy="${y}" r="${r}" fill="#0c0c10" stroke="#3b3d4a" stroke-width="3"/><circle cx="${x}" cy="${y}" r="${r * .45}" fill="#d7d9e4"/><path d="M${x - r * .45} ${y}H${x + r * .45}M${x} ${y - r * .45}V${y + r * .45}" stroke="#555" stroke-width="3"/></g>`;
  return `<svg class="kart" viewBox="-40 0 260 100" aria-hidden="true">
    <g class="smoke" fill="#cfd3e6"><circle cx="6" cy="74" r="8"/><circle cx="2" cy="70" r="7"/><circle cx="8" cy="78" r="6"/></g>
    <g class="body"><path d="M14 40h34v9H34l5 14H22z" fill="#15151c"/>
    <path d="M24 74l8-20 46-6 16 12h46l62 12-4 10H28z" fill="${color}"/><path d="M96 62h44l22 8H100z" fill="#fff" opacity=".85"/>
    <path d="M70 52c0-18 10-26 24-24l12 22-12 8H74z" fill="#1d2140"/><circle cx="90" cy="24" r="17" fill="${color}"/><path d="M92 17h14a17 17 0 010 13H94z" fill="#9fe4ff"/>
    <path d="M110 52l20-14" stroke="#15151c" stroke-width="6" stroke-linecap="round"/><text x="70" y="74" font-size="16" font-weight="900" font-style="italic" fill="#fff">${num}</text></g>
    ${roue(48, 76, 21)}${roue(172, 79, 18)}</svg>`;
}
$("#wipe").innerHTML = `<div class="band"></div><div class="check"></div>${kartSVG("#ffd447", 1)}`;

/* Transition : un kart traverse l'écran */
let enTransition = false;
function aller(fn) {
  if (enTransition) return;
  enTransition = true;
  const w = $("#wipe"); w.classList.remove("run"); void w.offsetWidth; w.classList.add("run");
  AUDIO.pass(); WORLD.target = 1.1;
  setTimeout(() => { WORLD.target = .35; WORLD.hero = false; document.body.classList.remove("drive"); fn(); }, 460);
  setTimeout(() => { w.classList.remove("run"); enTransition = false; }, 1050);
}

$("#mute").onclick = e => { e.currentTarget.textContent = AUDIO.toggle() ? "🔇" : "🔊"; };

/* ---------- 1. Accueil ---------- */
function intro() {
  hud();
  view(`
    <div class="logo"><h1>Le Grand Prix de <em>${NAME}</em></h1></div>
    <div class="parade">${kartSVG("#1e7bff", 7)}${kartSVG("#23d18b", 4)}${kartSVG("#e10620", 1)}</div>
    <div class="head">
      <p class="sub center">Tu as aimé Monaco ? Tu vas adorer Paris.<br><b>Au programme :</b></p>
      <ol class="prog">
        <li><b>1</b>Questions pour vérifier que t'es smart</li>
        <li><b>2</b>Test de rapidité pour vérifier ta réactivité aux appels de phares</li>
        <li><b>3</b>Choisis tes pneus en fonction de l'état de la route</li>
        <li><b>4</b>C'est le grand départ</li>
      </ol>
    </div>
    <button class="btn glow" id="go">Entrer dans le paddock 🏁</button>
    <p class="note">Les informations données sont utilisées à des fins de drague, pour éviter de venir te dire que tu portes mal les cartons.<br>Tes réponses et ton parcours sont envoyés à ${MOI} à la fin.</p>`);
  $("#go").onclick = () => {
    AUDIO.unlock(); AUDIO.rev(.8); S.debut = performance.now();
    JOURNAL["01 · Entrée dans le paddock"] = new Date().toLocaleString("fr-FR");
    aller(() => secteur(0));
  };
}

/* ---------- 2. Samedi : qualifications ---------- */
const SECTEURS = [
  { nom: "Le Marais", q: "Jeudi, pourquoi a-t-on autant tourné à scooter dans le Marais ?", o: [
    { t: "Le pilote était trop intimidé par la belle passagère", m: "Réclamation rejetée par le pilote." },
    { t: "Il y avait uniquement des bars gays", m: "FAUX, et hors de question que je te fasse une danse au premier date." },
    { t: "Pour passer plus de temps à te parler et que tu t'accroches à moi", ok: true }] },
  { nom: "La playlist", q: "Quel artiste n'est pas sur la liste que je t'ai notée au bar ?",
    // message selon le nombre d'erreurs sur cette question
    erreur: (n, o) => n === 1 ? (o.perso || "Donc tu ne m'écoutes pas ?") : n === 2 ? "Toujours pas, c'est pas cool…" : "Là, ça devient vexant…",
    o: [
    { t: "Georges Brassens" }, { t: "Charles Aznavour" }, { t: "Joe Dassin", ok: true },
    { t: "Édith Piaf", perso: "Elle est bien sur ta liste..." }] },
  { nom: "Le chien", q: "Quel chien voudras-tu adopter en premier ?", o: [
    { t: "Labrador", m: "Adorable, mais il ne conduit pas de scooter." },
    { t: "Beagle", m: "Il va te voler ton dîner. Mauvais choix." },
    { t: "Flat Coated", m: "Très beau, mais quelqu'un est encore plus fidèle." },
    { t: "Thomas", ok: true }] }
];
const chrono = () => BASE + (S.penalite ? ` +${S.penalite}s` : "");

function secteur(n) {
  const s = SECTEURS[n], essais = [], t0 = performance.now();
  let erreurs = 0, fini = false;
  WORLD.scene = "dusk";
  hud("Samedi · Qualifs", chrono(), 0);
  view(`<div class="head"><div class="tag">Secteur ${n + 1} / 3</div><h1>${s.q}</h1></div><div class="opts"></div><p class="warn" role="status"></p>`);
  s.o.forEach((o, k) => {
    const b = document.createElement("button");
    b.className = "opt"; b.innerHTML = `<i>${"ABCD"[k]}</i><span>${o.t}</span>`;
    b.onclick = () => {
      if (fini || b.classList.contains("bad")) return;
      if (o.ok) {
        fini = true; essais.push(o.t + " ✅"); b.classList.add("good"); effet("green"); AUDIO.good(); buzz(35);
        FX.sparks(...centre(b), "#25e07a"); WORLD.target = .95;
        JOURNAL[`0${n + 2} · Secteur ${n + 1} (${s.nom})`] = `${essais.join(" → ")} | pénalité : +${erreurs * 5} s | temps : ${depuis(t0)}`;
        setTimeout(() => aller(() => n + 1 < SECTEURS.length ? secteur(n + 1) : pole()), 800);
      } else {
        erreurs++; essais.push(o.t + " ❌"); S.penalite += 5;
        b.classList.add("bad"); b.setAttribute("aria-disabled", "true"); effet("red"); AUDIO.bad(); buzz([70, 40, 70]);
        hud("Samedi · Qualifs", chrono(), 0); const c = $("#chrono"); c.classList.add("hit");
        const w = $(".warn"); w.textContent = (s.erreur ? s.erreur(erreurs, o) : o.m) + " +5 secondes.";
        w.classList.remove("pop"); void w.offsetWidth; w.classList.add("pop");
        const p = document.createElement("div"); p.className = "penalty"; p.textContent = "+5 s"; document.body.appendChild(p); setTimeout(() => p.remove(), 1050);
      }
    };
    $(".opts").appendChild(b);
  });
}

function pole() {
  hud("Samedi · Résultat", chrono(), 1);
  JOURNAL["05 · Résultat des qualifs"] = `P1, ${chrono()}`;
  view(`
    <div class="panel center">
      <div class="tag" style="justify-content:center">Fin des qualifications</div>
      <div class="big p1big">P1</div>
      <h1>Pole position !</h1>
      <p>${S.penalite ? `Malgré ${S.penalite} secondes de pénalité, le directeur de la course est tombé sous le charme.` : "Un tour parfait, sans la moindre pénalité, tu te rapproches des bons %."} Tu partiras en tête demain.</p>
      <button class="btn" id="next">Passer à dimanche →</button>
    </div>`);
  AUDIO.fanfare(); FX.fireworks(2600); FX.confetti(90);
  $("#next").onclick = () => aller(depart);
}

/* ---------- 3. Dimanche : le départ ---------- */
function depart() {
  WORLD.scene = "night"; WORLD.target = 0;
  hud("Dimanche · Départ", "Tour 0", 1);
  view(`
    <div class="head">
      <div class="tag">La course</div>
      <h1>Les cinq <em>feux</em></h1>
      <p class="sub">Lance le départ, puis appuie dès que tous les feux passent au <span class="vert">VERT</span>.</p>
    </div>
    <div style="height:26px"></div>
    <div class="gantry">${'<div class="col"><i></i><i></i></div>'.repeat(5)}</div>
    <button class="pad" id="pad">Lancer</button>
    <div id="after"></div>`);
  const pad = $("#pad"), L = $$(".col"), t0 = performance.now();
  let etat = "pret", top = 0, timers = [];
  const eteindre = () => L.forEach(l => l.classList.remove("red", "green"));
  const appui = () => {
    if (etat === "pret") {
      etat = "attente"; eteindre(); pad.textContent = "Attends…"; AUDIO.rev(.2); WORLD.target = 0;
      L.forEach((l, k) => timers.push(setTimeout(() => { l.classList.add("red"); AUDIO.light(); buzz(15); }, 700 * (k + 1))));
      timers.push(setTimeout(() => {
        L.forEach(l => { l.classList.remove("red"); l.classList.add("green"); });
        etat = "go"; top = performance.now(); pad.textContent = "FONCE !"; pad.classList.add("go"); AUDIO.go();
      }, 3500 + 900 + Math.random() * 1600));
    } else if (etat === "attente") {
      timers.forEach(clearTimeout); timers = []; eteindre(); etat = "pret"; S.fauxDeparts++;
      effet("red"); AUDIO.bad(); buzz([90, 40, 90]); pad.textContent = "Faux départ ! Recommencer";
    } else if (etat === "go") {
      etat = "fini"; S.reaction = (performance.now() - top) / 1000; pad.classList.add("hide");
      WORLD.target = 1.5; AUDIO.rev(1); AUDIO.pass(); effet("green"); FX.sparks(innerWidth / 2, innerHeight * .7);
      JOURNAL["06 · Départ"] = `temps de réaction : ${secs(S.reaction)} | faux départs : ${S.fauxDeparts} | temps sur l'étape : ${depuis(t0)}`;
      const verdict = S.reaction < .3 ? "Réflexes de championne. Les écuries vont t'appeler." : S.reaction < .55 ? "Très joli départ, tu gardes la tête." : "Départ tout en élégance. Tu gardes quand même la tête vu que tu connais le patron du GP.";
      $("#after").innerHTML = `<div class="view"><div class="panel center"><div class="tag" style="justify-content:center">Temps de réaction</div><div class="big">${secs(S.reaction)}</div><p>${verdict}</p><button class="btn" id="next">Arrêt au stand 🔧</button></div></div>`;
      $("#next").onclick = () => aller(stand);
      $("#after").scrollIntoView({ behavior: "smooth", block: "end" });
    }
  };
  pad.addEventListener("pointerdown", appui);
  pad.addEventListener("keydown", e => { if (e.key === "Enter" || e.key === " ") { e.preventDefault(); appui(); } });
}

/* ---------- 4. Arrêt au stand ---------- */
const PNEUS = [
  { j: "Lundi 30", n: "Pneus pluie", c: "#2f8bff", pluie: 1 },
  { j: "Mardi 1er", n: "Pneus sec", c: "#ff2d3d", pluie: 0 }
];
function pneuSVG(p) {
  const rainures = p.pluie ? Array.from({ length: 16 }, (_, i) => `<path d="M60 4q7 8 3 17" transform="rotate(${i * 22.5} 60 60)" stroke="#45485a" stroke-width="4" fill="none"/>`).join("") : "";
  return `<svg viewBox="0 0 120 120" aria-hidden="true"><circle cx="60" cy="60" r="57" fill="#121217" stroke="#2c2e3a" stroke-width="3"/>${rainures}<circle cx="60" cy="60" r="37" fill="none" stroke="${p.c}" stroke-width="6" stroke-dasharray="70 18"/><circle cx="60" cy="60" r="27" fill="#b9bccb"/>${[0, 72, 144, 216, 288].map(a => `<path d="M56 56L58 36h4l2 20z" fill="#4a4d5c" transform="rotate(${a} 60 60)"/>`).join("")}<circle cx="60" cy="60" r="8" fill="${p.c}"/></svg>`;
}
function stand() {
  const t0 = performance.now(), choixPneus = [], choixHeures = [];
  S.jour = S.heure = ""; WORLD.target = .08;
  hud("Dimanche · Stand", "Tour 39", 2);
  view(`
    <div class="head">
      <div class="tag">Arrêt au stand</div>
      <h1>Choisis tes <em>pneus</em></h1>
      <p class="sub">Choisis le pneu, ça choisit le soir.</p>
    </div>
    <div class="tyres">${PNEUS.map((p, k) => `<button class="tyre" style="--c:${p.c}" data-k="${k}">${pneuSVG(p)}<b>${p.j}</b><small>${p.n}</small></button>`).join("")}</div>
    <div class="head"><div class="label">Heure de départ du scooter</div><div class="times">${["19h00", "19h30", "20h00", "20h30"].map(h => `<button class="time" data-h="${h}">${h}</button>`).join("")}</div></div>
    <button class="btn" id="next" disabled>Repartir à fond 💨</button>`);
  const maj = () => { $("#next").disabled = !(S.jour && S.heure); };
  $$(".tyre").forEach(b => b.onclick = () => {
    const p = PNEUS[b.dataset.k];
    $$(".tyre").forEach(o => o.classList.toggle("pick", o === b));
    S.jour = p.j; choixPneus.push(`${p.j} (${p.n})`); WORLD.rainTarget = p.pluie; WORLD.scene = p.pluie ? "night" : "dusk";
    AUDIO.rev(.6); buzz(25); FX.sparks(...centre(b), p.c); maj();
  });
  $$(".time").forEach(b => b.onclick = () => {
    $$(".time").forEach(o => o.classList.toggle("pick", o === b));
    S.heure = b.dataset.h; choixHeures.push(S.heure); AUDIO.light(); buzz(20); maj();
  });
  $("#next").onclick = () => {
    JOURNAL["07 · Pneus (soir)"] = `choisi : ${S.jour} | hésitations : ${choixPneus.join(" → ")}`;
    JOURNAL["08 · Heure du scooter"] = `choisie : ${S.heure} | hésitations : ${choixHeures.join(" → ")} | temps au stand : ${depuis(t0)}`;
    aller(sprint);
  };
}

/* ---------- 5. Dernier tour ---------- */
function sprint() {
  const TAPS = 18;
  let n = 0, t0 = 0;
  WORLD.scene = "night"; WORLD.target = .25; WORLD.hero = true; document.body.classList.add("drive");
  hud("Dimanche · Sprint", "Dernier tour", 3);
  view(`
    <div class="head">
      <div class="tag">Dernier tour</div>
      <h1>À fond jusqu'au <em>drapeau</em></h1>
      <p class="sub">Tapote le bouton le plus vite possible.</p>
      <div class="leds">${"<i></i>".repeat(TAPS)}</div>
      <div class="speedo"><div><b id="kmh">0</b><small>km/h</small></div><div class="pos" id="pos">P5</div></div>
    </div>
    <div class="spacer"></div>
    <button class="pad" id="gaz" style="height:120px">Accélérer 🔥</button>`);
  const gaz = $("#gaz");
  const tap = () => {
    if (n >= TAPS) return;
    if (!n) t0 = performance.now();
    n++; buzz(12); AUDIO.rev(n / TAPS);
    WORLD.target = .25 + n / TAPS * 1.5;
    $("#kmh").textContent = Math.round(80 + n / TAPS * 262);
    $$(".leds i")[n - 1].classList.add("on");
    $("#pos").textContent = "P" + Math.max(1, 5 - Math.floor(n / TAPS * 4));
    FX.sparks(innerWidth / 2 + (Math.random() - .5) * 120, innerHeight * .74, "#ffb02e");
    if (n === TAPS) {
      gaz.textContent = "Drapeau à damier !";
      JOURNAL["09 · Dernier tour"] = `${TAPS} accélérations en ${depuis(t0)}`;
      const d = document.createElement("div"); d.className = "finish"; document.body.appendChild(d);
      AUDIO.fanfare(); setTimeout(() => d.remove(), 1600); setTimeout(() => aller(podium), 900);
    }
  };
  gaz.addEventListener("pointerdown", tap);
  gaz.addEventListener("keydown", e => { if (e.key === "Enter" || e.key === " ") { e.preventDefault(); tap(); } });
}

/* ---------- 6. Podium ---------- */
function casque(c, l) {
  return `<svg viewBox="0 0 100 90" aria-hidden="true"><path d="M8 52C8 24 28 6 54 6s40 20 40 44v16c0 8-6 14-14 14H30C16 80 8 68 8 52z" fill="${c}"/><path d="M52 30h38c3 6 4 12 4 20v4H56c-10 0-14-24-4-24z" fill="#10142a"/><path d="M58 36h26" stroke="#9fe4ff" stroke-width="4" stroke-linecap="round"/><path d="M16 36C24 18 40 12 56 12" stroke="#fff" stroke-width="5" fill="none" opacity=".7"/><text x="32" y="66" text-anchor="middle" font-size="28" font-weight="900" font-style="italic" fill="#fff">${l}</text></svg>`;
}
const COUPE = `<svg viewBox="0 0 100 100" aria-hidden="true"><path d="M26 10h48v22c0 18-10 30-24 30S26 50 26 32z" fill="#ffd447"/><path d="M26 18H10c0 16 8 24 18 25M74 18h16c0 16-8 24-18 25" stroke="#ffd447" stroke-width="6" fill="none"/><path d="M44 60h12v16H44zM30 76h40v14H30z" fill="#d89f12"/><path d="M34 16v18c0 8 3 14 8 18" stroke="#fff" stroke-width="4" fill="none" opacity=".7" stroke-linecap="round"/></svg>`;
const AUTRES = [
  ["L'ancien date Hinge nul", "+12,4 s"], ["L'« ami » de St Trop", "+27,9 s"], ["Le dragueur de rue", "+1 tour"],
  ["Ton ex", "+3 tours"], ["L'ancien date Hinge n°2", "Au stand"], ["L'ex d'avant ton ex", "Abandon"], ["Le date Hinge qui n'a jamais répondu", "Disqualifié"]
];
function podium() {
  WORLD.scene = "party"; WORLD.target = .12; WORLD.rainTarget = 0;
  hud("Podium 🏁", "P1", 4);
  JOURNAL["10 · Arrivée sur le podium"] = maintenant();
  const soir = S.jour.toLowerCase();
  view(`
    <div class="head center"><h1>Victoire de <em>${NAME}</em> !</h1></div>
    <div class="podium">
      <div class="step s2">${casque("#2f6bff", "T")}<span>${MOI}</span><i>2</i></div>
      <div class="step s1">${casque("#e10620", "K")}<span>${NAME}</span><i>1</i></div>
      <div class="step s3">${casque("#6b7280", "?")}<span>Le Kiné qui pense que tu marches mal</span><i>3</i></div>
    </div>
    <ol class="tower">${AUTRES.map(([n, e], k) => `<li style="animation-delay:${1.5 + k * .18}s"><b>${k + 4}</b><span>${n}</span><small>${e}</small></li>`).join("")}</ol>
    <div class="panel reward">
      <div class="tag">Félicitations</div>
      ${COUPE}
      <h1>Tu remportes ce GP</h1>
      <p>Tu es invitée à être prête le <b>${soir}</b> à partir de <b>${S.heure}</b>, et le scooter passe te chercher pour faire une activité qui va te plaire.</p>
    </div>
    <button class="btn glow" id="coupe">Accepter la récompense 🏆</button>`);
  AUDIO.fanfare(); FX.confetti(180); FX.fireworks(6000); setTimeout(() => FX.champagne(), 1500);
  const msg = `🏆 Coupe acceptée !\n🎤 Activité secrète : ${S.jour}\n🛵 Départ du scooter : ${S.heure}\n⏱️ Mon temps de réaction : ${secs(S.reaction)}\n\nSigné : ${NAME}, championne du Grand Prix.`;
  $("#coupe").onclick = () => {
    FX.champagne(); FX.confetti(120); AUDIO.fanfare(); buzz([40, 30, 80]);
    envoyerRecap(msg); envoyer(msg);
  };
}

/* ---------- Récapitulatif par e-mail ---------- */
let dernierEnvoi = 0;
function envoyerRecap(msg) {
  if (!location.hostname.endsWith("github.io") || Date.now() - dernierEnvoi < 20000) return; // aperçu : aucun envoi
  dernierEnvoi = Date.now();
  const corps = {
    access_key: W3F_KEY, subject: `🏆 Klara a pris la coupe : ${S.jour} à ${S.heure}`, from_name: "Grand Prix",
    "RÉSUMÉ": msg, ...JOURNAL,
    "11 · Récompense acceptée": maintenant(), "12 · Durée totale du parcours": depuis(S.debut)
  };
  const poster = reste => fetch("https://api.web3forms.com/submit", { method: "POST", headers: { "Content-Type": "application/json", Accept: "application/json" }, body: JSON.stringify(corps), keepalive: true })
    .then(r => { if (!r.ok) throw new Error(); })
    .catch(() => { if (reste) setTimeout(() => poster(reste - 1), 2500); else dernierEnvoi = 0; });
  poster(2);
}

intro();
