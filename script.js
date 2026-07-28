
/* ===== Unique view counter (once per browser) ===== */
(function() {
  const el = document.getElementById('viewCount');
  if (!el) return;
  const KEY = 'jinx_viewed';
  const COUNT_KEY = 'jinx_view_total';
  // Simple shared counter in localStorage (per-device unique)
  // For a real global counter you'd need a backend; this counts unique browsers that opened the page.
  let total = parseInt(localStorage.getItem(COUNT_KEY) || '0', 10);
  if (!localStorage.getItem(KEY)) {
    total += 1;
    localStorage.setItem(KEY, '1');
    localStorage.setItem(COUNT_KEY, String(total));
  }
  el.textContent = 'Views: ' + total;
})();

/* ===== Audio Engine (Web Audio API) ===== */
let audioCtx = null;
let soundEnabled = localStorage.getItem('jinxSound') !== 'off';

function getAudio() {
  if (!audioCtx) {
    audioCtx = new (window.AudioContext || window.webkitAudioContext)();
  }
  if (audioCtx.state === 'suspended') audioCtx.resume();
  return audioCtx;
}

function playTone(freq, duration, type, volume) {
  if (!soundEnabled) return;
  type = type || 'sine';
  volume = volume || 0.08;
  try {
    const ctx = getAudio();
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = type;
    osc.frequency.value = freq;
    gain.gain.setValueAtTime(volume, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + duration);
    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.start();
    osc.stop(ctx.currentTime + duration);
  } catch (e) {}
}

function playPurr() {
  if (!soundEnabled) return;
  try {
    const ctx = getAudio();
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    const filter = ctx.createBiquadFilter();
    osc.type = 'sawtooth';
    osc.frequency.value = 45;
    filter.type = 'lowpass';
    filter.frequency.value = 180;
    gain.gain.setValueAtTime(0.04, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.45);
    osc.connect(filter);
    filter.connect(gain);
    gain.connect(ctx.destination);
    osc.start();
    osc.stop(ctx.currentTime + 0.5);
    setTimeout(function() { playTone(220, 0.12, 'sine', 0.05); }, 80);
  } catch (e) {}
}

function playClick() {
  playTone(800, 0.06, 'sine', 0.06);
}

function playSuccess() {
  playTone(520, 0.08, 'sine', 0.07);
  setTimeout(function() { playTone(720, 0.1, 'sine', 0.06); }, 70);
}

/* ===== Sound Toggle ===== */
const soundToggle = document.getElementById('soundToggle');
if (!soundEnabled) soundToggle.classList.add('muted');

soundToggle.addEventListener('click', function() {
  soundEnabled = !soundEnabled;
  localStorage.setItem('jinxSound', soundEnabled ? 'on' : 'off');
  soundToggle.classList.toggle('muted', !soundEnabled);
  if (soundEnabled) {
    playClick();
    getAudio();
  }
});

/* ===== Theme Toggle ===== */
const themeToggle = document.getElementById('themeToggle');
const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
const savedTheme = localStorage.getItem('theme');

if (savedTheme === 'light' || (!savedTheme && !prefersDark)) {
  document.body.classList.add('light');
}

themeToggle.addEventListener('click', function() {
  document.body.classList.toggle('light');
  localStorage.setItem('theme', document.body.classList.contains('light') ? 'light' : 'dark');
  playClick();
});

/* ===== Mobile Menu ===== */
const hamburger = document.getElementById('hamburger');
const mobileMenu = document.getElementById('mobileMenu');

hamburger.addEventListener('click', function() {
  hamburger.classList.toggle('open');
  mobileMenu.classList.toggle('open');
  document.body.style.overflow = mobileMenu.classList.contains('open') ? 'hidden' : '';
  playClick();
});

mobileMenu.querySelectorAll('a').forEach(function(link) {
  link.addEventListener('click', function() {
    hamburger.classList.remove('open');
    mobileMenu.classList.remove('open');
    document.body.style.overflow = '';
  });
});

/* ===== Cursor Glow ===== */
const glow = document.getElementById('cursor-glow');
let mouseX = 0, mouseY = 0, glowX = 0, glowY = 0;

document.addEventListener('mousemove', function(e) {
  mouseX = e.clientX;
  mouseY = e.clientY;
  if (glow) glow.style.opacity = '1';
});
document.addEventListener('mouseleave', function() {
  if (glow) glow.style.opacity = '0';
});

