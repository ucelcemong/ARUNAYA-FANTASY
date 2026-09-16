'use strict';
/* ============================================================
   ARUNAYA FANTASY — STAGE 1 FOUNDATION
   Vanilla JS, tanpa dependensi, tanpa resource eksternal.
   ============================================================ */

// ============================================================
// STATE
// ============================================================
const TAU = Math.PI * 2;
const SAVE_KEY = 'arunaya_save_v1';

const gameState = {
  currentScreen: 'screen-loading',
  hasSave: false,
  selectedClassId: null,
  creation: {
    gender: 'male',
    skin: 1,
    hair: 'short',
    hairColor: 0,
    eyes: 'normal',
    clothing: 0
  },
  player: null
};

// ============================================================
// DATA — CLASS & APPEARANCE
// ============================================================
const CHARACTER_ASSETS = {
  warrior: 'assets/characters/kael/kael-concept.png',
  archer: 'assets/characters/luna/luna-concept.png',
  mage: 'assets/characters/elara/elara-concept.png',
  cleric: 'assets/characters/lior/lior-concept.png'
};

const CLASS_DATA = [
  { id:'warrior', name:'Warrior',
    desc:'Pendekar garis depan yang tangguh. Mengandalkan kekuatan fisik dan pertahanan terkuat di medan pertempuran.',
    stats:{ hp:120, mp:30, atk:14, def:12, matk:2, agi:6 } },
  { id:'mage', name:'Mage',
    desc:'Pengguna sihir elemen dengan kekuatan magis besar, tetapi rentan terhadap serangan fisik.',
    stats:{ hp:70, mp:60, atk:4, def:4, matk:16, agi:6 } },
  { id:'archer', name:'Archer',
    desc:'Pemburu lincah dengan ketepatan tinggi. Mengandalkan kecepatan dan serangan jarak jauh.',
    stats:{ hp:90, mp:40, atk:11, def:6, matk:4, agi:12 } },
  { id:'cleric', name:'Cleric',
    desc:'Penjaga cahaya yang menyeimbangkan pertempuran melalui sihir penyembuhan dan perlindungan.',
    stats:{ hp:85, mp:55, atk:6, def:8, matk:12, agi:7 } }
];

const SKIN_TONES  = ['#F6D7B8', '#E9B98C', '#C98F5D', '#93603C'];
const HAIR_COLORS = ['#26201B', '#5C4033', '#C9974B', '#A44A2A', '#CBC0AC'];
const HAIR_STYLES = [
  { id:'short', name:'Pendek' },
  { id:'long',  name:'Panjang' },
  { id:'spiky', name:'Berdiri' },
  { id:'wavy',  name:'Ikal' }
];
const EYE_STYLES = [
  { id:'normal', name:'Normal' },
  { id:'sharp',  name:'Tajam' },
  { id:'round',  name:'Bulat' }
];
const CLOTHING = [
  { name:'Rimba',   main:'#4E7C4A', dark:'#3C6239' },
  { name:'Samudra', main:'#3E6C8E', dark:'#305570' },
  { name:'Senja',   main:'#B5543B', dark:'#8E402C' }
];

// Konfigurasi penampilan default untuk portrait tiap class (PROVISIONAL)
function defaultCfgForClass(id){
  const map = {
    warrior:{ gender:'male',   skin:1, hair:'spiky', hairColor:0, eyes:'sharp',  clothing:0 },
    mage:   { gender:'female', skin:0, hair:'long',  hairColor:1, eyes:'round',  clothing:1 },
    archer: { gender:'male',   skin:2, hair:'short', hairColor:2, eyes:'normal', clothing:0 },
    cleric: { gender:'female', skin:1, hair:'wavy',  hairColor:3, eyes:'normal', clothing:2 }
  };
  return map[id] || { gender:'male', skin:1, hair:'short', hairColor:0, eyes:'normal', clothing:0 };
}

