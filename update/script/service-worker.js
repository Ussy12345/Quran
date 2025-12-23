// Quran App - Fixed for local file system
console.log('🚀 Quran App loaded successfully!');
console.log('🌙 Quran App - Initializing...');

// ==================== CONSTANTS & CONFIG ====================
const CONFIG = {
    API_BASE: 'https://api.alquran.cloud/v1',
    EVERY_AYAH_BASE: 'https://everyayah.com/data',
    PRAYER_API: 'https://api.aladhan.com/v1',
    DEFAULT_RECITER: 'alafasy',
    DEFAULT_LANGUAGE: 'ar',
    STORAGE_KEYS: {
        SETTINGS: 'quran_app_settings',
        BOOKMARKS: 'quran_app_bookmarks',
        PROGRESS: 'quran_app_progress',
        NOTES: 'quran_app_notes',
        STATS: 'quran_app_stats'
    },
    MAX_STORAGE: 5 * 1024 * 1024, // 5MB
    VERSION: '2.0.0'
};

// ==================== STATE MANAGEMENT ====================
const state = {
    // App State
    initialized: false,
    loading: false,
    currentView: 'home',
    
    // Quran Data
    surahs: [],
    juz: [],
    currentSurah: null,
    currentJuz: null,
    currentAyah: 1,
    verses: [],
    translation: null,
    showTranslation: false,
    
    // Audio State
    reciters: [
        { id: 'alafasy', name: 'مشاري العفاسي', englishName: 'Mishary Alafasy', quality: '128kbps' },
        { id: 'abdulbasitmurattal', name: 'عبد الباسط عبد الصمد', englishName: 'Abdul Basit', quality: '128kbps' },
        { id: 'hussarymujawwad', name: 'محمود خليل الحصري', englishName: 'Mahmoud Al-Hussary', quality: '128kbps' },
        { id: 'minshawimujawwad', name: 'محمد صديق المنشاوي', englishName: 'Mohamed Siddiq Al-Minshawi', quality: '128kbps' },
        { id: 'abu_bakr_ash-shaatree', name: 'أبو بكر الشاطري', englishName: 'Abu Bakr Al-Shatri', quality: '128kbps' },
        { id: 'hudhaify', name: 'علي الحذيفي', englishName: 'Ali Al-Hudhaify', quality: '128kbps' },
        { id: 'as_sudais', name: 'عبد الرحمن السديس', englishName: 'Abdurrahman As-Sudais', quality: '128kbps' },
        { id: 'almuaiqly', name: 'ماهر المعيقلي', englishName: 'Maher Al-Muaiqly', quality: '128kbps' }
    ],
    currentReciter: CONFIG.DEFAULT_RECITER,
    audioSources: [],
    isPlaying: false,
    playbackMode: 'verse',
    repeatMode: { enabled: false, count: 0, current: 0 },
    audioQuality: '128',
    playbackSpeed: 1,
    
    // UI State
    fontSize: 28,
    showTajweed: false,
    tajweedStyle: 'detailed',
    autoScroll: true,
    theme: 'light',
    
    // User Data
    bookmarks: [],
    notes: [],
    progress: {},
    stats: {
        totalListeningTime: 0,
        completedSurahs: [],
        favoriteReciters: {},
        lastPositions: [],
        achievements: {
            firstListen: false,
            tenHours: false,
            completeQuran: false,
            nightListener: false
        }
    },
    
    // Prayer Times
    prayerTimes: null,
    nextPrayer: null,
    
    // System
    lastUpdate: Date.now()
};

// ==================== DOM ELEMENTS - SAFE GETTER ====================
const getElement = (id) => {
    const element = document.getElementById(id);
    if (!element) {
        console.warn(`⚠️ Element with id "${id}" not found`);
    }
    return element;
};

