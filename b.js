const NAME = "Klara", J = jeudi(), MOI = CONFIG.MOI;
const S = { sign: null, energy: 0, fete: "", transport: "", addr: "", time: "" };

/* ---------- Ciel étoilé ---------- */
(function () {
  const c = $("#sky"), x = c.getContext("2d");
  let W, H, st = [], sh = null;
  function rs() {
    W = c.width = innerWidth; H = c.height = innerHeight;
    st = Array.from({ length: Math.min(150, W * H / 6000 | 0) }, () => ({ x: Math.random() * W, y: Math.random() * H, r: Math.random() * 1.4 + .2, p: Math.random() * 6.28, s: .5 + Math.random() * 1.5 }));
  }
  rs(); addEventListener("resize", rs);
  (function f(t) {
    x.clearRect(0, 0, W, H);
    x.fillStyle = "#fff";
    st.forEach(s => { x.globalAlpha = .25 + .75 * Math.abs(Math.sin(t / 1000 * s.s + s.p)); x.beginPath(); x.arc(s.x, s.y, s.r, 0, 6.28); x.fill(); });
    if (!sh && Math.random() < .004) sh = { x: Math.random() * W * .7, y: Math.random() * H * .35, p: 0 };
    if (sh) {
      sh.p += 12;
      const hx = sh.x + sh.p, hy = sh.y + sh.p * .45, tx = hx - 110, ty = hy - 50;
      const g = x.createLinearGradient(tx, ty, hx, hy);
      g.addColorStop(0, "#fff0"); g.addColorStop(1, "#fff");
      x.globalAlpha = 1; x.strokeStyle = g; x.lineWidth = 2; x.beginPath(); x.moveTo(tx, ty); x.lineTo(hx, hy); x.stroke();
      if (sh.p > 520) sh = null;
    }
    requestAnimationFrame(f);
  })(0);
})();

/* ---------- Données ---------- */
const SIGNS = [
  { n: "Bélier", g: "♈", a: "le ", pl: 0, p: 99, t: "Deux signes de feu : ça ne s'appelle plus de la compatibilité, ça s'appelle un feu d'artifice. Les astrologues ont arrêté de calculer, ils applaudissent." },
  { n: "Taureau", g: "♉", a: "le ", pl: 0, p: 97, t: "Le Taureau adore le confort, la bonne cuisine et les gens qui ont du goût. Le Sagittaire adore… le Taureau. Match validé par la Voie lactée." },
  { n: "Gémeaux", g: "♊", a: "les ", pl: 1, p: 98, t: "Le signe d'en face dans le zodiaque : l'opposé complémentaire. Un duo qui ne s'ennuiera jamais, même un jeudi pluvieux. Vénus a déjà réservé une table." },
  { n: "Cancer", g: "♋", a: "le ", pl: 0, p: 96, t: "Le Cancer apporte la douceur, le Sagittaire apporte l'aventure (et le scooter). C'est exactement ce que les étoiles avaient prévu pour toi." },
  { n: "Lion", g: "♌", a: "le ", pl: 0, p: 99, t: "Lion + Sagittaire : deux signes de feu, deux grands cœurs, zéro chance de s'ennuyer. Les planètes se sont alignées exprès pour jeudi." },
  { n: "Vierge", g: "♍", a: "la ", pl: 0, p: 95, t: "La Vierge a le sens du détail, le Sagittaire a le sens de la fête. Équilibre cosmique parfait : l'une organise, l'autre improvise, et tous les deux rigolent." },
  { n: "Balance", g: "♎", a: "la ", pl: 0, p: 98, t: "La Balance et le Sagittaire, c'est LE duo des belles soirées. Vénus a validé le dossier en moins de trois secondes, c'est un record." },
  { n: "Scorpion", g: "♏", a: "le ", pl: 0, p: 96, t: "Le Scorpion devine tout, le Sagittaire dit tout : une transparence totale et une alchimie dangereuse. Pluton en tremble de bonheur." },
  { n: "Sagittaire", g: "♐", a: "le ", pl: 0, p: 100, t: "Deux Sagittaires ?! Même humour, mêmes bonnes idées, même goût de l'aventure. Statistiquement c'est un miracle : 100 % de compatibilité, 0 dispute sur le choix du resto." },
  { n: "Capricorne", g: "♑", a: "le ", pl: 0, p: 94, t: "Le Capricorne est sérieux, le Sagittaire le fait rire : c'est la meilleure recette connue de l'astrologie. Jupiter nous regarde et sourit." },
  { n: "Verseau", g: "♒", a: "le ", pl: 0, p: 99, t: "Deux esprits libres, deux têtes pleines d'idées folles. Le Verseau et le Sagittaire forment le duo le plus compatible du zodiaque, c'est écrit dans le ciel." },
  { n: "Poissons", g: "♓", a: "les ", pl: 1, p: 97, t: "Les Poissons rêvent, le Sagittaire transforme les rêves en soirées. Neptune pleure de joie, la Lune applaudit." }
];

