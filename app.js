/**
 * TIẾNG ANH LÀ GÌ TÔI KO QUEN - Core Web Application Logic
 * Single License Key Authentication + Dynamic Question Randomization
 */

const app = {
  data: {
    exams: [],
    currentExam: null,
    currentLevelFilter: 'all',
    userAnswers: {},
    soundEnabled: true,
    activeAudioElement: null,

    users: [],
    currentUser: null,

    userProgress: {
      unlockedUpTo: 1,
      passedSets: {},
      streak: 1,
      exp: 0,
      attempts: []
    },

    examTimer: {
      interval: null,
      secondsRemaining: 90 * 60
    }
  },

  // -------------------------------------------------------------
  // FISHER-YATES SHUFFLE ALGORITHM
  // -------------------------------------------------------------
  shuffleArray: function(array) {
    const arr = [...array];
    for (let i = arr.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [arr[i], arr[j]] = [arr[j], arr[i]];
    }
    return arr;
  },

  randomizeExamData: function(rawExam) {
    if (!rawExam) return null;
    const exam = JSON.parse(JSON.stringify(rawExam));
    const letters = ['A', 'B', 'C', 'D', 'E'];

    // 1. Randomize Listening
    if (exam.skills?.listening?.parts) {
      exam.skills.listening.parts.forEach(part => {
        if (part.questions && part.questions.length > 0) {
          part.questions = this.shuffleArray(part.questions);
          part.questions.forEach(q => {
            if (q.options && q.options.length > 1) {
              const originalCorrectKey = q.correct_answer;
              const originalCorrectOption = q.options.find(opt => opt.startsWith(originalCorrectKey + '.') || opt.startsWith(originalCorrectKey + ' '));
              const correctRawText = originalCorrectOption ? originalCorrectOption.replace(/^[A-Z][\.\:\s]\s*/, '').trim() : '';

              const rawOptions = q.options.map(opt => opt.replace(/^[A-Z][\.\:\s]\s*/, '').trim());
              const shuffledRaw = this.shuffleArray(rawOptions);

              q.options = shuffledRaw.map((txt, idx) => `${letters[idx]}. ${txt}`);
              const newCorrectIdx = shuffledRaw.findIndex(txt => txt === correctRawText);
              if (newCorrectIdx !== -1) {
                q.correct_answer = letters[newCorrectIdx];
              }
            }
          });
        }
      });
    }

    // 2. Randomize Reading
    if (exam.skills?.reading?.parts) {
      exam.skills.reading.parts.forEach(part => {
        if (part.questions && part.questions.length > 0) {
          part.questions = this.shuffleArray(part.questions);
          part.questions.forEach(q => {
            if (q.options && q.options.length > 1) {
              const originalCorrectKey = q.correct_answer;
              const originalCorrectOption = q.options.find(opt => opt.startsWith(originalCorrectKey + '.') || opt.startsWith(originalCorrectKey + ' '));
              const correctRawText = originalCorrectOption ? originalCorrectOption.replace(/^[A-Z][\.\:\s]\s*/, '').trim() : '';

              const rawOptions = q.options.map(opt => opt.replace(/^[A-Z][\.\:\s]\s*/, '').trim());
              const shuffledRaw = this.shuffleArray(rawOptions);

              q.options = shuffledRaw.map((txt, idx) => `${letters[idx]}. ${txt}`);
              const newCorrectIdx = shuffledRaw.findIndex(txt => txt === correctRawText);
              if (newCorrectIdx !== -1) {
                q.correct_answer = letters[newCorrectIdx];
              }
            }
          });
        }
      });
    }

    // 3. Randomize Writing Part 1
    if (exam.skills?.writing?.parts?.[0]?.questions) {
      exam.skills.writing.parts[0].questions = this.shuffleArray(exam.skills.writing.parts[0].questions);
    }

    return exam;
  },

  // -------------------------------------------------------------
  // AUDIO CONTROLLER & SOUND SYNTHESIZER
  // -------------------------------------------------------------
  formatTime: function(seconds) {
    if (isNaN(seconds) || seconds === Infinity || seconds < 0) return '00:00';
    const m = Math.floor(seconds / 60);
    const s = Math.floor(seconds % 60);
    return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  },

  stopAllAudios: function() {
    const audios = document.querySelectorAll('audio');
    audios.forEach(a => {
      try {
        a.pause();
        a.currentTime = 0;
      } catch (e) {}
    });

    document.querySelectorAll('.custom-audio-pill').forEach(btn => {
      btn.classList.remove('is-playing');
      const icon = btn.querySelector('.audio-icon');
      const text = btn.querySelector('.audio-btn-text');
      if (icon) icon.setAttribute('data-lucide', 'play');
      if (text) text.innerText = 'Phát';
    });

    document.querySelectorAll('.sound-wave').forEach(sw => {
      sw.classList.remove('sound-wave-playing');
    });

    document.querySelectorAll('.audio-progress-fill').forEach(fill => {
      fill.style.width = '0%';
    });

    this.data.activeAudioElement = null;
    this.initIcons();
  },

  toggleCustomAudio: function(audioId, btnId, timeId, waveId, fillId) {
    const audio = document.getElementById(audioId);
    const btn = document.getElementById(btnId);
    const timeDisplay = document.getElementById(timeId);
    const wave = document.getElementById(waveId);
    const fill = document.getElementById(fillId);

    if (!audio) return;

    if (this.data.activeAudioElement && this.data.activeAudioElement !== audio) {
      this.stopAllAudios();
    }

    if (audio.paused) {
      audio.play().then(() => {
        this.data.activeAudioElement = audio;
        if (btn) btn.classList.add('is-playing');
        if (wave) wave.classList.add('sound-wave-playing');
        const icon = btn?.querySelector('.audio-icon');
        const text = btn?.querySelector('.audio-btn-text');
        if (icon) icon.setAttribute('data-lucide', 'pause');
        if (text) text.innerText = 'Tạm Dừng';
        this.initIcons();
      }).catch(err => {
        console.warn('Audio play error:', err);
      });

      if (!audio.dataset.hasListeners) {
        audio.dataset.hasListeners = 'true';

        audio.addEventListener('timeupdate', () => {
          if (timeDisplay && !isNaN(audio.duration)) {
            timeDisplay.innerText = `${this.formatTime(audio.currentTime)} / ${this.formatTime(audio.duration)}`;
          }
          if (fill && !isNaN(audio.duration) && audio.duration > 0) {
            const pct = (audio.currentTime / audio.duration) * 100;
            fill.style.width = `${pct}%`;
          }
        });

        audio.addEventListener('ended', () => {
          if (btn) btn.classList.remove('is-playing');
          if (wave) wave.classList.remove('sound-wave-playing');
          if (fill) fill.style.width = '0%';
          const icon = btn?.querySelector('.audio-icon');
          const text = btn?.querySelector('.audio-btn-text');
          if (icon) icon.setAttribute('data-lucide', 'rotate-ccw');
          if (text) text.innerText = 'Phát Lại';
          if (timeDisplay && !isNaN(audio.duration)) {
            timeDisplay.innerText = `00:00 / ${this.formatTime(audio.duration)}`;
          }
          this.data.activeAudioElement = null;
          this.initIcons();
        });

        audio.addEventListener('loadedmetadata', () => {
          if (timeDisplay && !isNaN(audio.duration)) {
            timeDisplay.innerText = `00:00 / ${this.formatTime(audio.duration)}`;
          }
        });
      }
    } else {
      audio.pause();
      if (btn) btn.classList.remove('is-playing');
      if (wave) wave.classList.remove('sound-wave-playing');
      const icon = btn?.querySelector('.audio-icon');
      const text = btn?.querySelector('.audio-btn-text');
      if (icon) icon.setAttribute('data-lucide', 'play');
      if (text) text.innerText = 'Tiếp Tục';
      this.initIcons();
    }
  },

  seekAudio: function(audioId, event) {
    const audio = document.getElementById(audioId);
    const track = event.currentTarget;
    if (!audio || isNaN(audio.duration) || audio.duration <= 0) return;

    const rect = track.getBoundingClientRect();
    const clickX = event.clientX - rect.left;
    const width = rect.width;
    const targetTime = (clickX / width) * audio.duration;

    audio.currentTime = targetTime;
  },

  skipAudio: function(audioId, seconds) {
    const audio = document.getElementById(audioId);
    if (!audio || isNaN(audio.duration)) return;
    audio.currentTime = Math.max(0, Math.min(audio.duration, audio.currentTime + seconds));
  },

  playSound: function(type) {
    if (!this.data.soundEnabled) return;
    try {
      const ctx = new (window.AudioContext || window.webkitAudioContext)();
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.connect(gain);
      gain.connect(ctx.destination);

      if (type === 'click') {
        osc.type = 'sine';
        osc.frequency.setValueAtTime(600, ctx.currentTime);
        gain.gain.setValueAtTime(0.05, ctx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.08);
        osc.start();
        osc.stop(ctx.currentTime + 0.08);
      } else if (type === 'pass') {
        const notes = [523.25, 659.25, 783.99, 1046.50];
        notes.forEach((freq, idx) => {
          const o = ctx.createOscillator();
          const g = ctx.createGain();
          o.type = 'triangle';
          o.frequency.setValueAtTime(freq, ctx.currentTime + idx * 0.1);
          g.gain.setValueAtTime(0.15, ctx.currentTime + idx * 0.1);
          g.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + idx * 0.1 + 0.4);
          o.connect(g);
          g.connect(ctx.destination);
          o.start(ctx.currentTime + idx * 0.1);
          o.stop(ctx.currentTime + idx * 0.1 + 0.45);
        });
      } else if (type === 'fail') {
        osc.type = 'sawtooth';
        osc.frequency.setValueAtTime(220, ctx.currentTime);
        osc.frequency.linearRampToValueAtTime(160, ctx.currentTime + 0.3);
        gain.gain.setValueAtTime(0.1, ctx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.35);
        osc.start();
        osc.stop(ctx.currentTime + 0.35);
      }
    } catch (e) {}
  },

  toggleSoundEffects: function() {
    this.data.soundEnabled = !this.data.soundEnabled;
    const icon = document.getElementById('icon-sound');
    const btn = document.getElementById('btn-sound-toggle');
    if (this.data.soundEnabled) {
      btn.className = 'p-2 rounded-xl bg-slate-800 hover:bg-slate-700 border border-slate-700 text-cyan-400 transition-colors';
      if (icon) icon.setAttribute('data-lucide', 'volume-2');
      this.playSound('click');
    } else {
      btn.className = 'p-2 rounded-xl bg-slate-800 hover:bg-slate-700 border border-slate-700 text-slate-500 transition-colors';
      if (icon) icon.setAttribute('data-lucide', 'volume-x');
    }
    this.initIcons();
  },

  // -------------------------------------------------------------
  // INITIALIZATION
  // -------------------------------------------------------------
  init: async function() {
    this.loadUsersFromStorage();
    this.loadActiveUserSession();
    await this.loadExamsDataset();
    this.renderRoadmap();
    this.updateUserStatsDisplay();
    this.initIcons();
  },

  initIcons: function() {
    if (window.lucide) {
      lucide.createIcons();
    }
  },

  // -------------------------------------------------------------
  // SUBSCRIPTION & LICENSE CALCULATION
  // -------------------------------------------------------------
  getRemainingDays: function(expiresAt) {
    if (!expiresAt) return 0;
    const now = new Date();
    const expiry = new Date(expiresAt);
    const diffTime = expiry - now;
    return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  },

  isAccountActive: function(user) {
    if (!user) return false;
    const remaining = this.getRemainingDays(user.expiresAt);
    return remaining > 0 && user.status === 'ACTIVE';
  },

  // -------------------------------------------------------------
  // USER STORAGE & MANAGEMENT
  // -------------------------------------------------------------
  loadUsersFromStorage: function() {
    try {
      const saved = localStorage.getItem('eduquest_b1_all_users');
      if (saved) {
        this.data.users = JSON.parse(saved);
      } else {
        this.data.users = [];
      }
    } catch (e) {
      this.data.users = [];
    }
  },

  loadActiveUserSession: function() {
    try {
      const savedUser = localStorage.getItem('eduquest_b1_logged_user');
      if (savedUser) {
        const parsed = JSON.parse(savedUser);
        const liveUser = this.data.users.find(u => u.key === parsed.key || u.id === parsed.id);
        this.data.currentUser = liveUser || parsed;
        this.loadUserProgressFromStorage();
      } else {
        this.data.currentUser = null;
      }
    } catch (e) {
      this.data.currentUser = null;
    }
  },

  loadUserProgressFromStorage: function() {
    if (!this.data.currentUser) {
      this.data.userProgress = { unlockedUpTo: 1, passedSets: {}, streak: 0, exp: 0, attempts: [] };
      return;
    }
    try {
      const userKey = this.data.currentUser.key || this.data.currentUser.id;
      const storageKey = `eduquest_b1_progress_${userKey}`;
      const saved = localStorage.getItem(storageKey);
      if (saved) {
        this.data.userProgress = JSON.parse(saved);
      } else {
        this.data.userProgress = {
          unlockedUpTo: 1,
          passedSets: {},
          streak: 1,
          exp: 0,
          attempts: []
        };
      }
    } catch (e) {
      console.warn('Could not read user progress', e);
    }
  },

  saveUserProgressToStorage: function() {
    if (!this.data.currentUser) return;
    try {
      const userKey = this.data.currentUser.key || this.data.currentUser.id;
      const storageKey = `eduquest_b1_progress_${userKey}`;
      localStorage.setItem(storageKey, JSON.stringify(this.data.userProgress));
    } catch (e) {
      console.error('Could not save progress', e);
    }
  },

  loadExamsDataset: async function() {
    const candidateUrls = [
      '/data/exams_50_dataset.json',
      'data/exams_50_dataset.json',
      '/api/exams',
      '../data/exams_50_dataset.json'
    ];

    for (const url of candidateUrls) {
      try {
        const response = await fetch(url);
        if (response.ok) {
          const json = await response.json();
          if (json && json.exams && json.exams.length > 0) {
            this.data.exams = json.exams;
            return;
          }
        }
      } catch (e) {}
    }
  },

  updateUserStatsDisplay: function() {
    const user = this.data.currentUser;
    const heroBadge = document.getElementById('hero-user-badge');
    const subBadge = document.getElementById('badge-subscription-status');
    const subText = document.getElementById('stat-subscription-days');
    const authSec = document.getElementById('user-auth-section');
    const statusBadge = document.getElementById('roadmap-status-badge');

    if (user) {
      const remainingDays = this.getRemainingDays(user.expiresAt);
      const isActive = this.isAccountActive(user);

      if (heroBadge) {
        heroBadge.innerHTML = `<i data-lucide="user-check" class="w-3 h-3 text-indigo-400"></i> Học viên: <strong class="text-white">${user.name}</strong>`;
      }

      if (isActive) {
        if (subBadge) {
          subBadge.classList.remove('hidden');
          subBadge.className = 'hidden md:flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl bg-indigo-950/80 border border-indigo-700 text-cyan-300 text-xs font-bold shadow-sm';
        }
        if (subText) subText.innerText = `${user.package} (Còn ${remainingDays} ngày)`;
        if (statusBadge) {
          statusBadge.className = 'inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-emerald-950 text-emerald-300 border border-emerald-800 text-xs font-bold';
          statusBadge.innerHTML = '<i data-lucide="unlock" class="w-3.5 h-3.5"></i> Đề 01 Sẵn Sàng';
        }
      } else {
        if (subBadge) {
          subBadge.classList.remove('hidden');
          subBadge.className = 'hidden md:flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl bg-rose-950 border border-rose-700 text-rose-300 text-xs font-bold animate-pulse';
        }
        if (subText) subText.innerText = '⚠️ Key Đã Hết Hạn';
        if (statusBadge) {
          statusBadge.className = 'inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-rose-950 text-rose-300 border border-rose-800 text-xs font-bold';
          statusBadge.innerHTML = '<i data-lucide="alert-circle" class="w-3.5 h-3.5"></i> Key Đã Hết Hạn';
        }
      }

      if (authSec) {
        authSec.innerHTML = `
          <div class="flex items-center gap-1.5">
            <div class="flex items-center gap-1.5 p-1 pl-2 pr-2.5 rounded-xl bg-slate-800 border border-slate-700">
              <div class="w-6 h-6 rounded-lg bg-indigo-500 flex items-center justify-center font-bold text-xs text-white shrink-0">
                ${user.name.charAt(0).toUpperCase()}
              </div>
              <span class="text-xs font-bold text-slate-100 hidden sm:inline-block truncate max-w-[100px]">${user.name}</span>
            </div>
            <button onclick="app.logout()" class="p-2 rounded-xl bg-slate-800 hover:bg-rose-950 text-slate-400 hover:text-rose-300 border border-slate-700 hover:border-rose-800 transition-colors shrink-0" title="Đăng Xuất / Đổi Key">
              <i data-lucide="log-out" class="w-4 h-4"></i>
            </button>
          </div>
        `;
      }

      const total = this.data.exams.length || 50;
      const passedCount = Object.keys(this.data.userProgress.passedSets).length;
      const percent = Math.min(100, Math.round((passedCount / total) * 100));

      const progText = document.getElementById('roadmap-progress-text');
      const progBar = document.getElementById('roadmap-progress-bar');
      if (progText) progText.innerText = `${passedCount} / ${total} Đề (${percent}%)`;
      if (progBar) progBar.style.width = `${percent}%`;

    } else {
      if (heroBadge) {
        heroBadge.innerHTML = `<i data-lucide="key" class="w-3 h-3 text-slate-400"></i> Nhập Key để bắt đầu`;
      }
      if (subBadge) subBadge.classList.add('hidden');
      if (statusBadge) {
        statusBadge.className = 'inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-950 text-slate-400 border border-slate-800 text-xs font-bold';
        statusBadge.innerHTML = '<i data-lucide="lock" class="w-3.5 h-3.5"></i> Nhập Key';
      }
      if (authSec) {
        authSec.innerHTML = `
          <button onclick="app.openLoginModal()" class="px-3 sm:px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 active:bg-indigo-700 text-white font-bold text-xs shadow-lg shadow-indigo-600/30 flex items-center gap-1.5 transition-all shrink-0">
            <i data-lucide="key" class="w-3.5 h-3.5"></i> Nhập Key
          </button>
        `;
      }

      const progText = document.getElementById('roadmap-progress-text');
      const progBar = document.getElementById('roadmap-progress-bar');
      if (progText) progText.innerText = `0 / 50 Đề (0%)`;
      if (progBar) progBar.style.width = `0%`;
    }

    this.initIcons();
  },

  // -------------------------------------------------------------
  // KEY ACTIVATION / LOGOUT
  // -------------------------------------------------------------
  openLoginModal: function() {
    this.playSound('click');
    const modal = document.getElementById('modal-login');
    const errBox = document.getElementById('login-error-msg');
    if (errBox) errBox.classList.add('hidden');
    if (modal) {
      modal.classList.remove('hidden');
      modal.classList.add('flex');
    }
    this.initIcons();
  },

  closeLoginModal: function() {
    const modal = document.getElementById('modal-login');
    if (modal) {
      modal.classList.add('hidden');
      modal.classList.remove('flex');
    }
  },

  handleLogin: function(event) {
    if (event) event.preventDefault();
    const keyInp = document.getElementById('login-license-key');
    const errBox = document.getElementById('login-error-msg');

    if (!keyInp) return;

    const enteredKey = keyInp.value.trim().toUpperCase();

    if (!enteredKey) {
      if (errBox) {
        errBox.innerText = 'Vui lòng nhập mã Key kích hoạt!';
        errBox.classList.remove('hidden');
      }
      return;
    }

    this.loadUsersFromStorage();

    // Match against license key
    const user = this.data.users.find(u => {
      const uKey = (u.key || u.id || '').trim().toUpperCase();
      return uKey === enteredKey;
    });

    if (user) {
      if (errBox) errBox.classList.add('hidden');
      this.data.currentUser = user;
      localStorage.setItem('eduquest_b1_logged_user', JSON.stringify(user));
      this.loadUserProgressFromStorage();

      this.closeLoginModal();
      this.renderRoadmap();
      this.updateUserStatsDisplay();
      this.playSound('pass');
      alert(`🎉 Kích hoạt thành công! Chào mừng học viên ${user.name} vào luyện thi.`);
    } else {
      this.playSound('fail');
      if (errBox) {
        errBox.innerHTML = `
          <div>❌ <strong>Mã Key "${enteredKey}" không tồn tại hoặc chưa được cấp!</strong></div>
          <div class="text-[11px] text-slate-300 mt-1">
            • Bạn có thể bấm vào <strong>"Cổng Quản Trị Cấp Key"</strong> bên dưới để tạo mã Key mới.
          </div>
        `;
        errBox.classList.remove('hidden');
      } else {
        alert('❌ Mã Key không chính xác!');
      }
    }
  },

  logout: function() {
    if (confirm('Bạn có chắc chắn muốn thoát khỏi tài khoản này?')) {
      this.stopAllAudios();
      this.saveUserProgressToStorage();
      this.data.currentUser = null;
      localStorage.removeItem('eduquest_b1_logged_user');
      this.loadUserProgressFromStorage();
      this.renderRoadmap();
      this.updateUserStatsDisplay();
      this.playSound('click');
    }
  },

  // -------------------------------------------------------------
  // TAB NAVIGATION
  // -------------------------------------------------------------
  showTab: function(tabName) {
    this.stopAllAudios();
    this.playSound('click');
    const views = ['roadmap', 'exam', 'result', 'history'];
    views.forEach(v => {
      const el = document.getElementById(`view-${v}`);
      if (el) el.classList.add('hidden');
      const navBtn = document.getElementById(`nav-${v}`);
      if (navBtn) navBtn.classList.remove('active-tab');
    });

    const activeView = document.getElementById(`view-${tabName}`);
    if (activeView) activeView.classList.remove('hidden');

    const activeNav = document.getElementById(`nav-${tabName}`);
    if (activeNav) activeNav.classList.add('active-tab');

    if (tabName === 'history') {
      this.renderHistory();
    }
    this.initIcons();
  },

  // -------------------------------------------------------------
  // ROADMAP & EXAM CARDS
  // -------------------------------------------------------------
  filterLevel: function(level) {
    this.playSound('click');
    this.data.currentLevelFilter = level;
    document.querySelectorAll('.level-pill').forEach(btn => btn.classList.remove('active-level'));
    const btn = document.getElementById(`btn-filter-${level}`);
    if (btn) btn.classList.add('active-level');
    this.renderRoadmap();
  },

  renderRoadmap: function() {
    const container = document.getElementById('exams-grid');
    if (!container) return;

    container.innerHTML = '';
    const filtered = this.data.exams.filter(ex => {
      if (this.data.currentLevelFilter === 'all') return true;
      return ex.level_number === parseInt(this.data.currentLevelFilter);
    });

    const isLoggedIn = !!this.data.currentUser;

    filtered.forEach(ex => {
      const isUnlocked = isLoggedIn && (ex.set_number <= this.data.userProgress.unlockedUpTo);
      const passInfo = this.data.userProgress.passedSets[ex.exam_id];
      const isPassed = passInfo && passInfo.score >= 50;

      let levelBadge = 'bg-emerald-950 text-emerald-300 border-emerald-700/60';
      if (ex.level_number === 2) levelBadge = 'bg-amber-950 text-amber-300 border-amber-700/60';
      if (ex.level_number === 3) levelBadge = 'bg-rose-950 text-rose-300 border-rose-700/60';

      const card = document.createElement('div');
      card.className = `glass-card rounded-3xl p-4 sm:p-6 flex flex-col justify-between ${
        isUnlocked ? 'border-slate-800' : 'locked'
      }`;

      card.innerHTML = `
        <div class="space-y-3">
          <div class="flex items-center justify-between">
            <span class="px-2.5 py-0.5 rounded-full text-[11px] font-bold border ${levelBadge}">
              ${ex.level}
            </span>
            <div class="flex items-center gap-1 text-xs font-bold">
              ${
                isPassed 
                  ? `<span class="text-emerald-400 flex items-center gap-1 px-2 py-0.5 rounded-full bg-emerald-950 border border-emerald-800 text-[11px]"><i data-lucide="check-circle-2" class="w-3 h-3"></i> ${passInfo.score}%</span>`
                  : isUnlocked 
                    ? `<span class="text-cyan-400 flex items-center gap-1 px-2 py-0.5 rounded-full bg-cyan-950 border border-cyan-800 text-[11px]"><i data-lucide="unlock" class="w-3 h-3"></i> Mở</span>` 
                    : `<span class="text-slate-500 flex items-center gap-1 px-2 py-0.5 rounded-full bg-slate-900 border border-slate-800 text-[11px]"><i data-lucide="lock" class="w-3 h-3"></i> Khóa</span>`
              }
            </div>
          </div>

          <div>
            <h3 class="text-sm sm:text-base font-bold text-white">${ex.title}</h3>
            <p class="text-xs text-slate-300 mt-1 font-normal">3 Phần (Nghe • Đọc • Viết) • Đảo câu hỏi • Ngưỡng: ≥ ${ex.passing_threshold_percent}%</p>
          </div>
        </div>

        <div class="mt-4 pt-3 border-t border-slate-800 flex items-center justify-between">
          <span class="text-xs text-slate-400 font-mono font-bold">${ex.exam_id}</span>
          ${
            isLoggedIn
              ? isUnlocked
                ? `<button onclick="app.startExam('${ex.exam_id}')" class="px-3.5 py-1.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs shadow-md flex items-center gap-1 transition-all">
                    ${isPassed ? 'Làm Lại' : 'Bắt Đầu'} <i data-lucide="play" class="w-3 h-3"></i>
                  </button>`
                : `<button disabled class="px-3 py-1.5 rounded-xl bg-slate-900 text-slate-500 font-semibold text-xs cursor-not-allowed flex items-center gap-1 border border-slate-800">
                    <i data-lucide="lock" class="w-3 h-3"></i> Khóa
                  </button>`
              : `<button onclick="app.openLoginModal()" class="px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-cyan-300 font-bold text-xs flex items-center gap-1 border border-slate-700">
                  <i data-lucide="key" class="w-3 h-3"></i> Nhập Key
                </button>`
          }
        </div>
      `;

      container.appendChild(card);
    });

    this.initIcons();
  },

  // -------------------------------------------------------------
  // EXAM ROOM: RANDOMIZED QUESTIONS ON EVERY ENTRY
  // -------------------------------------------------------------
  startExam: function(examId) {
    this.stopAllAudios();
    this.playSound('click');

    if (!this.data.currentUser) {
      alert('Vui lòng nhập mã Key bản quyền để bắt đầu làm bài!');
      this.openLoginModal();
      return;
    }

    if (!this.isAccountActive(this.data.currentUser)) {
      alert('⚠️ KEY ĐÃ HẾT HẠN SỬ DỤNG!\n\nMã Key của bạn đã hết hạn. Vui lòng liên hệ Admin qua Cửa Hàng (binhluu.ai.studio) để gia hạn.');
      return;
    }

    const rawExam = this.data.exams.find(e => e.exam_id === examId);
    if (!rawExam) return;

    this.data.currentExam = this.randomizeExamData(rawExam);
    this.data.userAnswers = {};

    document.getElementById('exam-room-title').innerText = this.data.currentExam.title;

    this.showTab('exam');
    this.renderContinuousExamSheet();
    this.startExamTimer();
    window.scrollTo({ top: 0, behavior: 'smooth' });
  },

  exitExamRoom: function() {
    if (confirm('Bạn có chắc chắn muốn thoát phòng thi? Toàn bộ bài làm chưa nộp sẽ không được lưu.')) {
      this.stopAllAudios();
      this.stopExamTimer();
      this.showTab('roadmap');
    }
  },

  startExamTimer: function() {
    this.stopExamTimer();
    this.data.examTimer.secondsRemaining = 90 * 60;
    const timerDisplay = document.getElementById('exam-countdown');

    this.data.examTimer.interval = setInterval(() => {
      this.data.examTimer.secondsRemaining--;
      const mins = Math.floor(this.data.examTimer.secondsRemaining / 60);
      const secs = this.data.examTimer.secondsRemaining % 60;
      if (timerDisplay) {
        timerDisplay.innerText = `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
      }
      if (this.data.examTimer.secondsRemaining <= 0) {
        clearInterval(this.data.examTimer.interval);
        alert('Hết thời gian làm bài! Hệ thống tự động nộp bài của bạn.');
        this.submitCurrentExam();
      }
    }, 1000);
  },

  stopExamTimer: function() {
    if (this.data.examTimer.interval) {
      clearInterval(this.data.examTimer.interval);
      this.data.examTimer.interval = null;
    }
  },

  renderContinuousExamSheet: function() {
    const container = document.getElementById('exam-continuous-sheet');
    if (!container || !this.data.currentExam) return;

    container.innerHTML = '';
    const exam = this.data.currentExam;

    let questionGlobalIndex = 1;

    // ==========================================
    // SECTION 1: LISTENING (KỸ NĂNG NGHE - 35 ĐIỂM)
    // ==========================================
    const sec1 = document.createElement('div');
    sec1.id = 'sec-listening';
    sec1.className = 'space-y-4 sm:space-y-6 pt-2';
    sec1.innerHTML = `
      <div class="flex items-center gap-2.5 sm:gap-3 p-3.5 sm:p-4 rounded-2xl bg-indigo-950/70 border border-indigo-700/80">
        <div class="w-9 h-9 sm:w-10 sm:h-10 rounded-xl bg-indigo-600 flex items-center justify-center text-white shadow-md shrink-0">
          <i data-lucide="headphones" class="w-4 h-4 sm:w-5 sm:h-5"></i>
        </div>
        <div>
          <h3 class="font-bold text-sm sm:text-lg text-white">PHẦN 1: KỸ NĂNG NGHE (LISTENING - 35 ĐIỂM)</h3>
          <p class="text-[11px] sm:text-xs text-slate-300 font-medium">Bấm phát âm thanh, có thể tua hoặc bấm nghe lại tùy ý</p>
        </div>
      </div>
    `;

    exam.skills.listening.parts.forEach((part, pIdx) => {
      const partCard = document.createElement('div');
      partCard.className = 'glass-panel rounded-3xl p-4 sm:p-7 space-y-4 sm:space-y-5';

      const audioUniqueId = `audio-part-${pIdx}`;
      const btnUniqueId = `btn-audio-part-${pIdx}`;
      const timeUniqueId = `time-audio-part-${pIdx}`;
      const waveUniqueId = `wave-audio-part-${pIdx}`;
      const fillUniqueId = `fill-audio-part-${pIdx}`;

      partCard.innerHTML = `
        <div class="flex flex-col gap-2.5 pb-3 border-b border-slate-800">
          <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5">
            <div>
              <h4 class="font-bold text-sm sm:text-lg text-white">${part.title}</h4>
              <p class="text-xs text-slate-300 font-medium">Nghe đoạn băng và chọn đáp án chính xác</p>
            </div>

            <!-- Sleek Custom Audio Controller -->
            <div class="flex flex-wrap items-center gap-2">
              <audio id="${audioUniqueId}" preload="metadata" class="hidden">
                <source src="/${part.audio_file}" type="audio/mpeg">
              </audio>

              <button onclick="app.skipAudio('${audioUniqueId}', -10)" class="p-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-slate-300 hover:text-white border border-slate-800 text-xs font-bold flex items-center gap-0.5" title="Lùi 10 giây">
                <i data-lucide="rotate-ccw" class="w-3.5 h-3.5"></i> -10s
              </button>

              <button id="${btnUniqueId}" onclick="app.toggleCustomAudio('${audioUniqueId}', '${btnUniqueId}', '${timeUniqueId}', '${waveUniqueId}', '${fillUniqueId}')" class="custom-audio-pill px-3.5 py-2 rounded-2xl text-xs font-bold text-white shadow-lg flex items-center gap-1.5 cursor-pointer">
                <i data-lucide="play" class="w-3.5 h-3.5 text-cyan-300 audio-icon"></i>
                <span class="audio-btn-text">Phát</span>
              </button>

              <button onclick="app.skipAudio('${audioUniqueId}', 10)" class="p-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-slate-300 hover:text-white border border-slate-800 text-xs font-bold flex items-center gap-0.5" title="Tua 10 giây">
                +10s <i data-lucide="rotate-cw" class="w-3.5 h-3.5"></i>
              </button>

              <div class="flex items-center gap-1.5 px-2.5 py-1.5 rounded-2xl bg-slate-950 border border-slate-800">
                <div id="${waveUniqueId}" class="sound-wave flex items-center gap-0.5">
                  <div class="sound-wave-bar"></div>
                  <div class="sound-wave-bar"></div>
                  <div class="sound-wave-bar"></div>
                  <div class="sound-wave-bar"></div>
                  <div class="sound-wave-bar"></div>
                </div>
                <span id="${timeUniqueId}" class="text-[10px] sm:text-[11px] font-mono text-cyan-300 font-bold">00:00</span>
              </div>
            </div>
          </div>

          <!-- Clickable Seek Progress Track -->
          <div class="audio-progress-track" onclick="app.seekAudio('${audioUniqueId}', event)" title="Bấm vào thanh để tua nhanh">
            <div id="${fillUniqueId}" class="audio-progress-fill"></div>
          </div>
        </div>

        <div class="space-y-4 sm:space-y-5">
          ${part.questions.map(q => {
            const currentNum = questionGlobalIndex++;
            return `
              <div class="space-y-2.5 bg-slate-950 p-3.5 sm:p-5 rounded-2xl border border-slate-800">
                <div class="font-semibold text-xs sm:text-base text-white flex items-start gap-2 leading-snug">
                  <span class="px-2 py-0.5 rounded-lg bg-indigo-900 text-cyan-300 text-[11px] font-bold shrink-0 mt-0.5">Câu ${currentNum}</span>
                  <span>${q.question}</span>
                </div>
                <div class="grid grid-cols-1 gap-2 pt-1">
                  ${q.options.map(opt => {
                    const optKey = opt.charAt(0);
                    const isChecked = this.data.userAnswers[q.id] === optKey;
                    return `
                      <label class="option-label">
                        <input type="radio" name="ans-${q.id}" value="${optKey}" ${isChecked ? 'checked' : ''} onchange="app.recordAnswer('${q.id}', '${optKey}')" class="w-4 h-4 text-indigo-500 bg-slate-950 border-slate-700 shrink-0">
                        <span class="text-xs sm:text-sm font-normal text-slate-100">${opt}</span>
                      </label>
                    `;
                  }).join('')}
                </div>
              </div>
            `;
          }).join('')}
        </div>
      `;
      sec1.appendChild(partCard);
    });
    container.appendChild(sec1);

    // ==========================================
    // SECTION 2: READING (KỸ NĂNG ĐỌC - 35 ĐIỂM)
    // ==========================================
    const sec2 = document.createElement('div');
    sec2.id = 'sec-reading';
    sec2.className = 'space-y-4 sm:space-y-6 pt-3 sm:pt-4';
    sec2.innerHTML = `
      <div class="flex items-center gap-2.5 sm:gap-3 p-3.5 sm:p-4 rounded-2xl bg-cyan-950/70 border border-cyan-700/80">
        <div class="w-9 h-9 sm:w-10 sm:h-10 rounded-xl bg-cyan-600 flex items-center justify-center text-slate-950 shadow-md shrink-0">
          <i data-lucide="book-open" class="w-4 h-4 sm:w-5 sm:h-5"></i>
        </div>
        <div>
          <h3 class="font-bold text-sm sm:text-lg text-white">PHẦN 2: KỸ NĂNG ĐỌC (READING - 35 ĐIỂM)</h3>
          <p class="text-[11px] sm:text-xs text-slate-300 font-medium">Đọc các thông báo, đoạn văn và chọn đáp án chính xác</p>
        </div>
      </div>
    `;

    exam.skills.reading.parts.forEach(part => {
      const partCard = document.createElement('div');
      partCard.className = 'glass-panel rounded-3xl p-4 sm:p-7 space-y-4 sm:space-y-5';

      partCard.innerHTML = `
        <div class="pb-2.5 border-b border-slate-800">
          <h4 class="font-bold text-sm sm:text-lg text-white">${part.title}</h4>
        </div>

        <div class="space-y-4 sm:space-y-5">
          ${part.questions.map(q => {
            const currentNum = questionGlobalIndex++;
            return `
              <div class="space-y-2.5 bg-slate-950 p-3.5 sm:p-5 rounded-2xl border border-slate-800">
                ${q.context ? `<div class="p-3 rounded-2xl bg-indigo-950/60 border border-indigo-700/80 text-xs font-mono text-cyan-200 mb-2.5">${q.context}</div>` : ''}
                ${q.passage ? `<div class="p-3.5 rounded-2xl bg-slate-900 border border-slate-700 text-xs sm:text-sm text-slate-100 leading-relaxed font-normal mb-2.5">${q.passage}</div>` : ''}
                <div class="font-semibold text-xs sm:text-base text-white flex items-start gap-2 leading-snug">
                  <span class="px-2 py-0.5 rounded-lg bg-cyan-950 text-cyan-300 text-[11px] font-bold shrink-0 mt-0.5">Câu ${currentNum}</span>
                  <span>${q.question}</span>
                </div>
                <div class="grid grid-cols-1 gap-2 pt-1">
                  ${q.options.map(opt => {
                    const optKey = opt.charAt(0);
                    const isChecked = this.data.userAnswers[q.id] === optKey;
                    return `
                      <label class="option-label">
                        <input type="radio" name="ans-${q.id}" value="${optKey}" ${isChecked ? 'checked' : ''} onchange="app.recordAnswer('${q.id}', '${optKey}')" class="w-4 h-4 text-cyan-500 bg-slate-950 border-slate-700 shrink-0">
                        <span class="text-xs sm:text-sm font-normal text-slate-100">${opt}</span>
                      </label>
                    `;
                  }).join('')}
                </div>
              </div>
            `;
          }).join('')}
        </div>
      `;
      sec2.appendChild(partCard);
    });
    container.appendChild(sec2);

    // ==========================================
    // SECTION 3: WRITING (KỸ NĂNG VIẾT - 30 ĐIỂM)
    // ==========================================
    const sec3 = document.createElement('div');
    sec3.id = 'sec-writing';
    sec3.className = 'space-y-4 sm:space-y-6 pt-3 sm:pt-4 pb-6';
    sec3.innerHTML = `
      <div class="flex items-center gap-2.5 sm:gap-3 p-3.5 sm:p-4 rounded-2xl bg-amber-950/70 border border-amber-700/80">
        <div class="w-9 h-9 sm:w-10 sm:h-10 rounded-xl bg-amber-600 flex items-center justify-center text-slate-950 shadow-md shrink-0">
          <i data-lucide="pen-tool" class="w-4 h-4 sm:w-5 sm:h-5"></i>
        </div>
        <div>
          <h3 class="font-bold text-sm sm:text-lg text-white">PHẦN 3: KỸ NĂNG VIẾT (WRITING - 30 ĐIỂM)</h3>
          <p class="text-[11px] sm:text-xs text-slate-300 font-medium">Viết lại câu tương đương và trả lời đề tài viết luận ngắn</p>
        </div>
      </div>
    `;

    const wPart1 = exam.skills.writing.parts[0];
    const wCard1 = document.createElement('div');
    wCard1.className = 'glass-panel rounded-3xl p-4 sm:p-7 space-y-4 sm:space-y-5';
    wCard1.innerHTML = `
      <div class="pb-2.5 border-b border-slate-800">
        <h4 class="font-bold text-sm sm:text-lg text-white">${wPart1.title}</h4>
        <p class="text-xs text-slate-300 font-normal mt-0.5">Hoàn thành câu thứ hai sao cho nghĩa tương đương, dùng từ in hoa cho sẵn (1-3 từ).</p>
      </div>

      <div class="space-y-3.5">
        ${wPart1.questions.map(q => {
          const currentNum = questionGlobalIndex++;
          return `
            <div class="space-y-2 bg-slate-950 p-3.5 sm:p-5 rounded-2xl border border-slate-800">
              <div class="text-xs text-slate-300">
                <span class="px-2 py-0.5 rounded bg-amber-950 text-amber-300 font-bold text-xs mr-1">Câu ${currentNum}</span>
                Câu gốc: <strong class="text-white">"${q.original}"</strong> (Từ cho sẵn: <strong class="text-amber-400 font-mono">${q.target_word}</strong>)
              </div>
              <div class="text-xs sm:text-base font-semibold text-slate-100 mt-1">${q.prompt}</div>
              <input type="text" placeholder="Nhập từ còn thiếu..." value="${this.data.userAnswers[q.id] || ''}" oninput="app.recordAnswer('${q.id}', this.value)" class="w-full mt-2 px-4 py-3 rounded-xl bg-slate-900 border-2 border-slate-700 text-white focus:outline-none focus:border-amber-400 font-medium transition-colors">
            </div>
          `;
        }).join('')}
      </div>
    `;
    sec3.appendChild(wCard1);

    const wPart2 = exam.skills.writing.parts[1];
    const wCard2 = document.createElement('div');
    wCard2.className = 'glass-panel rounded-3xl p-4 sm:p-7 space-y-4';
    wCard2.innerHTML = `
      <div class="pb-2.5 border-b border-slate-800">
        <h4 class="font-bold text-sm sm:text-lg text-white">${wPart2.title}</h4>
      </div>
      <div class="p-3.5 sm:p-5 rounded-2xl bg-slate-950 border border-slate-800 space-y-2.5">
        <p class="text-xs sm:text-sm text-slate-200 leading-relaxed font-normal">${wPart2.task.prompt}</p>
        <textarea rows="4" placeholder="Viết câu trả lời vào đây (35-45 từ)..." class="w-full px-4 py-3 rounded-xl bg-slate-900 border-2 border-slate-700 text-white focus:outline-none focus:border-indigo-400 font-normal"></textarea>
      </div>

      <div class="pt-3 border-t border-slate-800 flex justify-end">
        <button onclick="app.submitCurrentExam()" class="w-full sm:w-auto px-6 py-3 rounded-2xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-bold text-xs sm:text-sm shadow-xl flex items-center justify-center gap-2">
          <i data-lucide="send" class="w-4 h-4"></i> Hoàn Thành & Nộp Toàn Bộ Đề Thi
        </button>
      </div>
    `;
    sec3.appendChild(wCard2);
    container.appendChild(sec3);

    this.initIcons();
  },

  recordAnswer: function(qId, val) {
    this.playSound('click');
    this.data.userAnswers[qId] = val;
  },

  // -------------------------------------------------------------
  // SUBMISSION & STRICT 50% PASSING THRESHOLD
  // -------------------------------------------------------------
  submitCurrentExam: function() {
    this.stopAllAudios();
    this.stopExamTimer();
    const exam = this.data.currentExam;
    if (!exam) return;

    let listeningCorrect = 0, listeningTotal = 0;
    let readingCorrect = 0, readingTotal = 0;
    let writingCorrect = 0, writingTotal = 0;

    exam.skills.listening.parts.forEach(p => {
      p.questions.forEach(q => {
        listeningTotal++;
        if (this.data.userAnswers[q.id] === q.correct_answer) listeningCorrect++;
      });
    });

    exam.skills.reading.parts.forEach(p => {
      p.questions.forEach(q => {
        readingTotal++;
        if (this.data.userAnswers[q.id] === q.correct_answer) readingCorrect++;
      });
    });

    exam.skills.writing.parts[0].questions.forEach(q => {
      writingTotal++;
      const userAns = (this.data.userAnswers[q.id] || '').trim().toLowerCase();
      const targetAns = q.correct_answer.toLowerCase();
      if (userAns === targetAns || userAns.includes(targetAns)) writingCorrect++;
    });

    const lisScore = listeningTotal ? (listeningCorrect / listeningTotal) * 35 : 25;
    const reaScore = readingTotal ? (readingCorrect / readingTotal) * 35 : 25;
    const wriScore = writingTotal ? (writingCorrect / writingTotal) * 30 : 25;

    const totalScore = Math.round(lisScore + reaScore + wriScore);
    const isPassed = totalScore >= exam.passing_threshold_percent;

    if (isPassed) {
      this.playSound('pass');
      if (exam.set_number >= this.data.userProgress.unlockedUpTo) {
        this.data.userProgress.unlockedUpTo = exam.set_number + 1;
      }
      this.data.userProgress.exp += 100;
      this.data.userProgress.passedSets[exam.exam_id] = {
        score: totalScore,
        passed: true,
        timestamp: new Date().toISOString()
      };

      if (window.confetti) {
        confetti({ particleCount: 120, spread: 80, origin: { y: 0.6 } });
      }
    } else {
      this.playSound('fail');
    }

    this.data.userProgress.attempts.unshift({
      exam_id: exam.exam_id,
      title: exam.title,
      score: totalScore,
      passed: isPassed,
      date: new Date().toLocaleDateString('vi-VN')
    });

    this.saveUserProgressToStorage();
    this.updateUserStatsDisplay();
    this.showResultModal(totalScore, isPassed, lisScore, reaScore, wriScore);
  },

  showResultModal: function(score, isPassed, lis, rea, wri) {
    this.showTab('result');
    window.scrollTo({ top: 0, behavior: 'smooth' });

    const card = document.getElementById('result-scorecard-card');
    const icon = document.getElementById('result-status-icon');
    const title = document.getElementById('result-status-title');
    const sub = document.getElementById('result-status-sub');
    const nextBtn = document.getElementById('btn-next-exam');

    if (isPassed) {
      card.className = 'rounded-3xl p-5 sm:p-8 border border-emerald-500/50 bg-gradient-to-b from-emerald-950/50 via-slate-900 to-slate-950 shadow-2xl relative overflow-hidden text-center space-y-4 sm:space-y-5';
      icon.className = 'w-14 h-14 sm:w-16 sm:h-16 mx-auto rounded-full bg-emerald-500/20 text-emerald-400 flex items-center justify-center text-3xl shadow-xl border border-emerald-500/30';
      icon.innerHTML = '🎉';
      title.innerText = 'CHÚC MỪNG BẠN ĐÃ VƯỢT ẢI THÀNH CÔNG!';
      title.className = 'font-extrabold text-xl sm:text-3xl text-emerald-300';
      sub.innerHTML = `Bạn đã xuất sắc đạt <strong>${score}%</strong> (vượt ngưỡng yêu cầu 50%). Bộ đề tiếp theo đã được mở khóa!`;
      nextBtn.classList.remove('hidden');
    } else {
      card.className = 'rounded-3xl p-5 sm:p-8 border border-rose-500/50 bg-gradient-to-b from-rose-950/50 via-slate-900 to-slate-950 shadow-2xl relative overflow-hidden text-center space-y-4 sm:space-y-5';
      icon.className = 'w-14 h-14 sm:w-16 sm:h-16 mx-auto rounded-full bg-rose-500/20 text-rose-400 flex items-center justify-center text-3xl shadow-xl border border-rose-500/30';
      icon.innerHTML = '⚠️';
      title.innerText = 'CHƯA ĐẠT NGƯỠNG VƯỢT ẢI (50%)';
      title.className = 'font-extrabold text-xl sm:text-3xl text-rose-300';
      sub.innerHTML = `Bạn đạt <strong>${score}%</strong> điểm. Cần tối thiểu <strong>50%</strong> để mở khóa bộ đề tiếp theo. Vui lòng xem lại phân tích lỗi sai bên dưới và làm lại nhé!`;
      nextBtn.classList.add('hidden');
    }

    document.getElementById('res-total-score').innerText = `${score} / 100`;
    document.getElementById('res-percentage').innerText = `${score}% (${isPassed ? 'ĐẠT' : 'CHƯA ĐẠT'})`;
    document.getElementById('res-listening-score').innerText = `${Math.round(lis)} / 35`;
    document.getElementById('res-reading-score').innerText = `${Math.round(rea)} / 35`;
    document.getElementById('res-writing-score').innerText = `${Math.round(wri)} / 30`;

    this.renderReviewDetails();
  },

  // -------------------------------------------------------------
  // REVIEW DETAILS
  // -------------------------------------------------------------
  renderReviewDetails: function() {
    const container = document.getElementById('review-questions-list');
    if (!container || !this.data.currentExam) return;

    container.innerHTML = '';
    const exam = this.data.currentExam;

    // Listening Review
    exam.skills.listening.parts.forEach(p => {
      p.questions.forEach(q => {
        const userAns = this.data.userAnswers[q.id];
        const isCorrect = userAns === q.correct_answer;

        const el = document.createElement('div');
        el.className = `p-4 sm:p-6 rounded-3xl border-2 ${isCorrect ? 'bg-emerald-950/40 border-emerald-700/80' : 'bg-rose-950/40 border-rose-700/80'} space-y-3 shadow-lg`;

        el.innerHTML = `
          <div class="flex items-center justify-between">
            <span class="text-[11px] sm:text-sm font-bold px-2.5 py-1 rounded-full ${isCorrect ? 'bg-emerald-900 text-emerald-200 border border-emerald-600' : 'bg-rose-900 text-rose-200 border border-rose-600'}">
              ${isCorrect ? '✓ TRẢ LỜI ĐÚNG' : '✗ TRẢ LỜI SAI'}
            </span>
            <span class="text-xs text-slate-300 font-bold">${p.title}</span>
          </div>

          <div class="font-semibold text-xs sm:text-base text-white leading-snug">${q.question}</div>

          <div class="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
            <div class="p-2.5 rounded-2xl bg-slate-900 border border-slate-700">
              <span class="text-slate-300 font-medium">Bạn đã chọn:</span> <strong class="${isCorrect ? 'text-emerald-400' : 'text-rose-400'} font-bold ml-1">${userAns || 'Chưa chọn'}</strong>
            </div>
            <div class="p-2.5 rounded-2xl bg-slate-900 border border-slate-700">
              <span class="text-slate-300 font-medium">Đáp án đúng:</span> <strong class="text-emerald-400 font-bold ml-1">${q.correct_answer}</strong>
            </div>
          </div>

          <div class="p-3.5 rounded-2xl bg-slate-950 border border-slate-800 text-xs text-slate-100 space-y-1 leading-relaxed font-normal">
            <div class="text-cyan-300 font-bold flex items-center gap-1.5">💡 Giải thích chi tiết:</div>
            <div>${q.explanation}</div>
            ${q.tapescript ? `<div class="mt-2 text-slate-300 italic p-2 rounded-xl bg-slate-900/80 border border-slate-800">🎧 Tapescript: "${q.tapescript}"</div>` : ''}
          </div>
        `;
        container.appendChild(el);
      });
    });

    // Reading Review
    exam.skills.reading.parts.forEach(p => {
      p.questions.forEach(q => {
        const userAns = this.data.userAnswers[q.id];
        const isCorrect = userAns === q.correct_answer;

        const el = document.createElement('div');
        el.className = `p-4 sm:p-6 rounded-3xl border-2 ${isCorrect ? 'bg-emerald-950/40 border-emerald-700/80' : 'bg-rose-950/40 border-rose-700/80'} space-y-3 shadow-lg`;

        el.innerHTML = `
          <div class="flex items-center justify-between">
            <span class="text-[11px] sm:text-sm font-bold px-2.5 py-1 rounded-full ${isCorrect ? 'bg-emerald-900 text-emerald-200 border border-emerald-600' : 'bg-rose-900 text-rose-200 border border-rose-600'}">
              ${isCorrect ? '✓ TRẢ LỜI ĐÚNG' : '✗ TRẢ LỜI SAI'}
            </span>
            <span class="text-xs text-slate-300 font-bold">${p.title}</span>
          </div>

          <div class="font-semibold text-xs sm:text-base text-white leading-snug">${q.question}</div>

          <div class="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
            <div class="p-2.5 rounded-2xl bg-slate-900 border border-slate-700">
              <span class="text-slate-300 font-medium">Bạn đã chọn:</span> <strong class="${isCorrect ? 'text-emerald-400' : 'text-rose-400'} font-bold ml-1">${userAns || 'Chưa chọn'}</strong>
            </div>
            <div class="p-2.5 rounded-2xl bg-slate-900 border border-slate-700">
              <span class="text-slate-300 font-medium">Đáp án đúng:</span> <strong class="text-emerald-400 font-bold ml-1">${q.correct_answer}</strong>
            </div>
          </div>

          <div class="p-3.5 rounded-2xl bg-slate-950 border border-slate-800 text-xs text-slate-100 space-y-1 leading-relaxed font-normal">
            <div class="text-cyan-300 font-bold flex items-center gap-1.5">💡 Giải thích ngữ pháp:</div>
            <div>${q.explanation}</div>
          </div>
        `;
        container.appendChild(el);
      });
    });

    this.initIcons();
  },

  retakeCurrentExam: function() {
    if (this.data.currentExam) {
      this.startExam(this.data.currentExam.exam_id);
    }
  },

  showNextExamOrRoadmap: function() {
    this.showTab('roadmap');
  },

  // -------------------------------------------------------------
  // HISTORY
  // -------------------------------------------------------------
  renderHistory: function() {
    const list = document.getElementById('history-list');
    if (!list) return;

    list.innerHTML = '';
    const attempts = this.data.userProgress.attempts || [];

    if (!this.data.currentUser) {
      list.innerHTML = `
        <div class="text-center py-10 bg-slate-900/40 rounded-3xl border border-slate-800 text-slate-300 text-xs sm:text-sm font-medium">
          Vui lòng nhập mã Key để xem lịch sử làm bài thi.
        </div>
      `;
      return;
    }

    if (attempts.length === 0) {
      list.innerHTML = `
        <div class="text-center py-10 bg-slate-900/40 rounded-3xl border border-slate-800 text-slate-300 text-xs sm:text-sm font-medium">
          Chưa có lịch sử thi nào. Hãy bắt đầu vượt ải từ Đề số 01!
        </div>
      `;
      return;
    }

    attempts.forEach(att => {
      const el = document.createElement('div');
      el.className = 'p-4 rounded-2xl bg-slate-900 border border-slate-800 flex items-center justify-between shadow-md';
      el.innerHTML = `
        <div>
          <div class="font-bold text-xs sm:text-sm text-white">${att.title}</div>
          <div class="text-[11px] text-slate-400 mt-0.5">Ngày thi: ${att.date} • ${att.exam_id}</div>
        </div>
        <div class="flex items-center gap-2">
          <span class="text-xs sm:text-sm font-bold ${att.passed ? 'text-emerald-400' : 'text-rose-400'}">${att.score} Điểm (${att.passed ? 'ĐẠT' : 'CHƯA ĐẠT'})</span>
        </div>
      `;
      list.appendChild(el);
    });
  }
};

// Start application upon DOM load
document.addEventListener('DOMContentLoaded', () => {
  app.init();
});
