/**
 * TIẾNG ANH LÀ GÌ TÔI KO QUEN / BÌNH LƯU - Core Web Application Logic
 * Multi-Layer Bulletproof Key Activation + Full Flat Randomization + Centered Modal Dialogs
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
    },

    dialogCallback: null
  },

  // -------------------------------------------------------------
  // SLEEK CENTERED CUSTOM DIALOG SYSTEM
  // -------------------------------------------------------------
  showCustomConfirm: function(options) {
    this.playSound('click');
    const modal = document.getElementById('modal-custom-dialog');
    const iconWrapper = document.getElementById('custom-dialog-icon-wrapper');
    const iconSpan = document.getElementById('custom-dialog-icon');
    const titleEl = document.getElementById('custom-dialog-title');
    const msgEl = document.getElementById('custom-dialog-msg');
    const cancelBtn = document.getElementById('custom-dialog-cancel-btn');
    const confirmBtn = document.getElementById('custom-dialog-confirm-btn');
    const btnContainer = document.getElementById('custom-dialog-buttons');

    if (!modal) return;

    if (iconWrapper) iconWrapper.style.display = 'flex';
    iconSpan.innerText = options.icon || '⚠️';
    iconWrapper.className = `w-16 h-16 rounded-2xl mx-auto flex items-center justify-center text-3xl shadow-xl ${
      options.iconBg || 'bg-amber-950/80 border border-amber-600/60 text-amber-400'
    }`;
    titleEl.innerText = options.title || 'Xác Nhận';
    msgEl.innerHTML = options.message || '';

    btnContainer.className = 'grid grid-cols-2 gap-3 pt-2';
    cancelBtn.className = 'w-full py-3 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs sm:text-sm shadow-md transition-all';
    cancelBtn.innerText = options.cancelText || 'Ở Lại Làm Bài';
    cancelBtn.style.display = 'block';

    confirmBtn.className = 'w-full py-3 rounded-xl bg-slate-800 hover:bg-rose-950 text-slate-300 hover:text-rose-300 border border-slate-700 hover:border-rose-800 font-bold text-xs sm:text-sm transition-all';
    confirmBtn.innerText = options.confirmText || 'Thoát Ra';

    this.data.dialogCallback = (confirmed) => {
      if (confirmed && options.onConfirm) options.onConfirm();
      if (!confirmed && options.onCancel) options.onCancel();
    };

    modal.classList.remove('hidden');
    modal.classList.add('flex');
    this.initIcons();
  },

  showCustomAlert: function(options) {
    this.playSound('click');
    const modal = document.getElementById('modal-custom-dialog');
    const iconWrapper = document.getElementById('custom-dialog-icon-wrapper');
    const iconSpan = document.getElementById('custom-dialog-icon');
    const titleEl = document.getElementById('custom-dialog-title');
    const msgEl = document.getElementById('custom-dialog-msg');
    const cancelBtn = document.getElementById('custom-dialog-cancel-btn');
    const confirmBtn = document.getElementById('custom-dialog-confirm-btn');
    const btnContainer = document.getElementById('custom-dialog-buttons');

    if (!modal) return;

    if (options.hideIcon || options.icon === false) {
      if (iconWrapper) iconWrapper.style.display = 'none';
    } else {
      if (iconWrapper) {
        iconWrapper.style.display = 'flex';
        iconSpan.innerText = options.icon || '🎉';
        iconWrapper.className = `w-16 h-16 rounded-2xl mx-auto flex items-center justify-center text-3xl shadow-xl ${
          options.iconBg || 'bg-indigo-950/80 border border-indigo-600/60 text-indigo-400'
        }`;
      }
    }
    titleEl.innerText = options.title || 'Thông Báo';
    msgEl.innerHTML = options.message || '';

    btnContainer.className = 'flex justify-center pt-2';
    cancelBtn.style.display = 'none';

    confirmBtn.className = 'w-full max-w-xs py-3 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs sm:text-sm shadow-lg shadow-indigo-600/30 transition-all';
    confirmBtn.innerText = options.btnText || 'Đã Hiểu';

    this.data.dialogCallback = (confirmed) => {
      if (options.onConfirm) options.onConfirm();
    };

    modal.classList.remove('hidden');
    modal.classList.add('flex');
    this.initIcons();
  },

  closeCustomDialog: function(confirmed) {
    const modal = document.getElementById('modal-custom-dialog');
    if (modal) {
      modal.classList.add('hidden');
      modal.classList.remove('flex');
    }
    if (this.data.dialogCallback) {
      const cb = this.data.dialogCallback;
      this.data.dialogCallback = null;
      cb(confirmed);
    }
  },

  // -------------------------------------------------------------
  // SMART KEY NORMALIZATION (HANDLES IPHONE EN-DASH, EM-DASH, O/0)
  // -------------------------------------------------------------
  normalizeKey: function(str) {
    if (!str) return '';
    return str
      .toString()
      .toUpperCase()
      .replace(/[\s\-_–—−.\,\:\;]/g, '')
      .trim();
  },

  isKeyMatching: function(key1, key2) {
    const norm1 = this.normalizeKey(key1);
    const norm2 = this.normalizeKey(key2);
    if (!norm1 || !norm2) return false;
    if (norm1 === norm2) return true;
    const fuzzy1 = norm1.replace(/O/g, '0');
    const fuzzy2 = norm2.replace(/O/g, '0');
    return fuzzy1 === fuzzy2;
  },

  // -------------------------------------------------------------
  // COMPREHENSIVE FISHER-YATES SHUFFLE ALGORITHM
  // -------------------------------------------------------------
  shuffleArray: function(array) {
    if (!Array.isArray(array)) return [];
    const arr = [...array];
    for (let i = arr.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [arr[i], arr[j]] = [arr[j], arr[i]];
    }
    return arr;
  },

  // -------------------------------------------------------------
  // FULL FLAT SHUFFLE: XÁO TRỘN TOÀN BỘ CÂU HỎI TÙM LÙM
  // -------------------------------------------------------------
  randomizeExamData: function(rawExam) {
    if (!rawExam) return null;
    const exam = JSON.parse(JSON.stringify(rawExam));
    const letters = ['A', 'B', 'C', 'D', 'E'];
    const allQuestions = [];

    // 1. Listening Questions
    if (exam.skills?.listening?.parts) {
      exam.skills.listening.parts.forEach(part => {
        if (part.questions) {
          part.questions.forEach(q => {
            const item = { ...q, skillType: 'listening', partTitle: part.title, audioFile: part.audio_file };
            if (item.options && item.options.length > 1) {
              const originalCorrectKey = item.correct_answer;
              const originalCorrectOption = item.options.find(opt => opt.startsWith(originalCorrectKey + '.') || opt.startsWith(originalCorrectKey + ' '));
              const correctRawText = originalCorrectOption ? originalCorrectOption.replace(/^[A-Z][\.\:\s]\s*/, '').trim() : '';

              const rawOptions = item.options.map(opt => opt.replace(/^[A-Z][\.\:\s]\s*/, '').trim());
              const shuffledRaw = this.shuffleArray(rawOptions);

              item.options = shuffledRaw.map((txt, idx) => `${letters[idx]}. ${txt}`);
              const newCorrectIdx = shuffledRaw.findIndex(txt => txt === correctRawText);
              if (newCorrectIdx !== -1) {
                item.correct_answer = letters[newCorrectIdx];
              }
            }
            allQuestions.push(item);
          });
        }
      });
    }

    // 2. Reading Questions
    if (exam.skills?.reading?.parts) {
      exam.skills.reading.parts.forEach(part => {
        if (part.questions) {
          part.questions.forEach(q => {
            const item = { ...q, skillType: 'reading', partTitle: part.title };
            if (item.options && item.options.length > 1) {
              const originalCorrectKey = item.correct_answer;
              const originalCorrectOption = item.options.find(opt => opt.startsWith(originalCorrectKey + '.') || opt.startsWith(originalCorrectKey + ' '));
              const correctRawText = originalCorrectOption ? originalCorrectOption.replace(/^[A-Z][\.\:\s]\s*/, '').trim() : '';

              const rawOptions = item.options.map(opt => opt.replace(/^[A-Z][\.\:\s]\s*/, '').trim());
              const shuffledRaw = this.shuffleArray(rawOptions);

              item.options = shuffledRaw.map((txt, idx) => `${letters[idx]}. ${txt}`);
              const newCorrectIdx = shuffledRaw.findIndex(txt => txt === correctRawText);
              if (newCorrectIdx !== -1) {
                item.correct_answer = letters[newCorrectIdx];
              }
            }
            allQuestions.push(item);
          });
        }
      });
    }

    // 3. Writing Part 1 Questions
    if (exam.skills?.writing?.parts?.[0]?.questions) {
      exam.skills.writing.parts[0].questions.forEach(q => {
        allQuestions.push({
          ...q,
          skillType: 'writing_p1',
          partTitle: 'Part 1 - Sentence Transformation'
        });
      });
    }

    // 4. Writing Part 2 (Essay)
    if (exam.skills?.writing?.parts?.[1]?.task) {
      allQuestions.push({
        id: 'WRI-ESSAY-001',
        skillType: 'writing_p2',
        partTitle: 'Part 2 - Short Message & Essay',
        prompt: exam.skills.writing.parts[1].task.prompt
      });
    }

    // Total Shuffle
    exam.flatQuestions = this.shuffleArray(allQuestions);
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

  toggleCustomAudio: function(audioId, btnId, timeId, waveId, fillId, qStart, qDuration, qEnd) {
    const audio = document.getElementById(audioId);
    const btn = document.getElementById(btnId);
    const timeDisplay = document.getElementById(timeId);
    const wave = document.getElementById(waveId);
    const fill = document.getElementById(fillId);

    if (!audio) return;

    const startSec = typeof qStart === 'number' ? qStart : 0;
    const durSec = typeof qDuration === 'number' && qDuration > 0 ? qDuration : 45;
    const endSec = typeof qEnd === 'number' ? qEnd : (startSec + durSec);

    if (this.data.activeAudioElement && this.data.activeAudioElement !== audio) {
      this.stopAllAudios();
    }

    if (audio.paused) {
      if (audio.currentTime < startSec || audio.currentTime >= endSec - 0.5) {
        audio.currentTime = startSec;
      }

      audio.play().then(() => {
        this.data.activeAudioElement = audio;
        audio.dataset.qStart = startSec;
        audio.dataset.qDur = durSec;
        audio.dataset.qEnd = endSec;

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
          const s = parseFloat(audio.dataset.qStart) || 0;
          const d = parseFloat(audio.dataset.qDur) || 45;
          const e = parseFloat(audio.dataset.qEnd) || (s + d);

          if (audio.currentTime >= e) {
            audio.pause();
            audio.currentTime = s;
            if (btn) btn.classList.remove('is-playing');
            if (wave) wave.classList.remove('sound-wave-playing');
            if (fill) fill.style.width = '0%';
            const icon = btn?.querySelector('.audio-icon');
            const text = btn?.querySelector('.audio-btn-text');
            if (icon) icon.setAttribute('data-lucide', 'rotate-ccw');
            if (text) text.innerText = 'Phát Lại';
            if (timeDisplay) timeDisplay.innerText = `00:00 / ${this.formatTime(d)}`;
            this.data.activeAudioElement = null;
            this.initIcons();
            return;
          }

          const elapsedRel = Math.max(0, Math.min(d, audio.currentTime - s));
          if (timeDisplay) {
            timeDisplay.innerText = `${this.formatTime(elapsedRel)} / ${this.formatTime(d)}`;
          }
          if (fill && d > 0) {
            const pct = (elapsedRel / d) * 100;
            fill.style.width = `${pct}%`;
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

  seekAudio: function(audioId, event, qStart, qDuration) {
    const audio = document.getElementById(audioId);
    const track = event.currentTarget;
    if (!audio) return;

    const s = typeof qStart === 'number' ? qStart : (parseFloat(audio.dataset.qStart) || 0);
    const d = typeof qDuration === 'number' && qDuration > 0 ? qDuration : (parseFloat(audio.dataset.qDur) || 45);

    const rect = track.getBoundingClientRect();
    const clickX = event.clientX - rect.left;
    const width = rect.width;
    const pct = Math.max(0, Math.min(1, clickX / width));
    audio.currentTime = s + (pct * d);
  },

  skipAudio: function(audioId, seconds, qStart, qDuration, qEnd) {
    const audio = document.getElementById(audioId);
    if (!audio) return;

    const s = typeof qStart === 'number' ? qStart : (parseFloat(audio.dataset.qStart) || 0);
    const d = typeof qDuration === 'number' && qDuration > 0 ? qDuration : (parseFloat(audio.dataset.qDur) || 45);
    const e = typeof qEnd === 'number' ? qEnd : (s + d);

    audio.currentTime = Math.max(s, Math.min(e, audio.currentTime + seconds));
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

  APP_VERSION: 'v2.3.2',

  // -------------------------------------------------------------
  // INITIALIZATION
  // -------------------------------------------------------------
  init: async function() {
    this.initPWA();
    this.renderAnnouncementBanner();

    // Check version update & force clean re-login across all devices
    const currentSessionVer = localStorage.getItem('eduquest_b1_session_version');
    if (currentSessionVer !== this.APP_VERSION) {
      localStorage.removeItem('eduquest_b1_account');
      localStorage.removeItem('eduquest_b1_logged_user');
      localStorage.setItem('eduquest_b1_session_version', this.APP_VERSION);
      this.data.currentUser = null;
      this.data.userProgress = { unlockedUpTo: 1, passedSets: {}, streak: 0, exp: 0, attempts: [] };
      setTimeout(() => {
        this.showCustomAlert({
          title: 'HỆ THỐNG ĐÃ CẬP NHẬT v2.3.2',
          message: 'Hệ thống vừa nâng cấp phiên bản mới nhất với tính năng khôi phục tài khoản đa tầng, bộ đếm ngược thời gian thực và đồng bộ đám mây.<br><br>Vui lòng <strong>Đăng nhập lại</strong> để cập nhật phiên bản mới!',
          icon: '🚀',
          iconBg: 'bg-indigo-950/80 border border-indigo-600/60 text-indigo-400',
          btnText: 'Đăng Nhập Lại Ngay',
          onConfirm: () => this.openLoginModal()
        });
      }, 600);
    } else {
      this.loadUsersFromStorage();
      this.loadActiveUserSession();
      this.updateDailyStreak();
      await this.validateActiveSessionWithServer();
    }

    await this.syncKeysFromCloud();
    await this.loadExamsDataset();
    this.renderRoadmap();
    this.updateUserStatsDisplay();
    this.startSubscriptionCountdown();
    this.initIcons();

    // Re-validate when student tab becomes visible/active
    document.addEventListener('visibilitychange', () => {
      if (document.visibilityState === 'visible') {
        this.validateActiveSessionWithServer();
      }
    });
  },

  renderAnnouncementBanner: function() {
    const bannerEl = document.getElementById('dynamic-announcement-banner');
    const badgeEl = document.getElementById('banner-badge');
    const badgeTextEl = document.getElementById('banner-badge-text');
    const marqueeEl = document.getElementById('banner-marquee');
    const linkBtn = document.getElementById('banner-link-btn');
    const linkTextEl = document.getElementById('banner-link-text');

    if (!bannerEl) return;

    let config = {
      enabled: true,
      text: '🔥 Ưu đãi giảm 30% khi mua Key Bản Quyền tại binhluu.ai.studio • Chúc các bạn học viên vượt ải B1 thành công!',
      badge: 'THÔNG BÁO',
      link: 'https://binhluu.ai.studio/',
      btnText: 'Xem Ngay',
      bgColor: '#0f172a',
      borderColor: '#06b6d4',
      textColor: '#f8fafc',
      badgeColor: '#0891b2'
    };

    try {
      const saved = localStorage.getItem('eduquest_b1_banner_config');
      if (saved) {
        config = { ...config, ...JSON.parse(saved) };
      }
    } catch (e) {}

    if (!config.enabled) {
      bannerEl.style.display = 'none';
      return;
    }

    bannerEl.style.display = 'block';
    bannerEl.style.backgroundColor = config.bgColor || '#0f172a';
    bannerEl.style.borderColor = config.borderColor || '#06b6d4';
    bannerEl.style.color = config.textColor || '#f8fafc';

    if (badgeEl) {
      badgeEl.style.backgroundColor = config.badgeColor || '#0891b2';
      badgeEl.style.borderColor = config.borderColor || '#06b6d4';
      badgeEl.style.color = config.textColor || '#f8fafc';
    }
    if (badgeTextEl) badgeTextEl.innerText = config.badge || 'THÔNG BÁO';

    if (marqueeEl) {
      const repeatCount = 4;
      const textItem = `<span class="banner-text-item mx-6">${config.text}</span>`;
      marqueeEl.innerHTML = textItem.repeat(repeatCount);
      marqueeEl.style.color = config.textColor || '#f8fafc';
    }

    if (linkBtn) {
      if (config.link) {
        linkBtn.href = config.link;
        linkBtn.style.backgroundColor = config.badgeColor || '#0891b2';
        linkBtn.style.color = config.textColor || '#f8fafc';
        if (linkTextEl) linkTextEl.innerText = config.btnText || 'Xem Ngay';
      } else {
        linkBtn.style.display = 'none';
      }
    }

    this.initIcons();
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

  getDynamicPackageName: function(remainingDays) {
    if (remainingDays <= 0) return 'Gói Đã Hết Hạn';
    const months = Math.round(remainingDays / 30);
    if (months >= 12) return 'Gói 1 Năm';
    if (months <= 1) return 'Gói 1 Tháng';
    return `Gói ${months} Tháng`;
  },

  isAccountActive: function(user) {
    if (!user) return false;
    const remaining = this.getRemainingDays(user.expiresAt);
    return remaining > 0 && user.status === 'ACTIVE';
  },

  // -------------------------------------------------------------
  // DAILY LEARNING STREAK TRACKER
  // -------------------------------------------------------------
  updateDailyStreak: function() {
    if (!this.data.currentUser) return;
    const today = new Date();
    const todayStr = today.toISOString().slice(0, 10);

    const progress = this.data.userProgress;
    if (!progress.lastActiveDate) {
      progress.streak = 1;
      progress.lastActiveDate = todayStr;
    } else if (progress.lastActiveDate !== todayStr) {
      const lastDate = new Date(progress.lastActiveDate);
      const diffDays = Math.round((today - lastDate) / (1000 * 60 * 60 * 24));
      if (diffDays === 1) {
        progress.streak = (progress.streak || 1) + 1;
      } else if (diffDays > 1) {
        progress.streak = 1;
      }
      progress.lastActiveDate = todayStr;
    }

    // Sync streak into user object so admin can view
    this.data.currentUser.streak = progress.streak || 1;
    const userInList = this.data.users.find(u => this.isKeyMatching(u.key || u.id, this.data.currentUser.key || this.data.currentUser.id));
    if (userInList) {
      userInList.streak = progress.streak || 1;
      localStorage.setItem('eduquest_b1_all_users', JSON.stringify(this.data.users));
    }

    this.saveUserProgressToStorage();
  },

  initIcons: function() {
    if (window.lucide) {
      lucide.createIcons();
    }
  },

  deferredPWAEvent: null,

  initPWA: function() {
    // 1. Register Service Worker
    if ('serviceWorker' in navigator) {
      window.addEventListener('load', () => {
        navigator.serviceWorker.register('/sw.js').catch(err => console.log('SW register:', err));
      });
    }

    // 2. Android / Chrome Install Prompt
    window.addEventListener('beforeinstallprompt', (e) => {
      e.preventDefault();
      this.deferredPWAEvent = e;
      const floatBar = document.getElementById('pwa-floating-bar');
      if (floatBar && !localStorage.getItem('eduquest_b1_pwa_dismissed')) {
        floatBar.classList.remove('hidden');
        floatBar.classList.add('flex');
      }
    });

    window.addEventListener('appinstalled', () => {
      this.deferredPWAEvent = null;
      const floatBar = document.getElementById('pwa-floating-bar');
      const heroBtn = document.getElementById('btn-pwa-install-hero');
      if (floatBar) floatBar.classList.add('hidden');
      if (heroBtn) heroBtn.classList.add('hidden');
      this.showCustomAlert({
        title: '🎉 CÀI ĐẶT APP THÀNH CÔNG!',
        message: 'Ứng dụng <strong>Luyện Đề B1</strong> đã được thêm vào màn hình chính của bạn.<br>Từ giờ bạn có thể chạm icon trên màn hình để mở học ngay!',
        icon: '📱'
      });
    });

    // Check standalone mode
    const isStandalone = window.matchMedia('(display-mode: standalone)').matches || window.navigator.standalone;
    if (isStandalone) {
      const floatBar = document.getElementById('pwa-floating-bar');
      const heroBtn = document.getElementById('btn-pwa-install-hero');
      if (floatBar) floatBar.classList.add('hidden');
      if (heroBtn) heroBtn.classList.add('hidden');
    }
  },

  triggerPWAInstall: function() {
    this.playSound('click');
    if (this.deferredPWAEvent) {
      this.deferredPWAEvent.prompt();
      this.deferredPWAEvent.userChoice.then((choiceResult) => {
        if (choiceResult.outcome === 'accepted') {
          this.deferredPWAEvent = null;
        }
      });
    } else {
      // iOS Safari or other browsers -> Show visual step-by-step guide
      const modal = document.getElementById('modal-ios-install-guide');
      if (modal) {
        modal.classList.remove('hidden');
        modal.classList.add('flex');
      }
    }
  },

  closeIOSInstallGuide: function() {
    const modal = document.getElementById('modal-ios-install-guide');
    if (modal) {
      modal.classList.add('hidden');
      modal.classList.remove('flex');
    }
  },

  dismissPWABar: function() {
    const floatBar = document.getElementById('pwa-floating-bar');
    if (floatBar) {
      floatBar.classList.add('hidden');
      floatBar.classList.remove('flex');
    }
    localStorage.setItem('eduquest_b1_pwa_dismissed', 'true');
  },

  // -------------------------------------------------------------
  // USER STORAGE & REAL-TIME CLOUD SYNC
  // -------------------------------------------------------------
  loadUsersFromStorage: function() {
    try {
      const saved = localStorage.getItem('eduquest_b1_all_users');
      this.data.users = saved ? JSON.parse(saved) : [];
    } catch (e) {
      this.data.users = [];
    }
  },

  syncKeysFromCloud: async function() {
    let localUsers = [];
    try {
      const saved = localStorage.getItem('eduquest_b1_all_users');
      if (saved) localUsers = JSON.parse(saved);
    } catch (e) {
      localUsers = [];
    }

    let cloudData = null;
    const urls = ['/api/keys', '/data/users_cloud_db.json'];
    for (const url of urls) {
      try {
        const response = await fetch(url + '?t=' + Date.now());
        if (response.ok) {
          const data = await response.json();
          if (Array.isArray(data) && data.length > 0) {
            cloudData = data;
            break;
          }
        }
      } catch (e) {}
    }

    // Smart Bi-directional Merge: Combine cloud and local keys safely
    const keyMap = new Map();

    // 1. Add cloud users first
    if (Array.isArray(cloudData)) {
      cloudData.forEach(u => {
        const k = this.normalizeKey(u.key || u.id);
        if (k) keyMap.set(k, u);
      });
    }

    // 2. Add local users (LOCAL KEYS ARE NEVER WIPED BY OLD CLOUD DATA!)
    if (Array.isArray(localUsers)) {
      localUsers.forEach(u => {
        const k = this.normalizeKey(u.key || u.id);
        if (k) {
          if (keyMap.has(k)) {
            // Keep the most up-to-date name & progress
            const existing = keyMap.get(k);
            if (u.name && u.name !== 'Chưa Kích Hoạt' && (!existing.name || existing.name === 'Chưa Kích Hoạt')) {
              existing.name = u.name;
            }
          } else {
            keyMap.set(k, u);
          }
        }
      });
    }

    const merged = Array.from(keyMap.values());
    if (merged.length > 0) {
      this.data.users = merged;
      localStorage.setItem('eduquest_b1_all_users', JSON.stringify(merged));

      // If local had keys missing from cloud, push merged back to cloud
      if (cloudData && merged.length > cloudData.length) {
        try {
          fetch('/api/keys', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(merged)
          });
        } catch(e) {}
      }
    }

    // Verify logged in user
    if (this.data.currentUser) {
      const liveUser = this.data.users.find(u => this.isKeyMatching(u.key || u.id, this.data.currentUser.key || this.data.currentUser.id));
      if (!liveUser) {
        console.warn('Key was removed by Admin. Logging out.');
        this.data.currentUser = null;
        localStorage.removeItem('eduquest_b1_logged_user');
        this.renderRoadmap();
        this.updateUserStatsDisplay();
        return;
      }

      // Check if account has been locked by Admin!
      if (liveUser.status !== 'ACTIVE') {
        console.warn('Account has been locked by Admin. Logging out.');
        this.data.currentUser = null;
        localStorage.removeItem('eduquest_b1_logged_user');
        this.renderRoadmap();
        this.updateUserStatsDisplay();
        this.showCustomAlert({
          title: 'TÀI KHOẢN ĐÃ BỊ KHÓA',
          message: 'Mã Key của bạn đã bị tạm khóa bởi Quản trị viên. Vui lòng liên hệ Admin tại binhluu.ai.studio.',
          icon: '🔒',
          iconBg: 'bg-rose-950/80 border border-rose-600/60 text-rose-400',
          btnText: 'Đã Hiểu'
        });
        return;
      }

      // Check if Admin extended the duration!
      const oldExp = new Date(this.data.currentUser.expiresAt).getTime();
      const newExp = new Date(liveUser.expiresAt).getTime();
      if (newExp > oldExp) {
        const addedDays = Math.round((newExp - oldExp) / (1000 * 60 * 60 * 24));
        const remaining = this.getRemainingDays(liveUser.expiresAt);
        const dynamicPkg = this.getDynamicPackageName(remaining);
        this.data.currentUser = liveUser;
        localStorage.setItem('eduquest_b1_logged_user', JSON.stringify(liveUser));
        this.renderRoadmap();
        this.updateUserStatsDisplay();

        this.showCustomAlert({
          title: '🎉 TÀI KHOẢN ĐƯỢC GIA HẠN!',
          message: `Quản trị viên vừa cộng thêm <strong>+${addedDays} ngày học</strong> cho bạn!<br><br>• Thời hạn mới: <strong>${dynamicPkg} (Còn ${remaining} ngày)</strong>.<br>Chúc bạn ôn luyện và thi đạt kết quả tốt nhất!`,
          icon: '🎁',
          iconBg: 'bg-emerald-950/80 border border-emerald-600/60 text-emerald-400',
          btnText: 'Tuyệt Vời, Tiếp Tục Học'
        });
      } else {
        this.data.currentUser = liveUser;
        localStorage.setItem('eduquest_b1_logged_user', JSON.stringify(liveUser));
      }
    }
  },

  loadActiveUserSession: function() {
    try {
      const savedUser = localStorage.getItem('eduquest_b1_logged_user');
      if (savedUser) {
        const parsed = JSON.parse(savedUser);
        const remainingDays = this.getRemainingDays(parsed.expiresAt);
        if (remainingDays > 0 && parsed.status === 'ACTIVE') {
          const liveUser = this.data.users.find(u => this.isKeyMatching(u.key || u.id, parsed.key || parsed.id));
          this.data.currentUser = liveUser || parsed;
          this.loadUserProgressFromStorage();
        } else {
          this.data.currentUser = null;
          localStorage.removeItem('eduquest_b1_logged_user');
        }
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
      const userKey = this.normalizeKey(this.data.currentUser.key || this.data.currentUser.id);
      const storageKey = `eduquest_b1_progress_${userKey}`;
      const saved = localStorage.getItem(storageKey);
      this.data.userProgress = saved ? JSON.parse(saved) : { unlockedUpTo: 1, passedSets: {}, streak: 1, exp: 0, attempts: [] };
    } catch (e) {
      console.warn('Could not read user progress', e);
    }
  },

  saveUserProgressToStorage: function() {
    if (!this.data.currentUser) return;
    try {
      const userKey = this.normalizeKey(this.data.currentUser.key || this.data.currentUser.id);
      const storageKey = `eduquest_b1_progress_${userKey}`;
      localStorage.setItem(storageKey, JSON.stringify(this.data.userProgress));
    } catch (e) {
      console.error('Could not save progress', e);
    }
  },

  // -------------------------------------------------------------
  // STRICT KEY ACTIVATION (ONLY ACCEPTS KEYS CREATED BY ADMIN)
  // -------------------------------------------------------------
  handleLogin: async function(event) {
    if (event) event.preventDefault();
    const keyInp = document.getElementById('login-license-key');
    const errBox = document.getElementById('login-error-msg');
    const submitBtn = document.getElementById('btn-submit-login');
    if (!keyInp) return;

    const rawInput = (keyInp.value || '').trim();
    const enteredKeyNorm = this.normalizeKey(rawInput);
    if (!enteredKeyNorm) {
      if (errBox) {
        errBox.innerText = 'Vui lòng nhập mã Key kích hoạt!';
        errBox.classList.remove('hidden');
      }
      return;
    }

    if (submitBtn) {
      submitBtn.disabled = true;
      submitBtn.innerHTML = '<i data-lucide="loader-2" class="w-4 h-4 animate-spin"></i> Đang Xác Thực Key...';
      this.initIcons();
    }

    // 1. Sync live keys from Cloud / Server
    await this.syncKeysFromCloud();
    this.loadUsersFromStorage();

    // 2. Strict search: Match ONLY against keys created by Admin
    const user = this.data.users.find(u => this.isKeyMatching(u.key || u.id, rawInput));

    if (submitBtn) {
      submitBtn.disabled = false;
      submitBtn.innerHTML = '<i data-lucide="check-circle" class="w-4 h-4"></i> Kích Hoạt & Bắt Đầu Học';
      this.initIcons();
    }

    if (user) {
      if (user.status !== 'ACTIVE') {
        this.playSound('fail');
        if (errBox) {
          errBox.innerHTML = `<div>❌ <strong>Mã Key "${rawInput}" đã bị Khóa bởi Quản trị viên!</strong></div>`;
          errBox.classList.remove('hidden');
        }
        return;
      }

      const remainingDays = this.getRemainingDays(user.expiresAt);
      if (remainingDays <= 0) {
        this.playSound('fail');
        if (errBox) {
          errBox.innerHTML = `
            <div>⚠️ <strong>Mã Key "${rawInput}" đã Hết Hạn sử dụng!</strong></div>
            <div class="text-[11px] text-slate-300 mt-1">• Vui lòng liên hệ Admin tại binhluu.ai.studio để gia hạn.</div>
          `;
          errBox.classList.remove('hidden');
        }
        return;
      }

      if (errBox) errBox.classList.add('hidden');

      // Check if Key has no student name yet (First-time Self-Onboarding)
      const cleanName = (user.name || '').trim();
      if (!cleanName || cleanName === 'Chưa Kích Hoạt' || cleanName === 'Chưa Đặt Tên' || cleanName === 'Học Viên Mới') {
        this.data.pendingLoginUser = user;
        this.closeLoginModal();
        const nameModal = document.getElementById('modal-name-registration');
        const nameInp = document.getElementById('inp-register-student-name');
        if (nameInp) nameInp.value = '';
        if (nameModal) {
          nameModal.classList.remove('hidden');
          nameModal.classList.add('flex');
        }
        this.initIcons();
        return;
      }

      const dynamicPkg = this.getDynamicPackageName(remainingDays);
      user.package = dynamicPkg;
      this.data.currentUser = user;
      localStorage.setItem('eduquest_b1_logged_user', JSON.stringify(user));
      this.loadUserProgressFromStorage();
      this.updateDailyStreak();
      this.closeLoginModal();
      this.renderRoadmap();
      this.updateUserStatsDisplay();
      this.playSound('pass');

      this.showCustomAlert({
        title: 'KÍCH HOẠT THÀNH CÔNG!',
        message: `Chào mừng học viên <strong>${user.name}</strong> (${dynamicPkg} - Còn ${remainingDays} Ngày) đã vào hệ thống luyện thi B1!`,
        icon: '🎉',
        iconBg: 'bg-emerald-950/80 border border-emerald-600/60 text-emerald-400',
        btnText: 'Bắt Đầu Vượt Ải Ngay'
      });
    } else {
      this.playSound('fail');
      if (errBox) {
        errBox.innerHTML = `
          <div>❌ <strong>Mã Key "${rawInput}" không tồn tại hoặc chưa được cấp!</strong></div>
          <div class="text-[11px] text-slate-300 mt-1">
            • Vui lòng kiểm tra lại mã Key chính xác hoặc liên hệ Admin tại <strong>binhluu.ai.studio</strong>.
          </div>
        `;
        errBox.classList.remove('hidden');
      }
    }
  },

  handleNameRegistration: async function(event) {
    if (event) event.preventDefault();
    const nameInp = document.getElementById('inp-register-student-name');
    const submitBtn = document.getElementById('btn-submit-register-name');
    const user = this.data.pendingLoginUser;
    if (!user || !nameInp) return;

    const enteredName = nameInp.value.trim().toUpperCase();
    if (!enteredName) {
      alert('Vui lòng nhập Họ và Tên của bạn!');
      return;
    }

    if (submitBtn) {
      submitBtn.disabled = true;
      submitBtn.innerHTML = '<i data-lucide="loader-2" class="w-4 h-4 animate-spin"></i> Đang Lưu Hồ Sơ...';
      this.initIcons();
    }

    user.name = enteredName;
    user.status = 'ACTIVE';

    // Update in all users list
    const foundIdx = this.data.users.findIndex(u => this.isKeyMatching(u.key || u.id, user.key || user.id));
    if (foundIdx !== -1) {
      this.data.users[foundIdx].name = enteredName;
      this.data.users[foundIdx].status = 'ACTIVE';
    } else {
      this.data.users.unshift(user);
    }
    localStorage.setItem('eduquest_b1_all_users', JSON.stringify(this.data.users));

    // Post to /api/keys to sync to Admin in cloud
    try {
      await fetch('/api/keys', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(this.data.users)
      });
    } catch(e) {}

    const remainingDays = this.getRemainingDays(user.expiresAt);
    const dynamicPkg = this.getDynamicPackageName(remainingDays);
    user.package = dynamicPkg;
    this.data.currentUser = user;
    localStorage.setItem('eduquest_b1_logged_user', JSON.stringify(user));
    this.loadUserProgressFromStorage();
    this.updateDailyStreak();

    // Close registration modal
    const nameModal = document.getElementById('modal-name-registration');
    if (nameModal) {
      nameModal.classList.add('hidden');
      nameModal.classList.remove('flex');
    }

    if (submitBtn) {
      submitBtn.disabled = false;
      submitBtn.innerHTML = '<i data-lucide="check-circle" class="w-4 h-4"></i> Xác Nhận & Vào Học Ngay';
    }

    this.renderRoadmap();
    this.updateUserStatsDisplay();
    this.playSound('pass');

    this.showCustomAlert({
      title: 'KÍCH HOẠT THÀNH CÔNG!',
      message: `Chào mừng học viên <strong>${user.name}</strong> (${dynamicPkg} - Còn ${remainingDays} Ngày) đã vào hệ thống luyện thi B1!`,
      icon: '🎉',
      iconBg: 'bg-emerald-950/80 border border-emerald-600/60 text-emerald-400',
      btnText: 'Bắt Đầu Vượt Ải Ngay'
    });
  },

  loadActiveUserSession: function() {
    try {
      // Try new account system first
      const savedAccount = localStorage.getItem('eduquest_b1_account');
      if (savedAccount) {
        const account = JSON.parse(savedAccount);
        if (account && account.accountId) {
          this.data.currentUser = account;
          // Load progress from account object
          this.data.userProgress = account.progress
            ? { ...account.progress, streak: account.progress.streak || account.streak || 1 }
            : { unlockedUpTo: 1, passedSets: {}, streak: account.streak || 1, exp: 0, attempts: [] };
          return;
        }
      }
      // Fallback: old key-based session (legacy)
      const savedUser = localStorage.getItem('eduquest_b1_logged_user');
      if (savedUser) {
        const parsed = JSON.parse(savedUser);
        const liveUser = this.data.users.find(u => this.isKeyMatching(u.key || u.id, parsed.key || parsed.id));
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
      const userKey = this.normalizeKey(this.data.currentUser.key || this.data.currentUser.id);
      const storageKey = `eduquest_b1_progress_${userKey}`;
      const saved = localStorage.getItem(storageKey);
      this.data.userProgress = saved ? JSON.parse(saved) : { unlockedUpTo: 1, passedSets: {}, streak: 1, exp: 0, attempts: [] };
    } catch (e) {
      console.warn('Could not read user progress', e);
    }
  },

  saveUserProgressToStorage: function() {
    if (!this.data.currentUser) return;
    try {
      const userKey = this.normalizeKey(this.data.currentUser.key || this.data.currentUser.id);
      const storageKey = `eduquest_b1_progress_${userKey}`;
      localStorage.setItem(storageKey, JSON.stringify(this.data.userProgress));
    } catch (e) {
      console.error('Could not save progress', e);
    }
  },

  loadExamsDataset: async function() {
    const candidateUrls = ['/data/exams_50_dataset.json', 'data/exams_50_dataset.json', '/api/exams', '../data/exams_50_dataset.json'];
    for (const url of candidateUrls) {
      try {
        const response = await fetch(url + '?v=' + Date.now());
        if (response.ok) {
          const json = await response.json();
          if (json && json.exams && json.exams.length > 0) {
            this.data.exams = json.exams;
            return;
          } else if (Array.isArray(json) && json.length > 0) {
            this.data.exams = json;
            return;
          }
        }
      } catch (e) {}
    }
  },

  renderTikTokFlameHTML: function(level, customSize) {
    let size = customSize;
    if (!size) {
      if (level === 5) size = 32;
      else if (level === 4) size = 28;
      else if (level === 3) size = 25;
      else if (level === 2) size = 22;
      else size = 19;
    }
    const height = Math.round(size * 1.05);
    const showSparks = level >= 2;

    return `
      <span class="flame-plump-container flame-tier-lv${level}" style="width: ${size}px; height: ${height}px;">
        <svg viewBox="0 0 100 100" class="flame-plump-svg" style="width: 100%; height: 100%; overflow: visible;" xmlns="http://www.w3.org/2000/svg">
          <defs>
            <!-- Level 1: Warm Amber / Gold -->
            <linearGradient id="plump-out-1" x1="0" y1="1" x2="0" y2="0">
              <stop offset="0%" stop-color="#b45309"/>
              <stop offset="55%" stop-color="#f59e0b"/>
              <stop offset="100%" stop-color="#fef08a"/>
            </linearGradient>
            <linearGradient id="plump-in-1" x1="0" y1="1" x2="0" y2="0">
              <stop offset="0%" stop-color="#f59e0b"/>
              <stop offset="60%" stop-color="#fde047"/>
              <stop offset="100%" stop-color="#ffffff"/>
            </linearGradient>

            <!-- Level 2: Fiery Radiant Orange -->
            <linearGradient id="plump-out-2" x1="0" y1="1" x2="0" y2="0">
              <stop offset="0%" stop-color="#c2410c"/>
              <stop offset="50%" stop-color="#f97316"/>
              <stop offset="100%" stop-color="#fef08a"/>
            </linearGradient>
            <linearGradient id="plump-in-2" x1="0" y1="1" x2="0" y2="0">
              <stop offset="0%" stop-color="#ea580c"/>
              <stop offset="60%" stop-color="#fbbf24"/>
              <stop offset="100%" stop-color="#ffffff"/>
            </linearGradient>

            <!-- Level 3: Ruby Red Inferno (As in User Screenshot!) -->
            <linearGradient id="plump-out-3" x1="0" y1="1" x2="0" y2="0">
              <stop offset="0%" stop-color="#9f1239"/>
              <stop offset="45%" stop-color="#e11d48"/>
              <stop offset="75%" stop-color="#ff2a5f"/>
              <stop offset="100%" stop-color="#ffe4e6"/>
            </linearGradient>
            <linearGradient id="plump-in-3" x1="0" y1="1" x2="0" y2="0">
              <stop offset="0%" stop-color="#e11d48"/>
              <stop offset="60%" stop-color="#fb7185"/>
              <stop offset="100%" stop-color="#ffffff"/>
            </linearGradient>

            <!-- Level 4: Plasma Purple / Electric -->
            <linearGradient id="plump-out-4" x1="0" y1="1" x2="0" y2="0">
              <stop offset="0%" stop-color="#4c1d95"/>
              <stop offset="45%" stop-color="#7c3aed"/>
              <stop offset="80%" stop-color="#c084fc"/>
              <stop offset="100%" stop-color="#f5d0fe"/>
            </linearGradient>
            <linearGradient id="plump-in-4" x1="0" y1="1" x2="0" y2="0">
              <stop offset="0%" stop-color="#7c3aed"/>
              <stop offset="60%" stop-color="#d8b4fe"/>
              <stop offset="100%" stop-color="#ffffff"/>
            </linearGradient>

            <!-- Level 5: Sacred Solar Gold Crown -->
            <linearGradient id="plump-out-5" x1="0" y1="1" x2="0" y2="0">
              <stop offset="0%" stop-color="#854d0e"/>
              <stop offset="45%" stop-color="#eab308"/>
              <stop offset="80%" stop-color="#fde047"/>
              <stop offset="100%" stop-color="#ffffff"/>
            </linearGradient>
            <linearGradient id="plump-in-5" x1="0" y1="1" x2="0" y2="0">
              <stop offset="0%" stop-color="#ca8a04"/>
              <stop offset="60%" stop-color="#fef08a"/>
              <stop offset="100%" stop-color="#ffffff"/>
            </linearGradient>
          </defs>

          <!-- Plump, Chubby Outer Flame Body (Wide Belly!) -->
          <path fill="url(#plump-out-${level})" d="M50,4 C68,26 94,46 94,68 C94,86 76,96 50,96 C24,96 6,86 6,68 C6,46 32,26 50,4 Z" />

          <!-- Plump Secondary Inner 3D Cut -->
          <path fill="url(#plump-in-${level})" opacity="0.92" d="M50,18 C62,32 82,48 82,68 C82,84 68,90 50,90 C32,90 18,84 18,68 C18,48 38,32 50,18 Z" />

          <!-- Plump Superheated Core Glow -->
          <path class="flame-core-glow" fill="#ffffff" opacity="0.96" d="M50,48 C60,58 70,68 68,78 C66,86 58,87 50,87 C42,87 34,86 32,78 C30,68 40,58 50,48 Z" />
        </svg>

        ${showSparks ? `
          <span class="flame-spark-dot spark-dot-1"></span>
          <span class="flame-spark-dot spark-dot-2"></span>
        ` : ''}
      </span>
    `;
  },

  initAnimeFlameAnimation: function() {
    // Pure CSS High-Perf Spring Physics
  },

  showStreakCelebration: function() {
    const user = this.data.currentUser;
    if (!user) return;
    const streak = this.data.userProgress.streak || 1;
    const info = this.getStreakLevelInfo(streak);
    this.playSound('pass');

    this.showCustomAlert({
      hideIcon: true,
      title: `🔥 CHUỖI HỌC ${streak} NGÀY LIÊN TỤC!`,
      message: `
        <div class="text-center py-2 space-y-4">
          <div class="flex justify-center items-center py-3">
            <div class="scale-150 transform transition-transform">
              ${this.renderTikTokFlameHTML(info.level, 56)}
            </div>
          </div>
          <div class="font-black text-xl ${info.textClass}">Chuỗi: ${streak} Ngày (${info.title})</div>
          <p class="text-xs text-slate-300 max-w-sm mx-auto leading-relaxed">
            ${
              info.level >= 3
                ? '🔥🔥 Ngọn lửa đang bùng cháy cực đại! Hãy duy trì chuỗi học mỗi ngày để đạt mốc Tuần 5 mở khóa danh hiệu Huyền Thoại B1!'
                : 'Hãy đăng nhập và hoàn thành đề thi mỗi ngày để ngọn lửa tiến hóa lên cấp độ cao hơn sau mỗi tuần!'
            }
          </p>
        </div>
      `,
      btnText: 'Tiếp Tục Bùng Cháy 🔥'
    });
  },

  getStreakLevelInfo: function(streak) {
    const days = Math.max(1, parseInt(streak, 10) || 1);
    if (days >= 29) {
      return {
        level: 5,
        title: 'Huyền Thoại (Tuần 5+)',
        textClass: 'streak-text-lv5',
        heroClass: 'text-yellow-300 font-extrabold'
      };
    }
    if (days >= 22) {
      return {
        level: 4,
        title: 'Bậc Thầy (Tuần 4)',
        textClass: 'streak-text-lv4',
        heroClass: 'text-purple-400 font-extrabold'
      };
    }
    if (days >= 15) {
      return {
        level: 3,
        title: 'Siêu Cháy (Tuần 3)',
        textClass: 'streak-text-lv3',
        heroClass: 'text-rose-400 font-extrabold'
      };
    }
    if (days >= 8) {
      return {
        level: 2,
        title: 'Nhiệt Huyết (Tuần 2)',
        textClass: 'streak-text-lv2',
        heroClass: 'text-orange-400 font-bold'
      };
    }
    return {
      level: 1,
      title: 'Khởi Động (Tuần 1)',
      textClass: 'streak-text-lv1',
      heroClass: 'text-amber-300 font-bold'
    };
  },

  startSubscriptionCountdown: function() {
    if (this.data.subTimerInterval) {
      clearInterval(this.data.subTimerInterval);
      this.data.subTimerInterval = null;
    }

    const updateTimerUI = () => {
      const user = this.data.currentUser;
      const subBadge = document.getElementById('badge-subscription-status');
      const subText = document.getElementById('stat-subscription-days');
      const profileDays = document.getElementById('profile-days-left');

      if (!user) {
        if (subBadge) subBadge.classList.add('hidden');
        return;
      }

      const expStr = user.keyExpiresAt || user.expiresAt;
      const tier = this.getCurrentTier();

      if (tier !== 'premium' || !expStr) {
        if (subBadge) {
          subBadge.classList.remove('hidden');
          subBadge.className = 'hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-900 border border-slate-700 text-slate-400 text-xs font-bold cursor-pointer transition-all shrink-0';
        }
        if (subText) subText.innerText = '🆓 Gói Free';
        if (profileDays) profileDays.innerText = 'Tài khoản miễn phí (Làm thử Bài 1)';
        return;
      }

      const expTime = new Date(expStr).getTime();
      const now = Date.now();
      const diff = expTime - now;

      if (diff <= 0) {
        if (subBadge) {
          subBadge.classList.remove('hidden');
          subBadge.className = 'hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-rose-950 border border-rose-700 text-rose-300 text-xs font-bold animate-pulse cursor-pointer transition-all shrink-0';
        }
        if (subText) subText.innerText = '⚠️ Key Đã Hết Hạn';
        if (profileDays) {
          profileDays.className = 'font-bold text-rose-400 text-sm';
          profileDays.innerText = 'Đã hết hạn';
        }
        return;
      }

      const days = Math.floor(diff / (1000 * 60 * 60 * 24));
      const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
      const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
      const seconds = Math.floor((diff % (1000 * 60)) / 1000);

      const hh = hours.toString().padStart(2, '0');
      const mm = minutes.toString().padStart(2, '0');
      const ss = seconds.toString().padStart(2, '0');

      const countdownText = days > 0
        ? `⏳ Còn ${days} ngày ${hh}:${mm}:${ss}`
        : `⏳ Còn ${hh}:${mm}:${ss}`;

      if (subBadge) {
        subBadge.classList.remove('hidden');
        subBadge.className = 'hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-indigo-950/90 hover:bg-indigo-900 border border-indigo-700/80 text-cyan-300 text-xs font-bold cursor-pointer transition-all shrink-0 shadow-sm';
      }
      if (subText) {
        subText.innerHTML = `<span class="text-white font-mono font-bold tracking-tight">${countdownText}</span>`;
      }
      if (profileDays) {
        profileDays.className = 'font-bold text-emerald-400 text-sm font-mono';
        profileDays.innerText = `${days} ngày ${hh}h ${mm}m ${ss}s`;
      }
    };

    updateTimerUI();
    this.data.subTimerInterval = setInterval(updateTimerUI, 1000);
  },

  updateUserStatsDisplay: function() {
    const user = this.data.currentUser;
    const heroBadge = document.getElementById('hero-user-badge');
    const subBadge = document.getElementById('badge-subscription-status');
    const subText = document.getElementById('stat-subscription-days');
    const authSec = document.getElementById('user-auth-section');
    const statusBadge = document.getElementById('roadmap-status-badge');

    if (user) {
      const expDateStr = user.keyExpiresAt || user.expiresAt;
      const remainingDays = this.getRemainingDays(expDateStr);
      const dynamicPackageName = this.getDynamicPackageName(remainingDays);
      const tier = this.getCurrentTier(); // 'guest', 'free', 'premium'
      const isPremiumActive = tier === 'premium' && remainingDays > 0;
      const streak = this.data.userProgress.streak || 1;
      const streakInfo = this.getStreakLevelInfo(streak);
      const flameHTML = this.renderTikTokFlameHTML(streakInfo.level);

      if (heroBadge) {
        heroBadge.className = 'inline-flex items-center gap-1.5 px-3 py-1 rounded-xl bg-indigo-950/80 text-indigo-200 border border-indigo-700/80 text-[11px] sm:text-xs font-bold shrink-0';
        heroBadge.innerHTML = `<i data-lucide="user-check" class="w-3.5 h-3.5 text-indigo-400 shrink-0"></i> <strong class="text-white truncate max-w-[130px] sm:max-w-[200px]">${user.name}</strong> <span class="text-slate-500">•</span> <span class="${streakInfo.heroClass} whitespace-nowrap">🔥 ${streak} Ngày</span>`;
      }

      if (isPremiumActive) {
        if (subBadge) {
          subBadge.classList.remove('hidden');
          subBadge.className = 'hidden md:flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 border border-slate-700 text-slate-200 text-xs font-bold cursor-pointer transition-all';
          subBadge.setAttribute('onclick', 'app.openLinkKeyModal()');
          subBadge.setAttribute('title', 'Bấm để Gia Hạn hoặc Nhập Key Mới');
        }
        if (subText) subText.innerText = `⏳ ${dynamicPackageName} (Còn ${remainingDays} ngày)`;
        if (statusBadge) {
          statusBadge.className = 'inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-emerald-950 text-emerald-300 border border-emerald-800 text-xs font-bold';
          statusBadge.innerHTML = '<i data-lucide="unlock" class="w-3.5 h-3.5"></i> Đề 01 Sẵn Sàng';
        }
      } else {
        if (subBadge) {
          subBadge.classList.remove('hidden');
          subBadge.className = 'hidden md:flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl bg-rose-950 hover:bg-rose-900 border border-rose-700 text-rose-300 text-xs font-bold animate-pulse cursor-pointer transition-all';
          subBadge.setAttribute('onclick', 'app.openLinkKeyModal()');
          subBadge.setAttribute('title', 'Bấm để Nhập Key Mới kích hoạt');
        }
        if (subText) subText.innerText = '⚠️ Key Hết Hạn · [Nhập Key Mới]';
        if (statusBadge) {
          statusBadge.className = 'inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-amber-950 text-amber-300 border border-amber-800 text-xs font-bold cursor-pointer';
          statusBadge.setAttribute('onclick', 'app.openLinkKeyModal()');
          statusBadge.innerHTML = '<i data-lucide="key" class="w-3.5 h-3.5"></i> Nhập Key Mở Đề';
        }
      }

      if (authSec) {
        const tierBadge = isPremiumActive
          ? `<span class="hidden md:inline-flex items-center gap-1 px-2 py-0.5 rounded-lg bg-amber-950/80 border border-amber-700 text-amber-300 text-[10px] font-black">⭐ PREMIUM</span>`
          : `<span class="hidden md:inline-flex items-center gap-1 px-2 py-0.5 rounded-lg bg-slate-800 border border-slate-600 text-slate-300 text-[10px] font-black">🆓 FREE</span>`;
        authSec.innerHTML = `
          <div class="flex items-center gap-1 sm:gap-2 shrink-0">
            <!-- TIKTOK FRAMELESS TIER-SCALED STREAK FLAME BUTTON -->
            <button onclick="app.showStreakCelebration()" class="streak-frameless-btn shrink-0" title="Level ${streakInfo.level}: ${streakInfo.title} (${streak} Ngày)">
              ${flameHTML}
              <span class="${streakInfo.textClass} text-[11px] sm:text-xs font-black tracking-tight whitespace-nowrap">${streak} Ngày</span>
            </button>

            ${tierBadge}

            <!-- USER PROFILE BUTTON (CLICK TO VIEW DAYS & KEY MANAGEMENT) -->
            <button onclick="app.openUserProfileModal()" class="flex items-center gap-1.5 p-1 pl-1.5 pr-2 sm:pl-2 sm:pr-2.5 rounded-xl bg-slate-800/90 hover:bg-slate-700/90 border border-slate-700 hover:border-indigo-500/60 cursor-pointer shrink-0 transition-all shadow-sm" title="Xem Thời Hạn & Đổi Key">
              <div class="w-5 h-5 sm:w-6 sm:h-6 rounded-lg bg-indigo-500 flex items-center justify-center font-bold text-[10px] sm:text-xs text-white shrink-0 shadow">
                ${user.name.charAt(0).toUpperCase()}
              </div>
              <span class="text-xs font-bold text-slate-100 hidden md:inline-block truncate max-w-[100px]">${user.name}</span>
              <i data-lucide="chevron-down" class="w-3 h-3 text-slate-400 hidden md:inline-block"></i>
            </button>

            <button onclick="app.logout()" class="p-1.5 sm:p-2 rounded-xl bg-slate-800/80 hover:bg-rose-950 text-slate-400 hover:text-rose-300 border border-slate-700 hover:border-rose-800 transition-colors shrink-0" title="Đăng Xuất">
              <i data-lucide="log-out" class="w-3.5 h-3.5 sm:w-4 sm:h-4"></i>
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

      this.initAnimeFlameAnimation();
      this.startSubscriptionCountdown();
    } else {
      if (heroBadge) heroBadge.innerHTML = `<i data-lucide="key" class="w-3 h-3 text-slate-400"></i> Nhập Key để bắt đầu`;
      if (subBadge) subBadge.classList.add('hidden');
      if (statusBadge) {
        statusBadge.className = 'inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-950 text-slate-400 border border-slate-800 text-xs font-bold';
        statusBadge.innerHTML = '<i data-lucide="lock" class="w-3.5 h-3.5"></i> Nhập Key';
      }
      if (authSec) {
        authSec.innerHTML = `
          <button onclick="app.openLoginModal()" class="px-3 sm:px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 active:bg-indigo-700 text-white font-bold text-xs shadow-lg shadow-indigo-600/30 flex items-center gap-1.5 transition-all shrink-0">
            <i data-lucide="user-plus" class="w-3.5 h-3.5"></i> Đăng Ký / Nhập Key
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

  // -----------------------------------------------------------------------
  // USER PROFILE MODAL (NAME CLICK: VIEW DAYS & KEY MANAGEMENT)
  // -----------------------------------------------------------------------

  openUserProfileModal: function() {
    this.playSound('click');
    const user = this.data.currentUser;
    if (!user) {
      this.openLoginModal();
      return;
    }

    const modal = document.getElementById('modal-user-profile');
    if (!modal) return;

    const expDateStr = user.keyExpiresAt || user.expiresAt;
    const remainingDays = this.getRemainingDays(expDateStr);
    const dynamicPkg = this.getDynamicPackageName(remainingDays);
    const tier = this.getCurrentTier();
    const isPremium = tier === 'premium' && remainingDays > 0;

    const total = this.data.exams?.length || 50;
    const passedCount = Object.keys(this.data.userProgress?.passedSets || {}).length;
    const percent = Math.min(100, Math.round((passedCount / total) * 100));

    // Populate Modal Elements
    const avatar = document.getElementById('profile-avatar');
    const nameEl = document.getElementById('profile-name');
    const emailEl = document.getElementById('profile-email');
    const tierBadge = document.getElementById('profile-tier-badge');
    const daysEl = document.getElementById('profile-days-left');
    const keyEl = document.getElementById('profile-current-key');
    const progEl = document.getElementById('profile-progress');

    if (avatar) avatar.innerText = user.name ? user.name.charAt(0).toUpperCase() : 'U';
    if (nameEl) nameEl.innerText = user.name || 'Học Viên';
    if (emailEl) emailEl.innerText = user.email || 'Chưa liên kết email';

    if (tierBadge) {
      if (isPremium) {
        tierBadge.className = 'inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-950/80 border border-amber-600 text-amber-300 text-xs font-black';
        tierBadge.innerHTML = '⭐ GÓI PREMIUM';
      } else {
        tierBadge.className = 'inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-slate-800 border border-slate-600 text-slate-300 text-xs font-black';
        tierBadge.innerHTML = '🆓 GÓI FREE';
      }
    }

    if (daysEl) {
      if (isPremium) {
        daysEl.className = 'font-bold text-emerald-400 text-sm';
        daysEl.innerText = `Còn ${remainingDays} ngày (${dynamicPkg})`;
      } else {
        daysEl.className = 'font-bold text-slate-400 text-xs';
        daysEl.innerText = 'Tài khoản miễn phí';
      }
    }

    if (keyEl) {
      keyEl.innerText = user.linkedKey || user.key || '(Chưa nhập Key)';
    }

    if (progEl) {
      progEl.innerText = `${passedCount} / ${total} Đề (${percent}%)`;
    }

    modal.classList.remove('hidden');
    modal.classList.add('flex');
    this.initIcons();
  },

  closeUserProfileModal: function() {
    const modal = document.getElementById('modal-user-profile');
    if (modal) {
      modal.classList.add('hidden');
      modal.classList.remove('flex');
    }
  },

  // -----------------------------------------------------------------------
  // NEW ACCOUNT SYSTEM: Email-based registration + Key linking
  // -----------------------------------------------------------------------

  openLoginModal: function() {
    this.playSound('click');
    // Reset to step 1
    this.backToEmailStep();
    const errBox = document.getElementById('login-error-msg');
    if (errBox) { errBox.innerText = ''; errBox.classList.add('hidden'); }
    const modal = document.getElementById('modal-login');
    if (modal) { modal.classList.remove('hidden'); modal.classList.add('flex'); }
    this.initIcons();
  },

  closeLoginModal: function() {
    const modal = document.getElementById('modal-login');
    if (modal) { modal.classList.add('hidden'); modal.classList.remove('flex'); }
  },

  backToEmailStep: function() {
    document.getElementById('login-step-email')?.classList.remove('hidden');
    document.getElementById('login-step-name')?.classList.add('hidden');
    document.getElementById('login-step-key')?.classList.add('hidden');
  },

  showLegacyKeyLogin: function() {
    document.getElementById('login-step-email')?.classList.add('hidden');
    document.getElementById('login-step-name')?.classList.add('hidden');
    document.getElementById('login-step-key')?.classList.remove('hidden');
    const inp = document.getElementById('login-license-key');
    if (inp) inp.value = '';
    const errBox = document.getElementById('login-error-msg');
    if (errBox) { errBox.innerText = ''; errBox.classList.add('hidden'); }
  },

  handleEmailStep: async function() {
    const emailInp = document.getElementById('login-email-input');
    const errBox = document.getElementById('login-error-msg');
    const btn = document.getElementById('btn-email-step');
    const rawInput = (emailInp?.value || '').trim();

    if (!rawInput) {
      if (errBox) { errBox.innerText = 'Vui lòng nhập Email hoặc Mã Key!'; errBox.classList.remove('hidden'); }
      return;
    }
    if (errBox) errBox.classList.add('hidden');
    if (btn) { btn.disabled = true; btn.innerHTML = '<i data-lucide="loader-2" class="w-4 h-4 animate-spin"></i> Đang kiểm tra...'; this.initIcons(); }

    const isEmail = rawInput.includes('@');
    const cleanEmail = rawInput.toLowerCase();
    const cleanKeyNorm = rawInput.replace(/[- _]/g, '').toUpperCase();

    try {
      await this.syncKeysFromCloud();
      const accounts = await this.fetchAccountsFromCloud();
      
      // 1. Match by Email or Linked Key in accounts list
      let found = accounts.find(a => {
        if (isEmail && a.email && a.email.toLowerCase() === cleanEmail) return true;
        if (a.linkedKey && (a.linkedKey === rawInput || a.linkedKey.replace(/[- _]/g, '').toUpperCase() === cleanKeyNorm)) return true;
        return false;
      });

      // 2. Match by standalone Key in this.data.users list
      if (!found && Array.isArray(this.data.users)) {
        const matchedKey = this.data.users.find(u => {
          const uKeyNorm = (u.key || u.id || '').replace(/[- _]/g, '').toUpperCase();
          if (uKeyNorm && uKeyNorm === cleanKeyNorm) return true;
          if (isEmail && u.linkedEmail && u.linkedEmail.toLowerCase() === cleanEmail) return true;
          return false;
        });

        if (matchedKey && matchedKey.name && matchedKey.name !== 'Chưa Kích Hoạt') {
          found = {
            accountId: matchedKey.linkedAccountId || ('ACC-' + (matchedKey.key || matchedKey.id)),
            email: matchedKey.linkedEmail || (isEmail ? cleanEmail : (matchedKey.name.toLowerCase().replace(/\s+/g, '') + '@gmail.com')),
            name: matchedKey.name,
            tier: 'premium',
            linkedKey: matchedKey.key,
            keyExpiresAt: matchedKey.expiresAt,
            createdAt: matchedKey.createdAt || new Date().toISOString(),
            lastActiveDate: new Date().toISOString(),
            streak: matchedKey.streak || 1,
            progress: { passedSets: {}, unlockedUpTo: 1 },
            status: matchedKey.status || 'ACTIVE'
          };
          await this.pushAccountToCloud(found);
        }
      }

      if (found) {
        // Restore account with full name and progress
        this.loginWithAccount(found);
        this.closeLoginModal();
        this.playSound('pass');
        const isPrem = this.getCurrentTier() === 'premium';
        this.showCustomAlert({
          title: 'CHÀO MỪNG TRỞ LẠI!',
          message: `Học viên <strong>${found.name}</strong> đã đăng nhập thành công!<br><br>${isPrem ? '⭐ Tài khoản <strong>Premium</strong> đang hoạt động.' : '🆓 Tài khoản Free – Bài 1 sẵn sàng!'}`,
          icon: '👋',
          iconBg: 'bg-emerald-950/80 border border-emerald-600/60 text-emerald-400',
          btnText: 'Vào Học Ngay'
        });
      } else {
        if (!isEmail) {
          if (errBox) { errBox.innerText = `Không tìm thấy mã Key "${rawInput}". Vui lòng kiểm tra lại hoặc nhập đúng Email!`; errBox.classList.remove('hidden'); }
          return;
        }
        // New email → show name registration step
        this.data.pendingEmail = cleanEmail;
        document.getElementById('login-step-email')?.classList.add('hidden');
        document.getElementById('login-step-name')?.classList.remove('hidden');
        const nameInp = document.getElementById('login-name-input');
        if (nameInp) nameInp.value = '';
        this.initIcons();
      }
    } catch (e) {
      if (errBox) { errBox.innerText = 'Không thể kết nối server. Vui lòng thử lại!'; errBox.classList.remove('hidden'); }
    } finally {
      if (btn) { btn.disabled = false; btn.innerHTML = '<i data-lucide="arrow-right" class="w-4 h-4"></i> Tiếp Tục'; this.initIcons(); }
    }
  },

  handleRegister: async function() {
    const nameInp = document.getElementById('login-name-input');
    const errBox = document.getElementById('login-error-msg');
    const btn = document.getElementById('btn-register');
    const name = (nameInp?.value || '').trim().toUpperCase();

    if (!name || name.length < 2) {
      if (errBox) { errBox.innerText = 'Vui lòng nhập Họ và Tên (ít nhất 2 ký tự)!'; errBox.classList.remove('hidden'); }
      return;
    }
    const email = this.data.pendingEmail;
    if (!email) { this.backToEmailStep(); return; }

    if (btn) { btn.disabled = true; btn.innerHTML = '<i data-lucide="loader-2" class="w-4 h-4 animate-spin"></i> Đang tạo tài khoản...'; this.initIcons(); }

    const accountId = 'ACC-' + Date.now() + '-' + Math.random().toString(36).substr(2, 5).toUpperCase();
    const account = {
      accountId, email, name,
      tier: 'free',
      linkedKey: null,
      keyExpiresAt: null,
      freeExamSubmitted: false,
      createdAt: new Date().toISOString(),
      streak: 1,
      lastActiveDate: new Date().toISOString().split('T')[0],
      progress: { unlockedUpTo: 1, passedSets: {}, streak: 1, exp: 0, attempts: [] },
      status: 'ACTIVE'
    };

    try {
      await this.pushAccountToCloud(account);
      this.loginWithAccount(account);
      this.closeLoginModal();
      this.playSound('pass');
      this.showCustomAlert({
        title: '🎉 TẠO TÀI KHOẢN THÀNH CÔNG!',
        message: `Chào mừng học viên <strong>${name}</strong>! Tài khoản <strong>Miễn Phí</strong> đã được tạo. Bạn có thể làm thử <strong>Bài 1</strong> ngay bây giờ. Để mở toàn bộ 50 bài, hãy nhập Key bản quyền.`,
        icon: '🐘',
        iconBg: 'bg-emerald-950/80 border border-emerald-600/60 text-emerald-400',
        btnText: 'Bắt Đầu Bài 1!'
      });
    } catch (e) {
      if (errBox) { errBox.innerText = 'Lỗi tạo tài khoản. Vui lòng thử lại!'; errBox.classList.remove('hidden'); }
    } finally {
      if (btn) { btn.disabled = false; btn.innerHTML = '<i data-lucide="user-plus" class="w-4 h-4"></i> Tạo Tài Khoản & Bắt Đầu'; this.initIcons(); }
    }
  },

  loginWithAccount: function(account) {
    this.data.currentUser = account;
    account.lastActiveDate = new Date().toISOString();

    // Check if premium is still active
    if (account.tier === 'premium' && account.keyExpiresAt) {
      const remaining = this.getRemainingDays(account.keyExpiresAt);
      if (remaining <= 0) account.tier = 'free'; // Key expired, downgrade to free (keep progress)
    }
    // Load progress from account
    this.data.userProgress = account.progress
      ? { ...account.progress, streak: account.progress.streak || account.streak || 1 }
      : { unlockedUpTo: 1, passedSets: {}, streak: account.streak || 1, exp: 0, attempts: [] };
    // Also update lastActiveDate streak
    const todayStr = new Date().toISOString().split('T')[0];
    if (!this.data.userProgress.lastActiveDate) {
      this.data.userProgress.lastActiveDate = todayStr;
    } else if (this.data.userProgress.lastActiveDate !== todayStr) {
      const lastDate = new Date(this.data.userProgress.lastActiveDate);
      const today = new Date(todayStr);
      const diffDays = Math.round((today - lastDate) / 86400000);
      if (diffDays === 1) this.data.userProgress.streak = (this.data.userProgress.streak || 1) + 1;
      else if (diffDays > 1) this.data.userProgress.streak = 1;
      this.data.userProgress.lastActiveDate = todayStr;
    }
    // Save to localStorage for quick restore and push updated lastActiveDate
    localStorage.setItem('eduquest_b1_account', JSON.stringify(account));
    this.pushAccountToCloud(account);
    this.renderRoadmap();
    this.updateUserStatsDisplay();
    this.initIcons();
  },

  getCurrentTier: function() {
    const user = this.data.currentUser;
    if (!user) return 'guest';
    if (user.tier === 'premium' && user.keyExpiresAt) {
      if (this.getRemainingDays(user.keyExpiresAt) > 0) return 'premium';
    }
    return 'free';
  },

  openLinkKeyModal: function() {
    this.playSound('click');
    const errBox = document.getElementById('link-key-error-msg');
    if (errBox) { errBox.innerText = ''; errBox.classList.add('hidden'); }
    const inp = document.getElementById('link-key-input');
    if (inp) inp.value = '';
    const modal = document.getElementById('modal-link-key');
    if (modal) { modal.classList.remove('hidden'); modal.classList.add('flex'); }
    this.initIcons();
  },

  closeLinkKeyModal: function() {
    const modal = document.getElementById('modal-link-key');
    if (modal) { modal.classList.add('hidden'); modal.classList.remove('flex'); }
  },

  handleLinkKey: async function() {
    const user = this.data.currentUser;
    if (!user) { this.closeLinkKeyModal(); this.openLoginModal(); return; }

    const keyInp = document.getElementById('link-key-input');
    const errBox = document.getElementById('link-key-error-msg');
    const btn = document.getElementById('btn-link-key');
    const rawKey = (keyInp?.value || '').trim().toUpperCase();

    if (!rawKey) {
      if (errBox) { errBox.innerText = 'Vui lòng nhập mã Key!'; errBox.classList.remove('hidden'); }
      return;
    }
    if (errBox) errBox.classList.add('hidden');
    if (btn) { btn.disabled = true; btn.innerHTML = '<i data-lucide="loader-2" class="w-4 h-4 animate-spin"></i> Đang xác thực...'; this.initIcons(); }

    try {
      const res = await fetch('/api/link-key', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ accountId: user.accountId, key: rawKey })
      });
      const data = await res.json();
      if (data.ok) {
        // Merge returned account data with current progress (never overwrite progress)
        const updatedAccount = { ...data.account, progress: this.data.userProgress };
        await this.pushAccountToCloud(updatedAccount);
        this.loginWithAccount(updatedAccount);
        this.closeLinkKeyModal();
        this.playSound('pass');
        const remaining = this.getRemainingDays(data.account.keyExpiresAt);
        this.showCustomAlert({
          title: '⭐ KÍCH HOẠT PREMIUM THÀNH CÔNG!',
          message: `Học viên <strong>${updatedAccount.name}</strong> đã mở khóa <strong>toàn bộ 50 bộ đề</strong>! Key còn <strong>${remaining} ngày</strong> sử dụng. Hãy chinh phục B1 ngay!`,
          icon: '🎉',
          iconBg: 'bg-amber-950/80 border border-amber-600/60 text-amber-400',
          btnText: 'Vượt Ải Ngay!'
        });
      } else {
        if (errBox) { errBox.innerHTML = `❌ <strong>${data.error || 'Key không hợp lệ!'}</strong>`; errBox.classList.remove('hidden'); }
        this.playSound('fail');
      }
    } catch (e) {
      if (errBox) { errBox.innerText = 'Lỗi kết nối. Vui lòng thử lại!'; errBox.classList.remove('hidden'); }
    } finally {
      if (btn) { btn.disabled = false; btn.innerHTML = '<i data-lucide="zap" class="w-4 h-4"></i> Kích Hoạt Premium Ngay'; this.initIcons(); }
    }
  },

  // Legacy key login (fallback, no email required)
  handleLegacyKeyLogin: async function() {
    const keyInp = document.getElementById('login-license-key');
    const errBox = document.getElementById('login-error-msg');
    const btn = document.getElementById('btn-submit-login');
    if (!keyInp) return;

    const rawInput = (keyInp.value || '').trim();
    if (!rawInput) {
      if (errBox) { errBox.innerText = 'Vui lòng nhập mã Key!'; errBox.classList.remove('hidden'); }
      return;
    }
    if (btn) { btn.disabled = true; btn.innerHTML = '<i data-lucide="loader-2" class="w-4 h-4 animate-spin"></i> Đang xác thực...'; this.initIcons(); }

    // Sync keys from cloud first
    await this.syncKeysFromCloud();
    this.loadUsersFromStorage();
    const user = this.data.users.find(u => this.isKeyMatching(u.key || u.id, rawInput));

    if (btn) { btn.disabled = false; btn.innerHTML = '<i data-lucide="check-circle" class="w-4 h-4"></i> Kích Hoạt & Bắt Đầu Học'; this.initIcons(); }

    if (user) {
      if (user.status !== 'ACTIVE') {
        this.playSound('fail');
        if (errBox) { errBox.innerHTML = `❌ <strong>Mã Key "${rawInput}" đã bị Khóa!</strong>`; errBox.classList.remove('hidden'); }
        return;
      }
      const remainingDays = this.getRemainingDays(user.expiresAt);
      if (remainingDays <= 0) {
        this.playSound('fail');
        if (errBox) { errBox.innerHTML = `⚠️ <strong>Key "${rawInput}" đã Hết Hạn!</strong><div class="mt-1">Liên hệ Admin tại binhluu.ai.studio để gia hạn.</div>`; errBox.classList.remove('hidden'); }
        return;
      }
      if (errBox) errBox.classList.add('hidden');
      const cleanName = (user.name || '').trim();
      if (!cleanName || cleanName === 'Chưa Kích Hoạt' || cleanName === 'Chưa Đặt Tên') {
        this.data.pendingLoginUser = user;
        this.closeLoginModal();
        const nameModal = document.getElementById('modal-name-registration');
        if (nameModal) { nameModal.classList.remove('hidden'); nameModal.classList.add('flex'); }
        this.initIcons();
        return;
      }
      const acct = {
        accountId: user.linkedAccountId || ('ACC-' + (user.key || user.id)),
        email: user.linkedEmail || (cleanName ? (cleanName.toLowerCase().replace(/\s+/g, '') + '@gmail.com') : 'hocvien@gmail.com'),
        name: cleanName,
        tier: 'premium',
        linkedKey: user.key,
        keyExpiresAt: user.expiresAt,
        createdAt: user.createdAt || new Date().toISOString(),
        lastActiveDate: new Date().toISOString(),
        streak: user.streak || 1,
        progress: this.data.userProgress || { passedSets: {}, unlockedUpTo: 1 },
        status: 'ACTIVE'
      };
      this.data.currentUser = acct;
      localStorage.setItem('eduquest_b1_account', JSON.stringify(acct));
      localStorage.setItem('eduquest_b1_logged_user', JSON.stringify(user));
      await this.pushAccountToCloud(acct);
      this.loadUserProgressFromStorage();
      this.updateDailyStreak();
      this.closeLoginModal();
      this.renderRoadmap();
      this.updateUserStatsDisplay();
      this.playSound('pass');
      this.showCustomAlert({
        title: 'KÍCH HOẠT THÀNH CÔNG!',
        message: `Chào mừng học viên <strong>${cleanName}</strong>! Key còn <strong>${remainingDays} ngày</strong>.`,
        icon: '🎉', iconBg: 'bg-emerald-950/80 border border-emerald-600/60 text-emerald-400', btnText: 'Bắt Đầu Vượt Ải'
      });
    } else {
      this.playSound('fail');
      if (errBox) { errBox.innerHTML = `❌ <strong>Mã Key "${rawInput}" không tồn tại!</strong><div class="mt-1">Vui lòng kiểm tra lại hoặc liên hệ Admin tại binhluu.ai.studio.</div>`; errBox.classList.remove('hidden'); }
    }
  },

  // Keep old handleLogin as alias for legacy
  handleLogin: function(event) {
    if (event) event.preventDefault();
    return this.handleLegacyKeyLogin();
  },

  fetchAccountsFromCloud: async function() {
    let accountsList = [];
    const urls = ['/api/accounts', '/data/accounts_db.json'];
    for (const url of urls) {
      try {
        const res = await fetch(url + '?t=' + Date.now());
        if (res.ok) {
          const data = await res.json();
          const list = Array.isArray(data) ? data : (data.accounts || data.data || []);
          if (Array.isArray(list) && list.length > 0) {
            accountsList = list;
            break;
          }
        }
      } catch (e) {}
    }

    // Also check local accounts database in localStorage
    try {
      const localSaved = localStorage.getItem('eduquest_b1_all_accounts');
      if (localSaved) {
        const parsed = JSON.parse(localSaved);
        if (Array.isArray(parsed) && parsed.length > 0) {
          const map = new Map(accountsList.map(a => [(a.email || '').toLowerCase(), a]));
          parsed.forEach(a => {
            const k = (a.email || '').toLowerCase();
            if (k && !map.has(k)) map.set(k, a);
          });
          accountsList = Array.from(map.values());
        }
      }
    } catch(e) {}

    // Also check registered users in this.data.users (Keys list)
    if (Array.isArray(this.data.users) && this.data.users.length > 0) {
      const map = new Map(accountsList.map(a => [(a.email || '').toLowerCase(), a]));
      this.data.users.forEach(u => {
        const email = (u.linkedEmail || (u.name ? u.name.toLowerCase().replace(/\s+/g, '') + '@gmail.com' : '')).toLowerCase();
        if (email && !map.has(email) && u.name && u.name !== 'Chưa Kích Hoạt') {
          map.set(email, {
            accountId: u.linkedAccountId || ('ACC-' + (u.key || u.id)),
            email: email,
            name: u.name,
            tier: 'premium',
            linkedKey: u.key,
            keyExpiresAt: u.expiresAt,
            createdAt: u.createdAt || new Date().toISOString(),
            lastActiveDate: u.lastActiveDate || new Date().toISOString(),
            streak: u.streak || 1,
            progress: { passedSets: {}, unlockedUpTo: 1 },
            status: u.status || 'ACTIVE'
          });
        }
      });
      accountsList = Array.from(map.values());
    }

    return accountsList;
  },

  pushAccountToCloud: async function(account) {
    if (!account) return;
    try {
      await fetch('/api/accounts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ account })
      });
    } catch (e) {}

    // Multi-account persistent cache in localStorage
    try {
      let all = [];
      const saved = localStorage.getItem('eduquest_b1_all_accounts');
      if (saved) all = JSON.parse(saved);
      if (!Array.isArray(all)) all = [];
      const idx = all.findIndex(a => 
        (a.accountId && a.accountId === account.accountId) ||
        (a.email && account.email && a.email.toLowerCase() === account.email.toLowerCase())
      );
      if (idx >= 0) all[idx] = account;
      else all.push(account);
      localStorage.setItem('eduquest_b1_all_accounts', JSON.stringify(all));
    } catch(e) {}

    // Update active user in localStorage
    localStorage.setItem('eduquest_b1_account', JSON.stringify(account));
  },

  validateActiveSessionWithServer: async function() {
    const localUser = this.data.currentUser;
    if (!localUser) return;

    try {
      const accounts = await this.fetchAccountsFromCloud();
      if (!Array.isArray(accounts)) return;

      // Find matching server account
      const serverAcct = accounts.find(a => 
        (a.accountId && a.accountId === localUser.accountId) ||
        (a.email && localUser.email && a.email.toLowerCase() === localUser.email.toLowerCase())
      );

      // Case 1: Account was deleted or purged by Admin
      if (!serverAcct || serverAcct.status === 'DELETED') {
        this.forceLogoutByAdmin('Tài khoản của bạn đã bị Quản Trị Viên xóa hoặc thu hồi khỏi hệ thống!');
        return;
      }

      // Case 2: Key was revoked/deleted by Admin -> Downgraded to free
      const serverTier = serverAcct.tier || 'free';
      const serverKey = serverAcct.linkedKey;
      if (localUser.tier === 'premium' && (serverTier === 'free' || !serverKey)) {
        this.data.currentUser.tier = 'free';
        this.data.currentUser.linkedKey = null;
        this.data.currentUser.keyExpiresAt = null;
        localStorage.setItem('eduquest_b1_account', JSON.stringify(this.data.currentUser));
        this.renderRoadmap();
        this.updateUserStatsDisplay();
        this.showToast('⚠️ Mã Key của bạn đã bị Admin thu hồi hoặc đã hết hạn.');
        return;
      }

      // Case 3: Admin extended key or updated details -> Sync to local
      if (serverAcct.keyExpiresAt !== localUser.keyExpiresAt || serverAcct.name !== localUser.name || serverAcct.tier !== localUser.tier) {
        this.data.currentUser = { ...this.data.currentUser, ...serverAcct };
        localStorage.setItem('eduquest_b1_account', JSON.stringify(this.data.currentUser));
        this.renderRoadmap();
        this.updateUserStatsDisplay();
      }
    } catch(e) {
      // Offline fallback
    }
  },

  forceLogoutByAdmin: function(reasonMessage) {
    this.stopAllAudios();
    this.data.currentUser = null;
    localStorage.removeItem('eduquest_b1_account');
    localStorage.removeItem('eduquest_b1_logged_user');
    this.data.userProgress = { unlockedUpTo: 1, passedSets: {}, streak: 0, exp: 0, attempts: [] };
    this.renderRoadmap();
    this.updateUserStatsDisplay();
    this.playSound('fail');
    this.showCustomAlert({
      title: 'TÀI KHOẢN ĐÃ BỊ THU HỒI',
      message: reasonMessage || 'Tài khoản của bạn đã bị Quản Trị Viên xóa khỏi hệ thống.',
      icon: '⚠️',
      iconBg: 'bg-rose-950/80 border border-rose-700 text-rose-400',
      btnText: 'Tôi Đã Hiểu'
    });
  },

  logout: function() {
    this.showCustomConfirm({
      title: 'Đăng Xuất Tài Khoản?',
      message: 'Bạn có chắc chắn muốn đăng xuất?',
      icon: '👋',
      iconBg: 'bg-indigo-950/80 border border-indigo-600/60 text-indigo-400',
      cancelText: 'Hủy Bỏ',
      confirmText: 'Đăng Xuất',
      onConfirm: () => {
        this.stopAllAudios();
        this.saveUserProgressToStorage();
        this.data.currentUser = null;
        localStorage.removeItem('eduquest_b1_account');
        localStorage.removeItem('eduquest_b1_logged_user');
        this.data.userProgress = { unlockedUpTo: 1, passedSets: {}, streak: 0, exp: 0, attempts: [] };
        this.renderRoadmap();
        this.updateUserStatsDisplay();
        this.playSound('click');
      }
    });
  },

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

    if (!this.data.exams || this.data.exams.length === 0) {
      this.loadExamsDataset().then(() => {
        if (this.data.exams && this.data.exams.length > 0) {
          this.renderRoadmap();
        }
      });
      return;
    }

    container.innerHTML = '';
    const filtered = this.data.exams.filter(ex => {
      if (this.data.currentLevelFilter === 'all') return true;
      return ex.level_number === parseInt(this.data.currentLevelFilter);
    });

    const tier = this.getCurrentTier(); // 'guest', 'free', 'premium'
    const freeExamDone = !!(this.data.currentUser?.freeExamSubmitted);
    const userProgress = this.data.userProgress || { passedSets: {}, unlockedUpTo: 1 };
    const passedSets = userProgress.passedSets || {};

    filtered.forEach(ex => {
      const isBai1 = ex.set_number === 1;
      const passInfo = passedSets[ex.exam_id];
      const isPassed = passInfo && passInfo.score >= 50;

      // Determine access level (Progression Rule: must pass >= 50% to unlock next)
      let isUnlocked, canStart, needsKey;
      if (tier === 'premium') {
        isUnlocked = (ex.set_number <= (userProgress.unlockedUpTo || 1));
        canStart = isUnlocked;
        needsKey = false;
      } else if (tier === 'free') {
        isUnlocked = isBai1;
        canStart = isBai1 && !freeExamDone;
        needsKey = !isBai1;
      } else { // guest
        isUnlocked = false;
        canStart = false;
        needsKey = true;
      }

      let levelBadge = 'bg-emerald-950 text-emerald-300 border-emerald-700/60';
      if (ex.level_number === 2) levelBadge = 'bg-amber-950 text-amber-300 border-amber-700/60';
      if (ex.level_number === 3) levelBadge = 'bg-rose-950 text-rose-300 border-rose-700/60';

      const card = document.createElement('div');
      card.className = `glass-card rounded-3xl p-4 sm:p-6 flex flex-col justify-between ${
        isUnlocked ? 'border-slate-800' : 'locked'
      }`;

      // Button logic
      let actionBtn;
      if (tier === 'guest') {
        actionBtn = `<button onclick="app.openLoginModal()" class="px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-cyan-300 font-bold text-xs flex items-center gap-1 border border-slate-700">
          <i data-lucide="user-plus" class="w-3 h-3"></i> Đăng Ký / Nhập Key
        </button>`;
      } else if (tier === 'premium') {
        if (isUnlocked) {
          actionBtn = `<button onclick="app.startExam('${ex.exam_id}')" class="px-3.5 py-1.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs shadow-md flex items-center gap-1 transition-all">
            ${isPassed ? 'Làm Lại' : 'Bắt Đầu'} <i data-lucide="play" class="w-3 h-3"></i>
          </button>`;
        } else {
          actionBtn = `<button disabled class="px-3 py-1.5 rounded-xl bg-slate-900 text-slate-500 font-semibold text-xs cursor-not-allowed flex items-center gap-1 border border-slate-800" title="Cần đạt Đề ${ex.set_number - 1} để mở khóa">
            <i data-lucide="lock" class="w-3 h-3"></i> Khóa · Cần Đạt Đề ${ex.set_number - 1}
          </button>`;
        }
      } else if (tier === 'free') {
        if (isBai1) {
          if (freeExamDone) {
            actionBtn = `<button onclick="app.openLinkKeyModal()" class="px-3 py-1.5 rounded-xl bg-slate-700 hover:bg-amber-950 text-slate-400 hover:text-amber-300 font-bold text-xs flex items-center gap-1 border border-slate-700 hover:border-amber-700 transition-all" title="Nhập Key để làm lại">
              <i data-lucide="check-circle-2" class="w-3 h-3 text-emerald-400"></i> Đã Nộp · Cần Key làm lại
            </button>`;
          } else {
            actionBtn = `<button onclick="app.startExam('${ex.exam_id}')" class="px-3.5 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs shadow-md flex items-center gap-1 transition-all">
              <i data-lucide="play" class="w-3 h-3"></i> Làm Bài Thử
            </button>`;
          }
        } else {
          actionBtn = `<button onclick="app.openLinkKeyModal()" class="px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-amber-950 text-slate-400 hover:text-amber-300 font-bold text-xs flex items-center gap-1 border border-slate-700 hover:border-amber-700 transition-all">
            <i data-lucide="key" class="w-3 h-3"></i> Cần Key
          </button>`;
        }
      }

      // Lock badge
      let lockBadge;
      if (isPassed) {
        lockBadge = `<span class="text-emerald-400 flex items-center gap-1 px-2 py-0.5 rounded-full bg-emerald-950 border border-emerald-800 text-[11px]"><i data-lucide="check-circle-2" class="w-3 h-3"></i> ${passInfo.score}%</span>`;
      } else if (isUnlocked) {
        lockBadge = `<span class="text-cyan-400 flex items-center gap-1 px-2 py-0.5 rounded-full bg-cyan-950 border border-cyan-800 text-[11px]"><i data-lucide="unlock" class="w-3 h-3"></i> Mở</span>`;
      } else if (tier === 'premium') {
        lockBadge = `<span class="text-slate-500 flex items-center gap-1 px-2 py-0.5 rounded-full bg-slate-900 border border-slate-800 text-[11px]"><i data-lucide="lock" class="w-3 h-3"></i> Khóa (≥50%)</span>`;
      } else {
        lockBadge = `<span class="text-amber-400 flex items-center gap-1 px-2 py-0.5 rounded-full bg-amber-950/60 border border-amber-800/60 text-[11px]"><i data-lucide="key" class="w-3 h-3"></i> Cần Key</span>`;
      }

      card.innerHTML = `
        <div class="space-y-3">
          <div class="flex items-center justify-between">
            <span class="px-2.5 py-0.5 rounded-full text-[11px] font-bold border ${levelBadge}">
              ${ex.level}
            </span>
            <div class="flex items-center gap-1 text-xs font-bold">${lockBadge}</div>
          </div>

          <div>
            <h3 class="text-sm sm:text-base font-bold text-white">${ex.title}</h3>
            <p class="text-xs text-slate-300 mt-1 font-normal">Xáo trộn ngẫu nhiên 100% • Ngưỡng đạt: ≥ ${ex.passing_threshold_percent}%</p>
          </div>
        </div>

        <div class="mt-4 pt-3 border-t border-slate-800 flex items-center justify-between">
          <span class="text-xs text-slate-400 font-mono font-bold">${ex.exam_id}</span>
          ${actionBtn}
        </div>
      `;

      container.appendChild(card);
    });

    this.initIcons();
  },

  startExam: function(examId) {
    this.stopAllAudios();
    this.playSound('click');

    const tier = this.getCurrentTier();

    if (tier === 'guest') {
      this.showCustomAlert({
        title: 'Tạo Tài Khoản Miễn Phí',
        message: 'Đăng ký tài khoản miễn phí để làm thử <strong>Bài 1</strong>! Nhập Key để mở toàn bộ 50 bài.',
        icon: '🐘',
        iconBg: 'bg-indigo-950/80 border border-indigo-600/60 text-indigo-400',
        btnText: 'Đăng Ký Ngay',
        onConfirm: () => this.openLoginModal()
      });
      return;
    }

    const rawExam = this.data.exams.find(e => e.exam_id === examId);
    if (!rawExam) return;

    const isBai1 = rawExam.set_number === 1;
    const freeExamDone = !!(this.data.currentUser?.freeExamSubmitted);

    if (tier === 'free') {
      if (!isBai1) {
        this.showCustomAlert({
          title: '🔑 Cần Key Bản Quyền',
          message: `<strong>Tài khoản Free</strong> chỉ được làm thử Bài 1. Để mở bài <strong>${rawExam.title}</strong>, hãy nhập Key bản quyền từ Admin.`,
          icon: '⭐',
          iconBg: 'bg-amber-950/80 border border-amber-600/60 text-amber-400',
          btnText: 'Nhập Key Ngay',
          onConfirm: () => this.openLinkKeyModal()
        });
        return;
      }
      if (isBai1 && freeExamDone) {
        this.showCustomAlert({
          title: '✅ Bạn Đã Nộp Bài 1 Rồi',
          message: 'Tài khoản Free chỉ được làm thử Bài 1 một lần. Hãy nhập <strong>Key bản quyền</strong> để làm lại và mở khóa toàn bộ 50 bài!',
          icon: '⭐',
          iconBg: 'bg-amber-950/80 border border-amber-600/60 text-amber-400',
          btnText: 'Nhập Key Upgrade',
          onConfirm: () => this.openLinkKeyModal()
        });
        return;
      }
    }

    if (tier === 'premium') {
      const unlockedUpTo = this.data.userProgress.unlockedUpTo || 1;
      if (rawExam.set_number > unlockedUpTo) {
        this.showCustomAlert({
          title: '🔒 BỘ ĐỀ CHƯA MỞ KHÓA',
          message: `Bạn cần hoàn thành và đạt tối thiểu <strong>≥ 50%</strong> ở <strong>Đề ${rawExam.set_number - 1}</strong> để mở khóa bài này!`,
          icon: '🛡️',
          iconBg: 'bg-indigo-950/80 border border-indigo-600/60 text-indigo-400',
          btnText: 'Đã Hiểu'
        });
        return;
      }
    }

    this.data.currentExam = this.randomizeExamData(rawExam);
    this.data.userAnswers = {};

    document.getElementById('exam-room-title').innerText = this.data.currentExam.title;

    this.showTab('exam');
    this.renderContinuousExamSheet();
    this.startExamTimer();
    window.scrollTo({ top: 0, behavior: 'smooth' });
  },

  exitExamRoom: function() {
    this.showCustomConfirm({
      title: 'Thoát Phòng Thi?',
      message: 'Bạn có chắc chắn muốn thoát phòng thi? Toàn bộ bài làm chưa nộp sẽ không được lưu.',
      icon: '⚠️',
      iconBg: 'bg-amber-950/80 border border-amber-600/60 text-amber-400',
      cancelText: 'Ở Lại Làm Bài',
      confirmText: 'Thoát Ra',
      onConfirm: () => {
        this.stopAllAudios();
        this.stopExamTimer();
        this.showTab('roadmap');
      }
    });
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
        this.showCustomAlert({
          title: 'HẾT THỜI GIAN LÀM BÀI!',
          message: 'Thời gian làm bài đã kết thúc. Hệ thống sẽ tự động nộp bài thi của bạn để chấm điểm ngay.',
          icon: '⏰',
          onConfirm: () => this.submitCurrentExam()
        });
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
    const questions = exam.flatQuestions || [];

    questions.forEach((q, idx) => {
      const qNumber = idx + 1;
      const card = document.createElement('div');
      card.className = 'glass-panel rounded-3xl p-4 sm:p-7 space-y-4 shadow-xl border border-slate-800';

      if (q.skillType === 'listening') {
        const audioUniqueId = `audio-q-${idx}`;
        const btnUniqueId = `btn-audio-q-${idx}`;
        const timeUniqueId = `time-audio-q-${idx}`;
        const waveUniqueId = `wave-audio-q-${idx}`;
        const fillUniqueId = `fill-audio-q-${idx}`;

        const qIndexInPart = q.part_question_index !== undefined ? q.part_question_index : (idx % 8);
        const qStart = q.start_time !== undefined ? q.start_time : (qIndexInPart * 45);
        const qDuration = q.duration !== undefined ? q.duration : 45;
        const qEnd = q.end_time !== undefined ? q.end_time : (qStart + qDuration);

        card.innerHTML = `
          <div class="flex flex-col gap-2.5 pb-3 border-b border-slate-800">
            <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5">
              <div class="flex items-center gap-2 shrink-0">
                <span class="px-2.5 py-1 rounded-xl bg-indigo-950 text-cyan-300 font-black text-xs border border-indigo-700">Câu ${qNumber} (Nghe)</span>
                <span class="text-xs text-slate-300 font-bold truncate max-w-[140px] sm:max-w-[220px]">${q.partTitle}</span>
              </div>

              <div class="flex items-center gap-1.5 sm:gap-2 flex-wrap sm:flex-nowrap">
                <audio id="${audioUniqueId}" preload="metadata" class="hidden">
                  <source src="/${q.audioFile}" type="audio/mpeg">
                </audio>
                <button onclick="app.skipAudio('${audioUniqueId}', -5, ${qStart}, ${qDuration}, ${qEnd})" class="p-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-slate-300 hover:text-white border border-slate-800 text-xs font-bold flex items-center gap-0.5 shrink-0" title="Lùi 5 giây">
                  <i data-lucide="rotate-ccw" class="w-3.5 h-3.5"></i> -5s
                </button>
                <button id="${btnUniqueId}" onclick="app.toggleCustomAudio('${audioUniqueId}', '${btnUniqueId}', '${timeUniqueId}', '${waveUniqueId}', '${fillUniqueId}', ${qStart}, ${qDuration}, ${qEnd})" class="custom-audio-pill px-3.5 py-2 rounded-2xl text-xs font-bold text-white shadow-lg flex items-center gap-1.5 cursor-pointer shrink-0">
                  <i data-lucide="play" class="w-3.5 h-3.5 text-cyan-300 audio-icon"></i>
                  <span class="audio-btn-text">Phát</span>
                </button>
                <button onclick="app.skipAudio('${audioUniqueId}', 5, ${qStart}, ${qDuration}, ${qEnd})" class="p-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-slate-300 hover:text-white border border-slate-800 text-xs font-bold flex items-center gap-0.5 shrink-0" title="Tua 5 giây">
                  +5s <i data-lucide="rotate-cw" class="w-3.5 h-3.5"></i>
                </button>
                <div class="flex items-center gap-1.5 px-2.5 py-1.5 rounded-2xl bg-slate-950 border border-slate-800 shrink-0">
                  <div id="${waveUniqueId}" class="sound-wave flex items-center gap-0.5">
                    <div class="sound-wave-bar"></div>
                    <div class="sound-wave-bar"></div>
                    <div class="sound-wave-bar"></div>
                    <div class="sound-wave-bar"></div>
                    <div class="sound-wave-bar"></div>
                  </div>
                  <span id="${timeUniqueId}" class="text-[10px] sm:text-[11px] font-mono text-cyan-300 font-bold">00:00 / ${this.formatTime(qDuration)}</span>
                </div>
              </div>
            </div>

            <div class="audio-progress-track" onclick="app.seekAudio('${audioUniqueId}', event, ${qStart}, ${qDuration})" title="Bấm vào thanh để tua đoạn nghe câu này">
              <div id="${fillUniqueId}" class="audio-progress-fill"></div>
            </div>
          </div>

          <div class="space-y-3 pt-1">
            ${q.context ? `<div class="p-3 rounded-2xl bg-indigo-950/60 border border-indigo-700/80 text-xs font-mono text-cyan-200">${q.context}</div>` : ''}
            <div class="font-bold text-xs sm:text-base text-white leading-snug">${q.question}</div>
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
      } else if (q.skillType === 'reading') {
        card.innerHTML = `
          <div class="flex items-center justify-between pb-3 border-b border-slate-800 gap-2">
            <div class="flex items-center gap-2 min-w-0">
              <span class="px-2.5 py-1 rounded-xl bg-cyan-950 text-cyan-300 font-black text-xs border border-cyan-700 whitespace-nowrap shrink-0">Câu ${qNumber} (Đọc)</span>
              <span class="text-xs text-slate-300 font-bold truncate">${q.partTitle}</span>
            </div>
          </div>

          <div class="space-y-3 pt-1">
            ${q.context ? `<div class="p-3 rounded-2xl bg-indigo-950/60 border border-indigo-700/80 text-xs font-mono text-cyan-200">${q.context}</div>` : ''}
            ${q.passage ? `<div class="p-3.5 rounded-2xl bg-slate-900 border border-slate-700 text-xs sm:text-sm text-slate-100 leading-relaxed font-normal">${q.passage}</div>` : ''}
            <div class="font-bold text-xs sm:text-base text-white leading-snug">${q.question}</div>
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
      } else if (q.skillType === 'writing_p1') {
        card.innerHTML = `
          <div class="flex items-center justify-between pb-3 border-b border-slate-800 gap-2">
            <div class="flex items-center gap-2 min-w-0">
              <span class="px-2.5 py-1 rounded-xl bg-amber-950 text-amber-300 font-black text-xs border border-amber-700 whitespace-nowrap shrink-0">Câu ${qNumber} (Viết)</span>
              <span class="text-xs text-slate-300 font-bold truncate">${q.partTitle}</span>
            </div>
          </div>

          <div class="space-y-3 pt-1">
            <div class="text-xs text-slate-300">
              Câu gốc: <strong class="text-white">"${q.original}"</strong> (Từ cho sẵn: <strong class="text-amber-400 font-mono">${q.target_word}</strong>)
            </div>
            <div class="text-xs sm:text-base font-semibold text-slate-100">${q.prompt}</div>
            <input type="text" placeholder="Nhập từ còn thiếu..." value="${this.data.userAnswers[q.id] || ''}" oninput="app.recordAnswer('${q.id}', this.value)" class="w-full mt-2 px-4 py-3 rounded-xl bg-slate-900 border-2 border-slate-700 text-white focus:outline-none focus:border-amber-400 font-medium transition-colors">
          </div>
        `;
      } else if (q.skillType === 'writing_p2') {
        card.innerHTML = `
          <div class="flex items-center justify-between pb-3 border-b border-slate-800 gap-2">
            <div class="flex items-center gap-2 min-w-0">
              <span class="px-2.5 py-1 rounded-xl bg-rose-950 text-rose-300 font-black text-xs border border-rose-700 whitespace-nowrap shrink-0">Câu ${qNumber} (Viết Luận)</span>
              <span class="text-xs text-slate-300 font-bold truncate">${q.partTitle}</span>
            </div>
          </div>

          <div class="space-y-3 pt-1">
            <p class="text-xs sm:text-sm text-slate-200 leading-relaxed font-normal">${q.prompt}</p>
            <textarea rows="4" placeholder="Viết câu trả lời vào đây (35-45 từ)..." class="w-full px-4 py-3 rounded-xl bg-slate-900 border-2 border-slate-700 text-white focus:outline-none focus:border-indigo-400 font-normal"></textarea>
          </div>
        `;
      }

      container.appendChild(card);
    });

    const submitCard = document.createElement('div');
    submitCard.className = 'pt-4 pb-10 flex justify-center';
    submitCard.innerHTML = `
      <button onclick="app.submitCurrentExam()" class="w-full sm:w-auto px-8 py-4 rounded-2xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-black text-sm sm:text-base shadow-2xl flex items-center justify-center gap-2 transition-all">
        <i data-lucide="send" class="w-5 h-5"></i> Hoàn Thành & Nộp Toàn Bộ Bài Thi
      </button>
    `;
    container.appendChild(submitCard);

    this.initIcons();
  },

  recordAnswer: function(qId, val) {
    this.playSound('click');
    this.data.userAnswers[qId] = val;
  },

  submitCurrentExam: function() {
    this.stopAllAudios();
    this.stopExamTimer();
    const exam = this.data.currentExam;
    if (!exam || !exam.flatQuestions) return;

    let listeningCorrect = 0, listeningTotal = 0;
    let readingCorrect = 0, readingTotal = 0;
    let writingCorrect = 0, writingTotal = 0;

    exam.flatQuestions.forEach(q => {
      if (q.skillType === 'listening') {
        listeningTotal++;
        if (this.data.userAnswers[q.id] === q.correct_answer) listeningCorrect++;
      } else if (q.skillType === 'reading') {
        readingTotal++;
        if (this.data.userAnswers[q.id] === q.correct_answer) readingCorrect++;
      } else if (q.skillType === 'writing_p1') {
        writingTotal++;
        const userAns = (this.data.userAnswers[q.id] || '').trim().toLowerCase();
        const targetAns = (q.correct_answer || '').toLowerCase();
        if (userAns === targetAns || userAns.includes(targetAns)) writingCorrect++;
      }
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

    // Sync progress to account object (new account system)
    if (this.data.currentUser && this.data.currentUser.accountId) {
      const isBai1 = exam.set_number === 1;
      const tier = this.getCurrentTier();
      if (tier === 'free' && isBai1) {
        this.data.currentUser.freeExamSubmitted = true;
      }
      this.data.currentUser.progress = { ...this.data.userProgress };
      this.pushAccountToCloud(this.data.currentUser);
      localStorage.setItem('eduquest_b1_account', JSON.stringify(this.data.currentUser));
    }

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

  renderReviewDetails: function() {
    const container = document.getElementById('review-questions-list');
    if (!container || !this.data.currentExam || !this.data.currentExam.flatQuestions) return;

    container.innerHTML = '';
    const questions = this.data.currentExam.flatQuestions;

    questions.forEach((q, idx) => {
      const userAns = this.data.userAnswers[q.id];
      const isWritingP1 = q.skillType === 'writing_p1';
      const isWritingP2 = q.skillType === 'writing_p2';

      if (isWritingP2) {
        const el = document.createElement('div');
        el.className = 'p-4 sm:p-6 rounded-3xl border-2 bg-indigo-950/30 border-indigo-700/80 space-y-3.5 shadow-lg';
        el.innerHTML = `
          <div class="flex items-center justify-between">
            <span class="text-[11px] sm:text-sm font-bold px-2.5 py-1 rounded-full bg-indigo-900 text-indigo-200 border border-indigo-600">
              ✍️ BÀI VIẾT TỰ LUẬN / EMAIL
            </span>
            <span class="text-xs text-slate-300 font-bold">Câu ${idx + 1} • ${q.partTitle || 'Part 2 - Writing Task'}</span>
          </div>

          <div class="p-3.5 rounded-2xl bg-slate-900 border border-slate-700 text-xs sm:text-sm text-slate-100 leading-relaxed">
            <span class="text-cyan-300 font-bold">Đề bài:</span> ${q.prompt}
          </div>

          ${userAns ? `
            <div class="p-3.5 rounded-2xl bg-slate-950 border border-slate-800 text-xs text-slate-200 space-y-1">
              <div class="text-slate-400 font-semibold">Bài bạn đã nộp:</div>
              <div class="whitespace-pre-wrap font-mono text-slate-100">${userAns}</div>
            </div>
          ` : ''}

          ${q.sample_answer ? `
            <div class="p-4 rounded-2xl bg-gradient-to-b from-emerald-950/70 to-slate-900 border border-emerald-500/80 space-y-2">
              <div class="text-amber-300 font-bold flex items-center gap-1.5 text-xs sm:text-sm">
                <i data-lucide="sparkles" class="w-4 h-4 text-amber-400"></i> Bài Viết Mẫu Chuẩn Điểm Cao (Band B1 Sample Answer):
              </div>
              <div class="text-white text-xs sm:text-sm leading-relaxed font-normal p-3 rounded-xl bg-slate-950/80 border border-emerald-800/60 whitespace-pre-wrap font-medium">
                ${q.sample_answer}
              </div>
            </div>
          ` : ''}
        `;
        container.appendChild(el);
        return;
      }
      
      const normStr = str => (str || '').toString().trim().toLowerCase().replace(/\s+/g, ' ');
      const isCorrect = isWritingP1
        ? (normStr(userAns) === normStr(q.correct_answer) || (normStr(userAns) && normStr(userAns).includes(normStr(q.correct_answer))))
        : userAns === q.correct_answer;

      const el = document.createElement('div');
      el.className = `p-4 sm:p-6 rounded-3xl border-2 ${isCorrect ? 'bg-emerald-950/40 border-emerald-700/80' : 'bg-rose-950/40 border-rose-700/80'} space-y-3 shadow-lg`;

      let modelSentenceHTML = '';
      if (isWritingP1) {
        const promptTemplate = q.prompt || '';
        const highlightedSentence = promptTemplate.includes('___')
          ? promptTemplate.replace(/_{2,}/, `<span class="px-2 py-0.5 mx-1 rounded-lg bg-emerald-500 text-slate-950 font-black shadow-sm">${q.correct_answer}</span>`)
          : `${promptTemplate} <span class="px-2 py-0.5 mx-1 rounded-lg bg-emerald-500 text-slate-950 font-black shadow-sm">${q.correct_answer}</span>`;

        modelSentenceHTML = `
          <!-- HIGHLIGHTED MODEL SENTENCE BOX FOR LEARNING -->
          <div class="p-3.5 sm:p-4 rounded-2xl bg-indigo-950/70 border-2 border-indigo-500/80 space-y-1.5 shadow-inner">
            <div class="text-amber-300 font-extrabold text-xs flex items-center gap-1.5">
              <i data-lucide="sparkles" class="w-4 h-4 text-amber-400 animate-pulse"></i> CÂU MẪU CHUẨN HOÀN CHỈNH (Học Viên Ghi Nhớ):
            </div>
            <div class="text-white font-bold text-xs sm:text-base leading-relaxed bg-slate-950/90 p-3 rounded-xl border border-indigo-700/60">
              "${highlightedSentence}"
            </div>
          </div>
        `;
      }

      el.innerHTML = `
        <div class="flex items-center justify-between">
          <span class="text-[11px] sm:text-sm font-bold px-2.5 py-1 rounded-full ${isCorrect ? 'bg-emerald-900 text-emerald-200 border border-emerald-600' : 'bg-rose-900 text-rose-200 border border-rose-600'}">
            ${isCorrect ? '✓ TRẢ LỜI ĐÚNG' : '✗ TRẢ LỜI SAI'}
          </span>
          <span class="text-xs text-slate-300 font-bold">Câu ${idx + 1} • ${q.partTitle || (isWritingP1 ? 'Part 1 - Viết Lại Câu' : '')}</span>
        </div>

        ${isWritingP1 && q.original ? `
          <div class="p-3 rounded-2xl bg-slate-900/90 border border-slate-700 text-xs text-slate-200 space-y-1">
            <div><span class="text-slate-400 font-semibold">Câu gốc:</span> <strong class="text-white font-bold">"${q.original}"</strong></div>
            <div><span class="text-slate-400 font-semibold">Từ khóa bắt buộc:</span> <span class="px-2 py-0.5 rounded-lg bg-amber-950 text-amber-300 border border-amber-700 font-mono font-bold">${q.target_word}</span></div>
          </div>
        ` : ''}

        <div class="font-semibold text-xs sm:text-base text-white leading-snug">${q.question || q.prompt}</div>

        <div class="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
          <div class="p-2.5 rounded-2xl bg-slate-900 border border-slate-700">
            <span class="text-slate-300 font-medium">Bạn đã ${isWritingP1 ? 'viết' : 'chọn'}:</span> <strong class="${isCorrect ? 'text-emerald-400' : 'text-rose-400'} font-bold ml-1">${userAns || '(Chưa điền)'}</strong>
          </div>
          <div class="p-2.5 rounded-2xl bg-slate-900 border border-slate-700">
            <span class="text-slate-300 font-medium">Đáp án chuẩn B1:</span> <strong class="text-emerald-400 font-bold ml-1">${q.correct_answer}</strong>
          </div>
        </div>

        ${modelSentenceHTML}

        <div class="p-3.5 rounded-2xl bg-slate-950 border border-slate-800 text-xs text-slate-100 space-y-1.5 leading-relaxed font-normal">
          ${q.grammar_pattern ? `<div class="text-amber-300 font-semibold">📌 Cấu trúc ngữ pháp: <span class="font-mono text-cyan-200">${q.grammar_pattern}</span></div>` : ''}
          <div class="text-cyan-300 font-bold flex items-center gap-1.5">💡 Giải thích chi tiết:</div>
          <div>${q.explanation || 'Đối chiếu ngữ pháp và ngữ cảnh chuẩn đề thi B1.'}</div>
          ${q.tapescript ? `<div class="mt-2 text-slate-300 italic p-2 rounded-xl bg-slate-900/80 border border-slate-800">🎧 Tapescript: "${q.tapescript}"</div>` : ''}
        </div>
      `;
      container.appendChild(el);
    });

    this.initIcons();
  },

  returnToRoadmap: function() {
    this.playSound('click');
    this.renderRoadmap();
    this.showTab('roadmap');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  },

  retakeCurrentExam: function() {
    if (this.data.currentExam) {
      this.startExam(this.data.currentExam.exam_id);
    }
  },

  showNextExamOrRoadmap: function() {
    this.playSound('click');
    this.renderRoadmap();
    this.showTab('roadmap');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  },

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

document.addEventListener('DOMContentLoaded', () => {
  app.init();
});
