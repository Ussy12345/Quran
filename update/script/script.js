// Quran App - Complete Fixed Version with Working Audio
console.log('🚀 Quran App loaded successfully!');

// ==================== CONSTANTS & CONFIG ====================
const CONFIG = {
    API_BASE: 'https://api.alquran.cloud/v1',
    EVERY_AYAH_BASE: 'https://everyayah.com/data',
    PRAYER_API: 'https://api.aladhan.com/v1',
    DEFAULT_RECITER: 'Alafasy_128kbps',
    STORAGE_KEYS: {
        SETTINGS: 'quran_app_settings',
        BOOKMARKS: 'quran_app_bookmarks',
        PROGRESS: 'quran_app_progress',
        NOTES: 'quran_app_notes',
        STATS: 'quran_app_stats'
    },
    VERSION: '2.0.0'
};

// ==================== STATE MANAGEMENT ====================
const state = {
    // App State
    initialized: false,
    currentView: 'home',
    
    // Quran Data
    surahs: [],
    currentSurah: null,
    currentAyah: 1,
    verses: [],
    
    // Audio State - FIXED: Using correct reciter identifiers
    reciters: [
        { id: 'Alafasy_128kbps', name: 'مشاري العفاسي', englishName: 'Mishary Alafasy', server: 'alafasy' },
        { id: 'Husary_128kbps', name: 'محمود خليل الحصري', englishName: 'Mahmoud Al-Hussary', server: 'husary' },
        { id: 'AbdulBaset_128kbps', name: 'عبد الباسط عبد الصمد', englishName: 'Abdul Basit', server: 'abdulbaset' },
        { id: 'Minshawi_Mujawwad_128kbps', name: 'محمد صديق المنشاوي', englishName: 'Mohamed Siddiq Al-Minshawi', server: 'minshawi' },
        { id: 'MaherAlMuaiqly128kbps', name: 'ماهر المعيقلي', englishName: 'Maher Al-Muaiqly', server: 'maher' },
        { id: 'Hudhaify_128kbps', name: 'علي الحذيفي', englishName: 'Ali Al-Hudhaify', server: 'hudhaify' },
        { id: 'Sudais_128kbps', name: 'عبد الرحمن السديس', englishName: 'Abdurrahman As-Sudais', server: 'sudais' },
        { id: 'Shatri_128kbps', name: 'أبو بكر الشاطري', englishName: 'Abu Bakr Al-Shatri', server: 'shatri' }
    ],
    currentReciter: CONFIG.DEFAULT_RECITER,
    audioSources: [],
    isPlaying: false,
    playbackMode: 'verse',
    repeatMode: { enabled: false, count: 0, current: 0 },
    audioQuality: '128',
    playbackSpeed: 1,
    isAudioLoading: false,
    
    // UI State
    fontSize: 28,
    showTranslation: false,
    autoScroll: true,
    theme: 'light',
    
    // User Data
    bookmarks: [],
    notes: [],
    stats: {
        totalListeningTime: 0,
        completedSurahs: [],
        favoriteReciters: {},
        lastPositions: []
    },
    
    // Prayer Times
    prayerTimes: null,
    nextPrayer: null
};

// ==================== DOM ELEMENTS ====================
const DOM = {
    // Loading
    loadingScreen: document.getElementById('loadingScreen'),
    appContainer: document.getElementById('appContainer'),
    
    // Header
    themeToggle: document.getElementById('themeToggle'),
    dashboardBtn: document.getElementById('dashboardBtn'),
    settingsBtn: document.getElementById('settingsBtn'),
    
    // Quick Stats
    totalTime: document.getElementById('totalTime'),
    bookmarkCount: document.getElementById('bookmarkCount'),
    progressPercent: document.getElementById('progressPercent'),
    currentPrayer: document.getElementById('currentPrayer'),
    
    // Player
    playBtn: document.getElementById('playBtn'),
    prevBtn: document.getElementById('prevBtn'),
    nextBtn: document.getElementById('nextBtn'),
    repeatBtn: document.getElementById('repeatBtn'),
    bookmarkBtn: document.getElementById('bookmarkBtn'),
    progressBar: document.getElementById('progressBar'),
    currentTime: document.getElementById('currentTime'),
    duration: document.getElementById('duration'),
    nowPlayingTitle: document.getElementById('nowPlayingTitle'),
    currentReciter: document.getElementById('currentReciter'),
    reciterSelect: document.getElementById('reciterSelect'),
    translationSelect: document.getElementById('translationSelect'),
    volumeSlider: document.getElementById('volumeSlider'),
    speedSelect: document.getElementById('speedSelect'),
    
    // Audio
    audioPlayer: document.getElementById('audioPlayer'),
    
    // Quick Actions
    lastPositionBtn: document.getElementById('lastPositionBtn'),
    randomAyahBtn: document.getElementById('randomAyahBtn'),
    favoriteBtn: document.getElementById('favoriteBtn'),
    notesBtn: document.getElementById('notesBtn'),
    
    // Surah List
    surahList: document.getElementById('surahList'),
    searchSurah: document.getElementById('searchSurah'),
    clearSearch: document.getElementById('clearSearch'),
    
    // Text Display
    surahDisplayName: document.getElementById('surahDisplayName'),
    ayahCount: document.getElementById('ayahCount'),
    textContainer: document.getElementById('textContainer'),
    textSizeDown: document.getElementById('textSizeDown'),
    textSizeUp: document.getElementById('textSizeUp'),
    textSizeLabel: document.getElementById('textSizeLabel'),
    toggleTranslation: document.getElementById('toggleTranslation'),
    autoScrollBtn: document.getElementById('autoScrollBtn'),
    
    // Right Panel
    juzGrid: document.getElementById('juzGrid'),
    fajrTime: document.getElementById('fajrTime'),
    dhuhrTime: document.getElementById('dhuhrTime'),
    asrTime: document.getElementById('asrTime'),
    maghribTime: document.getElementById('maghribTime'),
    ishaTime: document.getElementById('ishaTime'),
    nextPrayerName: document.getElementById('nextPrayerName'),
    nextPrayerTime: document.getElementById('nextPrayerTime'),
    quickNote: document.getElementById('quickNote'),
    saveNoteBtn: document.getElementById('saveNoteBtn'),
    recentBookmarks: document.getElementById('recentBookmarks'),
    
    // Modals
    modalOverlay: document.getElementById('modalOverlay'),
    dashboardModal: document.getElementById('dashboardModal'),
    settingsModal: document.getElementById('settingsModal'),
    
    // Dashboard Stats
    statListeningTime: document.getElementById('statListeningTime'),
    statCompletedSurahs: document.getElementById('statCompletedSurahs'),
    statFavoriteReciter: document.getElementById('statFavoriteReciter'),
    statTotalBookmarks: document.getElementById('statTotalBookmarks'),
    
    // Settings
    qualitySelect: document.getElementById('qualitySelect'),
    autoRepeatSelect: document.getElementById('autoRepeatSelect'),
    fontSizeRange: document.getElementById('fontSizeRange'),
    fontSizeValue: document.getElementById('fontSizeValue'),
    
    // Notifications
    notificationArea: document.getElementById('notificationArea')
};

