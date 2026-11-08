(function () {
  const SETS = {
    upper: 'ABCDEFGHIJKLMNOPQRSTUVWXYZ',
    lower: 'abcdefghijklmnopqrstuvwxyz',
    digits: '0123456789',
    symbols: '!@#$%&*()-_=+[]{};:,.?'
  };
  const AMBIGUOUS = /[0O1lI]/g;
  const LANG_KEY = 'password-generator-lang';
  const OPTIONS_KEY = 'password-generator-options';

  const passwordEl = document.getElementById('password');
  const copyBtn = document.getElementById('copy-btn');
  const regenBtn = document.getElementById('regen-btn');
  const lengthInput = document.getElementById('length');
  const lengthValue = document.getElementById('length-value');
  const errorEl = document.getElementById('error');
  const strengthBars = document.getElementById('strength-bars').children;
  const strengthLabel = document.getElementById('strength-label');
  const langButtons = document.querySelectorAll('.lang-btn');
  const checks = {
    upper: document.getElementById('opt-upper'),
    lower: document.getElementById('opt-lower'),
    digits: document.getElementById('opt-digits'),
    symbols: document.getElementById('opt-symbols'),
    ambiguous: document.getElementById('opt-ambiguous')
  };

  // ---- Language ----
  function detectLang() {
    try {
      const saved = localStorage.getItem(LANG_KEY);
      if (saved && STRINGS[saved]) return saved;
    } catch (e) { /* ignore */ }
    return (navigator.language || 'en').toLowerCase().startsWith('tr') ? 'tr' : 'en';
  }

  let lang = detectLang();
  let strengthLevel = null;
  let hasError = false;

  function t(key) { return STRINGS[lang][key]; }

  function applyLang() {
    document.documentElement.lang = lang;
    document.title = t('pageTitle');
    document.querySelectorAll('[data-i18n]').forEach(function (el) {
      el.textContent = t(el.dataset.i18n);
    });
    langButtons.forEach(function (b) {
      const active = b.dataset.lang === lang;
      b.classList.toggle('active', active);
      b.setAttribute('aria-pressed', String(active));
    });
    renderStrength();
    renderError();
  }

  langButtons.forEach(function (b) {
    b.addEventListener('click', function () {
      lang = b.dataset.lang;
      try { localStorage.setItem(LANG_KEY, lang); } catch (e) { /* ignore */ }
      applyLang();
    });
  });

  // ---- Secure randomness ----
  // Uniform integer in [0, max) without modulo bias (rejection sampling).
  function randomInt(max) {
    const limit = Math.floor(0x100000000 / max) * max;
    const buf = new Uint32Array(1);
    do {
      crypto.getRandomValues(buf);
    } while (buf[0] >= limit);
    return buf[0] % max;
  }

  function pick(str) {
    return str.charAt(randomInt(str.length));
  }

  function shuffle(arr) {
    for (let i = arr.length - 1; i > 0; i--) {
      const j = randomInt(i + 1);
      [arr[i], arr[j]] = [arr[j], arr[i]];
    }
    return arr;
  }

  // ---- Generation ----
  function activeSets() {
    const sets = [];
    for (const key of Object.keys(SETS)) {
      if (!checks[key].checked) continue;
      const chars = checks.ambiguous.checked ? SETS[key].replace(AMBIGUOUS, '') : SETS[key];
      if (chars) sets.push(chars);
    }
    return sets;
  }

  function generate() {
    const sets = activeSets();
    hasError = sets.length === 0;
    renderError();
    if (hasError) {
      passwordEl.textContent = '';
      strengthLevel = null;
      renderStrength();
      return;
    }

    const length = Math.max(parseInt(lengthInput.value, 10), sets.length);
    const pool = sets.join('');
    const chars = sets.map(pick); // at least one from every selected set
    while (chars.length < length) chars.push(pick(pool));
    shuffle(chars);

    renderPassword(chars.join(''));
    const bits = length * Math.log2(pool.length);
    strengthLevel = bits < 40 ? 0 : bits < 60 ? 1 : bits < 80 ? 2 : bits < 110 ? 3 : 4;
    renderStrength();
  }

  function renderPassword(value) {
    passwordEl.textContent = '';
    for (const ch of value) {
      const span = document.createElement('span');
      span.textContent = ch;
      if (/[0-9]/.test(ch)) span.className = 'ch-digit';
      else if (!/[A-Za-z]/.test(ch)) span.className = 'ch-symbol';
      passwordEl.append(span);
    }
    passwordEl.dataset.value = value;
  }

  function renderStrength() {
    const filled = strengthLevel === null ? 0 : Math.max(strengthLevel, 1);
    Array.from(strengthBars).forEach(function (bar, i) {
      bar.className = i < filled ? 'on level-' + strengthLevel : '';
    });
    strengthLabel.textContent = strengthLevel === null ? '' : t('strength' + strengthLevel);
  }

  function renderError() {
    errorEl.hidden = !hasError;
    errorEl.textContent = hasError ? t('errorNoSet') : '';
  }

  // ---- Copy ----
  function fallbackCopy(text) {
    const ta = document.createElement('textarea');
    ta.value = text;
    ta.style.position = 'fixed';
    ta.style.opacity = '0';
    document.body.append(ta);
    ta.select();
    let ok = false;
    try { ok = document.execCommand('copy'); } catch (e) { /* ignore */ }
    ta.remove();
    return ok;
  }

  let copyTimer;
  function flashCopy(ok) {
    copyBtn.textContent = t(ok ? 'copied' : 'copyFailed');
    clearTimeout(copyTimer);
    copyTimer = setTimeout(function () { copyBtn.textContent = t('copy'); }, 1500);
  }

  copyBtn.addEventListener('click', function () {
    const value = passwordEl.dataset.value;
    if (!value) return;
    if (navigator.clipboard && window.isSecureContext) {
      navigator.clipboard.writeText(value).then(
        function () { flashCopy(true); },
        function () { flashCopy(fallbackCopy(value)); }
      );
    } else {
      flashCopy(fallbackCopy(value));
    }
  });

  // ---- Options ----
  function saveOptions() {
    const data = { length: lengthInput.value };
    for (const key of Object.keys(checks)) data[key] = checks[key].checked;
    try { localStorage.setItem(OPTIONS_KEY, JSON.stringify(data)); } catch (e) { /* ignore */ }
  }

  function loadOptions() {
    try {
      const data = JSON.parse(localStorage.getItem(OPTIONS_KEY));
      if (data) {
        for (const key of Object.keys(checks)) {
          if (typeof data[key] === 'boolean') checks[key].checked = data[key];
        }
        if (data.length) lengthInput.value = data.length;
      }
    } catch (e) { /* ignore */ }

    // Backwards compatible with the old ?len=10&spec=true links.
    const params = new URLSearchParams(window.location.search);
    const len = parseInt(params.get('len'), 10);
    if (len >= lengthInput.min && len <= lengthInput.max) lengthInput.value = len;
    if (params.get('spec') === 'true') checks.symbols.checked = true;
    lengthValue.textContent = lengthInput.value;
  }

  lengthInput.addEventListener('input', function () {
    lengthValue.textContent = lengthInput.value;
    saveOptions();
    generate();
  });
  Object.values(checks).forEach(function (c) {
    c.addEventListener('change', function () { saveOptions(); generate(); });
  });
  regenBtn.addEventListener('click', generate);

  loadOptions();
  generate();
  applyLang();
})();