// ============================================================
// CHARACTER — SVG PLACEHOLDER GENERATOR (ringan, original)
// ============================================================
function charSVG(cfg, classId, size, faceOnly){
  const skin  = SKIN_TONES[cfg.skin % SKIN_TONES.length];
  const hairC = HAIR_COLORS[cfg.hairColor % HAIR_COLORS.length];
  const cloth = CLOTHING[cfg.clothing % CLOTHING.length];
  const female = cfg.gender === 'female';
  const hair = HAIR_STYLES.some(h => h.id === cfg.hair) ? cfg.hair : 'short';
  const parts = [];

  // --- lapisan belakang ---
  if (!faceOnly){
    if (classId === 'mage'){
      parts.push('<rect x="95" y="42" width="4.5" height="72" rx="2" fill="#7A5230"/>'
        + '<circle cx="97" cy="38" r="6" fill="#3AA8A0"/><circle cx="97" cy="38" r="3" fill="#8FDAD4"/>');
    }
    if (classId === 'archer'){
      parts.push('<path d="M24 46 Q10 80 24 114" fill="none" stroke="#7A5230" stroke-width="4.5" stroke-linecap="round"/>'
        + '<line x1="24" y1="46" x2="24" y2="114" stroke="#E8D9C0" stroke-width="1.6"/>');
    }
  }
  if (hair === 'long'){
    parts.push('<path d="M28 52 Q26 16 60 16 Q94 16 92 52 L92 96 Q92 104 84 104 L36 104 Q28 104 28 96 Z" fill="' + hairC + '"/>');
  } else if (hair === 'wavy'){
    parts.push('<path d="M28 52 Q26 16 60 16 Q94 16 92 52 L92 84 Q92 92 84 90 L36 90 Q28 92 28 84 Z" fill="' + hairC + '"/>');
  }

  // --- badan (dilewati untuk avatar wajah) ---
  if (!faceOnly){
    if (female){
      parts.push('<rect x="50" y="120" width="8" height="14" rx="4" fill="' + skin + '"/>'
        + '<rect x="62" y="120" width="8" height="14" rx="4" fill="' + skin + '"/>');
      parts.push('<path d="M46 82 L74 82 L74 100 L81 122 L39 122 L46 100 Z" fill="' + cloth.main + '"/>');
    } else {
      parts.push('<rect x="48" y="112" width="10" height="20" rx="5" fill="#5A4632"/>'
        + '<rect x="62" y="112" width="10" height="20" rx="5" fill="#5A4632"/>'
        + '<rect x="46" y="128" width="13" height="6" rx="3" fill="#7A5230"/>'
        + '<rect x="61" y="128" width="13" height="6" rx="3" fill="#7A5230"/>');
      parts.push('<rect x="42" y="82" width="36" height="36" rx="9" fill="' + cloth.main + '"/>'
        + '<rect x="42" y="106" width="36" height="6" fill="' + cloth.dark + '"/>');
    }
    parts.push('<rect x="33" y="86" width="9" height="24" rx="4.5" fill="' + cloth.main + '"/>'
      + '<circle cx="37.5" cy="112" r="5" fill="' + skin + '"/>');
    parts.push('<rect x="78" y="86" width="9" height="24" rx="4.5" fill="' + cloth.main + '"/>'
      + '<circle cx="82.5" cy="112" r="5" fill="' + skin + '"/>');
    if (classId === 'cleric'){
      parts.push('<rect x="80" y="97" width="17" height="13" rx="2" fill="#8A5A3A"/>'
        + '<line x1="88.5" y1="97" x2="88.5" y2="110" stroke="#E8D9A8" stroke-width="1.4"/>');
    }
  }

  // --- kepala & wajah ---
  parts.push('<circle cx="60" cy="52" r="30" fill="' + skin + '"/>');

  if (hair === 'spiky'){
    parts.push('<path d="M31 50 Q31 20 60 20 Q89 20 89 50 Q83 34 60 33 Q37 34 31 50 Z" fill="' + hairC + '"/>'
      + '<path d="M38 26 L44 12 L52 24 Z" fill="' + hairC + '"/>'
      + '<path d="M52 22 L60 8 L68 22 Z" fill="' + hairC + '"/>'
      + '<path d="M68 24 L76 12 L82 26 Z" fill="' + hairC + '"/>');
  } else if (hair === 'wavy'){
    parts.push('<path d="M31 50 Q31 20 60 20 Q89 20 89 50 Q84 34 60 33 Q36 34 31 50 Z" fill="' + hairC + '"/>'
      + '<circle cx="38" cy="46" r="6" fill="' + hairC + '"/><circle cx="49" cy="40" r="6.5" fill="' + hairC + '"/>'
      + '<circle cx="62" cy="38" r="6.5" fill="' + hairC + '"/><circle cx="75" cy="42" r="6" fill="' + hairC + '"/>'
      + '<circle cx="84" cy="49" r="5.5" fill="' + hairC + '"/>');
  } else { // short & long: poni dasar
    parts.push('<path d="M31 50 Q31 20 60 20 Q89 20 89 50 Q83 34 60 33 Q37 34 31 50 Z" fill="' + hairC + '"/>');
  }
  if (hair === 'long'){
    parts.push('<path d="M31 48 L29 92 Q29 98 36 96 L40 56 Z" fill="' + hairC + '"/>'
      + '<path d="M89 48 L91 92 Q91 98 84 96 L80 56 Z" fill="' + hairC + '"/>');
  }
  if (classId === 'warrior'){
    parts.push('<rect x="29" y="38" width="62" height="7" rx="3.5" fill="#B5543B"/>'
      + '<path d="M88 41 L100 37 L98 47 Z" fill="#B5543B"/>');
  }

  const eyeY = 57;
  const eye = (ex) => {
    if (cfg.eyes === 'sharp'){
      return '<path d="M' + (ex-6) + ' ' + (eyeY-1) + ' Q' + ex + ' ' + (eyeY-6) + ' ' + (ex+6) + ' ' + (eyeY-1)
        + ' Q' + ex + ' ' + (eyeY+4) + ' ' + (ex-6) + ' ' + (eyeY-1) + ' Z" fill="#FFF"/>'
        + '<circle cx="' + (ex+2) + '" cy="' + (eyeY-1) + '" r="2.6" fill="#4A2F23"/>'
        + '<path d="M' + (ex-6) + ' ' + (eyeY-3) + ' Q' + ex + ' ' + (eyeY-7) + ' ' + (ex+6) + ' ' + (eyeY-3)
        + '" stroke="#241C14" stroke-width="2" fill="none" stroke-linecap="round"/>';
    }
    if (cfg.eyes === 'round'){
      return '<circle cx="' + ex + '" cy="' + eyeY + '" r="5.2" fill="#FFF"/>'
        + '<circle cx="' + ex + '" cy="' + (eyeY+0.5) + '" r="3.4" fill="#4A2F23"/>'
        + '<circle cx="' + (ex+1.4) + '" cy="' + (eyeY-1.4) + '" r="1.3" fill="#FFF"/>';
    }
    return '<ellipse cx="' + ex + '" cy="' + eyeY + '" rx="4.6" ry="5.6" fill="#FFF"/>'
      + '<circle cx="' + ex + '" cy="' + (eyeY+0.8) + '" r="2.9" fill="#4A2F23"/>'
      + '<circle cx="' + (ex+1.2) + '" cy="' + (eyeY-1.2) + '" r="1.1" fill="#FFF"/>';
  };
  parts.push(eye(48), eye(72));

  const brows = (cfg.eyes === 'sharp')
    ? '<path d="M42 ' + (eyeY-11) + ' L54 ' + (eyeY-8) + '" stroke="#241C14" stroke-width="2" stroke-linecap="round"/>'
      + '<path d="M66 ' + (eyeY-8) + ' L78 ' + (eyeY-11) + '" stroke="#241C14" stroke-width="2" stroke-linecap="round"/>'
    : '<path d="M43 ' + (eyeY-10) + ' Q48 ' + (eyeY-13) + ' 53 ' + (eyeY-10) + '" stroke="#241C14" stroke-width="2" fill="none" stroke-linecap="round"/>'
      + '<path d="M67 ' + (eyeY-10) + ' Q72 ' + (eyeY-13) + ' 77 ' + (eyeY-10) + '" stroke="#241C14" stroke-width="2" fill="none" stroke-linecap="round"/>';
  parts.push(brows);
  parts.push('<ellipse cx="41" cy="66" rx="4.5" ry="2.4" fill="#E8927C" opacity="0.5"/>'
    + '<ellipse cx="79" cy="66" rx="4.5" ry="2.4" fill="#E8927C" opacity="0.5"/>');
  parts.push('<path d="M55 69 Q60 73 65 69" stroke="#7A4234" stroke-width="2.2" fill="none" stroke-linecap="round"/>');

  const vb = faceOnly ? '26 16 68 68' : '8 6 104 138';
  const h = faceOnly ? size : Math.round(size * 138 / 104);
  return '<svg xmlns="http://www.w3.org/2000/svg" viewBox="' + vb + '" width="' + size
    + '" height="' + h + '" role="img" aria-label="Karakter">' + parts.join('') + '</svg>';
}

