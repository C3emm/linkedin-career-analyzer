# 🌐 Gerçek LinkedIn Scraping Rehberi

Bu rehber, projeyi **gerçek LinkedIn verileri** ile nasıl kullanacağınızı adım adım anlatır.

---

## ⚠️ ÖNEMLİ UYARILAR

1. **LinkedIn Kullanım Şartları**: Bu araç eğitim ve araştırma amaçlıdır. LinkedIn'in kullanım şartlarına uygun kullanın.
2. **Rate Limiting**: Günde maximum 50 profil taraması yapın.
3. **Hesap Riski**: Aşırı kullanım hesabınızın askıya alınmasına neden olabilir.
4. **Kişisel Kullanım**: Yalnızca kendi LinkedIn hesabınızla kullanın.

---

## 📋 GEREKSİNİMLER

### 1. Tamamlanmış Kurulum
```bash
# Node.js kurulu olmalı
node --version  # v18+ gerekli

# Bağımlılıklar yüklenmiş olmalı
npm install

# Playwright tarayıcıları kurulu olmalı
npx playwright install chromium
```

### 2. LinkedIn Hesabı
- Aktif bir LinkedIn hesabınız olmalı
- Hesabınızla giriş yapabilmelisiniz

### 3. Anthropic API Key
- `.env` dosyasında `ANTHROPIC_API_KEY` tanımlı olmalı

---

## 🚀 ADIM ADIM KURULUM

### ADIM 1: Playwright Tarayıcılarını Kurun

```bash
npx playwright install chromium
```

Bu komut Chromium tarayıcısını indirecektir (~200MB).

**Beklenen çıktı:**
```
Downloading Chromium...
✓ chromium downloaded successfully
```

### ADIM 2: .env Dosyasını Güncelleyin

`.env` dosyasını açın:
```bash
nano .env
# veya
code .env
```

Şu değişiklikleri yapın:
```env
# Anthropic API Key (Zorunlu)
ANTHROPIC_API_KEY=sk-ant-api03-SIZIN_KEY_INIZ

# Gerçek LinkedIn Scraping'i AÇIN
USE_REAL_SCRAPING=true

# LinkedIn Cookie (Opsiyonel - şimdilik boş bırakabilirsiniz)
LINKEDIN_COOKIE=

# Güvenli limit
MAX_PROFILES_PER_DAY=50

# Profiller arası bekleme (bot koruması)
DELAY_MIN_MS=5000
DELAY_MAX_MS=10000
```

### ADIM 3: Projeyi Derleyin

```bash
npm run build
```

### ADIM 4: Web Sunucusunu Başlatın

```bash
npm run web
```

---

## 🎯 İLK GERÇEKLİNKEDIN ARAMANIZ

### 1. Tarayıcıda Açın

```bash
open http://localhost:3000
```

### 2. Küçük Bir Test Yapın

Formu doldurun:
- **Şirket Adı**: `Google`
- **Pozisyon**: `Software Engineer`
- **Profil Sayısı**: `5` ⚠️ İlk test için küçük sayı!
- ✅ Sertifika analizi
- ✅ Yan projeler

**"Analizi Başlat"** butonuna tıklayın.

### 3. LinkedIn'e Giriş Yapın

Playwright **bir tarayıcı penceresi açacak**:

1. LinkedIn giriş sayfası otomatik olarak açılacak
2. **Manuel olarak giriş yapın**:
   - Email/telefon girin
   - Şifrenizi girin
   - "Sign in" tıklayın
3. Ana sayfaya (Feed) yönlendirilene kadar bekleyin
4. Terminal'de "✓ LinkedIn girişi başarılı" mesajını göreceksiniz

### 4. Scraping Başlasın

Giriş yaptıktan sonra:
- Tarayıcı **kendi kendine** arama yapacak
- Profilleri bulacak
- Her profile girerek verileri çekecek
- Terminal'de ilerlemeyi göreceksiniz

**Terminal çıktısı:**
```
🌐 MOD: Gerçek LinkedIn Scraping (Playwright)
Tarayıcı başlatılıyor...
✓ Tarayıcı hazır
📊 Arama yapılıyor: "Software Engineer Google"
✓ 5 profil URL'si bulundu
[1/5] Profil scraping...
🤖 Claude AI ile profil verisi çıkarılıyor...
✓ Profil verisi çıkarıldı: Senior Software Engineer
```

### 5. Sonuçları Görüntüleyin

Scraping tamamlandığında:
- Web arayüzünde **gerçek veriler** görünecek
- İsimler, üniversiteler, yetkinlikler **gerçek** olacak
- Raporu indirebilirsiniz

---

## ⏱️ SÜRE VE LİMİTLER

### Beklenen Süreler
- **5 profil**: ~5-10 dakika
- **15 profil**: ~20-30 dakika
- **50 profil**: ~1-2 saat

### Neden Bu Kadar Uzun?
1. Her profil arasında 5-10 saniye bekleme (bot koruması)
2. LinkedIn'in yükleme süreleri
3. Claude AI'ın veri çıkarma süresi

### Güvenli Kullanım
```
✅ Günde max 50 profil
✅ Her profil arası 5-10 saniye
✅ Gündüz saatlerinde kullanım
❌ Binlerce profil çekme
❌ Hızlı arka arkaya aramalar
❌ Geceler boyu çalıştırma
```

---

## 🔧 SORUN GİDERME

### Problem 1: "Tarayıcı başlatılamadı"

**Çözüm:**
```bash
# Playwright'ı tekrar kur
npx playwright install --force chromium

# Sistem bağımlılıklarını yükle (Linux)
npx playwright install-deps
```