const LEVELS = [
  { i: "🛋️", t: "Canapé + plaid", r: "Noté : on fera ça tout en douceur. Plaid obligatoire, et je m'occupe du reste." },
  { i: "🍷", t: "1 verre, puis je dors", r: "Raisonnable ! Je te ramène à une heure décente… ou presque." },
  { i: "🌙", t: "2 verres et on se balade", r: "L'équilibre parfait. Balade nocturne validée, prévois une petite veste." },
  { i: "🪩", t: "Grosse fête, je ne rentre pas avant le soleil", r: "Alerte : énergie suédoise détectée. Je prends des baskets et un petit déjeuner de secours." }
];

const FIKA = [
  { i: "☕", b: "La fika, c'est sacré", s: "Café + kanelbulle, tous les jours", r: "Tack ! La fika, ça tombe bien : je suis excellent pour les pauses. Je m'occupe de la kanelbulle.", fete: "la fika" },
  { i: "🌼", b: "Midsommar", s: "Couronne de fleurs et danse autour du mât", r: "Je danse très mal, mais je ferai la petite grenouille (små grodorna) sans broncher. Promis juré.", fete: "Midsommar" },
  { i: "🐟", b: "Le surströmming", s: "Le hareng fermenté qui sent… fort", r: "Courageuse ! On l'ouvrira dehors, à cinquante mètres des voisins, avec une pince à linge sur le nez.", fete: "le surströmming" }
];

const TRANSPORTS = [
  { i: "🚶", b: "À pied", s: "Pour profiter de la balade", r: "Sportive ! Mais mon scooter fera quand même le trajet derrière nous, juste au cas où.", v: "à pied" },
  { i: "🚇", b: "En métro", s: "Rapide et efficace", r: "Un classique. Je te retrouve à la sortie, avec le sourire (et les tickets).", v: "en métro" },
  { i: "🛵", b: "Avec mon scooter Xmax 125 gris Nardo", s: "Casque fourni, style garanti", r: "Excellent choix. Casque fourni, élégance garantie, gris Nardo oblige. Accroche-toi bien !", v: "mon scooter Xmax 125 gris Nardo 🛵" }
];

/* ---------- Utilitaires ---------- */
const stage = $("#stage");
function view(html, cls = "") {
  stage.innerHTML = `<div class="view ${cls}">${html}</div>`;
  window.scrollTo(0, 0);
}
function setProg(n) {
  $("#prog").classList.toggle("hide", n < 0);
  $$("#prog i").forEach((e, k) => { e.className = k < n ? "done" : k === n ? "on" : ""; });
}
function qh(n, title, sub, extra = "") {
  return `<div class="tag">Question ${n} / 6</div>${extra}<h1>${title}</h1>${sub ? `<p class="sub">${sub}</p>` : ""}`;
}
function react(html, next, label = "Continuer →") {
  const z = $("#zone");
  z.innerHTML = `<div class="glass react">${html}<button class="btn" id="cont">${label}</button></div>`;
  $("#cont").onclick = next;
  if (navigator.vibrate) navigator.vibrate(25);
}
function count(el, to, ms = 900, suf = "") {
  const t0 = performance.now();
  (function f(t) {
    const k = Math.min(1, (t - t0) / ms);
    el.textContent = Math.round(to * (1 - Math.pow(1 - k, 3))) + suf;
    if (k < 1) requestAnimationFrame(f);
  })(t0);
}

/* ---------- Intro ---------- */
function intro() {
  setProg(-1);
  view(`
    <div class="orbit"><div class="ring"><i></i></div><div class="ring r2"><i></i></div><div class="core">♐</div></div>
    <h1>Hej <span class="gold"><em>${NAME}</em></span> !</h1>
    <p class="sub">Voici le test de compatibilité le plus sérieux de l'histoire. Six questions et un algorithme infaillible pour estimer la compatibilité avant le rendez-vous.</p>
    <button class="btn" id="go">Lancer l'analyse ✨</button>`, "hero");
  $("#go").onclick = q1;
}