// SVG string -> Image (untuk digambar ke canvas world preview)
function svgToImage(svgString){
  const img = new Image();
  img.src = 'data:image/svg+xml;charset=utf-8,' + encodeURIComponent(svgString);
  return img;
}

// ============================================================
// SCREEN NAVIGATION
// ============================================================
function showScreen(id){
  document.querySelectorAll('.screen').forEach(s => {
    s.classList.toggle('active', s.id === id);
  });
  gameState.currentScreen = id;
  if (id !== 'screen-game') stopWorldPreview();
}

// ============================================================
// LOADING
// ============================================================
function runLoading(){
  const bar = document.getElementById('loading-bar');
  const text = document.getElementById('loading-text');
  let p = 0;
  const iv = setInterval(() => {
    p += 2 + Math.random() * 3.5;
    if (p >= 100){
      p = 100;
      clearInterval(iv);
      setTimeout(() => showScreen('screen-menu'), 350);
    }
    bar.style.width = p + '%';
    text.textContent = 'Memuat Dunia... ' + Math.floor(p) + '%';
  }, 80);
}

// ============================================================
// CHARACTER SELECTION
// ============================================================
function renderClassList(){
  const wrap = document.getElementById('class-list');

  wrap.innerHTML = CLASS_DATA.map(c => {
    const s = c.stats;
    const asset = CHARACTER_ASSETS[c.id];

    return '<button type="button" class="class-card" data-class="' + c.id + '">'
      + '<div class="class-portrait">'
      + '<img src="' + asset + '" alt="' + c.name + '">'
      + '</div>'
      + '<div class="class-info">'
      +   '<h3>' + c.name + '</h3>'
      +   '<p class="class-desc">' + c.desc + '</p>'
      +   '<ul class="class-stats">'
      +     '<li><span>HP</span><b>' + s.hp + '</b></li>'
      +     '<li><span>MP</span><b>' + s.mp + '</b></li>'
      +     '<li><span>ATK</span><b>' + s.atk + '</b></li>'
      +     '<li><span>DEF</span><b>' + s.def + '</b></li>'
      +     '<li><span>MATK</span><b>' + s.matk + '</b></li>'
      +     '<li><span>AGI</span><b>' + s.agi + '</b></li>'
      +   '</ul>'
      + '</div></button>';
  }).join('');
}

