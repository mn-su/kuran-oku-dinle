# Kur'an Oku & Dinle

Diyanet İşleri Başkanlığı ve EveryAyah verilerini kullanan, Kur'an-ı Kerim okuma ve dinleme uygulaması.

## ✨ Özellikler

- **İki Görünüm Modu:** Diyanet Elif fontu ile metin modu veya Mushaf görsel modu
- **Ayet-Ayet Dinleme:** Davut Kaya, Osman Şahin (Diyanet) ve M. Alafasy (EveryAyah)
- **Akıllı Ses Yönetimi:** Birincil kaynak yüklenemezse otomatik yedek devreye girer
- **Secde Ayetleri:** 14 secde ayeti kırmızı vurgu ve ۩ simgesiyle işaretli
- **Navigasyon:** Cüz, sure ve sayfa numarası ile gezinme
- **Klavye Kısayolları:** ← Geri, → İleri, Boşluk: Oynat/Duraklat
- **Otomatik Kayıt:** Son sayfa, okuyucu tercihi ve ayarlar `localStorage` ile hatırlanır
- **Karanlık Mod:** Sistem temasına uyum (mushaf alanı her zaman açık arka planlı)
- **Debug Modu:** Mushaf koordinat ızgarası ve fare takipçisi (Ayarlar'dan açılır)

## 🚀 Kullanım

Doğrudan `index.html` dosyasını tarayıcıda açın veya herhangi bir statik sunucu ile sunun:

```bash
npx serve -p 8080
```

## 📁 Yapı

```
okuma-modu/
├── index.html              # Ana sayfa
├── assets/
│   ├── app.js              # Uygulama mantığı
│   └── style.css           # Stiller
├── data/
│   ├── pages.js            # Sayfa-ayet verileri (605 sayfa)
│   ├── surahs.js           # Sure bilgileri (114 sure)
│   ├── coordinates.js      # Mushaf görsel koordinatları
│   ├── pages/              # Mushaf sayfa görselleri (PNG)
│   └── audio/              # Lokal ses dosyaları (opsiyonel)
└── scripts/
    ├── build-data.js        # Veri oluşturma betiği
    └── diyanet-mushaf-pages.ts
```

## 🔊 Ses Kaynakları

| Okuyucu | Kaynak | CORS |
|---|---|---|
| Davut Kaya | webdosya.diyanet.gov.tr | ✅ Açık |
| Osman Şahin | webdosya.diyanet.gov.tr | ✅ Açık |
| M. Alafasy | everyayah.com (Yedek) | ✅ Açık |


## 📜 Lisans

Kur'an-ı Kerim verileri ve ses dosyaları T.C. Diyanet İşleri Başkanlığı'na ve everyayah.com'a aittir.