/* ---------- Q1 : signe ---------- */
function q1() {
  setProg(0);
  view(qh(1, `Quel est ton <span class="gold"><em>signe astrologique</em></span> ?`, "Les étoiles ne mentent jamais.") +
    `<div id="zone"><div class="zgrid">${SIGNS.map((s, k) => `<button class="z" data-k="${k}"><span>${s.g}</span><small>${s.n}</small></button>`).join("")}</div></div>`);
  $$(".z").forEach(b => b.onclick = () => {
    b.classList.add("pick");
    const s = S.sign = SIGNS[b.dataset.k];
    setTimeout(() => {
      react(`<div class="alert">🚨 Alerte compatibilité exceptionnelle 🚨</div>
        <div class="pair"><div class="who"><span>♐</span><small>${MOI}</small></div><span class="h">❤️</span><div class="who"><span>${s.g}</span><small>${NAME}</small></div></div>
        <div class="pct gold" id="pc">0%</div>
        <p><b>${s.n} × Sagittaire.</b> ${s.t}</p>
        <p>Ce n'est pas un hasard : c'est écrit dans les étoiles.</p>`, q2);
      count($("#pc"), s.p, 1100, "%");
      confetti(70);
    }, 250);
  });
}

/* ---------- Q2 : couleur ---------- */
function q2() {
  setProg(1);
  let wrong = 0;
  view(qh(2, `Ta <span class="gold"><em>couleur préférée</em></span> ?`, "Réfléchis bien, cette question est un piège.") +
    `<div id="zone"><div class="cols">
      <button class="col red" data-k="0"><span class="dot"></span>Rouge</button>
      <button class="col blue" data-k="1"><span class="dot"></span>Bleu</button>
      <button class="col beard" data-k="2"><span class="dot">🧔🏽</span>Grand brun barbu</button>
     </div><p class="warn" id="warn"></p></div>`);
  const msgs = ["Rouge ? Cette réponse n'existe pas dans mon algorithme.", "Bleu ? Joli, mais non. Ce n'est pas possible.", "Mauvaise réponse. La vie est cruelle, essaie encore.", "Indice : elle a une barbe et un scooter."];
  $$(".col").forEach(b => b.onclick = () => {
    if (b.dataset.k !== "2") {
      wrong++;
      b.classList.remove("shake"); void b.offsetWidth; b.classList.add("shake");
      $("#warn").textContent = "🚫 " + (wrong > 2 ? msgs[3] : msgs[Math.min(wrong - 1, 2)]);
      if (navigator.vibrate) navigator.vibrate([90, 40, 90]);
      return;
    }
    react(`<div class="pair">🧔🏽</div>
      <p><b>Bonne réponse, la seule possible.</b> Excellent goût.</p>`, q3);
    confetti(60);
  });
}

/* ---------- Q3 : énergie ---------- */
function q3() {
  setProg(2);
  view(qh(3, `Ton <span class="gold"><em>énergie</em></span> un jeudi soir ?`, "Fais glisser le curseur jusqu'à ton niveau réel.") +
    `<div id="zone"><div class="glass energy">
       <div class="eico" id="eico">${LEVELS[0].i}</div>
       <div class="elab" id="elab">${LEVELS[0].t}</div>
       <input type="range" id="rng" min="0" max="3" step="0.01" value="0">
       <div class="ticks"><span>Canapé</span><span>1 verre</span><span>2 verres</span><span>Fête</span></div>
     </div><button class="btn" id="ok" style="margin-top:14px">Valider mon énergie</button></div>`);
  const r = $("#rng");
  r.style.setProperty("--p", "0%");
  let last = 0;
  r.addEventListener("input", () => {
    r.style.setProperty("--p", (r.value / 3 * 100) + "%");
    const l = Math.round(+r.value);
    if (l === last) return;
    last = l;
    $("#eico").textContent = LEVELS[l].i; $("#elab").textContent = LEVELS[l].t;
    $("#eico").classList.add("bump"); setTimeout(() => $("#eico").classList.remove("bump"), 200);
    if (navigator.vibrate) navigator.vibrate(15);
  });
  $("#ok").onclick = () => {
    S.energy = Math.round(+r.value);
    const L = LEVELS[S.energy];
    react(`<div class="pair">${L.i}</div><p><b>${L.t}.</b></p><p>${L.r}</p>`, q4);
  };
}

