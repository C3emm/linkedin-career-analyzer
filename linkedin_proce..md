# LinkedIn Career Intelligence Analyzer
## Claude Code Talimatları

Bu dosya Claude Code'a projenin nasıl çalıştığını, hangi MCP araçlarını kullanacağını ve
her görevde nasıl davranması gerektiğini açıklar.

---

## Proje Amacı

Bu araç, bir kullanıcının hedef şirket ve pozisyon için LinkedIn üzerinden gerçek çalışan
profillerini analiz eder. Belirli bir alanda çalışan kişilerin sahip olduğu yetkinlikleri,
teknoloji yığınlarını, sertifikalarını ve eğitim geçmişlerini çıkararak kullanıcıya
"bu pozisyona girmek için ne gerekir?" sorusunu yanıtlar.

---

## Mimari Genel Bakış

```
Kullanıcı CLI/MCP İsteği
        │
        ▼
 Orchestrator (src/orchestrator.ts)
        │
   ┌────┴────┐
   │         │
   ▼         ▼
Playwright  Claude API
MCP Server  (Analiz)
   │
   ▼
LinkedIn Profil Scraper
   │
   ▼
HTML Web Arayüzü (src/ui/)
```

---

## Kullanılan MCP Sunucuları

### 1. Playwright MCP (`@playwright/mcp`)
LinkedIn profillerini ve arama sonuçlarını taramak için kullanılır.

**Kurulum:**
```bash
npx @playwright/mcp@latest
```

**Claude Code config (`~/.claude/claude_desktop_config.json`):**
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

> ⚠️ `PLAYWRIGHT_HEADLESS: false` — LinkedIn bot tespitini azaltmak için tarayıcı görünür çalışmalıdır.

### 2. Bu Proje MCP Sunucusu (opsiyonel)
`src/mcp-server.ts` dosyası, bu aracı başka Claude oturumlarına MCP olarak sunar.

---

## CLI Kullanımı

```bash
# Kurulum
npm install
npm run build

# Temel kullanım
node dist/cli.js \
  --company "Google" \
  --role "Software Engineer" \
  --department "Machine Learning" \
  --count 20

# Tam parametreler
node dist/cli.js \
  --company    <şirket adı>        # Zorunlu
  --role       <pozisyon başlığı>  # Zorunlu
  --department <departman>         # Opsiyonel
  --count      <profil sayısı>     # Default: 15
  --output     <html|json|both>    # Default: html
  --certs                          # Sertifika analizi dahil et
  --extras                         # Ek projeler/yayınlar dahil et

# Örnek
node dist/cli.js --company "Trendyol" --role "Backend Engineer" --count 25 --certs --extras
```

---

## MCP Araç Tanımları

Bu proje MCP sunucusu olarak çalıştığında şu araçları sunar:

### `analyze_linkedin_profiles`
```typescript
{
  name: "analyze_linkedin_profiles",
  description: "Belirtilen şirkette belirli pozisyonda çalışan LinkedIn profillerini analiz eder",
  inputSchema: {
    type: "object",
    properties: {
      company: {
        type: "string",
        description: "Hedef şirket adı (örn: 'Google', 'Trendyol')"
      },
      role: {
        type: "string", 
        description: "Hedef pozisyon (örn: 'Software Engineer', 'Data Scientist')"
      },
      department: {
        type: "string",
        description: "Departman filtresi (örn: 'Machine Learning', 'Platform')"
      },
      profile_count: {
        type: "number",
        description: "Analiz edilecek profil sayısı (5-50 arası, default: 15)"
      },
      include_certifications: {
        type: "boolean",
        description: "Sertifika analizini dahil et (default: false)"
      },
      include_extras: {
        type: "boolean",
        description: "Yan projeler, yayınlar, açık kaynak katkılarını dahil et (default: false)"
      }
    },
    required: ["company", "role"]
  }
}
```

### `get_skill_gap_report`
```typescript
{
  name: "get_skill_gap_report",
  description: "Kullanıcının mevcut yetkinliklerini analiz sonuçlarıyla karşılaştırır",
  inputSchema: {
    type: "object",
    properties: {
      current_skills: {
        type: "array",
        items: { type: "string" },
        description: "Kullanıcının sahip olduğu mevcut yetkinlikler"
      },
      target_analysis_id: {
        type: "string",
        description: "Önceki analyze_linkedin_profiles çağrısından dönen analiz ID'si"
      }
    },
    required: ["current_skills", "target_analysis_id"]
  }
}
```

---

## Claude Code'un Yapması Gereken Adımlar

Claude Code bu projeyi çalıştırırken şu sırayı izlemelidir:

### Adım 1 — Giriş Validasyonu
- Kullanıcıdan `company`, `role` ve opsiyonel parametreleri al
- Eksik parametre varsa kullanıcıya sor

### Adım 2 — LinkedIn Arama (Playwright MCP)
Playwright MCP'yi kullanarak şu adımları uygula:

```
1. LinkedIn'e git: https://www.linkedin.com/search/results/people/
2. Arama filtrelerini ayarla:
   - "Current company" = {company}
   - "Title" = {role}
3. İlk {count} profili listele
4. Her profil URL'sini kaydet
```

