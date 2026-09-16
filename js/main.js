'use strict';
/* ============================================================
   ARUNAYA FANTASY — STAGE 1 FOUNDATION V2 (PATCH: save-compat)
   Flow: Menu → Showcase → Creation → Nickname → Server →
         Game Loading → Main Game
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

  nickname: '',
  selectedServerId: null,

  player: null
};

// ============================================================
// DATA — CLASS, APPEARANCE, SERVER, TIPS
// (urutan array CLASS_DATA = urutan tampil di Character Selection:
//  Warrior, Archer, Mage, Cleric)
// ============================================================
const CLASS_DATA = [
  { id:'warrior', name:'Warrior', character:'Kael Arvandra',
    asset:'assets/characters/kael/kael-concept.png',
    desc:'Pendekar garis depan yang tangguh. Mengandalkan kekuatan fisik dan pertahanan terkuat di medan pertempuran.',
    stats:{ hp:120, mp:30, atk:14, def:12, matk:2, agi:6 } },
  { id:'archer', name:'Archer', character:'Luna Myesha',
    asset:'assets/characters/luna/luna-concept.png',
    desc:'Pemburu lincah dengan ketepatan tinggi. Mengandalkan kecepatan dan serangan jarak jauh.',
    stats:{ hp:90, mp:40, atk:11, def:6, matk:4, agi:12 } },
  { id:'mage', name:'Mage', character:'Elara Veylin',
    asset:'assets/characters/elara/elara-concept.png',
    desc:'Pengguna sihir elemen dengan kekuatan magis besar, tetapi rentan terhadap serangan fisik.',
    stats:{ hp:70, mp:60, atk:4, def:4, matk:16, agi:6 } },
  { id:'cleric', name:'Cleric', character:'Lior Kaien',
    asset:'assets/characters/lior/lior-concept.png',
    desc:'Penjaga cahaya yang menyeimbangkan pertempuran melalui sihir penyembuhan dan perlindungan.',
    stats:{ hp:85, mp:55, atk:6, def:8, matk:12, agi:7 } }
];

const SKIN_TONES  = ['#F6D7B8', '#E9B98C', '#C98F5D', '#93603C'];
const HAIR_COLORS = ['#26201B', '#5C4033', '#C9974B', '#A44A2A', '#CBC0AC'];

// Daftar rambut master (id dipakai charSVG)
const HAIR_STYLES = [
  { id:'short',  name:'Pendek' },
  { id:'medium', name:'Sedang' },
  { id:'long',   name:'Panjang' },
  { id:'spiky',  name:'Berdiri' },
  { id:'wavy',   name:'Ikal' }
];
// Pilihan rambut per gender (foundation — mudah dikembangkan)
const HAIR_BY_GENDER = {
  male:   ['short', 'medium', 'spiky', 'wavy'],
  female: ['short', 'medium', 'long',  'wavy']
};
function hairListFor(gender){
  return HAIR_BY_GENDER[gender] || HAIR_BY_GENDER.male;
}
function hairName(id){
  const h = HAIR_STYLES.find(x => x.id === id);
  return h ? h.name : id;
}

const EYE_STYLES = [
  { id:'normal', name:'Normal' },
  { id:'sharp',  name:'Tajam' },
  { id:'round',  name:'Besar' }
];
const CLOTHING = [
  { name:'Rimba',   main:'#4E7C4A', dark:'#3C6239' },
  { name:'Samudra', main:'#3E6C8E', dark:'#305570' },
  { name:'Senja',   main:'#B5543B', dark:'#8E402C' }
];

// Server prototype — SIMULASI UI SAJA (tanpa networking)
const SERVERS = [
  { id:'asia-01', name:'SERVER ASIA', server:'Server 01', status:'ONLINE' },
  { id:'sea-01',  name:'SERVER SEA',  server:'Server 01', status:'ONLINE' }
];

const loadingTips = [
  'Jelajahi dunia untuk menemukan tempat-tempat baru.',
  'Setiap karakter memiliki gaya bermain yang berbeda.',
  'Perhatikan lingkungan di sekitar perjalananmu.',
  'Quest akan membantu mengungkap dunia ARUNAYA.',
  'Dunia ARUNAYA masih terus berkembang.'
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
// Dipakai oleh: Character Creation, Nickname preview, HUD (avatar),
// World Preview, dan fallback Character Selection.
// BUKAN desain karakter final — renderer dapat diganti nanti.
// ============================================================
function charSVG(cfg, classId, size, faceOnly){
  if (!cfg) return '';
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
  } else if (hair === 'medium'){
    parts.push('<path d="M28 52 Q26 16 60 16 Q94 16 92 52 L92 78 Q92 86 84 86 L36 86 Q28 86 28 78 Z" fill="' + hairC + '"/>');
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
  } else { // short, medium & long: poni dasar
    parts.push('<path d="M31 50 Q31 20 60 20 Q89 20 89 50 Q83 34 60 33 Q37 34 31 50 Z" fill="' + hairC + '"/>');
  }
  if (hair === 'long'){
    parts.push('<path d="M31 48 L29 92 Q29 98 36 96 L40 56 Z" fill="' + hairC + '"/>'
      + '<path d="M89 48 L91 92 Q91 98 84 96 L80 56 Z" fill="' + hairC + '"/>');
  } else if (hair === 'medium'){
    parts.push('<path d="M31 48 L29 80 Q29 86 36 84 L40 56 Z" fill="' + hairC + '"/>'
      + '<path d="M89 48 L91 80 Q91 86 84 84 L80 56 Z" fill="' + hairC + '"/>');
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
  if (gameState.currentScreen === 'screen-loading-game' && id !== 'screen-loading-game'){
    stopGameLoading();
  }
  document.querySelectorAll('.screen').forEach(s => {
    s.classList.toggle('active', s.id === id);
  });
  gameState.currentScreen = id;
  if (id !== 'screen-game') stopWorldPreview();
}

// Navigasi KEMBALI dengan refresh state/UI sesuai screen tujuan.
// State tidak dihapus — hanya dirender ulang dari state terakhir.
function navigateBack(target){
  if (target === 'screen-create'){
    // Creation: appearance terakhir tetap tersimpan di gameState.creation;
    // render ulang preview + opsi agar sesuai state.
    showScreen(target);
    renderCreation();
  } else if (target === 'screen-nickname'){
    // Nickname: nickname terakhir tetap ada; counter, pesan validasi,
    // dan status tombol LANJUTKAN dirender ulang dari state.
    showScreen(target);
    renderNickname();
  } else {
    // Class → Menu, Creation → Class: tidak perlu refresh tambahan.
    showScreen(target);
  }
}

// ============================================================
// LOADING AWAL
// ============================================================
function runLoading(){
  const bar = document.getElementById('loading-bar');
  const text = document.getElementById('loading-text');
  if (!bar || !text) return;
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
// CHARACTER SELECTION (SHOWCASE — CHARACTER FIRST)
// ============================================================
const VITAL_MAX = {
  hp: Math.max(...CLASS_DATA.map(c => c.stats.hp)),  // 120
  mp: Math.max(...CLASS_DATA.map(c => c.stats.mp))   // 60
};

const csEls = {};                // referensi elemen UI selection
const fallbackUsed = new Set();  // PNG yang gagal dimuat (agar tidak retry loop)
const fallbackURICache = {};     // fallback SVG per class (data-URI, dibuat sekali)

function getClass(id){
  return CLASS_DATA.find(c => c.id === id) || null;
}

function getFallbackURI(id){
  if (!fallbackURICache[id]){
    fallbackURICache[id] = 'data:image/svg+xml;charset=utf-8,'
      + encodeURIComponent(charSVG(defaultCfgForClass(id), id, 220));
  }
  return fallbackURICache[id];
}

function applyCharImg(img, cls){
  const c = getClass(cls);
  if (!img || !c) return;
  img.alt = c.character + ' — ' + c.name;
  img.dataset.class = cls;
  img.src = fallbackUsed.has(cls) ? getFallbackURI(cls) : c.asset;
}

function renderClassSelect(){
  const wrap = document.getElementById('class-list');
  if (!wrap) return;
  const thumbs = CLASS_DATA.map(c => {
    return '<button type="button" class="cs-thumb" data-class="' + c.id + '" aria-label="Pilih ' + c.character + '">'
      + '<span class="cs-thumb-img"><img decoding="async" alt=""></span>'
      + '<span class="cs-thumb-name">' + c.character.split(' ')[0].toUpperCase() + '</span>'
      + '</button>';
  }).join('');

  wrap.innerHTML =
    '<div class="cs-layout">'
    +  '<div class="cs-head">'
    +    '<h3 class="cs-name" id="cs-name"></h3>'
    +    '<span class="cs-role" id="cs-role"></span>'
    +  '</div>'
    +  '<div class="cs-hero"><img id="cs-hero" decoding="async" alt=""></div>'
    +  '<div class="cs-body">'
    +    '<p class="cs-desc" id="cs-desc"></p>'
    +    '<div class="cs-vitals">'
    +      '<div class="cs-vital"><span class="cs-vital-label">HP</span><span class="cs-vital-track"><span class="cs-vital-fill is-hp" id="cs-vital-hp"></span></span><span class="cs-vital-num" id="cs-num-hp"></span></div>'
    +      '<div class="cs-vital"><span class="cs-vital-label">MP</span><span class="cs-vital-track"><span class="cs-vital-fill is-mp" id="cs-vital-mp"></span></span><span class="cs-vital-num" id="cs-num-mp"></span></div>'
    +    '</div>'
    +    '<ul class="cs-stats">'
    +      '<li><span>ATK</span><b id="cs-stat-atk"></b></li>'
    +      '<li><span>DEF</span><b id="cs-stat-def"></b></li>'
    +      '<li><span>MATK</span><b id="cs-stat-matk"></b></li>'
    +      '<li><span>AGI</span><b id="cs-stat-agi"></b></li>'
    +    '</ul>'
    +  '</div>'
    +  '<div class="cs-thumbs">' + thumbs + '</div>'
    + '</div>';

  csEls.hero   = document.getElementById('cs-hero');
  csEls.name   = document.getElementById('cs-name');
  csEls.role   = document.getElementById('cs-role');
  csEls.desc   = document.getElementById('cs-desc');
  csEls.hpFill = document.getElementById('cs-vital-hp');
  csEls.mpFill = document.getElementById('cs-vital-mp');
  csEls.hpNum  = document.getElementById('cs-num-hp');
  csEls.mpNum  = document.getElementById('cs-num-mp');
  csEls.stats  = {
    atk:  document.getElementById('cs-stat-atk'),
    def:  document.getElementById('cs-stat-def'),
    matk: document.getElementById('cs-stat-matk'),
    agi:  document.getElementById('cs-stat-agi')
  };

  // Fallback SVG hanya jika PNG gagal dimuat — asset PNG tetap prioritas utama
  wrap.querySelectorAll('img').forEach(img => {
    img.addEventListener('error', () => {
      const cls = img.dataset.class;
      if (!cls || fallbackUsed.has(cls)) return;
      fallbackUsed.add(cls);
      applyCharImg(img, cls);
    });
  });

  // Isi thumbnail (sekali render — sekaligus preload keempat PNG via cache browser)
  wrap.querySelectorAll('.cs-thumb').forEach(t => {
    applyCharImg(t.querySelector('img'), t.dataset.class);
  });
}

function setCharacterInfo(id){
  const c = getClass(id);
  if (!c || !csEls.hero) return;
  applyCharImg(csEls.hero, id);
  csEls.name.textContent = c.character;
  csEls.role.textContent = c.name;
  csEls.desc.textContent = c.desc;
  csEls.hpNum.textContent = c.stats.hp;
  csEls.mpNum.textContent = c.stats.mp;
  csEls.hpFill.style.width = Math.round(c.stats.hp / VITAL_MAX.hp * 100) + '%';
  csEls.mpFill.style.width = Math.round(c.stats.mp / VITAL_MAX.mp * 100) + '%';
  csEls.stats.atk.textContent  = c.stats.atk;
  csEls.stats.def.textContent  = c.stats.def;
  csEls.stats.matk.textContent = c.stats.matk;
  csEls.stats.agi.textContent  = c.stats.agi;

  // fade ringan sekali-jalan saat berganti karakter (bukan loop)
  [csEls.hero, csEls.name, csEls.desc].forEach(el => {
    el.classList.remove('cs-swap');
    void el.offsetWidth; // retrigger animasi
    el.classList.add('cs-swap');
  });
}

function selectClass(id){
  if (!getClass(id)) return;
  gameState.selectedClassId = id;
  setCharacterInfo(id);
  document.querySelectorAll('.cs-thumb').forEach(t =>
    t.classList.toggle('selected', t.dataset.class === id));
  const btn = document.getElementById('btn-class-confirm');
  if (btn) btn.disabled = false;
}

function clearClassSelection(){
  // Memulai karakter baru — reset pilihan flow
  gameState.selectedClassId = null;
  gameState.nickname = '';
  gameState.selectedServerId = null;
  const btn = document.getElementById('btn-class-confirm');
  if (btn) btn.disabled = true;
  document.querySelectorAll('.cs-thumb.selected').forEach(el => el.classList.remove('selected'));
  // preview default: karakter pertama (tanpa state selected)
  if (csEls.hero) setCharacterInfo(CLASS_DATA[0].id);
}

function confirmClass(){
  if (!gameState.selectedClassId) return;
  // Reset appearance sesuai class yang dipilih —
  // Mage → Warrior tidak membawa appearance Mage sebelumnya.
  gameState.creation = Object.assign(
    {},
    defaultCfgForClass(gameState.selectedClassId)
  );
  showScreen('screen-create');
  renderCreation();
}

// ============================================================
// CHARACTER CREATION (foundation customization)
// ============================================================
function renderChipRow(containerId, labels, activeIdx, onPick){
  const el = document.getElementById(containerId);
  if (!el) return;
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
  if (!el) return;
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
  const el = document.getElementById('create-preview');
  if (!el) return;
  el.innerHTML = charSVG(gameState.creation, gameState.selectedClassId, 200);
}

// Class identity — menampilkan karakter & class yang dipilih di Character Selection
function renderCreationClassInfo(){
  let el = document.getElementById('cc-class-info');
  if (!el){
    const preview = document.getElementById('create-preview');
    if (!preview) return;
    el = document.createElement('div');
    el.id = 'cc-class-info';
    preview.parentNode.insertBefore(el, preview.nextSibling);
  }
  const c = getClass(gameState.selectedClassId);
  if (c){
    el.style.display = 'flex';
    el.innerHTML = '<span class="cc-char">' + c.character + '</span>'
      + '<span class="cc-role">' + c.name + '</span>';
  } else {
    el.style.display = 'none';
  }
}

function renderCreationOptions(){
  const cr = gameState.creation;
  if (!cr) return;

  // Rambut mengikuti gender — reset ke pilihan valid jika tidak tersedia
  const hairIds = hairListFor(cr.gender);
  if (!hairIds.includes(cr.hair)) cr.hair = hairIds[0];

  renderChipRow('opt-gender', ['Laki-laki', 'Perempuan'],
    cr.gender === 'male' ? 0 : 1,
    i => { cr.gender = i === 0 ? 'male' : 'female'; });
  renderSwatchRow('opt-skin', SKIN_TONES, cr.skin,
    i => { cr.skin = i; });
  renderChipRow('opt-hair', hairIds.map(hairName),
    hairIds.indexOf(cr.hair),
    i => { cr.hair = hairIds[i]; });
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
  renderCreationClassInfo();
  renderCreationOptions();
}

// BUAT — simpan appearance (sudah ada di state), lanjut ke Nickname
function openNickname(){
  showScreen('screen-nickname');
  renderNickname();
}

// ============================================================
// NICKNAME SCREEN
// ============================================================
const NICK_INVALID_MSG = '✕ Nickname tidak valid\nGunakan huruf, angka, spasi, underscore (_), strip (-), atau titik (.)';
const NICK_VALID_REGEX = /^[A-Za-z0-9 ._-]+$/;

function validateNickname(raw){
  const name = (raw || '').trim();
  if (!name) return { ok:false, msg:NICK_INVALID_MSG };
  if (name.length > 16) return { ok:false, msg:NICK_INVALID_MSG };
  if (!NICK_VALID_REGEX.test(name)) return { ok:false, msg:NICK_INVALID_MSG };
  return { ok:true, msg:'✓ Nickname valid', name:name };
}

function renderNickname(){
  const c = getClass(gameState.selectedClassId);
  const preview = document.getElementById('nk-preview');
  if (preview){
    preview.innerHTML = charSVG(gameState.creation, gameState.selectedClassId, 160);
  }
  const charEl = document.getElementById('nk-char');
  const roleEl = document.getElementById('nk-role');
  if (charEl) charEl.textContent = c ? c.character : '';
  if (roleEl) roleEl.textContent = c ? c.name : '';
  const input = document.getElementById('nk-nickname');
  if (!input) return;
  input.value = gameState.nickname; // pertahankan nickname saat kembali
  updateNicknameUI(input.value);
}

function updateNicknameUI(value){
  const countEl = document.getElementById('nk-count');
  const msgEl = document.getElementById('nk-msg');
  const btn = document.getElementById('btn-nickname-confirm');
  if (!countEl || !msgEl || !btn) return;
  countEl.textContent = value.length + ' / 16';
  const v = validateNickname(value);
  if (value.length === 0){
    msgEl.textContent = '';
    msgEl.classList.remove('ok', 'err');
  } else {
    msgEl.textContent = v.msg;
    msgEl.classList.toggle('ok', v.ok);
    msgEl.classList.toggle('err', !v.ok);
  }
  btn.disabled = !v.ok;
}

function confirmNickname(){
  const input = document.getElementById('nk-nickname');
  if (!input) return;
  const v = validateNickname(input.value);
  if (!v.ok){ updateNicknameUI(input.value); return; }
  gameState.nickname = v.name;
  showScreen('screen-server');
  renderServerSelect();
}

// ============================================================
// SERVER SELECTION (prototype UI — tanpa networking)
// ============================================================
function renderServerSelect(){
  const list = document.getElementById('server-list');
  if (!list) return;
  list.innerHTML = SERVERS.map(s =>
    '<button type="button" class="srv-card' + (gameState.selectedServerId === s.id ? ' selected' : '') + '" data-server="' + s.id + '">'
    +  '<span class="srv-main">'
    +    '<span class="srv-name">' + s.name + '</span>'
    +    '<span class="srv-id">' + s.server + '</span>'
    +  '</span>'
    +  '<span class="srv-status">' + s.status + '</span>'
    + '</button>'
  ).join('');
  const btn = document.getElementById('btn-server-confirm');
  if (btn) btn.disabled = !gameState.selectedServerId;
}

function selectServer(id){
  if (!SERVERS.some(s => s.id === id)) return;
  gameState.selectedServerId = id;
  document.querySelectorAll('.srv-card').forEach(c =>
    c.classList.toggle('selected', c.dataset.server === id));
  const btn = document.getElementById('btn-server-confirm');
  if (btn) btn.disabled = false;
}

function confirmServer(){
  if (!gameState.selectedServerId) return;
  startGame();
}

// ============================================================
// GAME LOADING + TIPS (loading kedua — setelah server dipilih)
// Progress & tip disimpan di object gameLoading agar aman
// di-pause (background) lalu di-resume tanpa duplikasi timer.
// ============================================================
const gameLoading = { progressTimer:0, tipTimer:0, progress:0, tipIdx:0 };

function startGameLoading(){
  stopGameLoading(); // anti duplikasi interval
  gameLoading.progress = 0;
  gameLoading.tipIdx = Math.floor(Math.random() * loadingTips.length);

  const bar = document.getElementById('loading-game-bar');
  const pct = document.getElementById('loading-game-pct');
  const tip = document.getElementById('loading-game-tip');
  if (bar) bar.style.width = '0%';
  if (pct) pct.textContent = '0%';
  if (tip) tip.textContent = loadingTips[gameLoading.tipIdx];

  gameLoading.progressTimer = setInterval(gameLoadingTick, 400);
  gameLoading.tipTimer = setInterval(gameLoadingTipTick, 1600);
}

// Satu langkah progress: 0% → 25% → 50% → 75% → 100%
function gameLoadingTick(){
  gameLoading.progress = Math.min(100, gameLoading.progress + 25);
  const bar = document.getElementById('loading-game-bar');
  const pct = document.getElementById('loading-game-pct');
  if (bar) bar.style.width = gameLoading.progress + '%';
  if (pct) pct.textContent = gameLoading.progress + '%';
  if (gameLoading.progress >= 100){
    stopGameLoading();            // hentikan timer SEBELUM masuk game
    enterGame();                  // dipanggil tepat satu kali per flow
  }
}

function gameLoadingTipTick(){
  const tip = document.getElementById('loading-game-tip');
  if (!tip) return;
  gameLoading.tipIdx = (gameLoading.tipIdx + 1) % loadingTips.length;
  tip.classList.remove('tip-swap');
  void tip.offsetWidth; // retrigger animasi fade
  tip.classList.add('tip-swap');
  tip.textContent = loadingTips[gameLoading.tipIdx];
}

function stopGameLoading(){
  clearInterval(gameLoading.progressTimer);
  clearInterval(gameLoading.tipTimer);
  gameLoading.progressTimer = 0;
  gameLoading.tipTimer = 0;
}

// Lanjutkan loading setelah app kembali dari background (document.hidden === false).
// - Timer masih berjalan → tidak melakukan apa-apa (anti duplikasi).
// - Progress < 100%  → interval dibuat ulang, lanjut dari progress terakhir.
// - Progress 100%    → langsung masuk Main Game.
function resumeGameLoading(){
  if (gameState.currentScreen !== 'screen-loading-game') return;
  if (gameLoading.progressTimer || gameLoading.tipTimer) return;
  if (gameLoading.progress >= 100){
    stopGameLoading();
    enterGame();
    return;
  }
  gameLoading.progressTimer = setInterval(gameLoadingTick, 400);
  gameLoading.tipTimer = setInterval(gameLoadingTipTick, 1600);
}

// ============================================================
// GAME INITIALIZATION
// ============================================================
// Player final dibuat SETELAH server dipilih (MASUK)
function createCharacter(name){
  const cls = CLASS_DATA.find(c => c.id === gameState.selectedClassId) || CLASS_DATA[0];
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
    appearance: Object.assign({}, gameState.creation),
    serverId: gameState.selectedServerId
  };
}

// Langkah final flow — dipanggil dari MASUK (server)
function startGame(){
  if (!gameState.selectedServerId) return;
  createCharacter(gameState.nickname);
  saveGame();
  showScreen('screen-loading-game');
  startGameLoading();
}

function continueGame(){
  const data = loadSaveData();
  if (!data){ showToast('Data save tidak ditemukan.'); return; }
  gameState.player = data;
  enterGame(); // langsung Main Game — save lama tanpa serverId tidak
               // diminta memilih server ulang (serverId dinormalisasi null)
}

function enterGame(){
  showScreen('screen-game');
  updateHUD();
  startWorldPreview();
}

function initGame(){
  checkSave(); updateContinueBtn();
  renderClassSelect();
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
    if (!data || !data.name || !data.classId) return null;
    // Kompatibilitas save lama (sebelum flow server): normalisasi serverId
    // menjadi null tanpa memaksa player memilih server ulang.
    if (typeof data.serverId === 'undefined') data.serverId = null;
    // Normalisasi ringan field wajib HUD jika save lama tidak lengkap
    if (typeof data.level !== 'number') data.level = 1;
    if (typeof data.gold !== 'number') data.gold = 0;
    if (typeof data.exp !== 'number') data.exp = 0;
    if (typeof data.expToNext !== 'number') data.expToNext = 100;
    if (typeof data.hp !== 'number' || typeof data.maxHp !== 'number'){
      const cls = getClass(data.classId);
      data.maxHp = cls ? cls.stats.hp : 100;
      data.hp = data.maxHp;
    }
    if (typeof data.mp !== 'number' || typeof data.maxMp !== 'number'){
      const cls = getClass(data.classId);
      data.maxMp = cls ? cls.stats.mp : 30;
      data.mp = data.maxMp;
    }
    return data;
  } catch(e){ return null; }
}
function checkSave(){
  try { gameState.hasSave = !!localStorage.getItem(SAVE_KEY); }
  catch(e){ gameState.hasSave = false; }
}
function updateContinueBtn(){
  const btn = document.getElementById('btn-continue');
  if (btn) btn.disabled = !gameState.hasSave;
}

// ============================================================
// HUD
// ============================================================
function updateHUD(){
  const p = gameState.player;
  if (!p) return;
  const el = (id) => document.getElementById(id);
  const nameEl = el('hud-name');
  if (!nameEl) return; // HUD belum tersedia — jangan lanjut
  nameEl.textContent = p.name;
  el('hud-level').textContent = 'Lv.' + p.level;
  el('hud-gold').textContent = p.gold;
  el('bar-hp').style.width  = Math.max(0, Math.min(100, p.hp  / p.maxHp * 100)) + '%';
  el('bar-mp').style.width  = Math.max(0, Math.min(100, p.mp  / p.maxMp * 100)) + '%';
  el('bar-exp').style.width = Math.max(0, Math.min(100, p.exp / p.expToNext * 100)) + '%';
  el('bar-hp-text').textContent  = p.hp + '/' + p.maxHp;
  el('bar-mp-text').textContent  = p.mp + '/' + p.maxMp;
  el('bar-exp-text').textContent = p.exp + '/' + p.expToNext;
  el('hud-avatar').innerHTML =
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
  if (!gameState.player) return; // null safety — tanpa player tidak ada preview
  world.canvas = document.getElementById('world-canvas');
  if (!world.canvas) return;
  world.ctx = world.canvas.getContext('2d', { alpha:false });
  if (!world.ctx) return;
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
  const titleEl = document.getElementById('modal-title');
  const bodyEl = document.getElementById('modal-body');
  const modal = modalEl();
  if (!titleEl || !bodyEl || !modal) return;
  titleEl.textContent = title;
  bodyEl.innerHTML = bodyHTML;
  modal.classList.remove('hidden');
}
function closeModal(){
  const modal = modalEl();
  if (modal) modal.classList.add('hidden');
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
  if (!el) return;
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

  // Tombol kembali (header) — dengan refresh UI sesuai screen tujuan
  document.querySelectorAll('.btn-back').forEach(btn => {
    btn.addEventListener('click', () => navigateBack(btn.dataset.back));
  });

  // Character selection (delegasi — terpasang sekali)
  document.getElementById('class-list').addEventListener('click', e => {
    const thumb = e.target.closest('.cs-thumb');
    if (!thumb) return;
    selectClass(thumb.dataset.class);
  });
  document.getElementById('btn-class-confirm').addEventListener('click', confirmClass);

  // Character creation — BUAT menuju Nickname (bukan langsung main)
  document.getElementById('btn-start-game').addEventListener('click', openNickname);

  // Nickname — validasi real-time saat mengetik
  const nkInput = document.getElementById('nk-nickname');
  nkInput.addEventListener('input', () => updateNicknameUI(nkInput.value));
  document.getElementById('btn-nickname-confirm').addEventListener('click', confirmNickname);

  // Server selection (delegasi — terpasang sekali)
  document.getElementById('server-list').addEventListener('click', e => {
    const card = e.target.closest('.srv-card');
    if (!card) return;
    selectServer(card.dataset.server);
  });
  document.getElementById('btn-server-confirm').addEventListener('click', confirmServer);

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

  // Resize & visibility
  // - Background (hidden): hentikan World Preview & Game Loading (tanpa merusak state).
  // - Kembali (visible): resume World Preview / Game Loading dari posisi terakhir.
  let resizeTO = 0;
  window.addEventListener('resize', () => {
    clearTimeout(resizeTO);
    resizeTO = setTimeout(() => { if (world.running) resizeCanvas(); }, 150);
  });
  document.addEventListener('visibilitychange', () => {
    if (document.hidden){
      stopWorldPreview();
      if (gameState.currentScreen === 'screen-loading-game') stopGameLoading();
    } else {
      if (gameState.currentScreen === 'screen-game') startWorldPreview();
      else if (gameState.currentScreen === 'screen-loading-game') resumeGameLoading();
    }
  });
}

// ============================================================
// INIT
// ============================================================
initGame();