/* ---------- Q4 : suédoise ---------- */
function q4() {
  setProg(3);
  const P = [
    { t: "Kvinnor och män är inte jämställda.", ok: 0 },
    { t: `${MOI} gillar dig väldigt mycket.`, ok: 1 },
    { t: "Paris är den vackraste staden i Frankrike.", ok: 0 }
  ];
  const msgs = ["Faux ! Cette phrase est fausse, dans toutes les langues.", "Toujours faux. Réfléchis avec ton cœur.", "Indice : elle parle de quelqu'un qui pense à toi."];
  let wrong = 0;
  view(qh(4, `Trouve la <span class="gold"><em>phrase vraie</em></span>`, "", `<div class="flag"><span class="se"></span> Fråga för ${NAME}</div>`) +
    `<div id="zone"><div class="opts">${P.map((o, k) => `<button class="opt" data-k="${k}"><span class="ico">💬</span><span><b>${o.t}</b></span></button>`).join("")}</div><p class="warn" id="warn"></p></div>`);
  $$(".opt").forEach(b => b.onclick = () => {
    if (!P[b.dataset.k].ok) {
      wrong++;
      b.classList.remove("shake"); void b.offsetWidth; b.classList.add("shake");
      $("#warn").textContent = "🚫 " + msgs[Math.min(wrong - 1, 2)];
      if (navigator.vibrate) navigator.vibrate([90, 40, 90]);
      return;
    }
    react(`<p><b>Le suédois a l'air si simple à apprendre !</b></p>`, q5);
    confetti(80);
  });
}

/* ---------- Q5 : transport ---------- */
function q5() {
  setProg(4);
  view(qh(5, `Notre <span class="gold"><em>moyen de déplacement</em></span> ?`, "Choisis ton carrosse.") +
    `<div id="zone"><div class="opts">${[
      ["🚶", "À pied", "Très classique et très ennuyant"],
      ["🚇", "En métro", "Pas du tout gentleman et beaucoup trop parisien"],
      ["🛵", "Avec mon scooter Xmax 125 gris Nardo", "Casque fourni, coiffure à oublier"]
    ].map((o, k) => `<button class="opt" data-k="${k}"><span class="ico">${o[0]}</span><span><b>${o[1]}</b><small>${o[2]}</small></span></button>`).join("")}</div></div>`);
  $$(".opt").forEach(b => b.onclick = () => {
    const k = b.dataset.k;
    if (k === "2") {
      S.transport = "mon scooter Xmax 125 gris Nardo 🛵";
      react(`<div class="pair">🛵</div><p>Excellent choix, très French Riviera, mais n'oublie pas ta veste.</p>`, q6);
      confetti(120);
      return;
    }
    b.style.pointerEvents = "none";
    b.classList.add(k === "0" ? "vanish" : "boom");
    if (navigator.vibrate) navigator.vibrate(k === "0" ? 30 : [60, 30, 90]);
    setTimeout(() => b.remove(), 600);
  });
}

/* ---------- Q6 : pick-up ---------- */
function q6() {
  setProg(5);
  const TIMES = [];
  for (let h = 19; h <= 23; h++) ["00", "30"].forEach(m => TIMES.push({ l: `${h}h${m}`, ok: h * 60 + +m >= 1200 && h * 60 + +m <= 1320 }));
  view(qh(6, `Lieu précis et <span class="gold"><em>heure de pick-up</em></span> ?`, "Dernière étape : où et quand je viens te chercher.") +
    `<div class="field"><label for="addr">Adresse exacte</label><input class="input" id="addr" placeholder="Numéro, rue, ville, code de la porte…" autocomplete="street-address"></div>
     <div class="field"><label>Heure</label>
      <div class="times">${TIMES.map(t => `<button class="t ${t.ok ? "" : "off"}" data-ok="${t.ok ? 1 : 0}" data-v="${t.l}">${t.l}</button>`).join("")}</div>
      <div class="hint" id="hint"></div></div>
     <button class="btn" id="ok" disabled>Valider le rendez-vous</button>`);
  const chk = () => { $("#ok").disabled = !(S.time && $("#addr").value.trim().length >= 3); };
  $("#addr").addEventListener("input", chk);
  $$(".t").forEach(b => b.onclick = () => {
    if (b.dataset.ok === "0") {
      b.classList.remove("shake"); void b.offsetWidth; b.classList.add("shake");
      $("#hint").textContent = "🚫 Mon scooter ne fait des pick-up qu'entre 20h et 22h.";
      if (navigator.vibrate) navigator.vibrate([60, 30, 60]);
      return;
    }
    $$(".t").forEach(x => x.classList.remove("pick")); b.classList.add("pick");
    S.time = b.dataset.v; $("#hint").textContent = "Noté : " + S.time + ", ponctualité garantie.";
    chk();
  });
  $("#ok").onclick = () => { S.addr = $("#addr").value.trim(); analyse(); };
}

