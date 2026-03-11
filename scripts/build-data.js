const fs = require('fs');
const path = require('path');

const DATA_DIR = path.join(__dirname, '../data');
const QURAN_FILE = path.join(DATA_DIR, 'quran-diyanet-elif.txt');
const SURAHS_OUT = path.join(DATA_DIR, 'surahs.js');
const PAGES_OUT = path.join(DATA_DIR, 'pages.js');

const MUSHAF_PAGES_FILE = path.join(__dirname, 'diyanet-mushaf-pages.ts');

const JUZ_PAGES = [
    1, 22, 42, 62, 82, 102, 122, 142, 162, 182, 
    202, 222, 242, 262, 282, 302, 322, 342, 362, 382, 
    402, 422, 442, 462, 482, 502, 522, 542, 562, 582
];

async function main() {
    console.log("Veriler hazırlanıyor...");

    if (!fs.existsSync(QURAN_FILE)) {
        console.error("Kuran text dosyası bulunamadı:", QURAN_FILE);
        return;
    }

    if (!fs.existsSync(MUSHAF_PAGES_FILE)) {
        console.error("Mushaf pages TS bulunamadı:", MUSHAF_PAGES_FILE);
        return;
    }

    const tsContent = fs.readFileSync(MUSHAF_PAGES_FILE, 'utf8');
    
    // Yalnızca süslü parantezlerin aralığını alalım ve noktalı virgül (;) içermemesine dikkat edelim.
    let startIndex = tsContent.indexOf('DIYANET_MUSHAF_PAGES');
    startIndex = tsContent.indexOf('{', startIndex);
    let endIndex = tsContent.lastIndexOf('}');
    
    let objStr = tsContent.substring(startIndex, endIndex + 1);
    
    let DIYANET_MUSHAF_PAGES;
    try {
        // Objeyi oluştur
        eval("DIYANET_MUSHAF_PAGES = " + objStr);
        console.log(`Diyanet mushaf mappingi okundu.`);
    } catch(e) {
        console.error("TS Parse Hatası:", e);
        return;
    }

    const lines = fs.readFileSync(QURAN_FILE, 'utf8').split('\n');
    let ayahsBySurah = {}; 
    let surahs = {};
    const basmalahRegex = /^بِسْمِ اللّٰهِ الرَّحْمٰنِ الرَّحٖيمِ(?: \)? ?)/;

    for (const line of lines) {
        if (!line.trim() || line.startsWith("#")) continue;

        const parts = line.split('|');
        if (parts.length < 3) continue;

        const surah = parseInt(parts[0], 10);
        const ayah = parseInt(parts[1], 10);
        let text = parts[2].trim();

        if (surah !== 1 && surah !== 9 && ayah === 1) {
             text = text.replace(basmalahRegex, "");
        }

        if (!surahs[surah]) {
            surahs[surah] = { id: surah, ayahCount: 0 };
            ayahsBySurah[surah] = {};
        }
        surahs[surah].ayahCount = Math.max(surahs[surah].ayahCount, ayah);
        ayahsBySurah[surah][ayah] = text;
    }

    let pagesOut = {};

    for (const p in DIYANET_MUSHAF_PAGES) {
        const pNum = parseInt(p, 10);
        const actualPageNum = pNum; // Diyanet standardı: Fatiha 0, Bakara 1...
        
        let c = 1;
        for(let j=0; j<JUZ_PAGES.length; j++) {
            // JUZ_PAGES genelde 1-based, ama actualPageNum Diyanet'in kendi offsetine sahip.
            // Fatiha(0) her türlü 1. cüz.
            if(actualPageNum >= JUZ_PAGES[j]) c = j+1;
        }
        if (actualPageNum === 0) c = 1;

        let pageAyahs = [];
        let segments = DIYANET_MUSHAF_PAGES[pNum]; 

        segments.forEach(seg => {
            const { surah, fromAyah, toAyah } = seg; // TS dosyasındaki alan adları fromAyah ve toAyah
            for (let a = fromAyah; a <= toAyah; a++) {
                const text = ayahsBySurah[surah] && ayahsBySurah[surah][a] ? ayahsBySurah[surah][a] : `Ayet Bulunamadı (${surah}:${a})`;
                pageAyahs.push({
                    surah,
                    ayah: a,
                    text
                });
            }
        });

        pagesOut[actualPageNum] = {
            pageNumber: actualPageNum,
            juz: c,
            ayahs: pageAyahs
        };
    }

    fs.writeFileSync(SURAHS_OUT, "window.surahsData = " + JSON.stringify(surahs, null, 2) + ";");
    fs.writeFileSync(PAGES_OUT, "window.pagesData = " + JSON.stringify(pagesOut, null, 2) + ";");

    console.log(`Veri başarıyla oluşturuldu: ${Object.keys(surahs).length} Sure, ${Object.keys(pagesOut).length} Sayfa.`);
}

main().catch(console.error);