function animateGlow() {
  glowX += (mouseX - glowX) * 0.12;
  glowY += (mouseY - glowY) * 0.12;
  if (glow) {
    glow.style.left = glowX + 'px';
    glow.style.top = glowY + 'px';
  }
  requestAnimationFrame(animateGlow);
}
animateGlow();

/* ===== Particles ===== */
const canvas = document.getElementById('particles');
const pctx = canvas.getContext('2d');
let particles = [];
let w, h;

function resize() {
  w = canvas.width = window.innerWidth;
  h = canvas.height = window.innerHeight;
}
window.addEventListener('resize', resize);
resize();

function createParticles() {
  particles = [];
  const count = Math.min(55, Math.floor(w / 25));
  for (let i = 0; i < count; i++) {
    particles.push({
      x: Math.random() * w,
      y: Math.random() * h,
      r: Math.random() * 1.8 + 0.4,
      vx: (Math.random() - 0.5) * 0.25,
      vy: (Math.random() - 0.5) * 0.25,
      a: Math.random() * 0.4 + 0.1
    });
  }
}
createParticles();
window.addEventListener('resize', createParticles);

function drawParticlesEnhanced() {
  pctx.clearRect(0, 0, w, h);
  const isLight = document.body.classList.contains('light');
  particles = particles.filter(function(p) {
    if (p.life !== undefined) {
      p.life--;
      p.a *= 0.94;
      p.x += p.vx;
      p.y += p.vy;
      p.vy += 0.05;
      if (p.life <= 0) return false;
    } else {
      p.x += p.vx;
      p.y += p.vy;
      if (p.x < 0) p.x = w;
      if (p.x > w) p.x = 0;
      if (p.y < 0) p.y = h;
      if (p.y > h) p.y = 0;
    }
    pctx.beginPath();
    pctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
    if (p.life !== undefined) {
      pctx.fillStyle = isLight
        ? 'rgba(244, 114, 182, ' + (p.a * 0.6) + ')'
        : 'rgba(244, 114, 182, ' + p.a + ')';
    } else {
      pctx.fillStyle = isLight
        ? 'rgba(124, 92, 252, ' + (p.a * 0.5) + ')'
        : 'rgba(180, 160, 255, ' + p.a + ')';
    }
    pctx.fill();
    return true;
  });
  requestAnimationFrame(drawParticlesEnhanced);
}
drawParticlesEnhanced();

/* ===== Scroll Progress ===== */
const progressBar = document.createElement('div');
progressBar.className = 'scroll-progress';
document.body.prepend(progressBar);

window.addEventListener('scroll', function() {
  const scrollTop = window.scrollY;
  const docHeight = document.documentElement.scrollHeight - window.innerHeight;
  const pct = docHeight > 0 ? (scrollTop / docHeight) * 100 : 0;
  progressBar.style.width = pct + '%';
});

/* ===== Cat Petting ===== */
const catVisual = document.getElementById('catVisual');
const petCountEl = document.getElementById('petCount');
let pets = parseInt(localStorage.getItem('jinxPets') || '0', 10);
petCountEl.textContent = 'Pets: ' + pets;

function spawnPetParticles(x, y) {
  for (let i = 0; i < 14; i++) {
    particles.push({
      x: x,
      y: y,
      r: Math.random() * 2.5 + 1,
      vx: (Math.random() - 0.5) * 4.5,
      vy: (Math.random() - 0.5) * 4.5 - 1.5,
      a: 0.85,
      life: 45
    });
  }
}

catVisual.addEventListener('click', function(e) {
  pets++;
  localStorage.setItem('jinxPets', pets);
  petCountEl.textContent = 'Pets: ' + pets;
  catVisual.classList.add('petting');
  setTimeout(function() { catVisual.classList.remove('petting'); }, 400);
  playPurr();
  const rect = catVisual.getBoundingClientRect();
  spawnPetParticles(rect.left + rect.width / 2, rect.top + rect.height / 2 - 40);
});

/* ===== Cat Facts ===== */
const catFactEl = document.getElementById('catFact');
const newFactBtn = document.getElementById('newFact');

const fallbackFacts = [
  'Cats sleep for 70% of their lives.',
  'A group of cats is called a clowder.',
  'Cats can jump up to 6 times their length.',
  "A cat's nose print is unique, like a human fingerprint.",
  'Cats have 32 muscles in each ear.',
  'The oldest known pet cat existed 9,500 years ago.',
  'Cats can make over 100 different sounds.',
  "A cat's whiskers are roughly as wide as its body.",
  'Cats cannot taste sweetness.',
  'The average cat runs at about 30 mph.'
];