// Initialize DOM elements safely
const DOM = {
    // Loading
    loadingScreen: getElement('loadingScreen'),
    appContainer: getElement('appContainer'),
    
    // Header
    themeToggle: getElement('themeToggle'),
    dashboardBtn: getElement('dashboardBtn'),
    settingsBtn: getElement('settingsBtn'),
    
    // Quick Stats
    totalTime: getElement('totalTime'),
    bookmarkCount: getElement('bookmarkCount'),
    progressPercent: getElement('progressPercent'),
    currentPrayer: getElement('currentPrayer'),
    
    // Player
    playBtn: getElement('playBtn'),
    prevBtn: getElement('prevBtn'),
    nextBtn: getElement('nextBtn'),
    repeatBtn: getElement('repeatBtn'),
    bookmarkBtn: getElement('bookmarkBtn'),
    progressBar: getElement('progressBar'),
    currentTime: getElement('currentTime'),
    duration: getElement('duration'),
    nowPlayingTitle: getElement('nowPlayingTitle'),
    currentReciter: getElement('currentReciter'),
    reciterSelect: getElement('reciterSelect'),
    translationSelect: getElement('translationSelect'),
    volumeSlider: getElement('volumeSlider'),
    speedSelect: getElement('speedSelect'),
    modeButtons: document.querySelectorAll('.mode-btn'),
    
    // Audio
    audioPlayer: getElement('audioPlayer'),
    
    // Quick Actions
    lastPositionBtn: getElement('lastPositionBtn'),
    randomAyahBtn: getElement('randomAyahBtn'),
    favoriteBtn: getElement('favoriteBtn'),
    notesBtn: getElement('notesBtn'),
    
    // Surah List
    surahList: getElement('surahList'),
    searchSurah: getElement('searchSurah'),
    clearSearch: getElement('clearSearch'),
    filterButtons: document.querySelectorAll('.filter-btn'),
    
    // Text Display
    surahDisplayName: getElement('surahDisplayName'),
    ayahCount: getElement('ayahCount'),
    textContainer: getElement('textContainer'),
    textSizeDown: getElement('textSizeDown'),
    textSizeUp: getElement('textSizeUp'),
    textSizeLabel: getElement('textSizeLabel'),
    toggleTranslation: getElement('toggleTranslation'),
    autoScrollBtn: getElement('autoScrollBtn'),
    tajweedToggle: getElement('tajweedToggle'),
    
    // Right Panel
    juzGrid: getElement('juzGrid'),
    prayerTimes: {
        fajr: getElement('fajrTime'),
        dhuhr: getElement('dhuhrTime'),
        asr: getElement('asrTime'),
        maghrib: getElement('maghribTime'),
        isha: getElement('ishaTime')
    },
    nextPrayerName: getElement('nextPrayerName'),
    nextPrayerTime: getElement('nextPrayerTime'),
    quickNote: getElement('quickNote'),
    saveNoteBtn: getElement('saveNoteBtn'),
    recentBookmarks: getElement('recentBookmarks'),
    
    // Bottom Navigation
    navButtons: document.querySelectorAll('.nav-btn'),
    
    // Modals
    modalOverlay: getElement('modalOverlay'),
    dashboardModal: getElement('dashboardModal'),
    bookmarksModal: getElement('bookmarksModal'),
    notesModal: getElement('notesModal'),
    settingsModal: getElement('settingsModal'),
    closeButtons: document.querySelectorAll('.close-modal'),
    
    // Dashboard Stats
    statListeningTime: getElement('statListeningTime'),
    statCompletedSurahs: getElement('statCompletedSurahs'),
    statFavoriteReciter: getElement('statFavoriteReciter'),
    statTotalBookmarks: getElement('statTotalBookmarks'),
    
    // Settings
    qualitySelect: getElement('qualitySelect'),
    autoRepeatSelect: getElement('autoRepeatSelect'),
    tajweedStyleSelect: getElement('tajweedStyleSelect'),
    fontSizeRange: getElement('fontSizeRange'),
    fontSizeValue: getElement('fontSizeValue'),
    storageUsed: getElement('storageUsed'),
    storageTotal: getElement('storageTotal'),
    storageProgress: getElement('storageProgress'),
    clearDataBtn: getElement('clearDataBtn'),
    exportDataBtn: getElement('exportDataBtn'),
    importDataBtn: getElement('importDataBtn'),
    
    // Notifications
    notificationArea: getElement('notificationArea'),
    
    // Badges
    badgesGrid: getElement('badgesGrid')
};