**Playwright MCP komutları:**
```
browser_navigate(url="https://www.linkedin.com/search/results/people/?keywords={role}&company={company}")
browser_take_screenshot()
browser_get_text(selector=".search-results-container")
```

### Adım 3 — Profil Scraping (Her Profil İçin)
Her profil sayfasında şu veriyi çıkar:

```
ÇIKARILACAK VERİ:
├── Başlık & Mevcut pozisyon
├── Eğitim geçmişi (okul, bölüm, yıl)
├── İş deneyimi (şirket, pozisyon, süre)
├── Yetkinlikler (Skills bölümü)
├── Sertifikalar (Licenses & Certifications)
├── Diller
└── Varsa: Projeler, Yayınlar, Açık Kaynak
```

**Veri çıkarma promptu için bkz:** `prompts/extract_profile.md`

### Adım 4 — Analiz (Claude API)
Toplanan ham profil verisini `prompts/analyze_profiles.md` promptuyla analiz et.

Çıktı formatı için bkz: `config/output_schema.json`

### Adım 5 — Rapor Üretimi
`src/ui/report-template.html` kullanılarak HTML raporu üret ve tarayıcıda aç.

---

## Önemli Kurallar ve Kısıtlamalar

### LinkedIn Bot Koruması
- Her profil ziyareti arasında **3-7 saniye bekle** (rastgele)
- Günde **50'den fazla profil** tarama (hesap riski)
- Kullanıcı **kendi LinkedIn hesabıyla giriş yapmış olmalı**
- `PLAYWRIGHT_HEADLESS=false` — asla headless çalıştırma

### Veri Gizliliği
- Kişisel bilgileri (isim, fotoğraf, URL) raporlara **dahil etme**
- Yalnızca **anonimleştirilmiş yetkinlik verisini** sakla
- Ham profil verisini diske **yazma**, yalnızca analiz çıktısını sakla

### Hata Yönetimi
- LinkedIn giriş sayfasına yönlendirirse: kullanıcıya haber ver, dur
- "Rate limit" veya CAPTCHA görünürse: 60 saniye bekle, tekrar dene
- Profil özel ise: atla, sayacı düşürme

---

## Dosya Yapısı

```
linkedin-analyzer/
├── CLAUDE.md                    # ← Bu dosya (Claude Code talimatları)
├── package.json
├── tsconfig.json
├── config/
│   ├── mcp-config.json          # MCP sunucu konfigürasyonu
│   └── output_schema.json       # Analiz çıktı şeması
├── prompts/
│   ├── extract_profile.md       # Profil veri çıkarma promptu
│   └── analyze_profiles.md      # Toplu analiz promptu
└── src/
    ├── cli.ts                   # CLI giriş noktası
    ├── mcp-server.ts            # MCP sunucu tanımı
    ├── orchestrator.ts          # Ana orkestrasyon mantığı
    ├── linkedin/
    │   ├── searcher.ts          # LinkedIn arama
    │   └── scraper.ts           # Profil scraping
    ├── analyzer/
    │   ├── profile-analyzer.ts  # Claude API analiz
    │   └── skill-extractor.ts   # Yetkinlik çıkarma
    └── ui/
        ├── report-generator.ts  # HTML rapor üretimi
        └── report-template.html # Rapor şablonu
```

---

## Çevre Değişkenleri

```env
ANTHROPIC_API_KEY=sk-ant-...     # Zorunlu
LINKEDIN_COOKIE=...              # Opsiyonel (otomatik giriş için)
OUTPUT_DIR=./reports             # Rapor çıktı dizini (default: ./reports)
MAX_PROFILES_PER_DAY=50         # Günlük limit
DELAY_MIN_MS=3000               # Profiller arası min bekleme
DELAY_MAX_MS=7000               # Profiller arası max bekleme
```

---

## Örnek Çıktı Yapısı

Analiz tamamlandığında `reports/` klasöründe HTML raporu oluşturulur:

```
📊 GOOGLE — SOFTWARE ENGINEER (ML PLATFORM) ANALİZİ
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Analiz edilen profil sayısı: 20
Analiz tarihi: 2026-03-19

## Temel Yetkinlikler (En Sık Görülen)
1. Python               ████████████████ %92
2. TensorFlow / PyTorch ██████████████   %78
3. Distributed Systems  █████████████    %71
4. Kubernetes           ████████████     %65
5. Go                   ██████████       %58

## Eğitim Geçmişi
- Lisans: Bilgisayar Mühendisliği / Yazılım Mühendisliği (%89)
- Yüksek Lisans: %54 (çoğunlukla ML/AI alanında)
- Doktora: %12

## Sık Görülen Sertifikalar
1. Google Professional ML Engineer
2. AWS Solutions Architect
3. CKA (Certified Kubernetes Administrator)

## Ekstra Çalışmalar
- Açık kaynak katkıları: %67 profilde
- Arxiv/akademik yayın: %23 profilde
- Kişisel GitHub projeleri: %81 profilde
```

---

## Geliştirici Notları

- TypeScript kullan, `strict: true` modunda
- Her modül için unit test yaz (`src/__tests__/`)
- Playwright için `page.waitForSelector()` yerine `page.getByRole()` tercih et
- LinkedIn DOM değişkenlere karşı `data-testid` yerine metin tabanlı seçiciler kullan
- Hata logları için `winston` logger kullan