// ==================== INITIALIZATION ====================
document.addEventListener('DOMContentLoaded', async () => {
    console.log('🌙 Quran App - Initializing...');
    
    try {
        // 1. Load saved state
        await loadSavedState();
        
        // 2. Initialize UI
        initializeUI();
        
        // 3. Load Quran data
        await loadSurahs();
        
        // 4. Setup event listeners
        setupEventListeners();
        
        // 5. Load initial data
        if (state.stats.lastPositions && state.stats.lastPositions.length > 0) {
            const lastPos = state.stats.lastPositions[0];
            await loadSurah(lastPos.surah, false);
            state.currentAyah = lastPos.ayah;
            updateAyahDisplay();
        } else {
            await loadSurah(1, false);
        }
        
        // 6. Load prayer times
        loadPrayerTimes();
        
        // 7. Show app
        setTimeout(() => {
            if (DOM.loadingScreen) DOM.loadingScreen.style.display = 'none';
            if (DOM.appContainer) {
                DOM.appContainer.style.display = 'block';
                setTimeout(() => {
                    DOM.appContainer.classList.add('loaded');
                }, 100);
            }
        }, 500);
        
        state.initialized = true;
        console.log('✅ Quran App initialized successfully');
        
        // Show welcome notification
        showNotification('مرحباً بك في تطبيق القرآن الكريم', 'success');
        
    } catch (error) {
        console.error('❌ فشل التهيئة:', error);
        showError('فشل تحميل التطبيق: ' + error.message);
        
        // Try to show app anyway
        if (DOM.loadingScreen) DOM.loadingScreen.style.display = 'none';
        if (DOM.appContainer) {
            DOM.appContainer.style.display = 'block';
            DOM.appContainer.classList.add('loaded');
        }
    }
});

// ==================== CORE FUNCTIONS ====================