async function loadCatFact() {
  catFactEl.textContent = 'Loading a cat fact...';
  try {
    const res = await fetch('https://catfact.ninja/fact');
    if (!res.ok) throw new Error();
    const data = await res.json();
    catFactEl.textContent = data.fact;
  } catch (e) {
    catFactEl.textContent = fallbackFacts[Math.floor(Math.random() * fallbackFacts.length)];
  }
  playClick();
}

newFactBtn.addEventListener('click', loadCatFact);
loadCatFact();

/* ===== Copy Discord ===== */
const copyBtn = document.getElementById('copyDiscord');
const discordHandle = document.getElementById('discordHandle').textContent;

copyBtn.addEventListener('click', async function() {
  try {
    await navigator.clipboard.writeText(discordHandle);
    const original = copyBtn.innerHTML;
    copyBtn.innerHTML = '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="20 6 9 17 4 12"></polyline></svg> Copied!';
    copyBtn.style.background = 'var(--mint)';
    playSuccess();
    setTimeout(function() {
      copyBtn.innerHTML = original;
      copyBtn.style.background = '';
    }, 2000);
  } catch (e) {
    alert('Copy failed - username is: ' + discordHandle);
  }
});

/* ===== Button hover micro sounds ===== */
document.querySelectorAll('.btn, .theme-toggle, .sound-toggle').forEach(function(el) {
  el.addEventListener('mouseenter', function() {
    if (soundEnabled) playTone(600, 0.03, 'sine', 0.03);
  });
});

/* ===== Smooth reveal on scroll ===== */
const observer = new IntersectionObserver(
  function(entries) {
    entries.forEach(function(entry, i) {
      if (entry.isIntersecting) {
        setTimeout(function() { entry.target.classList.add('in'); }, i * 50);
      }
    });
  },
  { threshold: 0.1, rootMargin: '0px 0px -30px 0px' }
);

document.querySelectorAll('.exp-card, .why-card, .about-card, .cat-box, .contact-card').forEach(function(el) {
  el.style.opacity = '0';
  el.style.transform = 'translateY(28px)';
  el.style.transition = 'opacity 0.65s ease, transform 0.65s ease';
  observer.observe(el);
});

const styleEl = document.createElement('style');
styleEl.textContent = '.exp-card.in, .why-card.in, .about-card.in, .cat-box.in, .contact-card.in { opacity: 1 !important; transform: translateY(0) !important; }';
document.head.appendChild(styleEl);

/* ===== Active nav link ===== */
const sections = document.querySelectorAll('section[id], header[id]');
const navLinks = document.querySelectorAll('.nav-links a');

window.addEventListener('scroll', function() {
  let current = '';
  sections.forEach(function(section) {
    const top = section.offsetTop - 120;
    if (scrollY >= top) current = section.getAttribute('id');
  });
  navLinks.forEach(function(link) {
    link.style.color = '';
    if (link.getAttribute('href') === '#' + current) {
      link.style.color = 'var(--purple-lt)';
    }
  });
});