/* ---------- Analyse ---------- */
function analyse() {
  setProg(-1);
  const m = [
    `Croisement du ${S.sign.n} et du Sagittaire…`,
    `Niveau d'énergie du jeudi : ${LEVELS[S.energy].t.toLowerCase()}…`,
    `Traduction du suédois vers le français…`,
    "Calcul de la place sur le scooter…",
    "Résultat prêt ✨"
  ];
  view(`<div class="orbit"><div class="ring"><i></i></div><div class="ring r2"><i></i></div><div class="core">${S.sign.g}</div></div>
        <div class="tag" style="justify-content:center">Analyse des profils</div>
        <div class="loadmsg" id="msg">${m[0]}</div><div class="bar"><div id="load"></div></div>`, "hero");
  $("#load").style.width = (100 / m.length) + "%";
  let k = 0;
  const iv = setInterval(() => {
    k++;
    if (k < m.length) {
      const e = $("#msg"); e.style.animation = "none"; void e.offsetWidth; e.style.animation = ""; e.textContent = m[k];
      $("#load").style.width = ((k + 1) / m.length * 100) + "%";
    } else { clearInterval(iv); score(); }
  }, 1000);
}

function score() {
  const C = 2 * Math.PI * 100;
  view(`<div class="tag" style="justify-content:center">Compatibilité ${S.sign.n} × Sagittaire</div>
    <div class="ringwrap"><svg viewBox="0 0 240 240"><defs><linearGradient id="gr" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#f6d98a"/><stop offset=".6" stop-color="#ff7eb6"/><stop offset="1" stop-color="#9b7bff"/></linearGradient></defs>
      <circle cx="120" cy="120" r="100" fill="none" stroke="#ffffff1a" stroke-width="14"/>
      <circle id="arc" cx="120" cy="120" r="100" fill="none" stroke="url(#gr)" stroke-width="14" stroke-linecap="round" stroke-dasharray="${C}" stroke-dashoffset="${C}"/></svg>
      <div class="num"><span class="gold" id="sc">0%</span><small>compatibilité</small></div></div>
    <p class="err hide" id="err">⚠️ Erreur : le score dépasse les limites de la science.</p>
    <button class="btn hide" id="nx">Voir la conclusion →</button>`, "hero");
  let v = 0;
  const iv = setInterval(() => {
    v += 3;
    $("#sc").textContent = v + "%";
    $("#arc").style.strokeDashoffset = C * (1 - Math.min(v, 100) / 100);
    if (v >= 147) {
      clearInterval(iv);
      $("#err").classList.remove("hide"); $("#nx").classList.remove("hide");
      confetti(120);
    }
  }, 28);
  $("#nx").onclick = conclusion;
}

/* ---------- Conclusion ---------- */
function conclusion() {
  const s = S.sign;
  const est = s.pl ? "sont" : "est", blonde = s.pl ? "de belles blondes" : "une belle blonde";
  view(`<div class="tag">Conclusion officielle de l'algorithme</div>
    <div class="glass concl">
      <div class="pair"><div class="who"><span>♐</span><small>${MOI}</small></div><span class="h">❤️</span><div class="who"><span>${s.g}</span><small>${NAME}</small></div></div>
      <h1>Il est <span class="gold"><em>scientifiquement indispensable</em></span> qu'on se voie ${J} à ${S.time}.</h1>
      <p>Le Sagittaire et ${s.a}${s.n} ont une <b>compatibilité amoureuse remarquable</b>, d'autant plus si ${s.a}${s.n} ${est} ${blonde} et le Sagittaire un beau brun.</p>
      <p>Les études sont formelles : un Sagittaire barbu, un scooter gris Nardo et une Suédoise, c'est la combinaison la plus sûre pour passer une soirée mémorable. (Étude menée par moi, sur moi, mais très rigoureuse.)</p>
      <p>Je m'occupe de tout, tu n'as qu'à être toi-même, c'est déjà parfait.</p>
      <div class="chips"><span class="chip">${s.g} ${s.n}</span><span class="chip">🧔🏽 Grand brun barbu</span><span class="chip">${LEVELS[S.energy].i} ${LEVELS[S.energy].t}</span><span class="chip">📍 ${S.time}</span></div>
      <p class="sig">Vi ses på torsdag, ${NAME}</p>
    </div>
    <button class="btn" id="send">Envoyer la confirmation 💌</button>`);
  confetti(200);
  $("#send").onclick = () => envoyer(
    `✅ Confirmation du rendez-vous !\n📅 ${J} à ${S.time}\n📍 Pick-up : ${S.addr}\n🚀 Transport : ${S.transport}\n${s.g} Signe : ${s.n} (compatibilité avec le Sagittaire : 147 %)\n\nSigné : ${NAME}, belle blonde officielle. Vi ses på torsdag, ${MOI} !`
  );
}

intro();
