document.addEventListener('DOMContentLoaded', () => {
    // UI Elementleri
    const elements = {
        readingArea: document.getElementById('reading-area'),
        pageInput: document.getElementById('page-input'),
        prevBtn: document.getElementById('prev-btn'),
        nextBtn: document.getElementById('next-btn'),
        juzSelect: document.getElementById('juz-select'),
        surahSelect: document.getElementById('surah-select'),
        playPauseBtn: document.getElementById('play-pause-btn'),
        playingInfo: document.getElementById('playing-info'),
        coreAudio: document.getElementById('core-audio'),
        settingsBtn: document.getElementById('settings-btn'),
        settingsModal: document.getElementById('settings-modal'),
        closeSettings: document.getElementById('close-settings'),
        mushafTypeSelect: document.getElementById('mushaf-type-select'),
        reciterSelect: document.getElementById('reciter-select'),
        fontSizeSelect: document.getElementById('font-size-select')
    };

    // State Durumu
    const state = {
        currentPage: parseInt(localStorage.getItem('lastPage') || '0'),
        pagesData: {}, 
        surahsData: {},
        coordsData: {},
        isPlaying: false,
        currentAyahIndex: -1, // Hangi ayetteyiz (sayfa içi okunan)
        mushafType: localStorage.getItem('mushafType') || 'text', // 'text' | 'image'
        reciter: localStorage.getItem('reciter') || 'davutkaya',
        fontSize: localStorage.getItem('fontSize') || 'medium',
        isFallbackAttempting: false,
        debugMode: localStorage.getItem('debugMode') === 'true'
    };

    // Sabit Veriler
    const RECITERS = {
        ayahAyah: 'http://mobil.diyanet.gov.tr/mobile/sesdosyalari/dk1_', 
        fallbackAr: 'http://qr.haktankuran.com/as/' 
    };

    const SURAH_NAMES = [
        "Fatiha", "Bakara", "Âl-i İmrân", "Nisâ", "Mâide", "En'âm", "A'râf", "Enfâl", "Tevbe", "Yûnus",
        "Hûd", "Yûsuf", "Ra'd", "İbrâhîm", "Hicr", "Nahl", "İsrâ", "Kehf", "Meryem", "Tâhâ",
        "Enbiyâ", "Hac", "Mü'minûn", "Nûr", "Furkân", "Şuarâ", "Neml", "Kasas", "Ankebût", "Rûm",
        "Lokmân", "Secde", "Ahzâb", "Sebe'", "Fâtır", "Yâsîn", "Sâffât", "Sâd", "Zümer", "Mü'min",
        "Fussilet", "Şûrâ", "Zuhruf", "Duhân", "Câsiye", "Ahkâf", "Muhammed", "Fetih", "Hucurât", "Kâf",
        "Zâriyât", "Tûr", "Necm", "Kamer", "Rahmân", "Vâkıa", "Hadîd", "Mücâdele", "Haşr", "Mümtehine",
        "Saf", "Cuma", "Münâfikûn", "Tegâbün", "Talâk", "Tahrîm", "Mülk", "Kalem", "Hâkka", "Meâric",
        "Nûh", "Cin", "Müzzemmil", "Müddessir", "Kıyâme", "İnsân", "Mürselât", "Nebe'", "Nâziât", "Abese",
        "Tekvîr", "İnfitâr", "Mutaffifîn", "İnşikâk", "Bürûc", "Târık", "A'lâ", "Gâşiye", "Fecr", "Beled",
        "Şems", "Leyl", "Duhâ", "İnşirâh", "Tîn", "Alak", "Kadr", "Beyyine", "Zilzâl", "Âdiyât",
        "Kâria", "Tekâsür", "Asr", "Hümeze", "Fîl", "Kureyş", "Mâûn", "Kevser", "Kâfirûn", "Nasr",
        "Tebbet", "İhlâs", "Felak", "Nâs"
    ];

    const ARABIC_SURAH_NAMES = [
        "سُورَةُ ٱلْفَاتِحَةِ", "سُورَةُ البَقَرَةِ", "سُورَةُ اٰلِ عِمۡرَانَ", "سُورَةُ النِّسَاءِ", "سُورَةُ المَائـِدَةِ", "سُورَةُ الأَنۡعَامِ", "سُورَةُ الأَعۡرَافِ", "سُورَةُ الأَنفَالِ", "سُورَةُ التَّوۡبَةِ", "سُورَةُ يُونُسَ", "سُورَةُ هُودٍ", "سُورَةُ يُوسُفَ", "سُورَةُ الرَّعۡدِ", "سُورَةُ إِبۡرَاهِيمَ", "سُورَةُ الحِجۡرِ", "سُورَةُ النَّحۡلِ", "سُورَةُ الإِسۡرَاءِ", "سُورَةُ الكَهۡفِ", "سُورَةُ مَرۡيَمَ", "سُورَةُ طه", "سُورَةُ الأَنبِيَاءِ", "سُورَةُ الحَجِّ", "سُورَةُ المُؤۡمِنُونَ", "سُورَةُ النُّورِ", "سُورَةُ الفُرۡقَانِ", "سُورَةُ الشُّعَرَاءِ", "سُورَةُ النَّمۡلِ", "سُورَةُ القَصَصِ", "سُورَةُ العَنكَبُوتِ", "سُورَةُ الرُّومِ", "سُورَةُ لُقۡمَانَ", "سُورَةُ السَّجۡدَةِ", "سُورَةُ الأَحۡزَابِ", "سُورَةُ سَبَإٍ", "سُورَةُ فَاطِرٍ", "سُورَةُ يسٓ", "سُورَةُ الصَّافَّاتِ", "سُورَةُ صٓ", "سُورَةُ الزُّمَرِ", "سُورَةُ غَافِرٍ", "سُورَةُ فُصِّلَتۡ", "سُورَةُ الشُّورَىٰ", "سُورَةُ الزُّخۡرُفِ", "سُورَةُ الدُّخَانِ", "سُورَةُ الجَاثِيَةِ", "سُورَةُ الأَحۡقَافِ", "سُورَةُ مُحَمَّدٍ", "سُورَةُ الفَتۡحِ", "سُورَةُ الحُجُرَاتِ", "سُورَةُ قٓ", "سُورَةُ الذَّارِيَاتِ", "سُورَةُ الطُّورِ", "سُورَةُ النَّجۡمِ", "سُورَةُ القَمَرِ", "سُورَةُ الرَّحۡمَٰن", "سُورَةُ الوَاقِعَةِ", "سُورَةُ الحَدِيدِ", "سُورَةُ المُجَادلَةِ", "سُورَةُ الحَشۡرِ", "سُورَةُ المُمۡتَحنَةِ", "سُورَةُ الصَّفِّ", "سُورَةُ الجُمُعَةِ", "سُورَةُ المُنافِقُونَ", "سُورَةُ التَّغَابُنِ", "سُورَةُ الطَّلَاقِ", "سُورَةُ التَّحۡرِيمِ", "سُورَةُ المُلۡكِ", "سُورَةُ القَلَمِ", "سُورَةُ الحَاقَّةِ", "سُورَةُ المَعَارِجِ", "سُورَةُ نُوحٍ", "سُورَةُ الجِنِّ", "سُورَةُ المُزَّمِّلِ", "سُورَةُ المُدَّثِّرِ", "سُورَةُ القِيَامَةِ", "سُورَةُ الإِنسَانِ", "سُورَةُ المُرۡسَلَاتِ", "سُورَةُ النَّبَإِ", "سُورَةُ النَّازِعَاتِ", "سُورَةُ عَبَسَ", "سُورَةُ التَّكۡوِيرِ", "سُورَةُ الانفِطَارِ", "سُورَةُ المُطَفِّفِينَ", "سُورَةُ الانشِقَاقِ", "سُورَةُ البُرُوجِ", "سُورَةُ الطَّارِقِ", "سُورَةُ الأَعۡلَىٰ", "سُورَةُ الغَاشِيَةِ", "سُورَةُ الفَجۡرِ", "سُورَةُ البَلَدِ", "سُورَةُ الشَّمۡسِ", "سُورَةُ اللَّيۡلِ", "سُورَةُ الضُّحَىٰ", "سُورَةُ الشَّرۡحِ", "سُورَةُ التِّينِ", "سُورَةُ العَلَقِ", "سُورَةُ القَدۡرِ", "سُورَةُ البَيِّنَةِ", "سُورَةُ الزَّلۡزَلَةِ", "سُورَةُ العَادِيَاتِ", "سُورَةُ القَارِعَةِ", "سُورَةُ التَّكَاثُرِ", "سُورَةُ العَصۡرِ", "سُورَةُ الهُمَزَةِ", "سُورَةُ الفِيلِ", "سُورَةُ قُرَيۡشٍ", "سُورَةُ المَاعُونِ", "سُورَةُ الكَوۡثَرِ", "سُورَةُ الكَافِرُونَ", "سُورَةُ النَّصۡرِ", "سُورَةُ المَسَدِ", "سُورَةُ الإِخۡلَاصِ", "سُورَةُ الفَلَقِ", "سُورَةُ النَّاسِ"
    ];

    // Secde Ayetleri (14 adet)
    const SAJDA_AYAHS = [
        {surah: 7, ayah: 206}, {surah: 13, ayah: 15}, {surah: 16, ayah: 50},
        {surah: 17, ayah: 109}, {surah: 19, ayah: 58}, {surah: 22, ayah: 18},
        {surah: 25, ayah: 60}, {surah: 27, ayah: 26}, {surah: 32, ayah: 15},
        {surah: 38, ayah: 24}, {surah: 41, ayah: 38}, {surah: 53, ayah: 62},
        {surah: 84, ayah: 21}, {surah: 96, ayah: 19}
    ];

    function init() {
        try {
            state.surahsData = window.surahsData || {};
            state.pagesData = window.pagesData || {};
            state.coordsData = window.coordsData || {};

            populateSelects();
            bindEvents();

            // Kaydedilmiş font boyutunu uygula
            if (state.fontSize === 'small') document.documentElement.style.setProperty('--ayah-font-size', '54px');
            if (state.fontSize === 'large') document.documentElement.style.setProperty('--ayah-font-size', '82px');

            // Kaydedilmiş mushaf türünü uygula
            if (elements.mushafTypeSelect) elements.mushafTypeSelect.value = state.mushafType;
            if (elements.reciterSelect) elements.reciterSelect.value = state.reciter;
            if (elements.fontSizeSelect) elements.fontSizeSelect.value = state.fontSize;

            loadPage(state.currentPage);

        } catch (error) {
            console.error("Veriler yüklenirken hata oluştu:", error);
            elements.readingArea.innerHTML = '<p style="color:red; text-align:center;">Hata: Veriler okunamadı. Veri oluşturma betiğini çalıştırdığınızdan emin olun.</p>';
        }
    }

    function populateSelects() {
        // Cüzler (1-30)
        for (let i = 1; i <= 30; i++) {
            const opt = document.createElement('option');
            opt.value = i;
            opt.textContent = `${i}. Cüz`;
            elements.juzSelect.appendChild(opt);
        }

        // Sureler (1-114)
        for (const [id, surah] of Object.entries(state.surahsData)) {
            const opt = document.createElement('option');
            opt.value = id;
            opt.textContent = `${id}. ${SURAH_NAMES[id - 1]}`;
            elements.surahSelect.appendChild(opt);
        }
    }

    function bindEvents() {
        elements.prevBtn.addEventListener('click', () => navigatePage(-1));
        elements.nextBtn.addEventListener('click', () => navigatePage(1));
        elements.pageInput.addEventListener('change', (e) => {
            const val = parseInt(e.target.value, 10);
            if(val >= 1 && val <= 604) loadPage(val);
        });
        
        elements.playPauseBtn.addEventListener('click', togglePlay);

        // Cüz veya Sure Seçimi (Gezinme)
        elements.juzSelect.addEventListener('change', (e) => {
            const juz = parseInt(e.target.value);
            // Sayfa numaralarını sayısal sırala, ilk eşleşeni al
            const sortedPages = Object.keys(state.pagesData).map(Number).sort((a, b) => a - b);
            const targetPage = sortedPages.find(p => state.pagesData[p].juz === juz);
            if (targetPage !== undefined) loadPage(targetPage);
        });

        elements.surahSelect.addEventListener('change', (e) => {
            const surah = parseInt(e.target.value);
            // Sayfadaki TÜM ayetleri kontrol et (sure sayfa ortasında başlayabilir)
            const sortedPages = Object.keys(state.pagesData).map(Number).sort((a, b) => a - b);
            const targetPage = sortedPages.find(p => {
                const pd = state.pagesData[p];
                return pd.ayahs && pd.ayahs.some(a => a.surah === surah);
            });
            if (targetPage !== undefined) loadPage(targetPage);
        });

        elements.coreAudio.addEventListener('ended', handleAudioEnded);
        elements.coreAudio.addEventListener('error', handleAudioError);

        // Ayarlar Modal Events
        elements.settingsBtn.addEventListener('click', () => {
            elements.mushafTypeSelect.value = state.mushafType;
            elements.reciterSelect.value = state.reciter;
            elements.settingsModal.style.display = 'flex';
        });
        
        elements.closeSettings.addEventListener('click', () => {
            elements.settingsModal.style.display = 'none';
        });

        window.addEventListener('click', (e) => {
            if (e.target === elements.settingsModal) {
                elements.settingsModal.style.display = 'none';
            }
        });

        elements.mushafTypeSelect.addEventListener('change', (e) => {
            state.mushafType = e.target.value;
            localStorage.setItem('mushafType', state.mushafType);
            loadPage(state.currentPage);
        });

        elements.reciterSelect.addEventListener('change', (e) => {
            state.reciter = e.target.value;
            localStorage.setItem('reciter', state.reciter);
            if(state.isPlaying) togglePlay();
        });

        if (elements.fontSizeSelect) {
            elements.fontSizeSelect.addEventListener('change', (e) => {
                state.fontSize = e.target.value;
                localStorage.setItem('fontSize', state.fontSize);
                let val = '68px';
                if (state.fontSize === 'small') val = '54px';
                if (state.fontSize === 'large') val = '82px';
                document.documentElement.style.setProperty('--ayah-font-size', val);
            });
        }

        // Debug Modu Toggle
        const debugToggle = document.getElementById('debug-toggle');
        if (debugToggle) {
            debugToggle.checked = state.debugMode;
            debugToggle.addEventListener('change', (e) => {
                state.debugMode = e.target.checked;
                localStorage.setItem('debugMode', state.debugMode);
                loadPage(state.currentPage); // Sayfayı yeniden yükle (grid görünsün/gizlensin)
            });
        }

        // Klavye Kısayolları
        document.addEventListener('keydown', (e) => {
            // Input/select içinde değilse
            if (e.target.tagName === 'INPUT' || e.target.tagName === 'SELECT' || e.target.tagName === 'TEXTAREA') return;
            if (e.key === 'ArrowLeft') { navigatePage(-1); e.preventDefault(); }
            if (e.key === 'ArrowRight') { navigatePage(1); e.preventDefault(); }
            if (e.key === ' ') { togglePlay(); e.preventDefault(); }
        });
    }

    function navigatePage(dir) {
        let newPage = state.currentPage + dir;
        if(newPage >= 0 && newPage <= 604) {
            loadPage(newPage);
        }
    }

    function loadPage(pageNum) {
        stopAudio();
        state.currentPage = pageNum;
        localStorage.setItem('lastPage', pageNum);
        elements.pageInput.value = pageNum;
        
        const pageData = state.pagesData[pageNum];
        if(!pageData) return;

        // Okuma Alanını Temizle ve Doldur
        elements.readingArea.innerHTML = '';
        const pageContainer = document.createElement('div');
        pageContainer.className = 'page';

        if (state.mushafType === 'image') {
            pageContainer.style.padding = '0';
            
            const imgWrapper = document.createElement('div');
            imgWrapper.style.position = 'relative';
            imgWrapper.style.width = '100%';
            imgWrapper.style.cursor = 'pointer';

            const img = document.createElement('img');
            img.src = `data/pages/s${pageNum}.png`;
            img.style.width = '100%';
            img.style.height = 'auto';
            img.style.display = 'block';
            img.style.borderRadius = '8px';
            
            imgWrapper.appendChild(img);
            
            // --- HATA AYIKLAMA (DEBUG) IZGARASI ---
            // state.debugMode true ise görünür
            const drawDebugGrid = () => {
                const oldGrid = imgWrapper.querySelector('.debug-grid');
                if (oldGrid) oldGrid.remove();
                const oldTracker = imgWrapper.querySelector('.debug-tracker');
                if (oldTracker) oldTracker.remove();

                if (!state.debugMode) return; // Debug kapalıysa çizme

                const gridOverlay = document.createElement('div');
                gridOverlay.className = 'debug-grid';
                gridOverlay.style.position = 'absolute';
                gridOverlay.style.pointerEvents = 'none';
                gridOverlay.style.zIndex = '10';

                // Rölatıf konumlandırma: gridOverlay img'nin tam üzerine otursun
                // imgWrapper'a göre img'nin offset'ini hesaplıyoruz
                const wrapperRect = imgWrapper.getBoundingClientRect();
                const imgRect = img.getBoundingClientRect();

                const relTop = imgRect.top - wrapperRect.top;
                const relLeft = imgRect.left - wrapperRect.left;

                gridOverlay.style.top = relTop + 'px';
                gridOverlay.style.left = relLeft + 'px';
                gridOverlay.style.width = imgRect.width + 'px';
                gridOverlay.style.height = imgRect.height + 'px';

                const domW = imgRect.width;
                const domH = imgRect.height;
                // KRİTİK: JSON koordinatları Diyanet APK panel boyutlarına göre yazılmış
                // Max X=944, Max Y=984 analizi ile tespit edilmiştir.
                const COORD_REF_W = 944;
                const COORD_REF_H = 984;
                // Kullanıcı doğrulaması: X ve Y eksenlerinde ~40 koordinat birimi kayma tespit edildi
                const COORD_OFFSET_X = -40;
                const COORD_OFFSET_Y = -40;

                const scaleX = domW / COORD_REF_W;
                const scaleY = domH / COORD_REF_H;

                // Orijinal JSON koordinatları - Kırmızı
                pageData.ayahs.forEach((a) => {
                    const cList = (state.coordsData || []).filter(c => c.surahNo === a.surah && c.ayahNo === a.ayah);
                    cList.forEach(c => {
                        const box = document.createElement('div');
                        box.style.position = 'absolute';
                        box.style.border = '1px solid rgba(255,0,0,0.7)';
                        box.style.backgroundColor = 'rgba(255,0,0,0.1)';
                        box.style.color = 'red';
                        box.style.fontSize = '11px';
                        box.style.fontWeight = 'bold';
                        box.style.boxSizing = 'border-box';

                        const bLeft = Math.min(c.startX, c.endX) + COORD_OFFSET_X;
                        const bTop = Math.min(c.startY, c.endY) + COORD_OFFSET_Y;
                        const bW = Math.abs(c.endX - c.startX);
                        // Diyanet verisinde startY≈endY olduğundan kutucukları görünür kılmak için min yükseklik uygula
                        const bH = Math.max(Math.abs(c.endY - c.startY), 35);

                        box.style.left = (bLeft * scaleX) + 'px';
                        box.style.top = (bTop * scaleY) + 'px';
                        box.style.width = (bW * scaleX) + 'px';
                        box.style.height = (bH * scaleY) + 'px';
                        box.innerText = a.ayah;
                        gridOverlay.appendChild(box);
                    });
                });

                // Kullanıcı tarafından manuel belirlenen koordinatlar - Mavi
                const userYeniKoor = [
                  { surahNo: 1, ayahNo: 1, startX: 940, startY: 604, endX: 365, endY: 566 }
                ];
                userYeniKoor.forEach(c => {
                    if (pageNum === 1) {
                        const box = document.createElement('div');
                        box.style.position = 'absolute';
                        box.style.border = '2px solid rgba(0,100,255,1)';
                        box.style.backgroundColor = 'rgba(0,100,255,0.15)';
                        box.style.color = 'blue';
                        box.style.fontSize = '11px';
                        box.style.fontWeight = 'bold';
                        box.style.boxSizing = 'border-box';

                        const bLeft = Math.min(c.startX, c.endX) + COORD_OFFSET_X;
                        const bTop = Math.min(c.startY, c.endY) + COORD_OFFSET_Y;
                        const bW = Math.abs(c.endX - c.startX);
                        const bH = Math.max(Math.abs(c.endY - c.startY), 35);

                        box.style.left = (bLeft * scaleX) + 'px';
                        box.style.top = (bTop * scaleY) + 'px';
                        box.style.width = (bW * scaleX) + 'px';
                        box.style.height = (bH * scaleY) + 'px';
                        box.innerText = 'Yeni-' + c.ayahNo;
                        gridOverlay.appendChild(box);
                    }
                });

                imgWrapper.appendChild(gridOverlay);
            };

            img.onload = drawDebugGrid;
            window.addEventListener('resize', drawDebugGrid);

            // --- FARE TRACKER (İmleç Takipçisi) - sadece debug modda ---
            if (state.debugMode) {
                const tracker = document.createElement('div');
                tracker.className = 'debug-tracker';
                tracker.style.position = 'absolute';
                tracker.style.background = 'rgba(0,0,0,0.8)';
                tracker.style.color = 'lime';
                tracker.style.padding = '8px';
                tracker.style.fontSize = '13px';
                tracker.style.borderRadius = '4px';
                tracker.style.pointerEvents = 'none';
                tracker.style.zIndex = '1000';
                tracker.style.display = 'none';
                imgWrapper.appendChild(tracker);

                imgWrapper.addEventListener('mousemove', (e) => {
                    tracker.style.display = 'block';
                    const imgRect = img.getBoundingClientRect();
                    const wrapperRect = imgWrapper.getBoundingClientRect();

                    const relX = e.clientX - wrapperRect.left;
                    const relY = e.clientY - wrapperRect.top;
                    const imgX = e.clientX - imgRect.left;
                    const imgY = e.clientY - imgRect.top;

                    const mappedX = (imgX / imgRect.width) * 944;
                    const mappedY = (imgY / imgRect.height) * 984;

                    tracker.style.left = (relX + 15) + 'px';
                    tracker.style.top = (relY + 10) + 'px';
                    tracker.innerHTML = `<b>Dom (Img):</b> X:${Math.round(imgX)} Y:${Math.round(imgY)}<br><b>JSON Koord.:</b> X:${Math.round(mappedX)} Y:${Math.round(mappedY)}`;
                });
                imgWrapper.addEventListener('mouseleave', () => { tracker.style.display = 'none'; });
            } // debugMode sonu

            // --- TIKLAMA MANTIĞI ---
            imgWrapper.addEventListener('click', (e) => {
                // img'nin gerçek ekran rect'ini kullanıyoruz
                const imgRect = img.getBoundingClientRect();

                const imgY = e.clientY - imgRect.top;
                const imgX = e.clientX - imgRect.left;

                // Klik görsel dışındaysa yoksay
                if (imgY < 0 || imgX < 0 || imgY > imgRect.height || imgX > imgRect.width) return;

                // KRİTİK: JSON koordinatları 944x984 referans uzayında -> buna göre dönüştür
                const COORD_REF_W = 944;
                const COORD_REF_H = 984;
                // X ve Y eksenlerinde ~40 birim kayma düzeltmesi (bkz. debug grid)
                const COORD_OFFSET_X = -40;
                const COORD_OFFSET_Y = -40;
                const mappedY = (imgY / imgRect.height) * COORD_REF_H - COORD_OFFSET_Y;
                const mappedX = (imgX / imgRect.width) * COORD_REF_W - COORD_OFFSET_X;

                let clickedAyahIndex = -1;
                let minDistance = Infinity;

                pageData.ayahs.forEach((a, index) => {
                    const cList = (state.coordsData || []).filter(c => c.surahNo === a.surah && c.ayahNo === a.ayah);
                    cList.forEach(c => {
                        const top = Math.min(c.startY, c.endY) - 30;
                        const bottom = Math.max(c.startY, c.endY) + 30;

                        if (mappedY >= top && mappedY <= bottom) {
                            const dist = Math.abs(mappedY - ((c.startY + c.endY) / 2));
                            if (dist < minDistance) {
                                minDistance = dist;
                                clickedAyahIndex = index;
                            }
                        }
                    });
                });

                if (clickedAyahIndex !== -1) {
                    stopAudio();
                    state.currentAyahIndex = clickedAyahIndex;
                    playAyah(clickedAyahIndex);
                } else {
                    console.warn(`Ayet bulunamadı. MappedY=${Math.round(mappedY)}`);
                }
            });

            pageContainer.appendChild(imgWrapper);
        } else {
            // Zarif Sayfa Üst Bilgisi (Header)
            const topHeader = document.createElement('div');
            topHeader.className = 'page-top-header';
            
            // Sayfadaki eşsiz sureleri bul
            // Türkçe kısmı küçük, Arapça kısmı büyük yapalım
            const surahsOnPage = [...new Set(pageData.ayahs.map(a => a.surah))];
            const surahNamesStr = surahsOnPage.map(s => {
                const ayahsForSurah = pageData.ayahs.filter(a => a.surah === s);
                const firstAyah = ayahsForSurah[0].ayah;
                const lastAyah = ayahsForSurah[ayahsForSurah.length - 1].ayah;
                return `<span class="arabic-surah-top">${ARABIC_SURAH_NAMES[s - 1]}</span> <span class="latin-surah-top">• ${SURAH_NAMES[s - 1]} •</span> <span class="number-top">${firstAyah}-${lastAyah}</span>`;
            }).join('  |  ');
            
            topHeader.innerHTML = `
                <div>Sayfa ${pageNum}</div>
                <div class="surah-name">${surahNamesStr}</div>
                <div>${pageData.juz}. Cüz</div>
            `;
            pageContainer.appendChild(topHeader);

            const bismillahText = 'بِسْمِ اللّٰهِ الرَّحْمٰنِ الرَّحٖيمِ';

            pageData.ayahs.forEach((ayahObj, index) => {
                // Sure Başı Kontrolü (Ayet 1 ise)
                if (ayahObj.ayah === 1) {
                    const header = document.createElement('div');
                    header.className = 'surah-header';
                    header.style.fontFamily = "'DiyanetElif', Arial";
                    header.textContent = ARABIC_SURAH_NAMES[ayahObj.surah - 1];
                    pageContainer.appendChild(header);

                    // Besmele Kontrolü (Fatiha=1 ve Tevbe=9 hariç)
                    if (ayahObj.surah !== 1 && ayahObj.surah !== 9) {
                        const besmele = document.createElement('div');
                        besmele.className = 'bismillah';
                        besmele.textContent = bismillahText;
                        pageContainer.appendChild(besmele);
                    }
                }

                // Ayet Metni
                const ayahSpan = document.createElement('span');
                ayahSpan.className = 'ayah';
                ayahSpan.dataset.index = index;
                ayahSpan.dataset.surah = ayahObj.surah;
                ayahSpan.dataset.ayah = ayahObj.ayah;

                // Secde ayeti kontrolü
                const isSajda = SAJDA_AYAHS.some(s => s.surah === ayahObj.surah && s.ayah === ayahObj.ayah);
                if (isSajda) ayahSpan.classList.add('secde');
                
                const arabicNum = ayahObj.ayah.toString().replace(/\d/g, d => '٠١٢٣٤٥٦٧٨٩'[d]);
                const sajdaBadge = isSajda ? '<span class="sajda-badge">۩</span>' : '';

                ayahSpan.innerHTML = `${ayahObj.text} <span class="ayah-end${isSajda ? ' sajda-end' : ''}"><span class="ayah-num">${arabicNum}</span></span>${sajdaBadge}`;
                ayahSpan.addEventListener('click', () => {
                    stopAudio();
                    state.currentAyahIndex = index;
                    playAyah(index);
                });

                pageContainer.appendChild(ayahSpan);
            });
        }

        elements.readingArea.appendChild(pageContainer);
        elements.juzSelect.value = pageData.juz;
        elements.surahSelect.value = pageData.ayahs.length ? pageData.ayahs[0].surah : "";
    }

    // --- Audio Oynatma Sistemi ---

    function togglePlay() {
        if (state.isPlaying) {
            pauseAudio();
        } else {
            if (state.currentAyahIndex === -1) state.currentAyahIndex = 0;
            playAyah(state.currentAyahIndex);
        }
    }

    function getReciterUrl(surah, ayah) {
        // Diyanet WebDosya — CORS açık ses sunucusu
        // Format: https://webdosya.diyanet.gov.tr/kuran/kuranikerim/Sound/{reciterFolder}/{surah}_{ayah}.mp3
        const WEBDOSYA = 'https://webdosya.diyanet.gov.tr/kuran/kuranikerim/Sound';
        if (state.reciter === 'davutkaya') {
             return `${WEBDOSYA}/ar_davutKaya/${surah}_${ayah}.mp3`;
        } else if (state.reciter === 'osmansahin') {
             return `${WEBDOSYA}/ar_osmanSahin/${surah}_${ayah}.mp3`;
        } else {
             // EveryAyah (Alafasy) — farklı format
             let sStr = surah.toString().padStart(3, '0');
             let aStr = ayah.toString().padStart(3, '0');
             return `https://everyayah.com/data/Alafasy_128kbps/${sStr}${aStr}.mp3`;
        }
    }

    function playPageFallback() {
        const pageStr = state.currentPage.toString().padStart(3, '0');
        const url = `${RECITERS.fallbackAr}${pageStr}.mp3`;
        
        elements.coreAudio.src = url;
        elements.coreAudio.play().then(() => {
            state.isPlaying = true;
            elements.playPauseBtn.textContent = 'Duraklat';
            elements.playingInfo.innerHTML = `<strong>Haktan Kuran</strong> (${state.currentPage}. Sayfa Dinleniyor...)`;
        }).catch(e => {
            console.error(e);
            elements.playingInfo.textContent = 'Sayfa Sesi Bulunamadı';
        });
    }

    function playAyah(index) {
        state.isFallbackAttempting = false; // Yeni ayet oynatmada hatayı sıfırla
        const pageData = state.pagesData[state.currentPage];
        if (!pageData || !pageData.ayahs[index]) {
            // Sayfa bitti, sonrakine geç
            navigatePage(1);
            state.currentAyahIndex = 0;
            setTimeout(() => playAyah(0), 1000);
            return;
        }

        const ayahObj = pageData.ayahs[index];
        state.currentAyahIndex = index;
        
        // Vurgulama
        document.querySelectorAll('.ayah').forEach(el => el.classList.remove('active'));
        const activeSpan = document.querySelector(`.ayah[data-index="${index}"]`);
        if(activeSpan) {
            activeSpan.classList.add('active');
            activeSpan.scrollIntoView({ behavior: 'smooth', block: 'center' });
        }

        const url = getReciterUrl(ayahObj.surah, ayahObj.ayah);
        elements.coreAudio.src = url;
        
        elements.coreAudio.play().then(() => {
            state.isPlaying = true;
            elements.playPauseBtn.textContent = 'Duraklat';
            
            let rString = 'Davut Kaya';
            if (state.reciter === 'osmansahin') rString = 'Osman Şahin';
            if (state.reciter === 'everyayah') rString = 'M. Alafasy (EveryAyah)';
            
            elements.playingInfo.innerHTML = `<strong>${rString}</strong> (${SURAH_NAMES[ayahObj.surah - 1]} ${ayahObj.ayah} Dinleniyor...)`;
        }).catch(handleAudioError);
    }

    function handleAudioEnded() {
        // Sonraki ayete geç
        playAyah(state.currentAyahIndex + 1);
    }

    function handleAudioError(e) {
        if (state.isFallbackAttempting) return;

        const reciterNames = { davutkaya: 'Davut Kaya', osmansahin: 'Osman Şahin', everyayah: 'M. Alafasy' };
        const currentReciterName = reciterNames[state.reciter] || state.reciter;
        console.warn(`Ses yüklenemedi (${currentReciterName}):`, e);

        // Diyanet URL başarısız olduysa EveryAyah yedeğine geç
        if (elements.coreAudio.src.includes('diyanet.gov.tr')) {
            state.isFallbackAttempting = true;
            elements.playingInfo.innerHTML = `⚠️ <strong>${currentReciterName}</strong> yüklenemedi, yedek deneniyor...`;

            const pageData = state.pagesData[state.currentPage];
            if (pageData && pageData.ayahs[state.currentAyahIndex]) {
                const ayahObj = pageData.ayahs[state.currentAyahIndex];
                let sStr = ayahObj.surah.toString().padStart(3, '0');
                let aStr = ayahObj.ayah.toString().padStart(3, '0');
                
                const fallbackReciter = state.reciter === 'davutkaya' ? 'Alafasy_128kbps' : 'Husary_64kbps';
                const fallbackName = state.reciter === 'davutkaya' ? 'M. Alafasy (Yedek)' : 'Husary (Yedek)';

                elements.coreAudio.src = `https://everyayah.com/data/${fallbackReciter}/${sStr}${aStr}.mp3`;
                elements.coreAudio.load();

                setTimeout(() => {
                    elements.coreAudio.play().then(() => {
                        state.isPlaying = true;
                        elements.playPauseBtn.textContent = 'Duraklat';
                        elements.playingInfo.innerHTML = `⚠️ <strong>${fallbackName}</strong> (${SURAH_NAMES[ayahObj.surah - 1]} ${ayahObj.ayah})`;
                        
                        document.querySelectorAll('.ayah').forEach(el => el.classList.remove('active'));
                        const activeSpan = document.querySelector(`.ayah[data-index="${state.currentAyahIndex}"]`);
                        if(activeSpan) activeSpan.classList.add('active');
                    }).catch(err => {
                        console.error("Yedek de yüklenemedi:", err);
                        elements.playingInfo.innerHTML = `❌ Hiçbir ses kaynağı yüklenemedi (<strong>${currentReciterName}</strong> + Yedek)`;
                        state.isPlaying = false;
                        elements.playPauseBtn.textContent = 'Başlat';
                    });
                }, 150);
                return;
            }
        }

        stopAudio();
        elements.playingInfo.innerHTML = `❌ <strong>${currentReciterName}</strong> sesi yüklenemedi`;
    }

    function pauseAudio() {
        elements.coreAudio.pause();
        state.isPlaying = false;
        elements.playPauseBtn.textContent = 'Devam Et';
        elements.playingInfo.textContent = 'Duraklatıldı.';
    }

    function stopAudio() {
        elements.coreAudio.pause();
        elements.coreAudio.currentTime = 0;
        state.isPlaying = false;
        state.currentAyahIndex = -1;
        document.querySelectorAll('.ayah').forEach(el => el.classList.remove('active'));
        elements.playPauseBtn.textContent = 'Başlat';
        elements.playingInfo.textContent = 'Hazır.';
    }

    // Başlat
    init();
});