/* ===== Discord badges (full icons from Lanyard flags) ===== */
const BADGE_DEFS = [
  { bit: 1 << 0,  id: "staff",      title: "Discord Staff",        svg: '<svg viewBox="0 0 24 24" width="18" height="18"><path fill="#5865F2" d="M12 2L9 8H3l5 4-2 7 6-4 6 4-2-7 5-4h-6z"/></svg>' },
  { bit: 1 << 1,  id: "partner",    title: "Partnered Server Owner", svg: '<svg viewBox="0 0 24 24" width="18" height="18"><path fill="#5865F2" d="M12 2C6.5 2 2 6.5 2 12s4.5 10 10 10 10-4.5 10-10S17.5 2 12 2zm-1 15l-5-5 1.4-1.4L11 14.2l7.6-7.6L20 8l-9 9z"/></svg>' },
  { bit: 1 << 2,  id: "hypesquad",  title: "HypeSquad Events",     svg: '<svg viewBox="0 0 24 24" width="18" height="18"><path fill="#F47B67" d="M12 2l2.4 7.2H22l-6 4.8 2.3 7L12 16.8 5.7 21l2.3-7-6-4.8h7.6z"/></svg>' },
  { bit: 1 << 3,  id: "bughunter1", title: "Bug Hunter",           svg: '<svg viewBox="0 0 24 24" width="18" height="18"><path fill="#3BA55C" d="M20 8h-2.8l1.4-1.4-1.4-1.4L14.8 7H12V4h-1v3H8.2L6.8 5.2 5.4 6.6 6.8 8H4c-1.1 0-2 .9-2 2v2h2v-1h2v6H4v-1H2v3c0 1.1.9 2 2 2h4v-2H6v-6h4v8h1v-8h4v6h-2v2h4c1.1 0 2-.9 2-2v-3h-2v1h-2v-6h2v1h2v-2c0-1.1-.9-2-2-2z"/></svg>' },
  { bit: 1 << 6,  id: "bravery",    title: "HypeSquad Bravery",    svg: '<svg viewBox="0 0 24 24" width="18" height="18"><path fill="#9B84EE" d="M12 2L4 5v6c0 5.5 3.8 10.7 8 12 4.2-1.3 8-6.5 8-12V5l-8-3z"/></svg>' },
  { bit: 1 << 7,  id: "brilliance", title: "HypeSquad Brilliance", svg: '<svg viewBox="0 0 24 24" width="18" height="18"><path fill="#F47B67" d="M12 2L4 5v6c0 5.5 3.8 10.7 8 12 4.2-1.3 8-6.5 8-12V5l-8-3z"/></svg>' },
  { bit: 1 << 8,  id: "balance",    title: "HypeSquad Balance",    svg: '<svg viewBox="0 0 24 24" width="18" height="18"><path fill="#45DDC0" d="M12 2L4 5v6c0 5.5 3.8 10.7 8 12 4.2-1.3 8-6.5 8-12V5l-8-3z"/></svg>' },
  { bit: 1 << 9,  id: "early",      title: "Early Supporter",      svg: '<svg viewBox="0 0 24 24" width="18" height="18"><path fill="#9B84EE" d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z"/></svg>' },
  { bit: 1 << 14, id: "bughunter2", title: "Bug Hunter Level 2",   svg: '<svg viewBox="0 0 24 24" width="18" height="18"><path fill="#C6E0A4" d="M20 8h-2.8l1.4-1.4-1.4-1.4L14.8 7H12V4h-1v3H8.2L6.8 5.2 5.4 6.6 6.8 8H4c-1.1 0-2 .9-2 2v2h2v-1h2v6H4v-1H2v3c0 1.1.9 2 2 2h4v-2H6v-6h4v8h1v-8h4v6h-2v2h4c1.1 0 2-.9 2-2v-3h-2v1h-2v-6h2v1h2v-2c0-1.1-.9-2-2-2z"/></svg>' },
  { bit: 1 << 17, id: "botdev",     title: "Early Verified Bot Developer", svg: '<svg viewBox="0 0 24 24" width="18" height="18"><path fill="#3BA55C" d="M8 7h2v2H8V7zm6 0h2v2h-2V7zM9 14c0 1.7 1.3 3 3 3s3-1.3 3-3h-2c0 .6-.4 1-1 1s-1-.4-1-1H9zm-5-2v5c0 1.1.9 2 2 2h12c1.1 0 2-.9 2-2v-5H4zm16-3c0-2.8-2.2-5-5-5H9C6.2 4 4 6.2 4 9v1h16V9z"/></svg>' },
  { bit: 1 << 18, id: "mod",        title: "Moderator Programs Alumni", svg: '<svg viewBox="0 0 24 24" width="18" height="18"><path fill="#5865F2" d="M12 1L3 5v6c0 5.55 3.84 10.74 9 12 5.16-1.26 9-6.45 9-12V5l-9-4zm-2 16l-4-4 1.41-1.41L10 14.17l6.59-6.59L18 9l-8 8z"/></svg>' },
  { bit: 1 << 22, id: "activedev",  title: "Active Developer",     svg: '<svg viewBox="0 0 24 24" width="18" height="18"><path fill="#23A559" d="M8.5 6L3 12l5.5 6L10 16.5 5.5 12 10 7.5 8.5 6zm7 0L14 7.5 18.5 12 14 16.5 15.5 18l5.5-6-5.5-6z"/></svg>' }
];