// ==================== INITIALIZATION ====================
document.addEventListener('DOMContentLoaded', async () => {
    console.log('📡 جاري تحميل قائمة السور...');
    
    try {
        // 1. Load saved state
        await loadSavedState();
        
        // 2. Initialize UI
        initializeUI();
        
        // 3. Load Quran data
        await Promise.all([
            loadSurahs(),
            loadJuzData(),
            loadPrayerTimes().catch(err => console.warn('Prayer times failed:', err))
        ]);
        
        // 4. Setup event listeners
        setupEventListeners();
        
        // 5. Register Service Worker only on HTTP(S)
        registerServiceWorker();
        
        // 6. Load initial data
        if (state.stats.lastPositions && state.stats.lastPositions.length > 0) {
            const lastPos = state.stats.lastPositions[0];
            await loadSurah(lastPos.surah, false);
            state.currentAyah = lastPos.ayah;
            updateAyahDisplay();
        } else {
            await loadSurah(1, false);
        }
        
        // 7. Show app
        if (DOM.loadingScreen) DOM.loadingScreen.style.display = 'none';
        if (DOM.appContainer) DOM.appContainer.style.display = 'block';
        
        state.initialized = true;
        console.log('✅ Quran App initialized successfully');
        
        // Show welcome notification
        showNotification('مرحباً بك في تطبيق القرآن الكريم', 'success');
        
    } catch (error) {
        console.error('❌ فشل التهيئة:', error);
        showError('فشل تحميل التطبيق: ' + error.message);
        
        // Try to show app anyway
        if (DOM.loadingScreen) DOM.loadingScreen.style.display = 'none';
        if (DOM.appContainer) DOM.appContainer.style.display = 'block';
    }
});

// ==================== SERVICE WORKER REGISTRATION ====================
function registerServiceWorker() {
    // Only register if on HTTPS or localhost (not file://)
    if ('serviceWorker' in navigator && 
        (window.location.protocol === 'https:' || 
         window.location.hostname === 'localhost' || 
         window.location.hostname === '127.0.0.1')) {
        
        navigator.serviceWorker.register('service-worker.js')
            .then(registration => {
                console.log('✅ Service Worker registered:', registration);
            })
            .catch(error => {
                console.log('⚠️ Service Worker registration skipped (running locally):', error.message);
            });
    } else {
        console.log('ℹ️ Service Worker not required for local file system');
    }
}

// ==================== CORE FUNCTIONS ====================

async function loadSurahs() {
    try {
        const response = await fetch(`${CONFIG.API_BASE}/surah`);
        const data = await response.json();
        
        state.surahs = data.data.map(surah => ({
            number: surah.number,
            name: surah.englishName,
            arabicName: surah.name,
            englishName: surah.englishNameTranslation,
            ayahs: surah.numberOfAyahs,
            revelationType: surah.revelationType,
            type: surah.revelationType === 'Meccan' ? 'مكية' : 'مدنية',
            juz: []
        }));
        
        console.log(`✅ تم تحميل ${state.surahs.length} سورة`);
        renderSurahList();
        
    } catch (error) {
        console.error('Error loading surahs:', error);
        // Fallback to default data
        state.surahs = getDefaultSurahs();
        renderSurahList();
        showError('تعذر تحميل قائمة السور. استخدام البيانات المحلية.');
    }
}

function renderSurahList() {
    if (!DOM.surahList) return;
    
    DOM.surahList.innerHTML = '';
    
    state.surahs.forEach(surah => {
        const li = document.createElement('li');
        li.className = 'surah-item';
        li.dataset.surahNumber = surah.number;
        
        li.innerHTML = `
            <div class="surah-number">${surah.number}</div>
            <div class="surah-details">
                <div class="surah-name-arabic">${surah.arabicName}</div>
                <div class="surah-name-english">${surah.englishName}</div>
                <div class="surah-info">
                    <span class="ayahs">${surah.ayahs} آية</span>
                    <span class="type">${surah.type}</span>
                </div>
            </div>
        `;
        
        li.addEventListener('click', () => selectSurah(surah.number));
        DOM.surahList.appendChild(li);
    });
}

async function loadSurah(surahNumber, playFirstAyah = true) {
    console.log(`📖 جاري تحميل: سورة ${surahNumber}`);
    
    const surah = state.surahs.find(s => s.number == surahNumber);
    if (!surah) return;
    
    state.currentSurah = surah;
    state.currentAyah = 1;
    
    // Update UI
    if (DOM.surahDisplayName) DOM.surahDisplayName.textContent = surah.arabicName;
    if (DOM.nowPlayingTitle) DOM.nowPlayingTitle.textContent = `سورة ${surah.arabicName}`;
    if (DOM.ayahCount) DOM.ayahCount.textContent = `${surah.ayahs} آية`;
    
    // Highlight selected surah
    document.querySelectorAll('.surah-item').forEach(item => {
        item.classList.remove('active');
        if (item.dataset.surahNumber == surahNumber) {
            item.classList.add('active');
        }
    });
    
    try {
        // Load Arabic text
        const textResponse = await fetch(`${CONFIG.API_BASE}/surah/${surahNumber}/ar.alafasy`);
        if (textResponse.ok) {
            const textData = await textResponse.json();
            state.verses = textData.data.ayahs;
            renderQuranText();
        }
        
        // Load audio files
        await loadAudioFiles(surahNumber);
        
        if (playFirstAyah) {
            playAyah(1);
        }
        
        console.log(`✅ تم تحميل سورة ${surah.arabicName}`);
        
    } catch (error) {
        console.error('❌ خطأ في تحميل السورة:', error);
        showError('تعذر تحميل السورة. الرجاء المحاولة لاحقاً.');
    }
}