### Problem 2: "LinkedIn girişi başarısız"

**Çözüm:**
- LinkedIn hesabınızın aktif olduğundan emin olun
- İki faktörlü kimlik doğrulama varsa tamamlayın
- CAPTCHA çıkarsa manuel olarak çözün
- VPN kullanıyorsanız kapatmayı deneyin

### Problem 3: "Profil verisi çıkarılamadı"

**Çözüm:**
- Profil özel olabilir (atlanır, normal)
- Claude API limitine ulaşmış olabilirsiniz
- ANTHROPIC_API_KEY'in doğru olduğundan emin olun

### Problem 4: "Rate limit" uyarısı

**Çözüm:**
- LinkedIn sizi tespit etmiş olabilir
- 1-2 saat bekleyin
- Daha az profil isteyin
- DELAY_MIN_MS ve DELAY_MAX_MS değerlerini artırın

### Problem 5: Tarayıcı çok hızlı kapanıyor

**Çözüm:**
`.env` dosyasında:
```env
DELAY_MIN_MS=10000  # 10 saniye
DELAY_MAX_MS=15000  # 15 saniye
```

---

## 📊 GERÇEK VS MOCK VERİ KARŞILAŞTIRMA

### Mock Mod (USE_REAL_SCRAPING=false)
```
✅ Hızlı (30 saniye)
✅ LinkedIn girişi gerekmez
✅ Sınırsız kullanım
❌ Sahte veriler
❌ Hep aynı sonuçlar
```

### Gerçek Mod (USE_REAL_SCRAPING=true)
```
✅ Gerçek LinkedIn verileri
✅ Kişi isimleri, üniversiteler, yetkinlikler
✅ Her aramada farklı sonuçlar
❌ Yavaş (5-10 profil = 10-20 dakika)
❌ LinkedIn girişi gerekli
❌ Günlük limit var
```

---

## 🎯 ÖRNEK KULLANIM SENARYOLARI

### Senaryo 1: Kariyer Planlama
```
Şirket: Meta
Pozisyon: Frontend Engineer
Profil: 20
Amaç: React ekosisteminde hangi yetkinlikler gerekli?
```

### Senaryo 2: Müfredat Geliştirme
```
Şirket: Amazon
Pozisyon: Backend Engineer
Profil: 30
Amaç: Bootcamp müfredatı sektör ihtiyaçlarını karşılıyor mu?
```

### Senaryo 3: Beceri Boşluğu
```
Şirket: Google
Pozisyon: ML Engineer
Profil: 25
Amaç: Mevcut yetkinliklerimle aradaki fark ne?
```

---

## 📝 EN İYİ UYGULAMALAR

### 1. Küçük Başlayın
```bash
# İlk test: 5 profil
# Başarılıysa: 15 profil
# Güven kazandıktan sonra: 30-50 profil
```

### 2. Farklı Zamanlarda Kullanın
```bash
# ✅ Sabah: 10 profil
# ✅ Öğle: 10 profil
# ✅ Akşam: 10 profil
# ❌ Gece tek seferde: 50 profil
```

### 3. Profil Sayısını Optimize Edin
```bash
# Genel trend için: 15-20 profil yeterli
# Detaylı analiz için: 30-40 profil
# Akademik araştırma için: 50+ profil
```

### 4. Sonuçları Kaydedin
Her analiz sonrası JSON raporunu indirin:
```bash
reports/
  ├── Google_SoftwareEngineer_2026-03-19.json
  ├── Meta_Frontend_2026-03-19.json
  └── ...
```

---

## 🔐 GÜVENLİK VE GİZLİLİK

### Veri Anonimleştirme
Proje otomatik olarak:
- ❌ İsim paylaşmaz
- ❌ Fotoğraf URL'i saklamaz
- ❌ Profil URL'leri raporlara dahil edilmez
- ✅ Sadece yetkinlik/eğitim istatistikleri

### LinkedIn Hesabı Güvenliği
- Her zaman kendi hesabınızı kullanın
- Şifrenizi paylaşmayın
- İki faktörlü kimlik doğrulamayı açık tutun

---

## 🆘 YARDIM VE DESTEK

### Logları Kontrol Edin
```bash
# Terminal çıktısına bakın
# combined.log dosyasını kontrol edin
cat combined.log | tail -n 50

# Hata logları
cat error.log
```

### Tarayıcıyı Görsel Olarak İzleyin
Playwright **headless=false** modda çalışır, yani tarayıcıyı görebilirsiniz.
Ne yaptığını izleyebilirsiniz.

### Acil Durumda Durdurun
```bash
# Terminal'de Ctrl + C
# Tarayıcı otomatik kapanır
```

---

## ✅ BAŞARILI KULLANIM KONTROLLİSTESİ

- [ ] Node.js v18+ kurulu
- [ ] npm install tamamlandı
- [ ] Playwright chromium kurulu
- [ ] .env dosyasında ANTHROPIC_API_KEY tanımlı
- [ ] .env dosyasında USE_REAL_SCRAPING=true
- [ ] npm run build başarılı
- [ ] npm run web çalışıyor
- [ ] LinkedIn hesabı aktif
- [ ] İlk testte 5 profil denendi
- [ ] LinkedIn girişi başarılı
- [ ] İlk sonuçlar alındı

---

## 🎉 HAZIRSINIZ!

Artık gerçek LinkedIn verilerini analiz edebilirsiniz!

**İpucu:** İlk birkaç aramada küçük sayılarla (5-10 profil) test yapın, sistem sorunsuz çalışınca sayıyı artırın.

Sorularınız için: [README.md](README.md) | [QUICKSTART.md](QUICKSTART.md)
