
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



/* ===== Discord badges from Lanyard public_flags ===== */
const FLAG_BADGES = [
  { bit: 1 << 0,  name: 'Staff' },
  { bit: 1 << 1,  name: 'Partner' },
  { bit: 1 << 2,  name: 'Hypesquad' },
  { bit: 1 << 3,  name: 'Bug Hunter' },
  { bit: 1 << 6,  name: 'Hype Bravery' },
  { bit: 1 << 7,  name: 'Hype Brilliance' },
  { bit: 1 << 8,  name: 'Hype Balance' },
  { bit: 1 << 9,  name: 'Early Supporter' },
  { bit: 1 << 14, name: 'Bug Hunter+' },
  { bit: 1 << 17, name: 'Verified Bot Dev' },
  { bit: 1 << 18, name: 'Moderator' },
  { bit: 1 << 22, name: 'Active Developer' }
];

function renderBadges(user) {
  const box = document.getElementById('discordBadges');
  if (!box || !user) return;
  box.innerHTML = '';
  const flags = user.public_flags || 0;
  FLAG_BADGES.forEach(function(b) {
    if (flags & b.bit) {
      const span = document.createElement('span');
      span.className = 'badge-pill';
      span.textContent = b.name;
      box.appendChild(span);
    }
  });
  // Nitro / premium_type if present
  if (user.premium_type === 1 || user.premium_type === 2 || user.premium_type === 3) {
    const span = document.createElement('span');
    span.className = 'badge-pill';
    span.textContent = 'Nitro';
    box.appendChild(span);
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


/* ===== Design Theme Picker ===== */
const themePicker = document.getElementById('themePicker');
if (themePicker) {
  const savedDesign = localStorage.getItem('jinxDesign') || 'midnight';
  themePicker.value = savedDesign;
  if (savedDesign !== 'midnight') {
    document.body.setAttribute('data-theme', savedDesign);
  }
  themePicker.addEventListener('change', function() {
    const v = themePicker.value;
    if (v === 'midnight') {
      document.body.removeAttribute('data-theme');
    } else {
      document.body.setAttribute('data-theme', v);
    }
    localStorage.setItem('jinxDesign', v);
    if (typeof playClick === 'function') playClick();
  });
}


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

/* ===== Unlock audio on first gesture ===== */
['click', 'touchstart', 'keydown'].forEach(function(evt) {
  document.addEventListener(evt, function() { getAudio(); }, { once: true });
});