async function loadAudioFiles(surahNumber) {
    const reciter = state.reciters.find(r => r.id === state.currentReciter);
    if (!reciter || !state.currentSurah) return;
    
    console.log(`🎵 جاري تحميل الصوتيات للقارئ: ${reciter.name}`);
    
    const audioSources = [];
    const surahThreeDigit = surahNumber.toString().padStart(3, '0');
    
    // Map reciter IDs to correct directory names
    const reciterMapping = {
        'alafasy': 'Alafasy',
        'abdulbasitmurattal': 'AbdulBasitMurattal',
        'hussarymujawwad': 'Husary',
        'minshawimujawwad': 'Minshawy_Mujawwad',
        'abu_bakr_ash-shaatree': 'Abu_Bakr_Ash-Shaatree',
        'hudhaify': 'Hudhaify',
        'as_sudais': 'Sudais',
        'almuaiqly': 'MaherAlMuaiqly'
    };
    
    const reciterDir = reciterMapping[state.currentReciter] || state.currentReciter;
    const quality = state.audioQuality || '128';
    
    for (let ayah = 1; ayah <= state.currentSurah.ayahs; ayah++) {
        const ayahThreeDigit = ayah.toString().padStart(3, '0');
        
        // Primary source: EveryAyah.com
        const audioUrl = `${CONFIG.EVERY_AYAH_BASE}/${reciterDir}_${quality}kbps/${surahThreeDigit}${ayahThreeDigit}.mp3`;
        
        // Alternative source
        const altUrl = `https://cdn.islamic.network/quran/audio/${quality}/ar.${state.currentReciter}/${surahNumber}/${ayah}.mp3`;
        
        audioSources.push({
            number: ayah,
            url: audioUrl,
            altUrl: altUrl
        });
    }
    
    state.audioSources = audioSources;
    console.log(`✅ تم تحميل ${state.audioSources.length} ملف صوتي`);
    
    // Preload first ayah
    if (state.audioSources.length > 0 && DOM.audioPlayer) {
        DOM.audioPlayer.src = state.audioSources[0].url;
    }
}

// ==================== UI FUNCTIONS ====================

function initializeUI() {
    console.log('🎨 جاري تهيئة الواجهة...');
    
    // Set theme
    const savedTheme = localStorage.getItem('quran-theme') || 'light';
    document.documentElement.setAttribute('data-theme', savedTheme);
    state.theme = savedTheme;
    
    // Update theme icon
    if (DOM.themeToggle) {
        const themeIcon = DOM.themeToggle.querySelector('i');
        if (themeIcon) {
            themeIcon.className = savedTheme === 'dark' ? 'fas fa-sun' : 'fas fa-moon';
        }
    }
    
    // Populate reciter select
    if (DOM.reciterSelect) {
        DOM.reciterSelect.innerHTML = state.reciters.map(reciter => `
            <option value="${reciter.id}" ${reciter.id === state.currentReciter ? 'selected' : ''}>
                ${reciter.name}
            </option>
        `).join('');
    }
    
    // Update current reciter display
    const currentReciter = state.reciters.find(r => r.id === state.currentReciter);
    if (currentReciter && DOM.currentReciter) {
        DOM.currentReciter.textContent = currentReciter.name;
    }
    
    // Set playback speed
    if (DOM.speedSelect) DOM.speedSelect.value = state.playbackSpeed;
    
    // Set volume
    if (DOM.audioPlayer && DOM.volumeSlider) {
        DOM.audioPlayer.volume = DOM.volumeSlider.value / 100;
    }
    
    // Update text size
    if (DOM.textSizeLabel) DOM.textSizeLabel.textContent = `${state.fontSize}px`;
    if (DOM.fontSizeRange) DOM.fontSizeRange.value = state.fontSize;
    if (DOM.fontSizeValue) DOM.fontSizeValue.textContent = `${state.fontSize}px`;
    
    // Update bookmarks
    updateBookmarkUI();
    
    // Update stats
    updateProgressUI();
    
    // Initialize juz grid
    renderJuzGrid();
    
    console.log('✅ تم تهيئة الواجهة');
}

