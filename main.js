(() => {
  'use strict';

  const missions = window.LOGICODIX_MISSIONS || [];
  const RUN_KEY = 'logicodix.run.v1';
  const BEST_KEY = 'logicodix.best.v1';
  const START_SECONDS = 7 * 60;
  const picker = document.getElementById('mission-picker');
  const workspace = document.getElementById('mission-workspace');
  const timerValue = document.getElementById('timer-value');
  const timerStatus = document.getElementById('timer-status');
  const scoreValue = document.getElementById('score-value');
  const progressLabel = document.getElementById('progress-label');
  const progressFill = document.getElementById('overall-progress-fill');
  const startButton = document.getElementById('start-button');
  const resetButton = document.getElementById('reset-session');
  const clearButton = document.getElementById('clear-data');

  const blankRun = () => ({
    selectedMission: null,
    started: false,
    finished: false,
    endTime: null,
    remainingSeconds: START_SECONDS,
    hints: {},
    answers: {}
  });

  function readRun() {
    try {
      const stored = JSON.parse(localStorage.getItem(RUN_KEY));
      if (!stored || typeof stored !== 'object') return blankRun();
      const restored = { ...blankRun(), ...stored };
      if (restored.started && restored.endTime) {
        restored.remainingSeconds = Math.max(0, Math.ceil((restored.endTime - Date.now()) / 1000));
        if (restored.remainingSeconds === 0) {
          restored.started = false;
          restored.finished = true;
        }
      }
      if (!missions.some((mission) => mission.id === restored.selectedMission)) restored.selectedMission = null;
      return restored;
    } catch (_) {
      return blankRun();
    }
  }

  let run = readRun();
  let bestScore = readBest();
  let ticker = null;

  function readBest() {
    try {
      const value = Number(localStorage.getItem(BEST_KEY));
      return Number.isFinite(value) && value >= 0 ? value : 0;
    } catch (_) {
      return 0;
    }
  }

  function saveRun() {
    try { localStorage.setItem(RUN_KEY, JSON.stringify(run)); } catch (_) { /* Local saving may be blocked by the browser. */ }
  }

  function scoreFor(answer) {
    if (!answer) return 0;
    if (!answer.correct) return 10;
    const hintsUsed = Number(answer.hintsUsed) || 0;
    return 80 + Math.max(0, 20 - hintsUsed * 7);
  }

  function totalScore() {
    return Object.values(run.answers).reduce((sum, answer) => sum + scoreFor(answer), 0);
  }

  function answeredCount() {
    return Object.keys(run.answers).length;
  }

  function formatTime(seconds) {
    const safe = Math.max(0, seconds);
    const minutes = String(Math.floor(safe / 60)).padStart(2, '0');
    const remainder = String(safe % 60).padStart(2, '0');
    return `${minutes}:${remainder}`;
  }

  function missionById(id) {
    return missions.find((mission) => mission.id === id);
  }

  function renderPicker() {
    picker.innerHTML = missions.map((mission) => {
      const answer = run.answers[mission.id];
      const stateLabel = answer ? (answer.correct ? 'TERJAWAB · TEPAT' : 'TERJAWAB · COBA LAGI') : 'BELUM DIJAWAB';
      const selected = run.selectedMission === mission.id;
      return `<button class="mission-card" type="button" data-select-mission="${mission.id}" aria-pressed="${selected}">
        <span class="mission-card-head"><span class="mission-index">MISI ${mission.number}</span><span class="mission-state">${stateLabel}</span></span>
        <h3>${mission.title}</h3>
        <p>${mission.summary}</p>
        <span class="mission-card-footer"><span>${mission.category}</span><span aria-hidden="true">↗</span></span>
      </button>`;
    }).join('');
  }

  function renderTimer() {
    timerValue.textContent = formatTime(run.remainingSeconds);
    timerValue.classList.toggle('is-running', run.started);
    if (run.finished) {
      timerStatus.textContent = run.remainingSeconds === 0 ? 'Waktu habis — ringkasanmu siap.' : 'Tantangan selesai.';
    } else if (run.started) {
      timerStatus.textContent = 'Waktu terus berjalan. Fokus ke proses.';
    } else if (run.remainingSeconds < START_SECONDS) {
      timerStatus.textContent = 'Dijeda saat halaman ditutup; lanjutkan kapan saja.';
    } else {
      timerStatus.textContent = 'Siap kapan pun kamu mulai.';
    }
    startButton.disabled = run.finished || run.started;
    startButton.textContent = run.started ? 'Tantangan berjalan' : (run.remainingSeconds < START_SECONDS ? 'Lanjutkan tantangan' : 'Mulai tantangan →');
  }

  function renderProgress() {
    const count = answeredCount();
    scoreValue.textContent = String(totalScore());
    progressLabel.textContent = `${count} dari ${missions.length} misi dijawab`;
    progressFill.style.width = `${missions.length ? (count / missions.length) * 100 : 0}%`;
    renderPicker();
  }

  function renderConstraints(mission) {
    return `<div class="constraint-box"><strong>BATASAN YANG PERLU KAMU PERIKSA</strong><ul>${mission.constraints.map((item) => `<li>${item}</li>`).join('')}</ul></div>`;
  }

  function hintMarkup(mission) {
    const used = Number(run.hints[mission.id]) || 0;
    const hasAnswer = Boolean(run.answers[mission.id]);
    const nextHint = mission.hints[used];
    const button = !hasAnswer && run.started && nextHint
      ? `<button type="button" class="button button-outline button-compact hint-button" data-hint="${mission.id}">Buka petunjuk ${used + 1} dari ${mission.hints.length}</button>`
      : '';
    const shown = mission.hints.slice(0, used).map((hint, index) => `<div class="hint-revealed"><strong>PETUNJUK ${index + 1}</strong><p>${hint}</p></div>`).join('');
    return `${button ? `<div class="challenge-actions">${button}<span class="hint-count">${used} petunjuk dipakai</span></div>` : (used ? `<p class="hint-count">${used} petunjuk dipakai</p>` : '')}${shown}`;
  }

  function feedbackMarkup(mission, answer) {
    if (!answer) return '';
    const explanation = answer.correct ? mission.explanationCorrect : mission.explanationWrong;
    const points = scoreFor(answer);
    return `<div class="answer-feedback ${answer.correct ? 'feedback-correct' : 'feedback-incorrect'}" role="status" aria-live="polite">
      <h4>${answer.correct ? 'Tepat — semua batasan terpenuhi.' : 'Belum tepat — ini cara mengurainya.'}</h4>
      <p>${explanation}</p><p class="earned-points">${answer.correct ? 'Akurasi + proses' : 'Apresiasi usaha'}: ${points} poin · Waktu tidak menambah poin.</p>
    </div>`;
  }

  function challengeMarkup(mission) {
    const answer = run.answers[mission.id];
    const isActive = run.started && !run.finished;
    const disabled = !isActive || Boolean(answer);
    const options = mission.choices.map((choice) => {
      const checked = answer && answer.choiceId === choice.id ? ' checked' : '';
      const off = disabled ? ' disabled' : '';
      return `<label class="answer-option"><input type="radio" name="answer" value="${choice.id}"${checked}${off} required />
        <span class="answer-option-copy"><strong>${choice.label}</strong><small>${choice.detail}</small></span></label>`;
    }).join('');
    const answerButton = answer ? '' : `<div class="challenge-actions"><button class="button button-primary button-compact" type="submit"${isActive ? '' : ' disabled'}>Kunci jawaban <span aria-hidden="true">→</span></button></div>`;
    const hintSection = hintMarkup(mission);
    const continueButton = answer ? `<div class="next-actions"><button type="button" class="button button-primary button-compact" data-next>${answeredCount() === missions.length ? 'Lihat ringkasan' : 'Ke misi berikutnya'} <span aria-hidden="true">→</span></button></div>` : '';
    const endButton = !run.finished && (run.started || answeredCount() > 0) ? '<button type="button" class="finish-link" data-finish>Sudahi dan lihat ringkasan</button>' : '';
    return `<div class="challenge-topline"><div><span class="mission-index">MISI ${mission.number} / ${mission.category}</span><h3 id="challenge-title" tabindex="-1">${mission.title}</h3><p class="challenge-context">${mission.context}</p></div><span class="challenge-number">${mission.number} / 03</span></div>
      ${renderConstraints(mission)}
      <form class="answer-form" data-answer-form="${mission.id}"><fieldset><legend>${mission.question}</legend><p class="answer-note">${mission.answerFormat}</p><div class="answer-options">${options}</div></fieldset>${answerButton}</form>
      ${hintSection}${feedbackMarkup(mission, answer)}${continueButton}${endButton}`;
  }

  function summaryMarkup() {
    const score = totalScore();
    const answered = answeredCount();
    const items = missions.map((mission) => {
      const answer = run.answers[mission.id];
      const state = !answer ? 'Belum dicoba' : (answer.correct ? 'Tepat' : 'Perlu ditinjau');
      const labelClass = !answer ? '' : (answer.correct ? 'is-correct' : 'is-wrong');
      const detail = answer
        ? `${answer.correct ? mission.explanationCorrect : mission.explanationWrong} Petunjuk digunakan: ${answer.hintsUsed}. ${scoreFor(answer)} poin.`
        : `Belum dijawab sebelum sesi berakhir. Petunjuk digunakan: ${Number(run.hints[mission.id]) || 0}.`;
      return `<article class="summary-item"><strong>${mission.number}. ${mission.title}</strong><span class="result-pill ${labelClass}">${state} · ${answer ? scoreFor(answer) : 0} poin</span><p>${detail}</p></article>`;
    }).join('');
    const best = Math.max(bestScore, score);
    return `<div class="summary-panel"><div class="summary-top"><div><span class="summary-kicker">RINGKASAN TANTANGAN</span><h3 id="challenge-title" tabindex="-1">${answered === missions.length ? 'Semua misi sudah kamu uraikan.' : 'Ini jejak prosesmu.'}</h3></div><div class="summary-total"><strong>${score}</strong><span>POIN · ${answered} / ${missions.length} TERJAWAB</span></div></div>
      <div class="summary-list">${items}</div>
      <p class="scoring-explain"><strong>Skor = ketepatan + proses.</strong> Jawaban tepat bernilai hingga 100 poin: 80 poin akurasi dan 20 poin bonus proses, dikurangi 7 poin bonus untuk setiap petunjuk yang dibuka. Jawaban yang dicoba tetapi belum tepat mendapat 10 poin apresiasi usaha. Kecepatan tidak menambah skor.</p>
      <span class="best-record"><span aria-hidden="true">✦</span> REKOR TERBAIK DI PERANGKAT INI: <strong>${best} POIN</strong></span>
      <div class="next-actions"><button type="button" class="button button-primary button-compact" data-new-run>Mulai sesi baru <span aria-hidden="true">→</span></button></div>
    </div>`;
  }

  function renderWorkspace() {
    if (run.finished) {
      workspace.innerHTML = summaryMarkup();
      return;
    }
    const mission = missionById(run.selectedMission);
    if (!mission) {
      workspace.innerHTML = `<div class="empty-state"><span class="empty-symbol" aria-hidden="true">L?</span><div><h3 id="challenge-title" tabindex="-1">Pilih situasi untuk mulai bernalar.</h3><p>Pilih salah satu kartu misi di atas, lalu mulai tantangan tujuh menit saat kamu siap.</p></div></div>`;
      return;
    }
    workspace.innerHTML = challengeMarkup(mission);
  }

  function render() {
    renderTimer();
    renderProgress();
    renderWorkspace();
  }

  function stopTicker() {
    if (ticker) window.clearInterval(ticker);
    ticker = null;
  }

  function completeRun() {
    run.started = false;
    run.finished = true;
    run.remainingSeconds = Math.max(0, run.remainingSeconds);
    run.endTime = null;
    stopTicker();
    const score = totalScore();
    if (score > bestScore) {
      bestScore = score;
      try { localStorage.setItem(BEST_KEY, String(bestScore)); } catch (_) { /* Best score is optional if storage is unavailable. */ }
    }
    saveRun();
    render();
    const title = document.getElementById('challenge-title');
    if (title) title.focus();
  }

  function startRun() {
    if (run.finished || run.started) return;
    if (!run.selectedMission) run.selectedMission = missions[0]?.id || null;
    run.started = true;
    run.endTime = Date.now() + run.remainingSeconds * 1000;
    saveRun();
    timerStatus.textContent = 'Waktu terus berjalan. Fokus ke proses.';
    render();
    stopTicker();
    ticker = window.setInterval(() => {
      const next = Math.max(0, Math.ceil((run.endTime - Date.now()) / 1000));
      if (next !== run.remainingSeconds) {
        run.remainingSeconds = next;
        timerValue.textContent = formatTime(next);
        saveRun();
      }
      if (next <= 0) {
        completeRun();
        timerStatus.textContent = 'Waktu habis — ringkasanmu siap.';
      }
    }, 250);
  }

  function resetRun() {
    stopTicker();
    run = blankRun();
    saveRun();
    render();
    timerStatus.textContent = 'Sesi baru siap. Pilih misi dan mulai kapan pun.';
  }

  function chooseNextMission() {
    if (answeredCount() === missions.length) {
      completeRun();
      return;
    }
    const next = missions.find((mission) => !run.answers[mission.id]);
    if (next) run.selectedMission = next.id;
    saveRun();
    render();
    const title = document.getElementById('challenge-title');
    if (title) title.focus();
  }

  picker.addEventListener('click', (event) => {
    const button = event.target.closest('[data-select-mission]');
    if (!button || run.finished) return;
    run.selectedMission = button.dataset.selectMission;
    saveRun();
    render();
    const title = document.getElementById('challenge-title');
    if (title) title.focus();
  });

  workspace.addEventListener('click', (event) => {
    const hintButton = event.target.closest('[data-hint]');
    if (hintButton) {
      const mission = missionById(hintButton.dataset.hint);
      if (!mission || !run.started || run.answers[mission.id]) return;
      const used = Number(run.hints[mission.id]) || 0;
      if (used >= mission.hints.length) return;
      run.hints[mission.id] = used + 1;
      saveRun();
      render();
      const hint = workspace.querySelector('.hint-revealed:last-of-type');
      if (hint) hint.scrollIntoView({ block: 'nearest', behavior: 'smooth' });
      return;
    }
    if (event.target.closest('[data-next]')) {
      chooseNextMission();
      return;
    }
    if (event.target.closest('[data-finish]')) {
      completeRun();
      return;
    }
    if (event.target.closest('[data-new-run]')) {
      resetRun();
      document.getElementById('misi').scrollIntoView({ behavior: 'smooth' });
    }
  });

  workspace.addEventListener('submit', (event) => {
    const form = event.target.closest('[data-answer-form]');
    if (!form) return;
    event.preventDefault();
    const mission = missionById(form.dataset.answerForm);
    if (!mission || !run.started || run.answers[mission.id]) return;
    const selected = new FormData(form).get('answer');
    if (!selected) {
      let notice = form.querySelector('[data-validation-message]');
      if (!notice) {
        notice = document.createElement('p');
        notice.dataset.validationMessage = 'true';
        notice.className = 'answer-note';
        notice.setAttribute('role', 'alert');
        notice.textContent = 'Pilih satu jawaban sebelum mengunci pilihanmu.';
        form.append(notice);
      }
      form.querySelector('input[name="answer"]')?.focus();
      return;
    }
    const choice = mission.choices.find((item) => item.id === selected);
    if (!choice) return;
    run.answers[mission.id] = {
      choiceId: choice.id,
      correct: Boolean(choice.correct),
      hintsUsed: Number(run.hints[mission.id]) || 0,
      answeredAt: Date.now()
    };
    saveRun();
    render();
    workspace.querySelector('.answer-feedback')?.focus?.();
  });

  startButton.addEventListener('click', startRun);
  resetButton.addEventListener('click', () => {
    resetRun();
    timerStatus.textContent = 'Timer dan jawaban direset. Rekor terbaik tetap tersimpan.';
  });
  clearButton.addEventListener('click', () => {
    const confirmed = window.confirm('Hapus semua progres dan rekor LOGICODIX yang tersimpan di browser ini?');
    if (!confirmed) return;
    stopTicker();
    try {
      localStorage.removeItem(RUN_KEY);
      localStorage.removeItem(BEST_KEY);
    } catch (_) { /* The interface remains usable when browser storage is unavailable. */ }
    bestScore = 0;
    run = blankRun();
    render();
    timerStatus.textContent = 'Data lokal dihapus. Tantangan siap dimulai lagi.';
    document.getElementById('misi').scrollIntoView({ behavior: 'smooth' });
  });

  if (run.finished && totalScore() > bestScore) {
    bestScore = totalScore();
    try { localStorage.setItem(BEST_KEY, String(bestScore)); } catch (_) { /* Local record is optional. */ }
  }
  if (run.started && run.remainingSeconds > 0) {
    run.endTime = Date.now() + run.remainingSeconds * 1000;
    run.started = false;
    run.endTime = null;
    run.remainingSeconds = Math.min(run.remainingSeconds, START_SECONDS);
    saveRun();
  }
  render();
})();
