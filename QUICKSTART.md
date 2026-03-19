# 🚀 Quick Start Guide

LinkedIn Career Analyzer'ı 5 dakikada çalıştırın!

## Adım 1: Node.js Kurulumu

### macOS
```bash
# Homebrew ile (önerilen)
brew install node

# veya nvm ile
curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.39.0/install.sh | bash
nvm install --lts
```

### Windows
[Node.js resmi sitesinden](https://nodejs.org/) LTS sürümünü indirin ve kurun.

### Linux
```bash
# Ubuntu/Debian
sudo apt update
sudo apt install nodejs npm

# Fedora
sudo dnf install nodejs npm
```

**Kontrol:**
```bash
node --version  # v18.0.0 veya üzeri
npm --version   # 9.0.0 veya üzeri
```

## Adım 2: Projeyi Hazırlayın

```bash
# Proje dizinine gidin
cd ai_agent_test1

# Bağımlılıkları yükleyin
npm install

# TypeScript'i derleyin
npm run build
```

## Adım 3: Çevre Değişkenlerini Ayarlayın

```bash
# .env dosyası oluşturun
cp .env.example .env

# .env dosyasını editörde açın
nano .env  # veya code .env
```

**.env dosyasına ekleyin:**
```env
ANTHROPIC_API_KEY=sk-ant-api03-xxxxxxxxxxxx
```

> 💡 Anthropic API Key'i [console.anthropic.com](https://console.anthropic.com/) adresinden alabilirsiniz.

## Adım 4: Web Sunucusunu Başlatın

```bash
npm run web
```

Şu çıktıyı göreceksiniz:
```
🚀 LinkedIn Career Analyzer Web sunucusu başlatıldı
📡 http://localhost:3000
📊 API: http://localhost:3000/api/health
```

## Adım 5: Tarayıcıda Açın

```bash
# macOS
open http://localhost:3000

# Linux
xdg-open http://localhost:3000

# Windows
start http://localhost:3000
```

## ✅ İlk Analizinizi Yapın

1. **Şirket Adı:** örn: "Google", "Microsoft", "Trendyol"
2. **Pozisyon:** örn: "Software Engineer", "Data Scientist"
3. **Profil Sayısı:** 15 (demo için yeterli)
4. **Analizi Başlat** butonuna tıklayın

## ⚠️ Önemli Notlar

### Mock Data Modu

**Şu anda proje mock (sahte) data ile çalışıyor.** Gerçek LinkedIn scraping için:

1. **Playwright MCP kurulumu gerekli:**
```bash
npx @playwright/mcp@latest
```

2. **Claude Desktop Config'e ekleyin** (`~/.claude/claude_desktop_config.json`):
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

3. **LinkedIn'e giriş yapın** - Bot korumasını aşmak için

### Rate Limiting

LinkedIn bot koruması nedeniyle:
- Günlük max **50 profil** analiz edin
- Profiller arası **3-7 saniye** bekleme süresi var
- **Headless mode kapalı** olmalı (tarayıcı görünür)

## 🐛 Sorun Giderme

### Port zaten kullanımda
```bash
# Farklı port kullanın
PORT=8080 npm run web
```

### npm install hatası
```bash
# Node modüllerini temizle
rm -rf node_modules package-lock.json
npm install
```

### TypeScript derlenmiyor
```bash
# tsconfig.json kontrolü
npm run build -- --listFiles
```

### API Key hatası
```bash
# .env dosyasını kontrol edin
cat .env | grep ANTHROPIC_API_KEY
```

## 📚 Daha Fazla Bilgi

- [README.md](README.md) - Detaylı dokümantasyon
- [linkedin_proce..md](linkedin_proce..md) - Claude Code talimatları
- [API Documentation](#api-endpoints) - REST API referansı

## 🎉 Hazırsınız!

Artık LinkedIn Career Analyzer kullanıma hazır. Sorularınız için:
- GitHub Issues: [github.com/yourrepo/issues]
- Documentation: [README.md](README.md)