function updateBookmarkUI() {
    // Check if element exists
    if (!DOM.recentBookmarks) {
        console.warn('⚠️ recentBookmarks element not found');
        return;
    }
    
    // Update quick stats
    if (DOM.bookmarkCount) {
        DOM.bookmarkCount.textContent = state.bookmarks ? state.bookmarks.length : 0;
    }
    
    // Update recent bookmarks
    const recentBookmarks = state.bookmarks ? state.bookmarks.slice(0, 5) : [];
    
    if (recentBookmarks.length === 0) {
        DOM.recentBookmarks.innerHTML = `
            <div class="empty-state">
                <i class="far fa-bookmark"></i>
                <p>لا توجد إشارات مرجعية</p>
            </div>
        `;
        return;
    }
    
    DOM.recentBookmarks.innerHTML = recentBookmarks.map(bookmark => `
        <div class="bookmark-item" data-id="${bookmark.id}">
            <div class="bookmark-surah">${bookmark.surahName || 'سورة'}</div>
            <div class="bookmark-verse">
                <span>الآية ${bookmark.ayah}</span>
                <span class="bookmark-date">${formatDate(bookmark.timestamp)}</span>
            </div>
        </div>
    `).join('');
    
    // Add click listeners
    DOM.recentBookmarks.querySelectorAll('.bookmark-item').forEach(item => {
        item.addEventListener('click', () => {
            const bookmarkId = parseInt(item.dataset.id);
            const bookmark = state.bookmarks.find(b => b.id === bookmarkId);
            if (bookmark) {
                loadSurah(bookmark.surah, false);
                state.currentAyah = bookmark.ayah;
                updateAyahDisplay();
                highlightCurrentAyah();
            }
        });
    });
}

function renderQuranText() {
    if (!DOM.textContainer) return;
    
    DOM.textContainer.innerHTML = '';
    
    state.verses.forEach(verse => {
        const verseDiv = document.createElement('div');
        verseDiv.className = 'verse-container';
        verseDiv.dataset.ayah = verse.numberInSurah;
        
        verseDiv.innerHTML = `
            <div class="verse-header">
                <div class="verse-number">${verse.numberInSurah}</div>
                <div class="verse-actions">
                    <button class="verse-action-btn" title="إشارة مرجعية">
                        <i class="far fa-bookmark"></i>
                    </button>
                    <button class="verse-action-btn" title="نسخ">
                        <i class="far fa-copy"></i>
                    </button>
                </div>
            </div>
            <div class="verse-text">${verse.text} ﴿${verse.numberInSurah}﴾</div>
        `;
        
        verseDiv.addEventListener('click', () => {
            state.currentAyah = verse.numberInSurah;
            playAyah();
        });
        
        DOM.textContainer.appendChild(verseDiv);
    });
    
    highlightCurrentAyah();
}

function renderJuzGrid() {
    if (!DOM.juzGrid) return;
    
    DOM.juzGrid.innerHTML = '';
    
    for (let i = 1; i <= 30; i++) {
        const juzDiv = document.createElement('div');
        juzDiv.className = 'juz-item';
        juzDiv.textContent = i;
        juzDiv.title = `الجزء ${i}`;
        
        juzDiv.addEventListener('click', () => {
            // Simple implementation - goes to first surah of juz
            // In a full implementation, you would map juz to specific surahs
            alert(`الجزء ${i} - هذه الميزة تحت التطوير`);
        });
        
        DOM.juzGrid.appendChild(juzDiv);
    }
}

// ==================== HELPER FUNCTIONS ====================

function loadSavedState() {
    return new Promise((resolve) => {
        try {
            // Load settings
            const settings = JSON.parse(localStorage.getItem(CONFIG.STORAGE_KEYS.SETTINGS) || '{}');
            Object.assign(state, settings);
            
            // Load bookmarks
            state.bookmarks = JSON.parse(localStorage.getItem(CONFIG.STORAGE_KEYS.BOOKMARKS) || '[]');
            
            // Load notes
            state.notes = JSON.parse(localStorage.getItem(CONFIG.STORAGE_KEYS.NOTES) || '[]');
            
            // Load stats
            const savedStats = localStorage.getItem(CONFIG.STORAGE_KEYS.STATS);
            if (savedStats) {
                state.stats = JSON.parse(savedStats);
            }
            
            // Load progress
            const savedProgress = localStorage.getItem(CONFIG.STORAGE_KEYS.PROGRESS);
            if (savedProgress) {
                state.progress = JSON.parse(savedProgress);
            }
            
            console.log('✅ تم تحميل البيانات المحفوظة');
        } catch (error) {
            console.warn('⚠️ خطأ في تحميل البيانات المحفوظة:', error);
            // Initialize with defaults
            state.bookmarks = [];
            state.notes = [];
            state.stats = {
                totalListeningTime: 0,
                completedSurahs: [],
                favoriteReciters: {},
                lastPositions: [],
                achievements: {
                    firstListen: false,
                    tenHours: false,
                    completeQuran: false,
                    nightListener: false
                }
            };
            state.progress = {};
        }
        resolve();
    });
}

