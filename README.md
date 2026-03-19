# LinkedIn Career Intelligence Analyzer

LinkedIn'de belirli şirket ve pozisyondaki çalışanların profillerini analiz ederek kariyer yol haritası çıkarır.

## 💡 Neden Bu Projeyi Yaptım?

Kariyer planlaması yaparken hep şunu merak etmişimdir: "Google'da Software Engineer olan insanlar nasıl oraya ulaştılar?" LinkedIn'de tek tek profillere bakıp not almak çok zahmetli ve verimsizdi.

Bu projeyle şunu çözmeye çalıştım: Hedeflediğim şirket ve pozisyondaki onlarca kişinin profilini otomatik toplayıp, AI ile analiz edip, ortak paternleri bulmak. Mesela hangi üniversitelerden geliyorlar, hangi teknolojileri biliyorlar, hangi sertifikaları almışlar gibi.

Başlangıçta sadece kendim için bir script yazmayı düşünmüştüm ama sonra dedim ki "Bunu düzgün bir web uygulaması haline getireyim, başkaları da kullansın". TypeScript ile yazdım çünkü type safety seviyorum, Playwright ile scraping yaptım çünkü LinkedIn'in dinamik yapısıyla baş edebiliyordu, Claude AI kullandım çünkü profil verisini anlamlandırmada çok iyiydi.

Proje şu an hem web arayüzü hem CLI hem de MCP sunucu olarak çalışabiliyor. En çok kullandığım özelliği web arayüzü oldu açıkçası, çok pratik.

## 🎯 Özellikler

- 🌐 **Web Arayüzü** - Tarayıcıdan kullanılabilir modern UI
- 🔍 LinkedIn profil araması (Playwright MCP ile)
- 🤖 Otomatik profil veri çıkarma
- 📊 Claude API ile akıllı analiz
- 📄 HTML/JSON rapor üretimi
- 🔌 MCP sunucu olarak kullanılabilme
- 💻 CLI desteği

## 📦 Kurulum

```bash
# Bağımlılıkları yükle
npm install

# TypeScript'i derle
npm run build

# .env dosyası oluştur
cp .env.example .env
# .env dosyasını düzenle ve ANTHROPIC_API_KEY ekle
```

## 🚀 Kullanım

### 🌐 Web Arayüzü ile (Önerilen)

```bash
# Sunucuyu başlat
npm run web

# Tarayıcıda aç
open http://localhost:3000
```

Web arayüzünden:
1. Şirket adını ve pozisyonu girin
2. Opsiyonel parametreleri ayarlayın
3. "Analizi Başlat" butonuna tıklayın
4. Sonuçları görüntüleyin ve raporu indirin

**Port değiştirme:**
```bash
PORT=8080 npm run web
```

### 💻 CLI ile

```bash
# Temel kullanım
node dist/cli.js --company "Google" --role "Software Engineer" --count 20

# Tüm özelliklerle
node dist/cli.js \
  --company "Trendyol" \
  --role "Backend Engineer" \
  --department "Platform" \
  --count 25 \
  --certs \
  --extras \
  --output both
```

### Parametreler

- `--company` (zorunlu): Hedef şirket adı
- `--role` (zorunlu): Hedef pozisyon
- `--department` (opsiyonel): Departman filtresi
- `--count` (opsiyonel): Profil sayısı (5-50, default: 15)
- `--output` (opsiyonel): Çıktı formatı (html|json|both, default: html)
- `--certs`: Sertifika analizini dahil et
- `--extras`: Yan projeler, yayınlar, açık kaynak katkılarını dahil et

## 🔧 MCP Sunucu Olarak

```bash
# MCP sunucusunu başlat
npm run mcp
```

Claude Desktop config'e ekle (`~/.claude/claude_desktop_config.json`):

```json
{
  "mcpServers": {
    "linkedin-analyzer": {
      "command": "node",
      "args": ["/path/to/dist/mcp-server.js"],
      "env": {
        "ANTHROPIC_API_KEY": "your-api-key"
      }
    }
  }
}
```

## 📊 Çıktı Örneği

Analiz tamamlandığında `reports/` klasöründe HTML raporu oluşturulur:

- En sık görülen yetkinlikler (grafik ile)
- Eğitim istatistikleri
- Sık görülen sertifikalar
- Ek aktiviteler (açık kaynak, yayınlar, vb.)

## ⚠️ Önemli Notlar

### LinkedIn Bot Koruması

- Her profil arasında 3-7 saniye bekleme
- Günlük max 50 profil tarama
- Playwright headless=false modda çalışmalı
- LinkedIn'e giriş yapmış olmalısınız

### Playwright MCP Kurulumu

```bash
# Playwright MCP'yi yükle
npx @playwright/mcp@latest
```

Claude Desktop config'e Playwright ekle:

```json
{
  "mcpServers": {
    "playwright": {
      "command": "npx",
      "args": ["@playwright/mcp@latest"],
      "env": {
        "PLAYWRIGHT_HEADLESS": "false"
      }
    }
  }
}
```