function clearClassSelection(){
  gameState.selectedClassId = null;
  document.getElementById('btn-class-confirm').disabled = true;
  document.querySelectorAll('.class-card.selected').forEach(el => el.classList.remove('selected'));
}

function confirmClass(){
  if (!gameState.selectedClassId) return;
  showScreen('screen-create');
  renderCreation();
}

// ============================================================
// CHARACTER CREATION
// ============================================================
function renderChipRow(containerId, labels, activeIdx, onPick){
  const el = document.getElementById(containerId);
  el.innerHTML = '';
  labels.forEach((label, i) => {
    const b = document.createElement('button');
    b.type = 'button';
    b.className = 'chip' + (i === activeIdx ? ' selected' : '');
    b.textContent = label;
    b.addEventListener('click', () => { onPick(i); renderCreationOptions(); renderCreationPreview(); });
    el.appendChild(b);
  });
}

function renderSwatchRow(containerId, colors, activeIdx, onPick){
  const el = document.getElementById(containerId);
  el.innerHTML = '';
  colors.forEach((c, i) => {
    const b = document.createElement('button');
    b.type = 'button';
    b.className = 'swatch' + (i === activeIdx ? ' selected' : '');
    b.style.background = c;
    b.setAttribute('aria-label', 'Warna ' + (i + 1));
    b.addEventListener('click', () => { onPick(i); renderCreationOptions(); renderCreationPreview(); });
    el.appendChild(b);
  });
}

function renderCreationPreview(){
  document.getElementById('create-preview').innerHTML =
    charSVG(gameState.creation, gameState.selectedClassId, 170);
}

function renderCreationOptions(){
  const cr = gameState.creation;
  renderChipRow('opt-gender', ['Laki-laki', 'Perempuan'],
    cr.gender === 'male' ? 0 : 1,
    i => { cr.gender = i === 0 ? 'male' : 'female'; });
  renderSwatchRow('opt-skin', SKIN_TONES, cr.skin,
    i => { cr.skin = i; });
  renderChipRow('opt-hair', HAIR_STYLES.map(h => h.name),
    HAIR_STYLES.findIndex(h => h.id === cr.hair),
    i => { cr.hair = HAIR_STYLES[i].id; });
  renderSwatchRow('opt-haircolor', HAIR_COLORS, cr.hairColor,
    i => { cr.hairColor = i; });
  renderChipRow('opt-eyes', EYE_STYLES.map(e => e.name),
    EYE_STYLES.findIndex(e => e.id === cr.eyes),
    i => { cr.eyes = EYE_STYLES[i].id; });
  renderChipRow('opt-clothing', CLOTHING.map(c => c.name), cr.clothing,
    i => { cr.clothing = i; });
}

function renderCreation(){
  renderCreationPreview();
  renderCreationOptions();
}

function validateNickname(raw){
  const name = (raw || '').trim();
  if (!name) return { ok:false, msg:'Nama panggilan wajib diisi.' };
  if (name.length > 16) return { ok:false, msg:'Maksimal 16 karakter.' };
  if (!/^[A-Za-z0-9 ]+$/.test(name)) return { ok:false, msg:'Gunakan huruf, angka, dan spasi saja.' };
  return { ok:true, name:name };
}

// ============================================================
// GAME INITIALIZATION
// ============================================================
function createCharacter(name){
  const cls = CLASS_DATA.find(c => c.id === gameState.selectedClassId);
  gameState.player = {
    name: name,
    gender: gameState.creation.gender,
    class: cls.name,
    classId: cls.id,
    level: 1,
    hp: cls.stats.hp, maxHp: cls.stats.hp,
    mp: cls.stats.mp, maxMp: cls.stats.mp,
    exp: 0, expToNext: 100,
    gold: 50,
    appearance: Object.assign({}, gameState.creation)
  };
}

function startGame(){
  const v = validateNickname(document.getElementById('nickname').value);
  const errEl = document.getElementById('nickname-error');
  if (!v.ok){ errEl.textContent = v.msg; return; }
  errEl.textContent = '';
  createCharacter(v.name);
  saveGame();
  enterGame();
}