function saveState(key = null) {
    try {
        if (!key || key === 'SETTINGS') {
            localStorage.setItem(CONFIG.STORAGE_KEYS.SETTINGS, JSON.stringify({
                currentReciter: state.currentReciter,
                translation: state.translation,
                fontSize: state.fontSize,
                showTajweed: state.showTajweed,
                tajweedStyle: state.tajweedStyle,
                autoScroll: state.autoScroll,
                theme: state.theme,
                audioQuality: state.audioQuality,
                playbackSpeed: state.playbackSpeed,
                playbackMode: state.playbackMode
            }));
        }
        
        if (!key || key === 'BOOKMARKS') {
            localStorage.setItem(CONFIG.STORAGE_KEYS.BOOKMARKS, JSON.stringify(state.bookmarks));
        }
        
        if (!key || key === 'NOTES') {
            localStorage.setItem(CONFIG.STORAGE_KEYS.NOTES, JSON.stringify(state.notes));
        }
        
        if (!key || key === 'STATS') {
            localStorage.setItem(CONFIG.STORAGE_KEYS.STATS, JSON.stringify(state.stats));
        }
        
        if (!key || key === 'PROGRESS') {
            localStorage.setItem(CONFIG.STORAGE_KEYS.PROGRESS, JSON.stringify(state.progress));
        }
        
    } catch (error) {
        console.error('❌ خطأ في حفظ البيانات:', error);
    }
}

function showNotification(message, type = 'info') {
    console.log(`📢 ${type}: ${message}`);
    
    // Simple alert for now - you can enhance this with a proper notification system
    const colors = {
        success: '#28a745',
        error: '#dc3545',
        warning: '#ffc107',
        info: '#17a2b8'
    };
    
    const notification = document.createElement('div');
    notification.style.cssText = `
        position: fixed;
        bottom: 20px;
        right: 20px;
        background: ${colors[type] || colors.info};
        color: white;
        padding: 12px 20px;
        border-radius: 8px;
        box-shadow: 0 4px 12px rgba(0,0,0,0.2);
        z-index: 1000;
        max-width: 300px;
    `;
    
    notification.textContent = message;
    document.body.appendChild(notification);
    
    setTimeout(() => {
        notification.remove();
    }, 3000);
}

function showError(message) {
    showNotification(message, 'error');
}

function formatDate(timestamp) {
    const date = new Date(timestamp);
    const now = new Date();
    const diff = now - date;
    
    // Less than a minute
    if (diff < 60000) return 'الآن';
    
    // Less than an hour
    if (diff < 3600000) return `${Math.floor(diff / 60000)} دقيقة`;
    
    // Less than a day
    if (diff < 86400000) return `${Math.floor(diff / 3600000)} ساعة`;
    
    // Yesterday
    if (diff < 172800000) return 'أمس';
    
    // More than a day
    return `${Math.floor(diff / 86400000)} يوم`;
}

// ==================== SIMPLIFIED FUNCTIONS (to avoid errors) ====================

function playAyah(ayahNumber = state.currentAyah) {
    if (!state.audioSources || state.audioSources.length === 0 || !DOM.audioPlayer) {
        showError('لم يتم تحميل الصوتيات بعد');
        return;
    }
    
    const ayahIndex = ayahNumber - 1;
    if (ayahIndex >= state.audioSources.length) {
        state.isPlaying = false;
        updatePlayButton();
        showNotification('🎉 تم الانتهاء من السورة', 'success');
        return;
    }
    
    const audioSource = state.audioSources[ayahIndex];
    
    // Update current ayah
    state.currentAyah = ayahNumber;
    
    // Update UI
    updateAyahDisplay();
    highlightCurrentAyah();
    
    // Set audio source
    DOM.audioPlayer.src = audioSource.url;
    DOM.audioPlayer.playbackRate = state.playbackSpeed;
    
    const playPromise = DOM.audioPlayer.play();
    
    if (playPromise !== undefined) {
        playPromise.then(() => {
            state.isPlaying = true;
            updatePlayButton();
            
            // Update stats
            state.stats.totalListeningTime += 1;
            
            console.log(`▶️ تشغيل الآية ${state.currentAyah}`);
            
        }).catch(error => {
            console.error('❌ فشل تشغيل الصوت:', error);
            showError('تعذر تشغيل الصوت. الرجاء تجربة قارئ آخر.');
            state.isPlaying = false;
            updatePlayButton();
        });
    }
}