async function loadSurahs() {
    try {
        console.log('📡 جاري تحميل قائمة السور...');
        const response = await fetch(`${CONFIG.API_BASE}/surah`);
        
        if (!response.ok) {
            throw new Error('فشل تحميل السور من الخادم');
        }
        
        const data = await response.json();
        
        state.surahs = data.data.map(surah => ({
            number: surah.number,
            name: surah.englishName,
            arabicName: surah.name,
            englishName: surah.englishNameTranslation,
            ayahs: surah.numberOfAyahs,
            revelationType: surah.revelationType,
            type: surah.revelationType === 'Meccan' ? 'مكية' : 'مدنية'
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
    
    if (state.surahs.length === 0) {
        DOM.surahList.innerHTML = '<li class="loading">فشل تحميل السور. الرجاء تحديث الصفحة.</li>';
        return;
    }
    
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
    if (!surah) {
        showError('السورة غير موجودة');
        return;
    }
    
    state.currentSurah = surah;
    state.currentAyah = 1;
    
    // Update UI
    if (DOM.surahDisplayName) DOM.surahDisplayName.textContent = surah.arabicName;
    if (DOM.nowPlayingTitle) DOM.nowPlayingTitle.textContent = `سورة ${surah.arabicName}`;
    if (DOM.ayahCount) DOM.ayahCount.textContent = `${surah.ayahs} آية`;
    
    // Highlight selected surah in list
    document.querySelectorAll('.surah-item').forEach(item => {
        item.classList.remove('active');
        if (item.dataset.surahNumber == surahNumber) {
            item.classList.add('active');
        }
    });
    
    try {
        // Load Arabic text
        console.log(`📜 جاري تحميل نص السورة...`);
        const textResponse = await fetch(`${CONFIG.API_BASE}/surah/${surahNumber}/ar.alafasy`);
        
        if (textResponse.ok) {
            const textData = await textResponse.json();
            state.verses = textData.data.ayahs;
            renderQuranText();
            console.log(`✅ تم تحميل ${state.verses.length} آية`);
        } else {
            throw new Error('فشل تحميل نص السورة');
        }
        
        // Load audio files
        await loadAudioFiles(surahNumber);
        
        if (playFirstAyah) {
            setTimeout(() => playAyah(1), 500); // Small delay to ensure audio is loaded
        }
        
        console.log(`✅ تم تحميل سورة ${surah.arabicName}`);
        
    } catch (error) {
        console.error('❌ خطأ في تحميل السورة:', error);
        showError('تعذر تحميل السورة. الرجاء المحاولة لاحقاً.');
    }
}

// ==================== FIXED AUDIO FUNCTIONS ====================

async function loadAudioFiles(surahNumber) {
    const reciter = state.reciters.find(r => r.id === state.currentReciter);
    if (!reciter || !state.currentSurah) return;
    
    console.log(`🎵 جاري تحميل الصوتيات للقارئ: ${reciter.name}`);
    
    state.audioSources = [];
    const surahThreeDigit = surahNumber.toString().padStart(3, '0');
    
    // Generate audio URLs for all ayahs
    for (let ayah = 1; ayah <= state.currentSurah.ayahs; ayah++) {
        const ayahThreeDigit = ayah.toString().padStart(3, '0');
        
        // FIXED: Correct URL format for everyayah.com
        const audioUrl = `${CONFIG.EVERY_AYAH_BASE}/${state.currentReciter}/${surahThreeDigit}${ayahThreeDigit}.mp3`;
        
        // Alternative sources in case primary fails
        const alternativeUrls = [
            `https://cdn.islamic.network/quran/audio/128/${reciter.server}/${surahNumber}/${ayah}.mp3`,
            `https://server8.mp3quran.net/${reciter.server}/${surahThreeDigit}${ayahThreeDigit}.mp3`
        ];
        
        state.audioSources.push({
            number: ayah,
            url: audioUrl,
            altUrls: alternativeUrls
        });
    }
    
    console.log(`✅ تم تحميل ${state.audioSources.length} ملف صوتي`);
    
    // Preload first ayah
    if (state.audioSources.length > 0 && DOM.audioPlayer) {
        await preloadAudio(state.audioSources[0]);
    }
}

async function preloadAudio(audioSource) {
    return new Promise((resolve) => {
        if (!audioSource || !DOM.audioPlayer) {
            resolve(false);
            return;
        }
        
        // Try primary URL first
        DOM.audioPlayer.src = audioSource.url;
        DOM.audioPlayer.load();
        
        const successHandler = () => {
            console.log(`✅ تم تحميل الصوت: ${audioSource.url}`);
            DOM.audioPlayer.removeEventListener('canplaythrough', successHandler);
            DOM.audioPlayer.removeEventListener('error', errorHandler);
            resolve(true);
        };
        
        const errorHandler = async () => {
            console.warn(`⚠️ فشل تحميل الصوت الأساسي: ${audioSource.url}`);
            
            // Try alternative URLs
            for (let i = 0; i < audioSource.altUrls.length; i++) {
                try {
                    console.log(`🔄 تجربة مصدر بديل ${i + 1}: ${audioSource.altUrls[i]}`);
                    DOM.audioPlayer.src = audioSource.altUrls[i];
                    DOM.audioPlayer.load();
                    
                    await new Promise(res => {
                        const altSuccess = () => {
                            console.log(`✅ نجح المصدر البديل: ${audioSource.altUrls[i]}`);
                            DOM.audioPlayer.removeEventListener('canplaythrough', altSuccess);
                            DOM.audioPlayer.removeEventListener('error', altError);
                            res(true);
                        };
                        
                        const altError = () => {
                            DOM.audioPlayer.removeEventListener('canplaythrough', altSuccess);
                            DOM.audioPlayer.removeEventListener('error', altError);
                            res(false);
                        };
                        
                        DOM.audioPlayer.addEventListener('canplaythrough', altSuccess, { once: true });
                        DOM.audioPlayer.addEventListener('error', altError, { once: true });
                        
                        // Timeout for alternative source
                        setTimeout(() => {
                            DOM.audioPlayer.removeEventListener('canplaythrough', altSuccess);
                            DOM.audioPlayer.removeEventListener('error', altError);
                            res(false);
                        }, 3000);
                    });
                    
                    if (DOM.audioPlayer.src.includes(audioSource.altUrls[i])) {
                        resolve(true);
                        return;
                    }
                } catch (e) {
                    console.warn(`❌ فشل المصدر البديل ${i + 1}:`, e);
                }
            }
            
            console.error('❌ فشل جميع مصادر الصوت');
            resolve(false);
        };
        
        DOM.audioPlayer.addEventListener('canplaythrough', successHandler, { once: true });
        DOM.audioPlayer.addEventListener('error', errorHandler, { once: true });
        
        // Timeout
        setTimeout(() => {
            DOM.audioPlayer.removeEventListener('canplaythrough', successHandler);
            DOM.audioPlayer.removeEventListener('error', errorHandler);
            resolve(false);
        }, 5000);
    });
}

function playAyah(ayahNumber = state.currentAyah) {
    if (state.isAudioLoading) {
        console.log('⏳ الصوت قيد التحميل، الرجاء الانتظار...');
        return;
    }
    
    if (!state.audioSources || state.audioSources.length === 0 || !DOM.audioPlayer) {
        showError('لم يتم تحميل الصوتيات بعد');
        return;
    }
    
    const ayahIndex = ayahNumber - 1;
    if (ayahIndex >= state.audioSources.length) {
        // End of surah
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
    
    // Check if we need to load new audio
    if (DOM.audioPlayer.src !== audioSource.url && 
        !audioSource.altUrls.some(alt => DOM.audioPlayer.src.includes(alt))) {
        
        state.isAudioLoading = true;
        updatePlayButton();
        
        preloadAudio(audioSource).then(success => {
            state.isAudioLoading = false;
            
            if (success) {
                // Play the audio
                DOM.audioPlayer.playbackRate = state.playbackSpeed;
                const playPromise = DOM.audioPlayer.play();
                
                if (playPromise !== undefined) {
                    playPromise.then(() => {
                        state.isPlaying = true;
                        updatePlayButton();
                        
                        // Update stats
                        updateListeningTime();
                        console.log(`▶️ تشغيل الآية ${state.currentAyah}`);
                        
                    }).catch(error => {
                        console.error('❌ فشل تشغيل الصوت:', error);
                        showError('تعذر تشغيل الصوت. الرجاء تجربة قارئ آخر.');
                        state.isPlaying = false;
                        updatePlayButton();
                    });
                }
            } else {
                showError('تعذر تحميل الصوت. الرجاء تجربة قارئ آخر.');
                state.isPlaying = false;
                updatePlayButton();
            }
        });
    } else {
        // Audio already loaded, just play it
        DOM.audioPlayer.playbackRate = state.playbackSpeed;
        const playPromise = DOM.audioPlayer.play();
        
        if (playPromise !== undefined) {
            playPromise.then(() => {
                state.isPlaying = true;
                updatePlayButton();
                
                // Update stats
                updateListeningTime();
                console.log(`▶️ تشغيل الآية ${state.currentAyah}`);
                
            }).catch(error => {
                console.error('❌ فشل تشغيل الصوت:', error);
                showError('تعذر تشغيل الصوت. الرجاء تجربة قارئ آخر.');
                state.isPlaying = false;
                updatePlayButton();
            });
        }
    }
}

function updateListeningTime() {
    if (!state.stats.totalListeningTime) {
        state.stats.totalListeningTime = 0;
    }
    
    // Add 1 second for each ayah played
    state.stats.totalListeningTime += 1;
    
    // Update favorite reciters
    if (!state.stats.favoriteReciters[state.currentReciter]) {
        state.stats.favoriteReciters[state.currentReciter] = 0;
    }
    state.stats.favoriteReciters[state.currentReciter] += 1;
    
    // Save stats periodically
    if (state.stats.totalListeningTime % 30 === 0) {
        saveState();
        updateStats();
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
        console.log(`✅ Loaded ${state.reciters.length} reciters`);
    }
    
    // Update current reciter display
    const currentReciter = state.reciters.find(r => r.id === state.currentReciter);
    if (currentReciter && DOM.currentReciter) {
        DOM.currentReciter.textContent = currentReciter.name;
        console.log(`🎤 Current reciter: ${currentReciter.name}`);
    }
    
    // Set playback speed
    if (DOM.speedSelect) {
        DOM.speedSelect.value = state.playbackSpeed;
    }
    
    // Set volume
    if (DOM.audioPlayer && DOM.volumeSlider) {
        DOM.audioPlayer.volume = DOM.volumeSlider.value / 100;
    }
    
    // Update text size
    if (DOM.textSizeLabel) DOM.textSizeLabel.textContent = `${state.fontSize}px`;
    if (DOM.fontSizeRange) DOM.fontSizeRange.value = state.fontSize;
    if (DOM.fontSizeValue) DOM.fontSizeValue.textContent = `${state.fontSize}px`;
    
    // Initialize bookmarks
    if (!state.bookmarks) {
        state.bookmarks = [];
    }
    updateBookmarkUI();
    
    // Update stats
    updateStats();
    
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
        const count = state.bookmarks ? state.bookmarks.length : 0;
        DOM.bookmarkCount.textContent = count;
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
    
    DOM.recentBookmarks.innerHTML = recentBookmarks.map(bookmark => {
        const surahName = bookmark.surahName || 'سورة';
        const ayah = bookmark.ayah || 1;
        const timestamp = bookmark.timestamp || Date.now();
        
        return `
            <div class="bookmark-item" data-id="${bookmark.id}">
                <div class="bookmark-surah">${surahName}</div>
                <div class="bookmark-verse">
                    <span>الآية ${ayah}</span>
                    <span class="bookmark-date">${formatDate(timestamp)}</span>
                </div>
            </div>
        `;
    }).join('');
    
    // Add click listeners
    DOM.recentBookmarks.querySelectorAll('.bookmark-item').forEach(item => {
        item.addEventListener('click', () => {
            const bookmarkId = parseInt(item.dataset.id);
            const bookmark = state.bookmarks.find(b => b.id === bookmarkId);
            if (bookmark) {
                loadSurah(bookmark.surah, false);
                state.currentAyah = bookmark.ayah || 1;
                updateAyahDisplay();
                highlightCurrentAyah();
            }
        });
    });
}

function renderQuranText() {
    if (!DOM.textContainer) return;
    
    DOM.textContainer.innerHTML = '';
    
    if (!state.verses || state.verses.length === 0) {
        DOM.textContainer.innerHTML = `
            <div class="placeholder">
                <i class="fas fa-exclamation-triangle"></i>
                <h4>تعذر تحميل النص</h4>
                <p>الرجاء المحاولة مرة أخرى</p>
            </div>
        `;
        return;
    }
    
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
                    <button class="verse-action-btn copy-btn" title="نسخ الآية">
                        <i class="far fa-copy"></i>
                    </button>
                </div>
            </div>
            <div class="verse-text" style="font-size: ${state.fontSize}px">${verse.text} ﴿${verse.numberInSurah}﴾</div>
        `;
        
        // Click to play this ayah
        verseDiv.addEventListener('click', () => {
            state.currentAyah = verse.numberInSurah;
            playAyah();
        });
        
        // Bookmark button
        const bookmarkBtn = verseDiv.querySelector('.verse-action-btn');
        bookmarkBtn.addEventListener('click', (e) => {
            e.stopPropagation();
            addBookmark();
        });
        
        // Copy button
        const copyBtn = verseDiv.querySelector('.copy-btn');
        copyBtn.addEventListener('click', (e) => {
            e.stopPropagation();
            copyVerseToClipboard(verse.text, verse.numberInSurah);
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
        
        juzDiv.addEventListener('click', async () => {
            try {
                // Show loading
                showNotification(`جاري تحميل بداية الجزء ${i}...`, 'info');
                
                // Get the starting surah for this juz (simplified mapping)
                let startingSurah = 1;
                if (i === 1) startingSurah = 1;
                else if (i === 2) startingSurah = 2;
                else if (i === 3) startingSurah = 2;
                else if (i <= 5) startingSurah = 4;
                else if (i <= 7) startingSurah = 5;
                else if (i <= 9) startingSurah = 7;
                else if (i <= 11) startingSurah = 9;
                else if (i <= 14) startingSurah = 11;
                else if (i <= 16) startingSurah = 14;
                else if (i <= 18) startingSurah = 17;
                else if (i <= 21) startingSurah = 21;
                else if (i <= 23) startingSurah = 25;
                else if (i <= 25) startingSurah = 29;
                else if (i <= 27) startingSurah = 33;
                else if (i <= 29) startingSurah = 39;
                else startingSurah = 67;
                
                await loadSurah(startingSurah, true);
                showNotification(`تم تحميل بداية الجزء ${i}`, 'success');
            } catch (error) {
                showError('تعذر تحميل الجزء. الرجاء المحاولة لاحقاً.');
            }
        });
        
        DOM.juzGrid.appendChild(juzDiv);
    }
}

// ==================== HELPER FUNCTIONS ====================

async function loadSavedState() {
    console.log('💾 Loading saved state...');
    
    try {
        // Load settings
        const settingsStr = localStorage.getItem(CONFIG.STORAGE_KEYS.SETTINGS);
        if (settingsStr) {
            const settings = JSON.parse(settingsStr);
            Object.assign(state, settings);
        }
        
        // Load bookmarks
        const bookmarksStr = localStorage.getItem(CONFIG.STORAGE_KEYS.BOOKMARKS);
        if (bookmarksStr) {
            state.bookmarks = JSON.parse(bookmarksStr);
            if (!Array.isArray(state.bookmarks)) {
                state.bookmarks = [];
            }
        } else {
            state.bookmarks = [];
        }
        
        // Load stats
        const statsStr = localStorage.getItem(CONFIG.STORAGE_KEYS.STATS);
        if (statsStr) {
            state.stats = JSON.parse(statsStr);
        } else {
            state.stats = {
                totalListeningTime: 0,
                completedSurahs: [],
                favoriteReciters: {},
                lastPositions: []
            };
        }
        
        console.log('✅ تم تحميل البيانات المحفوظة');
    } catch (error) {
        console.warn('⚠️ خطأ في تحميل البيانات المحفوظة:', error);
        // Initialize with defaults
        state.bookmarks = [];
        state.stats = {
            totalListeningTime: 0,
            completedSurahs: [],
            favoriteReciters: {},
            lastPositions: []
        };
    }
}

function saveState() {
    try {
        localStorage.setItem(CONFIG.STORAGE_KEYS.SETTINGS, JSON.stringify({
            currentReciter: state.currentReciter,
            fontSize: state.fontSize,
            autoScroll: state.autoScroll,
            theme: state.theme,
            audioQuality: state.audioQuality,
            playbackSpeed: state.playbackSpeed,
            playbackMode: state.playbackMode
        }));
        
        localStorage.setItem(CONFIG.STORAGE_KEYS.BOOKMARKS, JSON.stringify(state.bookmarks));
        localStorage.setItem(CONFIG.STORAGE_KEYS.STATS, JSON.stringify(state.stats));
        
    } catch (error) {
        console.error('❌ خطأ في حفظ البيانات:', error);
    }
}

function showNotification(message, type = 'info') {
    console.log(`📢 ${type}: ${message}`);
    
    if (!DOM.notificationArea) return;
    
    const colors = {
        success: '#28a745',
        error: '#dc3545',
        warning: '#ffc107',
        info: '#17a2b8'
    };
    
    const icons = {
        success: 'check-circle',
        error: 'exclamation-circle',
        warning: 'exclamation-triangle',
        info: 'info-circle'
    };
    
    const notification = document.createElement('div');
    notification.className = 'notification ' + type;
    notification.innerHTML = `
        <div class="notification-header">
            <div class="notification-title">
                <i class="fas fa-${icons[type]}"></i>
                <span>${type === 'success' ? 'نجاح' : type === 'error' ? 'خطأ' : type === 'warning' ? 'تحذير' : 'معلومة'}</span>
            </div>
            <button class="notification-close">&times;</button>
        </div>
        <div class="notification-message">${message}</div>
    `;
    
    DOM.notificationArea.appendChild(notification);
    
    // Add close button functionality
    notification.querySelector('.notification-close').addEventListener('click', () => {
        notification.remove();
    });
    
    // Auto-remove after 5 seconds
    setTimeout(() => {
        if (notification.parentNode) {
            notification.remove();
        }
    }, 5000);
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

function updateAyahDisplay() {
    if (!state.currentSurah) return;
    
    // Update progress percentage
    if (DOM.progressPercent) {
        const percent = Math.round((state.currentAyah / state.currentSurah.ayahs) * 100);
        DOM.progressPercent.textContent = `${percent}%`;
    }
    
    // Update listening time
    if (DOM.totalTime) {
        const hours = Math.floor(state.stats.totalListeningTime / 3600);
        const minutes = Math.floor((state.stats.totalListeningTime % 3600) / 60);
        DOM.totalTime.textContent = `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}`;
    }
    
    // Auto-scroll to current ayah
    if (state.autoScroll) {
        setTimeout(() => {
            const currentVerse = document.querySelector(`.verse-container[data-ayah="${state.currentAyah}"]`);
            if (currentVerse) {
                currentVerse.scrollIntoView({ behavior: 'smooth', block: 'center' });
            }
        }, 100);
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
        if (state.isAudioLoading) {
            icon.className = 'fas fa-spinner fa-spin';
            DOM.playBtn.title = 'جاري التحميل...';
        } else {
            icon.className = state.isPlaying ? 'fas fa-pause' : 'fas fa-play';
            DOM.playBtn.title = state.isPlaying ? 'إيقاف' : 'تشغيل';
        }
    }
}

function addBookmark() {
    if (!state.currentSurah || !state.currentAyah) return;
    
    const bookmark = {
        id: Date.now(),
        surah: state.currentSurah.number,
        ayah: state.currentAyah,
        surahName: state.currentSurah.arabicName,
        timestamp: Date.now()
    };
    
    // Initialize bookmarks array if it doesn't exist
    if (!state.bookmarks) {
        state.bookmarks = [];
    }
    
    // Check if bookmark already exists
    const exists = state.bookmarks.some(b => b.surah === bookmark.surah && b.ayah === bookmark.ayah);
    if (exists) {
        showNotification('هذه الآية موجودة بالفعل في الإشارات المرجعية', 'warning');
        return;
    }
    
    state.bookmarks.unshift(bookmark);
    saveState();
    
    updateBookmarkUI();
    showNotification('تمت إضافة الإشارة المرجعية', 'success');
}

function copyVerseToClipboard(text, ayahNumber) {
    const verseText = `${text} ﴿${ayahNumber}﴾`;
    
    navigator.clipboard.writeText(verseText).then(() => {
        showNotification(`تم نسخ الآية ${ayahNumber} إلى الحافظة`, 'success');
    }).catch(err => {
        console.error('❌ فشل النسخ:', err);
        showError('تعذر نسخ الآية');
    });
}

function updateStats() {
    // Update dashboard stats
    if (DOM.statListeningTime) {
        const hours = Math.floor(state.stats.totalListeningTime / 3600);
        const minutes = Math.floor((state.stats.totalListeningTime % 3600) / 60);
        DOM.statListeningTime.textContent = `${hours} ساعة ${minutes} دقيقة`;
    }
    
    if (DOM.statCompletedSurahs) {
        DOM.statCompletedSurahs.textContent = state.stats.completedSurahs ? state.stats.completedSurahs.length : 0;
    }
    
    if (DOM.statFavoriteReciter) {
        const entries = Object.entries(state.stats.favoriteReciters || {});
        if (entries.length > 0) {
            const favorite = entries.sort((a, b) => b[1] - a[1])[0];
            const reciter = state.reciters.find(r => r.id === favorite[0]);
            DOM.statFavoriteReciter.textContent = reciter ? reciter.name : favorite[0];
        } else {
            DOM.statFavoriteReciter.textContent = '-';
        }
    }
    
    if (DOM.statTotalBookmarks) {
        DOM.statTotalBookmarks.textContent = state.bookmarks ? state.bookmarks.length : 0;
    }
}

async function loadPrayerTimes() {
    try {
        const response = await fetch(`${CONFIG.PRAYER_API}/timingsByCity?city=Mecca&country=Saudi%20Arabia&method=3`);
        const data = await response.json();
        
        if (data.code === 200) {
            state.prayerTimes = data.data.timings;
            updatePrayerTimesUI();
            calculateNextPrayer();
            
            // Update every minute
            setInterval(calculateNextPrayer, 60000);
        }
    } catch (error) {
        console.warn('❌ خطأ في تحميل أوقات الصلاة:', error);
    }
}

function updatePrayerTimesUI() {
    if (!state.prayerTimes) return;
    
    if (DOM.fajrTime) DOM.fajrTime.textContent = state.prayerTimes.Fajr;
    if (DOM.dhuhrTime) DOM.dhuhrTime.textContent = state.prayerTimes.Dhuhr;
    if (DOM.asrTime) DOM.asrTime.textContent = state.prayerTimes.Asr;
    if (DOM.maghribTime) DOM.maghribTime.textContent = state.prayerTimes.Maghrib;
    if (DOM.ishaTime) DOM.ishaTime.textContent = state.prayerTimes.Isha;
}

function calculateNextPrayer() {
    if (!state.prayerTimes) return;
    
    const now = new Date();
    const currentTime = now.getHours() * 60 + now.getMinutes();
    
    const prayers = [
        { name: 'الفجر', time: state.prayerTimes.Fajr },
        { name: 'الظهر', time: state.prayerTimes.Dhuhr },
        { name: 'العصر', time: state.prayerTimes.Asr },
        { name: 'المغرب', time: state.prayerTimes.Maghrib },
        { name: 'العشاء', time: state.prayerTimes.Isha }
    ];
    
    for (const prayer of prayers) {
        const [hours, minutes] = prayer.time.split(':').map(Number);
        const prayerTime = hours * 60 + minutes;
        
        if (prayerTime > currentTime) {
            state.nextPrayer = {
                name: prayer.name,
                time: prayer.time,
                minutesLeft: prayerTime - currentTime
            };
            updateNextPrayerUI();
            return;
        }
    }
    
    // If all prayers passed, use first prayer of next day
    state.nextPrayer = {
        name: 'الفجر',
        time: state.prayerTimes.Fajr,
        minutesLeft: (24 * 60 - currentTime) + parseInt(state.prayerTimes.Fajr.split(':')[0]) * 60 + parseInt(state.prayerTimes.Fajr.split(':')[1])
    };
    updateNextPrayerUI();
}

function updateNextPrayerUI() {
    if (!state.nextPrayer) return;
    
    if (DOM.nextPrayerName) DOM.nextPrayerName.textContent = state.nextPrayer.name;
    if (DOM.nextPrayerTime) DOM.nextPrayerTime.textContent = state.nextPrayer.time;
    if (DOM.currentPrayer) DOM.currentPrayer.textContent = `${state.nextPrayer.name} ${state.nextPrayer.time}`;
}

// ==================== EVENT LISTENERS ====================

function setupEventListeners() {
    console.log('🔧 جاري إعداد مستمعي الأحداث...');
    
    // Audio events
    if (DOM.audioPlayer) {
        DOM.audioPlayer.addEventListener('timeupdate', () => {
            if (DOM.progressBar && DOM.currentTime && DOM.audioPlayer.duration) {
                const progress = (DOM.audioPlayer.currentTime / DOM.audioPlayer.duration) * 100;
                DOM.progressBar.value = progress;
                DOM.currentTime.textContent = formatTime(DOM.audioPlayer.currentTime);
            }
        });
        
        DOM.audioPlayer.addEventListener('loadedmetadata', () => {
            if (DOM.duration && DOM.audioPlayer.duration) {
                DOM.duration.textContent = formatTime(DOM.audioPlayer.duration);
            }
        });
        
        DOM.audioPlayer.addEventListener('ended', () => {
            if (state.currentAyah < state.currentSurah.ayahs) {
                playAyah(state.currentAyah + 1);
            } else {
                state.isPlaying = false;
                updatePlayButton();
                showNotification('🎉 تم الانتهاء من السورة', 'success');
            }
        });
        
        DOM.audioPlayer.addEventListener('error', (e) => {
            console.error('❌ خطأ في الصوت:', DOM.audioPlayer.error);
            showError('خطأ في تحميل الصوت');
            state.isAudioLoading = false;
            updatePlayButton();
        });
    }
    
    // Progress bar
    if (DOM.progressBar) {
        DOM.progressBar.addEventListener('input', (e) => {
            if (DOM.audioPlayer && DOM.audioPlayer.duration) {
                const seekTime = (e.target.value / 100) * DOM.audioPlayer.duration;
                DOM.audioPlayer.currentTime = seekTime;
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
    
    if (DOM.repeatBtn) {
        DOM.repeatBtn.addEventListener('click', () => {
            state.repeatMode.enabled = !state.repeatMode.enabled;
            state.repeatMode.count = state.repeatMode.enabled ? 3 : 0;
            state.repeatMode.current = 0;
            
            DOM.repeatBtn.style.color = state.repeatMode.enabled ? 'var(--accent-color)' : '';
            DOM.repeatBtn.title = state.repeatMode.enabled ? 'التكرار (مفعل - 3 مرات)' : 'التكرار (إيقاف)';
            
            showNotification(state.repeatMode.enabled ? 'تم تفعيل وضع التكرار (3 مرات)' : 'تم إيقاف وضع التكرار', 'info');
        });
    }
    
    // Reciter change - FIXED: Properly handle reciter switching
    if (DOM.reciterSelect) {
        DOM.reciterSelect.addEventListener('change', async (event) => {
            const reciterId = event.target.value;
            const reciter = state.reciters.find(r => r.id === reciterId);
            
            if (!reciter || !state.currentSurah) return;
            
            // Store current playback state
            const wasPlaying = state.isPlaying;
            const currentAyahBeforeChange = state.currentAyah;
            
            // Update state
            state.currentReciter = reciterId;
            if (DOM.currentReciter) {
                DOM.currentReciter.textContent = reciter.name;
            }
            
            // Stop current audio
            if (DOM.audioPlayer) {
                DOM.audioPlayer.pause();
                state.isPlaying = false;
                updatePlayButton();
            }
            
            // Show loading notification
            showNotification(`جاري تحميل صوت ${reciter.name}...`, 'info');
            
            // Reload audio with new reciter
            await loadAudioFiles(state.currentSurah.number);
            
            // If audio was playing, restart with new reciter
            if (wasPlaying) {
                state.currentAyah = currentAyahBeforeChange;
                setTimeout(() => playAyah(state.currentAyah), 500);
            } else {
                // Just update the display
                state.currentAyah = 1;
                updateAyahDisplay();
                highlightCurrentAyah();
            }
            
            showNotification(`تم التغيير إلى القارئ: ${reciter.name}`, 'success');
            saveState();
        });
    }
    
    // Volume control
    if (DOM.volumeSlider) {
        DOM.volumeSlider.addEventListener('input', (e) => {
            if (DOM.audioPlayer) {
                DOM.audioPlayer.volume = e.target.value / 100;
            }
        });
    }
    
    // Playback speed
    if (DOM.speedSelect) {
        DOM.speedSelect.addEventListener('change', (e) => {
            state.playbackSpeed = parseFloat(e.target.value);
            if (DOM.audioPlayer) {
                DOM.audioPlayer.playbackRate = state.playbackSpeed;
            }
            saveState();
            showNotification(`تم تغيير سرعة التشغيل إلى ${e.target.value}x`, 'info');
        });
    }
    
    // Text size controls
    if (DOM.textSizeDown) {
        DOM.textSizeDown.addEventListener('click', () => {
            if (state.fontSize > 16) {
                state.fontSize -= 2;
                updateTextSize();
            }
        });
    }
    
    if (DOM.textSizeUp) {
        DOM.textSizeUp.addEventListener('click', () => {
            if (state.fontSize < 40) {
                state.fontSize += 2;
                updateTextSize();
            }
        });
    }
    
    // Font size range
    if (DOM.fontSizeRange) {
        DOM.fontSizeRange.addEventListener('input', (e) => {
            state.fontSize = parseInt(e.target.value);
            updateTextSize();
        });
    }
    
    // Translation toggle
    if (DOM.toggleTranslation) {
        DOM.toggleTranslation.addEventListener('click', () => {
            state.showTranslation = !state.showTranslation;
            DOM.toggleTranslation.style.color = state.showTranslation ? 'var(--accent-color)' : '';
            showNotification(state.showTranslation ? 'تم تفعيل عرض الترجمة' : 'تم إيقاف عرض الترجمة', 'info');
            saveState();
        });
    }
    
    // Auto scroll toggle
    if (DOM.autoScrollBtn) {
        DOM.autoScrollBtn.addEventListener('click', () => {
            state.autoScroll = !state.autoScroll;
            DOM.autoScrollBtn.style.color = state.autoScroll ? 'var(--accent-color)' : '';
            showNotification(state.autoScroll ? 'تم تفعيل التمرير التلقائي' : 'تم إيقاف التمرير التلقائي', 'info');
            saveState();
        });
    }
    
    // Theme toggle
    if (DOM.themeToggle) {
        DOM.themeToggle.addEventListener('click', toggleTheme);
    }
    
    // Quick actions
    if (DOM.lastPositionBtn) {
        DOM.lastPositionBtn.addEventListener('click', goToLastPosition);
    }
    
    if (DOM.randomAyahBtn) {
        DOM.randomAyahBtn.addEventListener('click', playRandomAyah);
    }
    
    if (DOM.favoriteBtn) {
        DOM.favoriteBtn.addEventListener('click', () => {
            showModal(DOM.dashboardModal);
        });
    }
    
    if (DOM.notesBtn) {
        DOM.notesBtn.addEventListener('click', () => {
            showNotification('ميزة الملاحظات قيد التطوير', 'info');
        });
    }
    
    // Save note button
    if (DOM.saveNoteBtn) {
        DOM.saveNoteBtn.addEventListener('click', saveQuickNote);
    }
    
    // Search functionality
    if (DOM.searchSurah) {
        DOM.searchSurah.addEventListener('input', handleSearch);
    }
    
    if (DOM.clearSearch) {
        DOM.clearSearch.addEventListener('click', () => {
            if (DOM.searchSurah) {
                DOM.searchSurah.value = '';
                handleSearch();
            }
        });
    }
    
    // Filter buttons
    document.querySelectorAll('.filter-btn').forEach(btn => {
        btn.addEventListener('click', () => {
            const filter = btn.dataset.filter;
            
            // Update active state
            document.querySelectorAll('.filter-btn').forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
            
            // Filter surahs
            filterSurahList(filter);
        });
    });
    
    // Mode buttons
    document.querySelectorAll('.mode-btn').forEach(btn => {
        btn.addEventListener('click', () => {
            const mode = btn.dataset.mode;
            
            // Update active state
            document.querySelectorAll('.mode-btn').forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
            
            // Set playback mode
            state.playbackMode = mode;
            showNotification(`تم تغيير وضع التشغيل إلى: ${mode === 'verse' ? 'آية بآية' : mode === 'surah' ? 'سورة كاملة' : 'جزء كامل'}`, 'info');
            saveState();
        });
    });
    
    // Modal controls
    if (DOM.dashboardBtn) {
        DOM.dashboardBtn.addEventListener('click', () => {
            updateStats();
            showModal(DOM.dashboardModal);
        });
    }
    
    if (DOM.settingsBtn) {
        DOM.settingsBtn.addEventListener('click', () => {
            showModal(DOM.settingsModal);
        });
    }
    
    // Close modals
    document.querySelectorAll('.close-modal').forEach(btn => {
        btn.addEventListener('click', closeAllModals);
    });
    
    if (DOM.modalOverlay) {
        DOM.modalOverlay.addEventListener('click', closeAllModals);
    }
    
    // Settings changes
    if (DOM.qualitySelect) {
        DOM.qualitySelect.addEventListener('change', (e) => {
            state.audioQuality = e.target.value;
            saveState();
            showNotification('سيتم تطبيق جودة الصوت عند تحميل السورة التالية', 'info');
        });
    }
    
    if (DOM.autoRepeatSelect) {
        DOM.autoRepeatSelect.addEventListener('change', (e) => {
            state.repeatMode.count = parseInt(e.target.value);
            state.repeatMode.enabled = state.repeatMode.count > 0;
            saveState();
            showNotification(state.repeatMode.enabled ? `تم تفعيل التكرار التلقائي (${state.repeatMode.count} مرات)` : 'تم إيقاف التكرار التلقائي', 'info');
        });
    }
    
    // Bottom navigation
    document.querySelectorAll('.nav-btn').forEach(btn => {
        btn.addEventListener('click', () => {
            const view = btn.dataset.view;
            
            // Update active state
            document.querySelectorAll('.nav-btn').forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
            
            // Handle view change
            switchView(view);
        });
    });
    
    // Keyboard shortcuts
    document.addEventListener('keydown', handleKeyboardShortcuts);
    
    // Save state before leaving
    window.addEventListener('beforeunload', () => {
        saveState();
    });
    
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
    saveState();
    showNotification(`تم التغيير إلى الوضع ${newTheme === 'dark' ? 'الداكن' : 'الفاتح'}`, 'info');
}

function updateTextSize() {
    if (DOM.textSizeLabel) DOM.textSizeLabel.textContent = `${state.fontSize}px`;
    if (DOM.fontSizeValue) DOM.fontSizeValue.textContent = `${state.fontSize}px`;
    
    // Apply to all verse text
    document.querySelectorAll('.verse-text').forEach(text => {
        text.style.fontSize = `${state.fontSize}px`;
    });
    
    saveState();
}

function handleSearch() {
    if (!DOM.searchSurah || !DOM.surahList) return;
    
    const searchTerm = DOM.searchSurah.value.toLowerCase();
    
    document.querySelectorAll('.surah-item').forEach(item => {
        const arabicName = item.querySelector('.surah-name-arabic')?.textContent || '';
        const englishName = item.querySelector('.surah-name-english')?.textContent || '';
        const surahNumber = item.querySelector('.surah-number')?.textContent || '';
        
        const matches = arabicName.includes(searchTerm) || 
                       englishName.toLowerCase().includes(searchTerm) ||
                       surahNumber.includes(searchTerm);
        
        item.style.display = matches ? 'flex' : 'none';
    });
}

function filterSurahList(filter) {
    document.querySelectorAll('.surah-item').forEach(item => {
        const typeElement = item.querySelector('.type');
        const type = typeElement?.textContent || '';
        
        let show = true;
        if (filter === 'meccan') {
            show = type.includes('مكية');
        } else if (filter === 'medinan') {
            show = type.includes('مدنية');
        }
        // 'all' shows everything
        
        item.style.display = show ? 'flex' : 'none';
    });
}

function goToLastPosition() {
    if (state.stats.lastPositions && state.stats.lastPositions.length > 0) {
        const lastPos = state.stats.lastPositions[0];
        loadSurah(lastPos.surah, false);
        state.currentAyah = lastPos.ayah;
        updateAyahDisplay();
        highlightCurrentAyah();
        showNotification('تم العودة إلى الموقع الأخير', 'success');
    } else {
        showError('لا يوجد موقع سابق محفوظ');
    }
}

function playRandomAyah() {
    if (state.surahs.length === 0) {
        showError('الرجاء انتظار تحميل السور');
        return;
    }
    
    const randomSurah = Math.floor(Math.random() * state.surahs.length) + 1;
    const surah = state.surahs.find(s => s.number === randomSurah);
    if (surah) {
        const randomAyah = Math.floor(Math.random() * surah.ayahs) + 1;
        loadSurah(randomSurah, false);
        state.currentAyah = randomAyah;
        setTimeout(() => playAyah(randomAyah), 500);
        showNotification('تم تشغيل آية عشوائية', 'info');
    }
}

function saveQuickNote() {
    if (!DOM.quickNote) return;
    
    const note = DOM.quickNote.value.trim();
    if (note === '') {
        showError('الرجاء كتابة ملاحظة أولاً');
        return;
    }
    
    // Initialize notes array
    if (!state.notes) {
        state.notes = [];
    }
    
    const noteObj = {
        id: Date.now(),
        text: note,
        timestamp: Date.now()
    };
    
    state.notes.unshift(noteObj);
    DOM.quickNote.value = '';
    
    // Save to localStorage
    try {
        localStorage.setItem(CONFIG.STORAGE_KEYS.NOTES, JSON.stringify(state.notes));
        showNotification('تم حفظ الملاحظة', 'success');
    } catch (error) {
        console.error('❌ خطأ في حفظ الملاحظة:', error);
        showError('تعذر حفظ الملاحظة');
    }
}

function showModal(modal) {
    if (!modal || !DOM.modalOverlay) return;
    
    modal.classList.add('active');
    DOM.modalOverlay.classList.add('active');
}

function closeAllModals() {
    document.querySelectorAll('.modal').forEach(modal => {
        modal.classList.remove('active');
    });
    
    if (DOM.modalOverlay) {
        DOM.modalOverlay.classList.remove('active');
    }
}

function switchView(view) {
    state.currentView = view;
    
    // Handle different views
    switch(view) {
        case 'bookmarks':
            showModal(DOM.dashboardModal); // Using dashboard modal for bookmarks
            break;
        case 'progress':
            showModal(DOM.dashboardModal);
            break;
        case 'settings':
            showModal(DOM.settingsModal);
            break;
        default:
            // Home view - do nothing
            break;
    }
}

function handleKeyboardShortcuts(event) {
    // Don't trigger shortcuts when typing in inputs
    if (event.target.tagName === 'INPUT' || event.target.tagName === 'TEXTAREA') {
        return;
    }
    
    switch(event.key) {
        case ' ': // Spacebar - play/pause
            event.preventDefault();
            togglePlayPause();
            break;
            
        case 'ArrowRight': // Next verse
            if (state.currentAyah < state.currentSurah.ayahs) {
                playAyah(state.currentAyah + 1);
            }
            break;
            
        case 'ArrowLeft': // Previous verse
            if (state.currentAyah > 1) {
                playAyah(state.currentAyah - 1);
            }
            break;
            
        case 'm': // Mute
            if (DOM.audioPlayer) {
                DOM.audioPlayer.muted = !DOM.audioPlayer.muted;
                showNotification(DOM.audioPlayer.muted ? 'تم كتم الصوت' : 'تم إلغاء كتم الصوت', 'info');
            }
            break;
            
        case 'b': // Bookmark
            addBookmark();
            break;
            
        case 'r': // Repeat toggle
            state.repeatMode.enabled = !state.repeatMode.enabled;
            state.repeatMode.count = state.repeatMode.enabled ? 3 : 0;
            showNotification(state.repeatMode.enabled ? 'تفعيل التكرار' : 'إيقاف التكرار', 'info');
            break;
            
        case 'Escape': // Close modals
            closeAllModals();
            break;
            
        case 't': // Theme toggle
            toggleTheme();
            break;
    }
}

function formatTime(seconds) {
    if (isNaN(seconds) || seconds === Infinity) return '0:00';
    
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

function selectSurah(surahNumber) {
    loadSurah(surahNumber, true);
}

console.log('📦 Quran App script loaded successfully!');