function continueGame(){
  const data = loadSaveData();
  if (!data){ showToast('Data save tidak ditemukan.'); return; }
  gameState.player = data;
  enterGame();
}

function enterGame(){
  showScreen('screen-game');
  updateHUD();
  startWorldPreview();
}

function initGame(){
  checkSave(); updateContinueBtn();
  renderClassList();
  bindEvents();
  runLoading();
}

// ============================================================
// SAVE / LOAD (localStorage — lokal, bukan cloud)
// ============================================================
function saveGame(){
  try {
    localStorage.setItem(SAVE_KEY, JSON.stringify(gameState.player));
    gameState.hasSave = true;
    updateContinueBtn();
  } catch(e){
    showToast('Gagal menyimpan progres.');
  }
}
function loadSaveData(){
  try {
    const raw = localStorage.getItem(SAVE_KEY);
    if (!raw) return null;
    const data = JSON.parse(raw);
    return (data && data.name && data.classId) ? data : null;
  } catch(e){ return null; }
}
function checkSave(){
  try { gameState.hasSave = !!localStorage.getItem(SAVE_KEY); }
  catch(e){ gameState.hasSave = false; }
}
function updateContinueBtn(){
  document.getElementById('btn-continue').disabled = !gameState.hasSave;
}

// ============================================================
// HUD
// ============================================================
function updateHUD(){
  const p = gameState.player;
  if (!p) return;
  document.getElementById('hud-name').textContent = p.name;
  document.getElementById('hud-level').textContent = 'Lv.' + p.level;
  document.getElementById('hud-gold').textContent = p.gold;
  document.getElementById('bar-hp').style.width  = Math.max(0, Math.min(100, p.hp  / p.maxHp * 100)) + '%';
  document.getElementById('bar-mp').style.width  = Math.max(0, Math.min(100, p.mp  / p.maxMp * 100)) + '%';
  document.getElementById('bar-exp').style.width = Math.max(0, Math.min(100, p.exp / p.expToNext * 100)) + '%';
  document.getElementById('bar-hp-text').textContent  = p.hp + '/' + p.maxHp;
  document.getElementById('bar-mp-text').textContent  = p.mp + '/' + p.maxMp;
  document.getElementById('bar-exp-text').textContent = p.exp + '/' + p.expToNext;
  document.getElementById('hud-avatar').innerHTML =
    charSVG(p.appearance, p.classId, 44, true);
}

// ============================================================
// WORLD PREVIEW (canvas placeholder — BUKAN world engine)
// ============================================================
const world = {
  running:false, rafId:0, canvas:null, ctx:null,
  w:0, h:0, dpr:1, scene:null, playerImg:null, npcImgs:[]
};

function startWorldPreview(){
  if (world.running) return;
  world.canvas = document.getElementById('world-canvas');
  world.ctx = world.canvas.getContext('2d', { alpha:false });
  resizeCanvas();
  world.playerImg = svgToImage(charSVG(gameState.player.appearance, gameState.player.classId, 120));
  world.npcImgs = [
    svgToImage(charSVG({ gender:'male',   skin:2, hair:'short', hairColor:1, eyes:'normal', clothing:1 }, null, 100)),
    svgToImage(charSVG({ gender:'female', skin:1, hair:'wavy',  hairColor:0, eyes:'normal', clothing:2 }, null, 100))
  ];
  world.running = true;
  world.rafId = requestAnimationFrame(worldFrame);
}

function stopWorldPreview(){
  world.running = false;
  if (world.rafId) cancelAnimationFrame(world.rafId);
  world.rafId = 0;
}

function resizeCanvas(){
  if (!world.canvas) return;
  const cw = world.canvas.clientWidth, ch = world.canvas.clientHeight;
  if (!cw || !ch) return;
  world.dpr = Math.min(window.devicePixelRatio || 1, 2); // batasi untuk hemat RAM/GPU
  world.canvas.width = Math.round(cw * world.dpr);
  world.canvas.height = Math.round(ch * world.dpr);
  world.ctx.setTransform(world.dpr, 0, 0, world.dpr, 0, 0);
  world.w = cw; world.h = ch;
  buildScene();
}