function updateAyahDisplay() {
    if (!state.currentSurah) return;
    
    // Update quick stats
    if (DOM.progressPercent) {
        DOM.progressPercent.textContent = `${Math.round((state.currentAyah / state.currentSurah.ayahs) * 100)}%`;
    }
    
    // Format listening time
    if (DOM.totalTime) {
        const hours = Math.floor(state.stats.totalListeningTime / 3600);
        const minutes = Math.floor((state.stats.totalListeningTime % 3600) / 60);
        DOM.totalTime.textContent = `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}`;
    }
}

function highlightCurrentAyah() {
    document.querySelectorAll('.verse-container').forEach(verse => {
        verse.classList.remove('active');
    });
    
    const currentVerse = document.querySelector(`.verse-container[data-ayah="${state.currentAyah}"]`);
    if (currentVerse) {
        currentVerse.classList.add('active');
    }
}

function updatePlayButton() {
    if (!DOM.playBtn) return;
    
    const icon = DOM.playBtn.querySelector('i');
    if (icon) {
        icon.className = state.isPlaying ? 'fas fa-pause' : 'fas fa-play';
    }
}

// ==================== BASIC EVENT LISTENERS ====================

function setupEventListeners() {
    console.log('🔧 جاري إعداد مستمعي الأحداث...');
    
    // Audio events
    if (DOM.audioPlayer) {
        DOM.audioPlayer.addEventListener('timeupdate', () => {
            if (DOM.progressBar && DOM.currentTime) {
                const progress = (DOM.audioPlayer.currentTime / DOM.audioPlayer.duration) * 100 || 0;
                DOM.progressBar.value = progress;
                DOM.currentTime.textContent = formatTime(DOM.audioPlayer.currentTime);
            }
        });
        
        DOM.audioPlayer.addEventListener('loadedmetadata', () => {
            if (DOM.duration) {
                DOM.duration.textContent = formatTime(DOM.audioPlayer.duration);
            }
        });
        
        DOM.audioPlayer.addEventListener('ended', () => {
            if (state.currentAyah < state.currentSurah.ayahs) {
                playAyah(state.currentAyah + 1);
            }
        });
    }
    
    // Player controls
    if (DOM.playBtn) {
        DOM.playBtn.addEventListener('click', togglePlayPause);
    }
    
    if (DOM.prevBtn) {
        DOM.prevBtn.addEventListener('click', () => {
            if (state.currentAyah > 1) {
                playAyah(state.currentAyah - 1);
            }
        });
    }
    
    if (DOM.nextBtn) {
        DOM.nextBtn.addEventListener('click', () => {
            if (state.currentAyah < state.currentSurah.ayahs) {
                playAyah(state.currentAyah + 1);
            }
        });
    }
    
    if (DOM.bookmarkBtn) {
        DOM.bookmarkBtn.addEventListener('click', addBookmark);
    }
    
    // Theme toggle
    if (DOM.themeToggle) {
        DOM.themeToggle.addEventListener('click', toggleTheme);
    }
    
    // Reciter change
    if (DOM.reciterSelect) {
        DOM.reciterSelect.addEventListener('change', handleReciterChange);
    }
    
    console.log('✅ تم إعداد مستمعي الأحداث');
}

function togglePlayPause() {
    if (!state.currentSurah) {
        showError('الرجاء اختيار سورة أولاً');
        return;
    }
    
    if (state.isPlaying) {
        DOM.audioPlayer.pause();
        state.isPlaying = false;
    } else {
        playAyah(state.currentAyah);
    }
    updatePlayButton();
}

function addBookmark() {
    if (!state.currentSurah || !state.currentAyah) return;
    
    const bookmark = {
        id: Date.now(),
        surah: state.currentSurah.number,
        ayah: state.currentAyah,
        surahName: state.currentSurah.arabicName,
        timestamp: Date.now(),
        note: '',
        tags: []
    };
    
    state.bookmarks = state.bookmarks || [];
    state.bookmarks.unshift(bookmark);
    saveState('BOOKMARKS');
    
    updateBookmarkUI();
    showNotification('تمت إضافة الإشارة المرجعية', 'success');
}

