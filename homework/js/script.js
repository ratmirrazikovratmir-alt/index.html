/* ==========================================================
   ТИР — тренажёр правописания
   Логика: таймер на слово, проверка ответа, патроны (жизни),
   счёт, серия попаданий, ускорение раундов, звук выстрела.
   ========================================================== */

(() => {
  "use strict";

  /* ---------------- Набор слов (мишени) ----------------
     Можно заменить/дополнить словами из модуля лексики —
     формат: { ru: "перевод-подсказка", en: "ответ" }         */
  const WORD_BANK = [
    { ru: "яблоко",        en: "apple" },
    { ru: "компьютер",     en: "computer" },
    { ru: "окно",          en: "window" },
    { ru: "учитель",       en: "teacher" },
    { ru: "друг",          en: "friend" },
    { ru: "погода",        en: "weather" },
    { ru: "путешествие",   en: "journey" },
    { ru: "гора",          en: "mountain" },
    { ru: "сад",           en: "garden" },
    { ru: "кухня",         en: "kitchen" },
    { ru: "мост",          en: "bridge" },
    { ru: "библиотека",    en: "library" },
  ];

  const MAX_LIVES = 3;
  const BASE_TIME_MS = 6000;   // время на первое слово
  const MIN_TIME_MS = 2800;    // минимальный порог по мере ускорения
  const TIME_STEP_MS = 300;    // на сколько таймер сокращается с каждым раундом

  /* ---------------- DOM ---------------- */
  const startScreen  = document.getElementById("startScreen");
  const gameScreen   = document.getElementById("gameScreen");
  const resultScreen = document.getElementById("resultScreen");

  const startBtn   = document.getElementById("startBtn");
  const restartBtn = document.getElementById("restartBtn");

  const roundValue  = document.getElementById("roundValue");
  const livesValue  = document.getElementById("livesValue");
  const hitsValue   = document.getElementById("hitsValue");
  const missesValue = document.getElementById("missesValue");
  const streakValue = document.getElementById("streakValue");

  const timerFill = document.getElementById("timerFill");

  const promptWord  = document.getElementById("promptWord");
  const target      = document.getElementById("target");
  const marksLayer  = document.getElementById("marks");
  const crosshair   = document.getElementById("crosshair");
  const muzzleFlash = document.getElementById("muzzleFlash");

  const fireForm    = document.getElementById("fireForm");
  const answerInput = document.getElementById("answerInput");
  const fireBtn     = document.getElementById("fireBtn");
  const feedback    = document.getElementById("feedback");

  const resHits      = document.getElementById("resHits");
  const resMisses     = document.getElementById("resMisses");
  const resStreak     = document.getElementById("resStreak");
  const resAccuracy   = document.getElementById("resAccuracy");
  const resultTitle   = document.getElementById("resultTitle");
  const resultRank    = document.getElementById("resultRank");

  /* ---------------- Состояние ---------------- */
  let deck = [];
  let wordIndex = 0;
  let lives = MAX_LIVES;
  let hits = 0;
  let misses = 0;
  let streak = 0;
  let bestStreak = 0;

  let timerStart = 0;
  let timerDuration = BASE_TIME_MS;
  let timerRAF = null;
  let roundLocked = false; // блокировка ввода между словами

  /* ---------------- Звук (Web Audio, без внешних файлов) ---------------- */
  let audioCtx = null;
  function ensureAudio() {
    if (!audioCtx) {
      const Ctx = window.AudioContext || window.webkitAudioContext;
      audioCtx = new Ctx();
    }
    return audioCtx;
  }

  function beep({ freq = 440, duration = 0.12, type = "square", gain = 0.06, glideTo = null }) {
    try {
      const ctx = ensureAudio();
      const osc = ctx.createOscillator();
      const g = ctx.createGain();
      osc.type = type;
      osc.frequency.setValueAtTime(freq, ctx.currentTime);
      if (glideTo) {
        osc.frequency.exponentialRampToValueAtTime(glideTo, ctx.currentTime + duration);
      }
      g.gain.setValueAtTime(gain, ctx.currentTime);
      g.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + duration);
      osc.connect(g).connect(ctx.destination);
      osc.start();
      osc.stop(ctx.currentTime + duration);
    } catch (e) {
      /* аудио недоступно — тихо игнорируем */
    }
  }

  const sound = {
    shot:  () => beep({ freq: 900, glideTo: 200, duration: 0.09, type: "square", gain: 0.05 }),
    hit:   () => beep({ freq: 660, glideTo: 990, duration: 0.16, type: "triangle", gain: 0.07 }),
    miss:  () => beep({ freq: 180, glideTo: 90,  duration: 0.28, type: "sawtooth", gain: 0.07 }),
    empty: () => beep({ freq: 120, duration: 0.35, type: "sawtooth", gain: 0.06 }),
  };

  /* ---------------- Утилиты ---------------- */
  function shuffle(arr) {
    const a = arr.slice();
    for (let i = a.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [a[i], a[j]] = [a[j], a[i]];
    }
    return a;
  }

  function normalize(str) {
    return str.trim().toLowerCase();
  }

  function updateHUD() {
    roundValue.textContent = String(wordIndex + 1);
    hitsValue.textContent = String(hits);
    missesValue.textContent = String(misses);
    streakValue.textContent = String(streak);
    livesValue.textContent = "●".repeat(lives) + "○".repeat(MAX_LIVES - lives);
  }

  function placeMark(type) {
    const el = document.createElement("div");
    el.className = "mark " + (type === "hit" ? "mark-hit" : "mark-miss");
    // случайная позиция в пределах мишени, подальше от самого центра
    const angle = Math.random() * Math.PI * 2;
    const radius = 30 + Math.random() * 34; // % от центра
    const x = 50 + Math.cos(angle) * radius;
    const y = 50 + Math.sin(angle) * radius;
    el.style.left = x + "%";
    el.style.top = y + "%";
    if (type === "miss") el.textContent = "✕";
    marksLayer.appendChild(el);
  }

  function flashMuzzle() {
    muzzleFlash.classList.remove("flash");
    void muzzleFlash.offsetWidth; // reflow для перезапуска анимации
    muzzleFlash.classList.add("flash");
  }

  function recoilCrosshair() {
    crosshair.classList.remove("fire");
    void crosshair.offsetWidth;
    crosshair.classList.add("fire");
  }

  /* ---------------- Таймер раунда ---------------- */
  function startTimer(durationMs) {
    cancelAnimationFrame(timerRAF);
    timerStart = performance.now();
    timerDuration = durationMs;
    timerFill.classList.remove("warn");

    function tick(now) {
      const elapsed = now - timerStart;
      const remaining = Math.max(0, 1 - elapsed / timerDuration);
      timerFill.style.transform = `scaleX(${remaining})`;
      if (remaining < 0.28) timerFill.classList.add("warn");

      if (elapsed >= timerDuration) {
        handleTimeout();
        return;
      }
      timerRAF = requestAnimationFrame(tick);
    }
    timerRAF = requestAnimationFrame(tick);
  }

  function stopTimer() {
    cancelAnimationFrame(timerRAF);
  }

  /* ---------------- Игровой цикл ---------------- */
  function startGame() {
    deck = shuffle(WORD_BANK);
    wordIndex = 0;
    lives = MAX_LIVES;
    hits = 0;
    misses = 0;
    streak = 0;
    bestStreak = 0;
    roundLocked = false;

    startScreen.classList.add("hidden");
    resultScreen.classList.add("hidden");
    gameScreen.classList.remove("hidden");

    marksLayer.innerHTML = "";
    updateHUD();
    loadWord();
  }

  function currentTimeBudget() {
    const t = BASE_TIME_MS - wordIndex * TIME_STEP_MS;
    return Math.max(MIN_TIME_MS, t);
  }

  function loadWord() {
    if (wordIndex >= deck.length) {
      endGame(true);
      return;
    }
    roundLocked = false;
    const word = deck[wordIndex];
    promptWord.textContent = word.ru;
    answerInput.value = "";
    feedback.textContent = "\u00A0";
    feedback.className = "feedback";
    updateHUD();
    startTimer(currentTimeBudget());
    answerInput.focus();
  }

  function handleTimeout() {
    if (roundLocked) return;
    roundLocked = true;
    registerMiss("Время вышло — цель ушла");
  }

  function registerHit() {
    stopTimer();
    hits++;
    streak++;
    bestStreak = Math.max(bestStreak, streak);
    sound.shot();
    recoilCrosshair();
    flashMuzzle();
    target.classList.remove("miss-flash");
    void target.offsetWidth;
    target.classList.add("hit-flash");
    setTimeout(() => target.classList.remove("hit-flash"), 350);
    placeMark("hit");
    sound.hit();
    feedback.textContent = "ПОПАДАНИЕ — " + deck[wordIndex].en.toUpperCase();
    feedback.className = "feedback hit-color";
    updateHUD();
    advance();
  }

  function registerMiss(reason) {
    stopTimer();
    misses++;
    streak = 0;
    lives--;
    sound.shot();
    recoilCrosshair();
    flashMuzzle();
    target.classList.remove("hit-flash");
    void target.offsetWidth;
    target.classList.add("miss-flash");
    setTimeout(() => target.classList.remove("miss-flash"), 350);
    placeMark("miss");
    sound.miss();
    const correct = deck[wordIndex].en;
    feedback.textContent = (reason ? reason + ". " : "Мимо. ") + "Верно: " + correct.toUpperCase();
    feedback.className = "feedback miss-color";
    updateHUD();

    if (lives <= 0) {
      sound.empty();
      setTimeout(() => endGame(false), 500);
      return;
    }
    advance();
  }

  function advance() {
    wordIndex++;
    setTimeout(loadWord, 700);
  }

  function endGame(finishedDeck) {
    stopTimer();
    gameScreen.classList.add("hidden");
    resultScreen.classList.remove("hidden");

    resHits.textContent = String(hits);
    resMisses.textContent = String(misses);
    resStreak.textContent = String(bestStreak);
    const total = hits + misses;
    const accuracy = total > 0 ? Math.round((hits / total) * 100) : 0;
    resAccuracy.textContent = accuracy + "%";

    resultTitle.textContent = finishedDeck ? "МИШЕНИ ЗАКОНЧИЛИСЬ" : "РУБЕЖ ЗАКРЫТ — ПАТРОНЫ КОНЧИЛИСЬ";

    let rank;
    if (accuracy >= 90) rank = "Снайпер. Ни одного лишнего выстрела.";
    else if (accuracy >= 70) rank = "Меткий стрелок.";
    else if (accuracy >= 50) rank = "Уверенный новичок.";
    else rank = "Стоит ещё потренироваться на рубеже.";
    resultRank.textContent = rank;
  }

  /* ---------------- Обработка выстрела ---------------- */
  fireForm.addEventListener("submit", (e) => {
    e.preventDefault();
    if (roundLocked) return;
    const value = answerInput.value;
    if (!value.trim()) {
      answerInput.focus();
      return;
    }
    roundLocked = true;
    const correct = normalize(deck[wordIndex].en);
    if (normalize(value) === correct) {
      registerHit();
    } else {
      registerMiss("Мимо цели");
    }
  });

  startBtn.addEventListener("click", startGame);
  restartBtn.addEventListener("click", startGame);
})();