function buildScene(){
  const w = world.w, h = world.h;
  world.scene = {
    patches: [
      [0.15,0.30,0.10,0.045],[0.70,0.60,0.12,0.05],[0.40,0.16,0.09,0.04],
      [0.85,0.80,0.10,0.045],[0.24,0.86,0.09,0.04],[0.55,0.46,0.07,0.03]
    ],
    flowers: [
      [0.30,0.50,'#F2E8D5'],[0.62,0.85,'#E8B54A'],[0.12,0.62,'#E8927C'],
      [0.88,0.52,'#F2E8D5'],[0.50,0.38,'#E8B54A'],[0.22,0.16,'#E8927C'],
      [0.75,0.90,'#F2E8D5'],[0.92,0.68,'#E8B54A']
    ],
    road:   [[0.08,1.02],[0.42,0.74],[0.74,0.44]],
    house:  { x:0.17, y:0.56 },
    portal: { x:0.78, y:0.40 },
    trees:  [
      { x:0.06, y:0.24 },{ x:0.93, y:0.22 },{ x:0.55, y:0.11 },
      { x:0.30, y:0.09 },{ x:0.97, y:0.52 }
    ],
    npcs: [
      { x:0.30, y:0.66, img:0, phase:0 },
      { x:0.62, y:0.80, img:1, phase:2.1 }
    ],
    slimes: [
      { x:0.50, y:0.24, color:'#7CBF5A', phase:0 },
      { x:0.66, y:0.31, color:'#9B6DC6', phase:1.4 }
    ],
    player: { x:0.43, y:0.72 }
  };
}

function worldFrame(ts){
  if (!world.running) return;
  drawWorld(ts / 1000);
  world.rafId = requestAnimationFrame(worldFrame);
}

function fillEllipse(x, y, rx, ry, color){
  const c = world.ctx;
  c.fillStyle = color;
  c.beginPath(); c.ellipse(x, y, rx, ry, 0, 0, TAU); c.fill();
}
function fillCircle(x, y, r, color){
  const c = world.ctx;
  c.fillStyle = color;
  c.beginPath(); c.arc(x, y, r, 0, TAU); c.fill();
}

function drawRoad(sc, w, h, s){
  const c = world.ctx;
  c.lineCap = 'round';
  c.beginPath();
  c.moveTo(sc.road[0][0]*w, sc.road[0][1]*h);
  c.quadraticCurveTo(sc.road[1][0]*w, sc.road[1][1]*h, sc.road[2][0]*w, sc.road[2][1]*h);
  c.strokeStyle = '#C7A170'; c.lineWidth = s * 0.075; c.stroke();
  c.strokeStyle = '#DBBA85'; c.lineWidth = s * 0.055; c.stroke();
}

function drawHouse(x, y, s){
  const c = world.ctx;
  const W = s * 0.34, H = s * 0.17;
  fillEllipse(x, y + s*0.012, W*0.66, s*0.018, 'rgba(0,0,0,0.16)');
  c.fillStyle = '#6B4A2F'; // tiang panggung (rumah panggung — sentuhan Nusantara)
  c.fillRect(x - W*0.42, y - H*0.28, s*0.012, H*0.32);
  c.fillRect(x + W*0.42 - s*0.012, y - H*0.28, s*0.012, H*0.32);
  c.fillRect(x - s*0.006, y - H*0.20, s*0.012, H*0.24);
  c.fillStyle = '#8A6038'; // lantai panggung
  c.fillRect(x - W*0.52, y - H*0.32, W*1.04, s*0.014);
  c.fillStyle = '#D9A96C'; // dinding
  c.fillRect(x - W*0.5, y - H*0.85, W, H*0.55);
  c.strokeStyle = 'rgba(122,74,40,0.35)'; c.lineWidth = 1;
  c.beginPath();
  c.moveTo(x - W*0.5, y - H*0.66); c.lineTo(x + W*0.5, y - H*0.66);
  c.moveTo(x - W*0.5, y - H*0.48); c.lineTo(x + W*0.5, y - H*0.48);
  c.stroke();
  c.fillStyle = '#6B4A2F'; // pintu
  c.fillRect(x - s*0.02, y - H*0.62, s*0.04, H*0.32);
  c.fillStyle = '#5A4632'; // jendela
  c.fillRect(x + W*0.24, y - H*0.80, s*0.035, s*0.035);
  c.fillStyle = '#A85B3F'; // atap limas
  c.beginPath();
  c.moveTo(x - W*0.66, y - H*0.82);
  c.lineTo(x - W*0.50, y - H*1.35);
  c.lineTo(x + W*0.50, y - H*1.35);
  c.lineTo(x + W*0.66, y - H*0.82);
  c.closePath(); c.fill();
  c.fillStyle = '#8A4A32'; // bubungan
  c.fillRect(x - W*0.54, y - H*1.38, W*1.08, s*0.014);
}

function drawTree(x, y, s){
  const r = s * 0.055, th = s * 0.16;
  fillEllipse(x, y, r*0.9, r*0.28, 'rgba(0,0,0,0.14)');
  world.ctx.fillStyle = '#7A5230';
  world.ctx.fillRect(x - s*0.008, y - th*0.7, s*0.016, th*0.7);
  fillCircle(x, y - th, r, '#4E7C4A');
  fillCircle(x - r*0.75, y - th*0.78, r*0.72, '#4E7C4A');
  fillCircle(x + r*0.75, y - th*0.78, r*0.72, '#4E7C4A');
  fillCircle(x - r*0.25, y - th - r*0.35, r*0.55, '#5C8F52');
  fillCircle(x - r*0.35, y - th - r*0.45, r*0.26, '#6FA45F');
}