function handleReciterChange(event) {
    const reciterId = event.target.value;
    const reciter = state.reciters.find(r => r.id === reciterId);
    
    if (!reciter || !state.currentSurah) return;
    
    state.currentReciter = reciterId;
    if (DOM.currentReciter) {
        DOM.currentReciter.textContent = reciter.name;
    }
    
    // Reload audio with new reciter
    loadAudioFiles(state.currentSurah.number).then(() => {
        if (state.isPlaying) {
            playAyah(state.currentAyah);
        }
        showNotification(`تم التغيير إلى القارئ: ${reciter.name}`, 'success');
        saveState('SETTINGS');
    });
}

function toggleTheme() {
    const newTheme = state.theme === 'light' ? 'dark' : 'light';
    document.documentElement.setAttribute('data-theme', newTheme);
    state.theme = newTheme;
    
    if (DOM.themeToggle) {
        const themeIcon = DOM.themeToggle.querySelector('i');
        if (themeIcon) {
            themeIcon.className = newTheme === 'dark' ? 'fas fa-sun' : 'fas fa-moon';
        }
    }
    
    localStorage.setItem('quran-theme', newTheme);
    saveState('SETTINGS');
}

// ==================== UTILITY FUNCTIONS ====================

function formatTime(seconds) {
    if (isNaN(seconds)) return '0:00';
    
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, '0')}`;
}

function getDefaultSurahs() {
    return [
        { number: 1, name: 'Al-Fatihah', arabicName: 'الفاتحة', englishName: 'The Opening', ayahs: 7, type: 'مكية', revelationType: 'Meccan' },
        { number: 2, name: 'Al-Baqarah', arabicName: 'البقرة', englishName: 'The Cow', ayahs: 286, type: 'مدنية', revelationType: 'Medinan' },
        { number: 3, name: 'Aal-E-Imran', arabicName: 'آل عمران', englishName: 'Family of Imran', ayahs: 200, type: 'مدنية', revelationType: 'Medinan' }
    ];
}

function loadJuzData() {
    state.juz = Array.from({ length: 30 }, (_, i) => ({
        number: i + 1,
        surahs: []
    }));
    return Promise.resolve();
}

async function loadPrayerTimes() {
    try {
        const response = await fetch(`${CONFIG.PRAYER_API}/timingsByCity?city=Mecca&country=Saudi Arabia&method=3`);
        const data = await response.json();
        
        if (data.code === 200) {
            state.prayerTimes = data.data.timings;
            updatePrayerTimesUI();
        }
    } catch (error) {
        console.warn('❌ خطأ في تحميل أوقات الصلاة:', error);
    }
}

function updatePrayerTimesUI() {
    if (!state.prayerTimes) return;
    
    if (DOM.prayerTimes.fajr) DOM.prayerTimes.fajr.textContent = state.prayerTimes.Fajr;
    if (DOM.prayerTimes.dhuhr) DOM.prayerTimes.dhuhr.textContent = state.prayerTimes.Dhuhr;
    if (DOM.prayerTimes.asr) DOM.prayerTimes.asr.textContent = state.prayerTimes.Asr;
    if (DOM.prayerTimes.maghrib) DOM.prayerTimes.maghrib.textContent = state.prayerTimes.Maghrib;
    if (DOM.prayerTimes.isha) DOM.prayerTimes.isha.textContent = state.prayerTimes.Isha;
}

function selectSurah(surahNumber) {
    loadSurah(surahNumber);
}

function updateProgressUI() {
    // Simple implementation
    const hours = Math.floor(state.stats.totalListeningTime / 3600);
    const minutes = Math.floor((state.stats.totalListeningTime % 3600) / 60);
    
    if (DOM.statListeningTime) {
        DOM.statListeningTime.textContent = `${hours} ساعة ${minutes} دقيقة`;
    }
    
    if (DOM.statCompletedSurahs) {
        DOM.statCompletedSurahs.textContent = state.stats.completedSurahs ? state.stats.completedSurahs.length : 0;
    }
    
    if (DOM.statFavoriteReciter) {
        const favorite = Object.entries(state.stats.favoriteReciters || {}).sort((a, b) => b[1] - a[1])[0];
        DOM.statFavoriteReciter.textContent = favorite ? favorite[0] : '-';
    }
    
    if (DOM.statTotalBookmarks) {
        DOM.statTotalBookmarks.textContent = state.bookmarks ? state.bookmarks.length : 0;
    }
}

console.log('📦 Quran App script loaded successfully!');