const NITRO_SVG = '<svg viewBox="0 0 24 24" width="18" height="18"><path fill="#FF73FA" d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 3c1.66 0 3 1.79 3 4s-1.34 4-3 4-3-1.79-3-4 1.34-4 3-4zm0 14.2c-2.5 0-4.71-1.28-6-3.22.03-1.99 4-3.08 6-3.08 1.99 0 5.97 1.09 6 3.08-1.29 1.94-3.5 3.22-6 3.22z"/></svg>';

function renderBadges(user) {
  const box = document.getElementById("discordBadges");
  if (!box || !user) return;
  box.innerHTML = "";
  const flags = user.public_flags || 0;

  BADGE_DEFS.forEach(function(b) {
    if (flags & b.bit) {
      const el = document.createElement("span");
      el.className = "discord-badge";
      el.title = b.title;
      el.innerHTML = b.svg;
      box.appendChild(el);
    }
  });

  // Nitro (premium_type: 1 Classic, 2 Nitro, 3 Basic)
  if (user.premium_type === 1 || user.premium_type === 2 || user.premium_type === 3) {
    const el = document.createElement("span");
    el.className = "discord-badge";
    el.title = user.premium_type === 2 ? "Nitro" : (user.premium_type === 1 ? "Nitro Classic" : "Nitro Basic");
    el.innerHTML = NITRO_SVG;
    box.appendChild(el);
  }
}

/* ===== Live Discord Status via Lanyard ===== */

/*
  HOW TO ENABLE LIVE STATUS:
  1. Open Discord → Settings → Advanced → turn on Developer Mode
  2. Right-click your own profile → "Copy User ID"
  3. Paste the number below between the quotes
  4. Join the Lanyard Discord (https://discord.gg/lanyard) so it can see your status
*/
const DISCORD_USER_ID = '790275674785972245';  // live Discord status via Lanyard

const statusDot = document.getElementById('statusDot');
const presenceStatus = document.getElementById('presenceStatus');
const presenceGame = document.getElementById('presenceGame');

const STATUS_MAP = {
  online:  { label: 'Online',          class: 'online' },
  idle:    { label: 'Idle',            class: 'idle' },
  dnd:     { label: 'Do Not Disturb',  class: 'dnd' },
  offline: { label: 'Offline',         class: 'offline' }
};

function applyPresence(discordStatus, activities) {
  const info = STATUS_MAP[discordStatus] || STATUS_MAP.offline;

  if (statusDot) {
    statusDot.dataset.status = info.class;
    statusDot.title = info.label;
  }
  if (presenceStatus) {
    presenceStatus.textContent = info.label;
    presenceStatus.className = 'presence-status ' + info.class;
  }

  // Only show real games (activity type 0 = Playing). Never treat custom status as a game.
  let gameName = '';
  if (activities && activities.length) {
    const playing = activities.find(function(a) { return a.type === 0; });
    if (playing) gameName = playing.name || '';
  }

  if (presenceGame) {
    if (gameName && discordStatus !== 'offline') {
      presenceGame.textContent = gameName;
      presenceGame.classList.add('show');
    } else {
      presenceGame.textContent = '';
      presenceGame.classList.remove('show');
    }
  }
}

async function fetchLanyard() {
  if (!DISCORD_USER_ID) {
    // No ID set – show a neutral online state
    applyPresence('online', []);
    return;
  }
  try {
    const res = await fetch('https://api.lanyard.rest/v1/users/' + DISCORD_USER_ID);
    if (!res.ok) throw new Error('Lanyard ' + res.status);
    const json = await res.json();
    if (!json.success) throw new Error('Lanyard fail');
    const d = json.data;
    applyPresence(d.discord_status || 'offline', d.activities || []);
    if (d.discord_user) renderBadges(d.discord_user);
  } catch (e) {
    console.warn('Lanyard error:', e);
    applyPresence('offline', []);
  }
}

// Initial + poll every 30 seconds
fetchLanyard();
setInterval(fetchLanyard, 30000);





/* ===== Smooth scroll with offset for sticky nav ===== */
document.querySelectorAll('a[href^="#"]').forEach(function(a) {
  a.addEventListener('click', function(e) {
    const id = a.getAttribute('href');
    if (!id || id === '#') return;
    const target = document.querySelector(id);
    if (!target) return;
    e.preventDefault();
    const top = target.getBoundingClientRect().top + window.scrollY - 70;
    window.scrollTo({ top: top, behavior: 'smooth' });
  });
});


