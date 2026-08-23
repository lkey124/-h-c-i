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

    iconSpan.innerText = options.icon || '🎉';
    iconWrapper.className = `w-16 h-16 rounded-2xl mx-auto flex items-center justify-center text-3xl shadow-xl ${
      options.iconBg || 'bg-indigo-950/80 border border-indigo-600/60 text-indigo-400'
    }`;
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
    this.renderAnnouncementBanner();
    this.loadUsersFromStorage();
    this.loadActiveUserSession();
    this.updateDailyStreak();
    await this.syncKeysFromCloud();
    await this.loadExamsDataset();
    this.renderRoadmap();
    this.updateUserStatsDisplay();
    this.initIcons();
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
        linkBtn.style.display = 'inline-flex';
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
    const urls = ['/api/keys', '/data/users_cloud_db.json', 'data/users_cloud_db.json'];
    for (const url of urls) {
      try {
        const response = await fetch(url);
        if (response.ok) {
          const cloudData = await response.json();
          if (Array.isArray(cloudData) && cloudData.length > 0) {
            // Live Cloud state is authoritative
            this.data.users = cloudData;
            localStorage.setItem('eduquest_b1_all_users', JSON.stringify(cloudData));

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
            return;
          }
        }
      } catch (e) {}
    }
  },

  loadActiveUserSession: function() {
    try {
      const savedUser = localStorage.getItem('eduquest_b1_logged_user');
      if (savedUser) {
        const parsed = JSON.parse(savedUser);
        const liveUser = this.data.users.find(u => this.isKeyMatching(u.key || u.id, parsed.key || parsed.id));
        this.data.currentUser = liveUser || null;
        if (!liveUser) {
          localStorage.removeItem('eduquest_b1_logged_user');
        } else {
          this.loadUserProgressFromStorage();
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

  loadActiveUserSession: function() {
    try {
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
      title: `🔥 CHUỖI HỌC ${streak} NGÀY LIÊN TỤC!`,
      message: `
        <div class="text-center py-4 space-y-4">
          <div class="flex justify-center items-center py-4">
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

  updateUserStatsDisplay: function() {
    const user = this.data.currentUser;
    const heroBadge = document.getElementById('hero-user-badge');
    const subBadge = document.getElementById('badge-subscription-status');
    const subText = document.getElementById('stat-subscription-days');
    const authSec = document.getElementById('user-auth-section');
    const statusBadge = document.getElementById('roadmap-status-badge');

    if (user) {
      const remainingDays = this.getRemainingDays(user.expiresAt);
      const dynamicPackageName = this.getDynamicPackageName(remainingDays);
      const isActive = this.isAccountActive(user);
      const streak = this.data.userProgress.streak || 1;
      const streakInfo = this.getStreakLevelInfo(streak);
      const flameHTML = this.renderTikTokFlameHTML(streakInfo.level);

      if (heroBadge) heroBadge.innerHTML = `<i data-lucide="user-check" class="w-3 h-3 text-indigo-400"></i> Học viên: <strong class="text-white">${user.name}</strong> • <span class="${streakInfo.heroClass}">🔥 Chuỗi: ${streak} Ngày (${streakInfo.title})</span>`;

      if (isActive) {
        if (subBadge) {
          subBadge.classList.remove('hidden');
          subBadge.className = 'hidden md:flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl bg-slate-800 border border-slate-700 text-slate-200 text-xs font-bold';
        }
        if (subText) subText.innerText = `⏳ ${dynamicPackageName} (Còn ${remainingDays} ngày)`;
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
          <div class="flex items-center gap-2">
            <!-- TIKTOK FRAMELESS TIER-SCALED STREAK FLAME BUTTON -->
            <button onclick="app.showStreakCelebration()" class="streak-frameless-btn" title="Level ${streakInfo.level}: ${streakInfo.title} (${streak} Ngày)">
              ${flameHTML}
              <span class="${streakInfo.textClass}">${streak} Ngày</span>
            </button>

            <div class="flex items-center gap-1.5 p-1 pl-2 pr-2.5 rounded-xl bg-slate-800/80 border border-slate-700">
              <div class="w-6 h-6 rounded-lg bg-indigo-500 flex items-center justify-center font-bold text-xs text-white shrink-0">
                ${user.name.charAt(0).toUpperCase()}
              </div>
              <span class="text-xs font-bold text-slate-100 hidden sm:inline-block truncate max-w-[90px]">${user.name}</span>
            </div>

            <button onclick="app.logout()" class="p-2 rounded-xl bg-slate-800/80 hover:bg-rose-950 text-slate-400 hover:text-rose-300 border border-slate-700 hover:border-rose-800 transition-colors shrink-0" title="Đăng Xuất / Đổi Key">
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

      this.initAnimeFlameAnimation();
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

  // (Cleaned - single strict handleLogin is maintained above)

  logout: function() {
    this.showCustomConfirm({
      title: 'Đăng Xuất Tài Khoản?',
      message: 'Bạn có chắc chắn muốn đăng xuất? Bạn có thể nhập lại mã Key bất kỳ lúc nào.',
      icon: '👋',
      iconBg: 'bg-indigo-950/80 border border-indigo-600/60 text-indigo-400',
      cancelText: 'Hủy Bỏ',
      confirmText: 'Đăng Xuất',
      onConfirm: () => {
        this.stopAllAudios();
        this.saveUserProgressToStorage();
        this.data.currentUser = null;
        localStorage.removeItem('eduquest_b1_logged_user');
        this.loadUserProgressFromStorage();
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
            <p class="text-xs text-slate-300 mt-1 font-normal">Xáo trộn ngẫu nhiên 100% • Ngưỡng đạt: ≥ ${ex.passing_threshold_percent}%</p>
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

  startExam: function(examId) {
    this.stopAllAudios();
    this.playSound('click');

    if (!this.data.currentUser) {
      this.showCustomAlert({
        title: 'Yêu Cầu Nhập Key',
        message: 'Vui lòng nhập mã Key bản quyền để mở khóa phòng thi!',
        icon: '🔑',
        onConfirm: () => this.openLoginModal()
      });
      return;
    }

    if (!this.isAccountActive(this.data.currentUser)) {
      this.showCustomAlert({
        title: 'KEY ĐÃ HẾT HẠN SỬ DỤNG',
        message: 'Mã Key của bạn đã hết hạn thời gian học. Vui lòng liên hệ Admin qua <strong>binhluu.ai.studio</strong> để gia hạn ngày học!',
        icon: '⚠️',
        iconBg: 'bg-rose-950/80 border border-rose-600/60 text-rose-400'
      });
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

        card.innerHTML = `
          <div class="flex flex-col gap-2.5 pb-3 border-b border-slate-800">
            <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5">
              <div class="flex items-center gap-2">
                <span class="px-2.5 py-1 rounded-xl bg-indigo-950 text-cyan-300 font-black text-xs border border-indigo-700">Câu ${qNumber} (Nghe)</span>
                <span class="text-xs text-slate-300 font-bold">${q.partTitle}</span>
              </div>

              <div class="flex flex-wrap items-center gap-2">
                <audio id="${audioUniqueId}" preload="metadata" class="hidden">
                  <source src="/${q.audioFile}" type="audio/mpeg">
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

            <div class="audio-progress-track" onclick="app.seekAudio('${audioUniqueId}', event)" title="Bấm vào thanh để tua nhanh">
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
          <div class="flex items-center justify-between pb-3 border-b border-slate-800">
            <div class="flex items-center gap-2">
              <span class="px-2.5 py-1 rounded-xl bg-cyan-950 text-cyan-300 font-black text-xs border border-cyan-700">Câu ${qNumber} (Đọc)</span>
              <span class="text-xs text-slate-300 font-bold">${q.partTitle}</span>
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
          <div class="flex items-center justify-between pb-3 border-b border-slate-800">
            <div class="flex items-center gap-2">
              <span class="px-2.5 py-1 rounded-xl bg-amber-950 text-amber-300 font-black text-xs border border-amber-700">Câu ${qNumber} (Viết)</span>
              <span class="text-xs text-slate-300 font-bold">${q.partTitle}</span>
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
          <div class="flex items-center justify-between pb-3 border-b border-slate-800">
            <div class="flex items-center gap-2">
              <span class="px-2.5 py-1 rounded-xl bg-rose-950 text-rose-300 font-black text-xs border border-rose-700">Câu ${qNumber} (Viết Luận)</span>
              <span class="text-xs text-slate-300 font-bold">${q.partTitle}</span>
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
      if (q.skillType === 'writing_p2') return;

      const userAns = this.data.userAnswers[q.id];
      const isCorrect = q.skillType === 'writing_p1'
        ? (userAns || '').trim().toLowerCase() === (q.correct_answer || '').toLowerCase()
        : userAns === q.correct_answer;

      const el = document.createElement('div');
      el.className = `p-4 sm:p-6 rounded-3xl border-2 ${isCorrect ? 'bg-emerald-950/40 border-emerald-700/80' : 'bg-rose-950/40 border-rose-700/80'} space-y-3 shadow-lg`;

      el.innerHTML = `
        <div class="flex items-center justify-between">
          <span class="text-[11px] sm:text-sm font-bold px-2.5 py-1 rounded-full ${isCorrect ? 'bg-emerald-900 text-emerald-200 border border-emerald-600' : 'bg-rose-900 text-rose-200 border border-rose-600'}">
            ${isCorrect ? '✓ TRẢ LỜI ĐÚNG' : '✗ TRẢ LỜI SAI'}
          </span>
          <span class="text-xs text-slate-300 font-bold">Câu ${idx + 1} • ${q.partTitle}</span>
        </div>

        <div class="font-semibold text-xs sm:text-base text-white leading-snug">${q.question || q.prompt}</div>

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
          <div>${q.explanation || 'Đối chiếu ngữ pháp và ngữ cảnh bài đọc/nghe.'}</div>
          ${q.tapescript ? `<div class="mt-2 text-slate-300 italic p-2 rounded-xl bg-slate-900/80 border border-slate-800">🎧 Tapescript: "${q.tapescript}"</div>` : ''}
        </div>
      `;
      container.appendChild(el);
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