function drawPortal(x, y, s, t){
  const r = s * 0.075;
  world.ctx.strokeStyle = '#8C857A';
  world.ctx.lineWidth = s * 0.016;
  world.ctx.beginPath(); world.ctx.arc(x, y, r, 0, TAU); world.ctx.stroke();
  fillCircle(x, y, r * 0.82, 'rgba(58,168,160,' + (0.4 + 0.18*Math.sin(t*1.6)).toFixed(3) + ')');
  fillCircle(x, y, r * 0.4,  'rgba(180,240,235,' + (0.35 + 0.2*Math.sin(t*1.6+1)).toFixed(3) + ')');
  for (let i = 0; i < 6; i++){
    const a = (i / 6) * TAU;
    fillCircle(x + Math.cos(a)*r*1.35, y + Math.sin(a)*r*1.35, s*0.008, '#8C857A');
  }
}

function drawSlime(x, y, s, t, phase, color){
  const c = world.ctx;
  const base = s * 0.045;
  const wave = Math.sin(t * 2.4 + phase);
  const hop = Math.max(0, wave);
  const yy = y - hop * base * 1.4;
  const sq = 1 - 0.15 * wave;
  fillEllipse(x, y, base*(1 - hop*0.25), base*0.3*(1 - hop*0.25), 'rgba(0,0,0,0.15)');
  c.save();
  c.translate(x, yy);
  c.scale(1 + (1 - sq) * 0.8, sq);
  c.beginPath();
  c.moveTo(-base*1.05, 0);
  c.quadraticCurveTo(-base*1.1, -base*1.6, 0, -base*1.6);
  c.quadraticCurveTo(base*1.1, -base*1.6, base*1.05, 0);
  c.closePath();
  c.fillStyle = color; c.fill();
  c.strokeStyle = 'rgba(0,0,0,0.25)'; c.lineWidth = 1.5; c.stroke();
  fillCircle(-base*0.38, -base*0.85, base*0.22, '#FFF');
  fillCircle( base*0.38, -base*0.85, base*0.22, '#FFF');
  fillCircle(-base*0.34, -base*0.83, base*0.11, '#26201B');
  fillCircle( base*0.42, -base*0.83, base*0.11, '#26201B');
  c.strokeStyle = '#26201B'; c.lineWidth = 1.5;
  c.beginPath(); c.arc(0, -base*0.55, base*0.28, 0.15*Math.PI, 0.85*Math.PI); c.stroke();
  fillEllipse(-base*0.4, -base*1.2, base*0.22, base*0.13, 'rgba(255,255,255,0.45)');
  c.restore();
}

function drawCharImg(img, x, y, dh, t, phase){
  const bob = (Math.sin(t*2 + phase) * 0.5 + 0.5) * dh * 0.03;
  const dw = dh * 104 / 138;
  fillEllipse(x, y, dw*0.34, dw*0.12, 'rgba(0,0,0,0.18)');
  if (img && img.complete && img.naturalWidth > 0){
    world.ctx.drawImage(img, x - dw/2, y - dh - bob, dw, dh);
  }
}

function drawWorld(t){
  const c = world.ctx, w = world.w, h = world.h;
  const s = Math.min(w, h);
  const sc = world.scene;
  if (!sc) return;

  c.fillStyle = '#7AA653'; // rumput dasar
  c.fillRect(0, 0, w, h);
  for (const p of sc.patches) fillEllipse(p[0]*w, p[1]*h, p[2]*w, p[3]*w, '#6F9A4B');
  drawRoad(sc, w, h, s);
  for (const f of sc.flowers){
    fillCircle(f[0]*w, f[1]*h, s*0.006, f[2]);
    fillCircle(f[0]*w, f[1]*h, s*0.0028, '#F7E9B0');
  }
  drawPortal(sc.portal.x*w, sc.portal.y*h, s, t);

  // urutan gambar sederhana berdasarkan sumbu Y (painter's algorithm)
  const ents = [];
  ents.push({ y: sc.house.y*h, fn: () => drawHouse(sc.house.x*w, sc.house.y*h, s) });
  for (const tr of sc.trees){
    ents.push({ y: tr.y*h, fn: ((tx, ty) => () => drawTree(tx, ty, s))(tr.x*w, tr.y*h) });
  }
  for (const n of sc.npcs){
    ents.push({ y: n.y*h, fn: () => drawCharImg(world.npcImgs[n.img], n.x*w, n.y*h, s*0.19, t, n.phase) });
  }
  for (const sl of sc.slimes){
    ents.push({ y: sl.y*h, fn: () => drawSlime(sl.x*w, sl.y*h, s, t, sl.phase, sl.color) });
  }
  ents.push({ y: sc.player.y*h, fn: () => drawCharImg(world.playerImg, sc.player.x*w, sc.player.y*h, s*0.21, t, 0) });
  ents.sort((a, b) => a.y - b.y);
  for (const e of ents) e.fn();
}