/* ===== Design Theme Picker (custom UI) ===== */
const THEMES = [
  { id: "midnight",  name: "Midnight",      colors: ["#7c5cfc", "#f472b6", "#34d399"] },
  { id: "minimal",   name: "Minimal Light", colors: ["#18181b", "#a1a1aa", "#16a34a"] },
  { id: "cyber",     name: "Cyber Neon",    colors: ["#00f0ff", "#ff00aa", "#00ff9d"] },
  { id: "pastel",    name: "Soft Pastel",   colors: ["#e8919a", "#c97b9a", "#7cb89a"] },
  { id: "terminal",  name: "Terminal",      colors: ["#33ff66", "#2a9a4a", "#66ff99"] },
  { id: "glass",     name: "Glass",         colors: ["#a78bfa", "#f9a8d4", "#34d399"] },
  { id: "brutalist", name: "Brutalist",     colors: ["#ffffff", "#0f0", "#111111"] },
  { id: "ocean",     name: "Ocean",         colors: ["#38bdf8", "#22d3ee", "#2dd4bf"] },
  { id: "sunset",    name: "Sunset",        colors: ["#f97316", "#f43f5e", "#fbbf24"] },
  { id: "nord",      name: "Nord",          colors: ["#88c0d0", "#b48ead", "#a3be8c"] },
  { id: "synthwave", name: "Synthwave",     colors: ["#ff2a6d", "#05d9e8", "#d1f7ff"] },
  { id: "ember",     name: "Ember",         colors: ["#ef4444", "#fb7185", "#fbbf24"] },
  { id: "discord",   name: "Discord",       colors: ["#5865f2", "#eb459e", "#23a559"] },
  { id: "mono",      name: "Monochrome",    colors: ["#ffffff", "#888888", "#333333"] },
  { id: "forest",    name: "Forest",        colors: ["#4ade80", "#a3e635", "#22c55e"] }
];

(function initThemeUI() {
  const ui = document.getElementById("themeUI");
  const trigger = document.getElementById("themeTrigger");
  const panel = document.getElementById("themePanel");
  const grid = document.getElementById("themeGrid");
  const label = document.getElementById("themeLabel");
  const swatches = document.getElementById("themeSwatches");
  if (!ui || !trigger || !panel || !grid) return;

  let current = localStorage.getItem("jinxDesign") || "midnight";

  function applyTheme(id) {
    current = id;
    if (id === "midnight") {
      document.body.removeAttribute("data-theme");
    } else {
      document.body.setAttribute("data-theme", id);
    }
    localStorage.setItem("jinxDesign", id);
    const t = THEMES.find(function(x) { return x.id === id; }) || THEMES[0];
    if (label) label.textContent = t.name;
    if (swatches) {
      swatches.innerHTML = t.colors.map(function(c) {
        return '<i style="background:' + c + '"></i>';
      }).join("");
    }
    grid.querySelectorAll(".theme-option").forEach(function(btn) {
      btn.classList.toggle("active", btn.dataset.theme === id);
    });
  }

  THEMES.forEach(function(t) {
    const btn = document.createElement("button");
    btn.type = "button";
    btn.className = "theme-option" + (t.id === current ? " active" : "");
    btn.dataset.theme = t.id;
    btn.setAttribute("role", "option");
    btn.innerHTML =
      '<span class="dots">' +
        t.colors.map(function(c) { return '<i style="background:' + c + '"></i>'; }).join("") +
      '</span><span class="name">' + t.name + '</span>';
    btn.addEventListener("click", function() {
      applyTheme(t.id);
      closePanel();
      if (typeof playClick === "function") playClick();
    });
    grid.appendChild(btn);
  });

  function openPanel() {
    panel.hidden = false;
    trigger.setAttribute("aria-expanded", "true");
  }
  function closePanel() {
    panel.hidden = true;
    trigger.setAttribute("aria-expanded", "false");
  }

  trigger.addEventListener("click", function(e) {
    e.stopPropagation();
    if (panel.hidden) openPanel(); else closePanel();
  });

  document.addEventListener("click", function(e) {
    if (!ui.contains(e.target)) closePanel();
  });

  document.addEventListener("keydown", function(e) {
    if (e.key === "Escape") closePanel();
  });

  applyTheme(current);
})();

/* ===== Unlock audio on first gesture ===== */
['click', 'touchstart', 'keydown'].forEach(function(evt) {
  document.addEventListener(evt, function() { getAudio(); }, { once: true });
});
