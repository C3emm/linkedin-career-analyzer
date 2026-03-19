# LinkedIn Career Intelligence Analyzer

LinkedIn'de belirli şirket ve pozisyondaki çalışanların profillerini analiz ederek kariyer yol haritası çıkarır.

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

## 📄 Lisans

MIT

## 🤝 Katkıda Bulunma

1. Fork edin
2. Feature branch oluşturun (`git checkout -b feature/amazing-feature`)
3. Commit edin (`git commit -m 'Add some amazing feature'`)
4. Push edin (`git push origin feature/amazing-feature`)
5. Pull Request açın