// ============================================================
// MODAL & TOAST
// ============================================================
const modalEl = () => document.getElementById('modal');

function openModal(title, bodyHTML){
  document.getElementById('modal-title').textContent = title;
  document.getElementById('modal-body').innerHTML = bodyHTML;
  modalEl().classList.remove('hidden');
}
function closeModal(){
  modalEl().classList.add('hidden');
}

function openSettingsModal(){
  openModal('PENGATURAN',
    '<p class="modal-note">Pengaturan lengkap akan tersedia pada tahap pengembangan berikutnya. Nilai di bawah masih berupa placeholder.</p>'
    + '<div class="setting-row"><span>Volume Musik</span><b>70%</b></div>'
    + '<div class="setting-row"><span>Efek Suara</span><b>Aktif</b></div>'
    + '<div class="setting-row"><span>Kualitas Grafis</span><b>Normal</b></div>');
}
function openExitModal(){
  openModal('KELUAR',
    '<p class="modal-note">Browser tidak menyediakan fungsi keluar aplikasi. Tutup tab atau jendela browser ini untuk keluar dari ARUNAYA FANTASY.</p>');
}
function openHudMenu(){
  openModal('MENU',
    '<button type="button" class="menu-btn" data-action="save">SIMPAN PROGRES</button>'
    + '<button type="button" class="menu-btn" data-action="mainmenu">KE MAIN MENU</button>');
}

let toastTimer = 0;
function showToast(msg){
  const el = document.getElementById('toast');
  el.textContent = msg;
  el.classList.add('show');
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => el.classList.remove('show'), 2200);
}

// ============================================================
// EVENT HANDLERS
// ============================================================
function bindEvents(){
  // Main menu
  document.getElementById('btn-start').addEventListener('click', () => {
    clearClassSelection();
    showScreen('screen-class');
  });
  document.getElementById('btn-continue').addEventListener('click', continueGame);
  document.getElementById('btn-settings').addEventListener('click', openSettingsModal);
  document.getElementById('btn-exit').addEventListener('click', openExitModal);

  // Tombol kembali (header)
  document.querySelectorAll('.btn-back').forEach(btn => {
    btn.addEventListener('click', () => showScreen(btn.dataset.back));
  });

  // Character selection (delegasi)
  document.getElementById('class-list').addEventListener('click', e => {
    const card = e.target.closest('.class-card');
    if (!card) return;
    document.querySelectorAll('.class-card').forEach(c => c.classList.remove('selected'));
    card.classList.add('selected');
    gameState.selectedClassId = card.dataset.class;
    document.getElementById('btn-class-confirm').disabled = false;
  });
  document.getElementById('btn-class-confirm').addEventListener('click', confirmClass);

  // Character creation
  const nick = document.getElementById('nickname');
  nick.addEventListener('input', () => {
    document.getElementById('nick-count').textContent = nick.value.length + '/16';
    document.getElementById('nickname-error').textContent = '';
  });
  document.getElementById('btn-start-game').addEventListener('click', startGame);

  // HUD
  document.getElementById('btn-hud-menu').addEventListener('click', openHudMenu);
  document.getElementById('hud-bottom').addEventListener('click', e => {
    const btn = e.target.closest('.hud-btn');
    if (!btn) return;
    if (btn.dataset.panel === 'SETTINGS'){ openSettingsModal(); return; }
    showToast('Fitur ' + btn.dataset.panel + ' akan hadir pada tahap berikutnya.');
  });

  // Modal
  document.getElementById('modal-close').addEventListener('click', closeModal);
  modalEl().addEventListener('click', e => { if (e.target === modalEl()) closeModal(); });
  document.getElementById('modal-body').addEventListener('click', e => {
    const b = e.target.closest('[data-action]');
    if (!b) return;
    if (b.dataset.action === 'save'){
      saveGame(); closeModal(); showToast('Progres tersimpan.');
    } else if (b.dataset.action === 'mainmenu'){
      saveGame(); closeModal();
      showScreen('screen-menu');
      showToast('Progres tersimpan.');
    }
  });

  // Resize & visibility (hemat baterai/RAM saat tab tersembunyi)
  let resizeTO = 0;
  window.addEventListener('resize', () => {
    clearTimeout(resizeTO);
    resizeTO = setTimeout(() => { if (world.running) resizeCanvas(); }, 150);
  });
  document.addEventListener('visibilitychange', () => {
    if (document.hidden) stopWorldPreview();
    else if (gameState.currentScreen === 'screen-game') startWorldPreview();
  });
}

// ============================================================
// INIT
// ============================================================
initGame();