## 🏗️ Proje Yapısı

```
linkedin-analyzer/
├── src/
│   ├── web-server.ts          # 🌐 Express web sunucusu
│   ├── cli.ts                 # CLI giriş noktası
│   ├── mcp-server.ts          # MCP sunucu
│   ├── orchestrator.ts        # Ana orkestrasyon
│   ├── types.ts               # TypeScript tipleri
│   ├── logger.ts              # Winston logger
│   ├── utils.ts               # Yardımcı fonksiyonlar
│   ├── linkedin/
│   │   ├── searcher.ts        # LinkedIn arama
│   │   └── scraper.ts         # Profil scraping
│   ├── analyzer/
│   │   └── profile-analyzer.ts # Profil analizi
│   └── ui/
│       └── report-generator.ts # Rapor üretimi
├── public/                    # 🌐 Web arayüzü
│   ├── index.html             # Ana sayfa
│   ├── css/
│   │   └── style.css          # Stiller
│   └── js/
│       └── app.js             # Frontend JavaScript
├── prompts/
│   ├── extract_profile.md     # Profil çıkarma promptu
│   └── analyze_profiles.md    # Analiz promptu
├── config/
│   ├── mcp-config.json        # MCP yapılandırması
│   └── output_schema.json     # Çıktı şeması
└── reports/                   # Üretilen raporlar
```

## 🔌 API Endpoints

Web sunucusu aşağıdaki API endpoint'lerini sunar:

### `POST /api/analyze`
LinkedIn profil analizi başlatır.

**Request Body:**
```json
{
  "company": "Google",
  "role": "Software Engineer",
  "department": "Machine Learning",
  "profile_count": 20,
  "include_certifications": true,
  "include_extras": true
}
```

**Response:**
```json
{
  "analysisId": "analysis_1234567890_abc123",
  "company": "Google",
  "role": "Software Engineer",
  "profileCount": 20,
  "topSkills": [...],
  "educationStats": {...},
  ...
}
```

### `GET /api/report/:analysisId`
Analiz raporunu JSON olarak indirir.

### `GET /api/health`
Sunucu sağlık kontrolü.

## 📝 Geliştirme

```bash
# Geliştirme modunda çalıştır (otomatik derleme)
npm run dev

# Test çalıştır
npm test

# Build
npm run build

# Web sunucusunu başlat
npm run web
```

## 🔐 Güvenlik ve Gizlilik

- Kişisel bilgiler (isim, fotoğraf, profil URL) raporlara dahil edilmez
- Yalnızca anonimleştirilmiş yetkinlik verisi saklanır
- Ham profil verisi diske yazılmaz

## 🛠️ Teknik Detaylar ve Öğrendiklerim

Bu proje yaparken birçok şey öğrendim, bazılarını paylaşmak istiyorum:

### Web Scraping Zorlukları
LinkedIn bot koruması oldukça sağlam. Başta headless modda çalıştırmayı denedim ama hemen yakaladı. Sonra Playwright'i headless=false yaptım, her profil arasına 3-7 saniye rastgele bekleme ekledim. Ayrıca günlük max 50 profil sınırı koydum ki hesap banlanmasın.

### AI Prompt Engineering
Claude'a profil verisini göndermek kolaydı ama düzgün çıktı almak başta zordu. JSON schema kullandım, prompt'u markdown dosyasında tutup versiyonladım. En büyük öğrenme: AI'ya ne istediğini çok net anlatman gerekiyor, yoksa her seferinde farklı format dönüyor.

### Modüler Mimari
Başta her şeyi tek dosyada yazmıştım (klasik hata). Sonra scraper, analyzer, report generator diye ayırdım. Şimdi her modül kendi işini yapıyor, test etmesi de çok daha kolay oldu.

### MCP Protokolü
Anthropic'in yeni çıkardığı MCP protokolünü denedim. Baya ilginç, Claude Desktop'a tool olarak entegre edebiliyorsun projeyi. Dökümantasyonu okumak biraz zaman aldı ama değdi.

### Type Safety
TypeScript kullanmak gerçekten çok işime yaradı. Özellikle profil verisi gibi kompleks objeleri handle ederken, interface'ler sayesinde hangi field'ın ne tipte olduğunu biliyorum. Compile-time'da bir sürü hatayı yakaladım.

### Asenkron İşlemler
Node.js'te async/await pattern'ini iyi öğrendim bu projede. Özellikle paralel profil scraping yaparken Promise.all kullandım, çok hızlandırdı işlemi.

## 📄 Lisans

MIT

## 🤝 Katkıda Bulunma

1. Fork edin
2. Feature branch oluşturun (`git checkout -b feature/amazing-feature`)
3. Commit edin (`git commit -m 'Add some amazing feature'`)
4. Push edin (`git push origin feature/amazing-feature`)
5. Pull Request açın

---

**Not:** Bu proje eğitim amaçlıdır. LinkedIn'in kullanım şartlarına uygun şekilde, etik ve sorumlu kullanım önemlidir.
