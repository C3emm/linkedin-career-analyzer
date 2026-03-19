/**
 * Gerçek LinkedIn Profil Scraper - Playwright ile
 */

import { Page } from 'playwright';
import Anthropic from '@anthropic-ai/sdk';
import { createPage, waitForPageLoad } from './browser-manager.js';
import type { ProfileData, EducationEntry, ExperienceEntry } from '../types.js';
import logger from '../logger.js';
import { readFile } from 'fs/promises';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY
});

export interface RealScrapeOptions {
  includeCertifications: boolean;
  includeExtras: boolean;
}

/**
 * LinkedIn profilinden veri çıkar (Gerçek)
 */
export async function scrapeProfileReal(
  profileUrl: string,
  options: RealScrapeOptions
): Promise<ProfileData | null> {
  logger.info(`📄 Profil scraping: ${profileUrl}`);

  const page = await createPage();

  try {
    // Profile git
    await page.goto(profileUrl, { waitUntil: 'domcontentloaded', timeout: 60000 });
    await waitForPageLoad(page, 3000);

    // Biraz bekle
    await page.waitForTimeout(2000);

    // Profil özel mi kontrol et
    const isPrivate = await page
      .locator('text=This profile is private')
      .count()
      .then((count) => count > 0);

    if (isPrivate) {
      logger.warn('⚠️  Profil özel, atlanıyor');
      await page.close();
      return null;
    }

    // Sayfayı kaydırarak tüm içeriği yükle
    logger.info('⏬ Sayfa içeriği yükleniyor...');
    await scrollToLoadContent(page);

    // Sayfa HTML'ini al
    const htmlContent = await page.content();

    // Sayfayı kapat
    await page.close();

    // Claude ile veri çıkar
    logger.info('🤖 Claude AI ile profil verisi çıkarılıyor...');
    const profileData = await extractProfileDataWithClaude(htmlContent, options);

    if (profileData) {
      logger.info(`✓ Profil verisi çıkarıldı: ${profileData.title}`);
    }

    return profileData;
  } catch (error: any) {
    logger.error(`❌ Profil scraping hatası: ${error.message}`);
    await page.close().catch(() => {});
    return null;
  }
}

/**
 * Sayfayı kaydırarak tüm içeriği yükle
 */
async function scrollToLoadContent(page: Page): Promise<void> {
  // "Show more" butonlarına tıkla
  try {
    const showMoreButtons = page.locator('button:has-text("Show more")');
    const count = await showMoreButtons.count();

    for (let i = 0; i < Math.min(count, 5); i++) {
      try {
        await showMoreButtons.nth(i).click({ timeout: 2000 });
        await page.waitForTimeout(500);
      } catch (e) {
        // Buton tıklanamadıysa devam et
      }
    }
  } catch (error) {
    // Hata varsa devam et
  }

  // Sayfayı kaydır
  for (let i = 0; i < 3; i++) {
    await page.evaluate(() => window.scrollBy(0, window.innerHeight));
    await page.waitForTimeout(1000);
  }
}

/**
 * Claude AI ile profil verisini çıkar
 */
async function extractProfileDataWithClaude(
  htmlContent: string,
  options: RealScrapeOptions
): Promise<ProfileData | null> {
  try {
    // Prompt dosyasını oku
    const promptPath = join(__dirname, '../../prompts/extract_profile.md');
    const promptTemplate = await readFile(promptPath, 'utf-8');

    // Claude'a gönder
    const response = await anthropic.messages.create({
      model: 'claude-3-5-sonnet-20241022',
      max_tokens: 4096,
      messages: [
        {
          role: 'user',
          content: `${promptTemplate}

HTML İçeriği:
${htmlContent.slice(0, 100000)}

Lütfen bu LinkedIn profil sayfasından yapılandırılmış veri çıkar.
${options.includeCertifications ? 'Sertifikaları dahil et.' : 'Sertifikaları atlayabilirsin.'}
${options.includeExtras ? 'Projeler, yayınlar ve açık kaynak katkılarını dahil et.' : 'Ekstra bilgileri atlayabilirsin.'}

Sadece geçerli JSON döndür, başka açıklama ekleme.`
        }
      ]
    });

    // Claude'un yanıtını parse et
    const textContent = response.content[0];
    if (textContent.type !== 'text') {
      throw new Error('Unexpected response type');
    }

    let jsonText = textContent.text.trim();

    // Markdown kod bloklarını temizle
    if (jsonText.startsWith('```')) {
      jsonText = jsonText.replace(/```json\n?/g, '').replace(/```\n?/g, '');
    }

    const profileData: ProfileData = JSON.parse(jsonText);

    return profileData;
  } catch (error: any) {
    const errorMsg = error.message || error.toString() || 'Bilinmeyen hata';
    const errorType = error.name || 'Unknown';
    const hasApiKey = process.env.ANTHROPIC_API_KEY ? 'Evet' : 'Hayır';
    const apiKeyLen = process.env.ANTHROPIC_API_KEY?.length || 0;

    logger.error(`Claude veri çıkarma hatası: ${errorMsg}`);
    logger.error(`Hata tipi: ${errorType}`);
    logger.error(`API key mevcut? ${hasApiKey} (uzunluk: ${apiKeyLen})`);

    // Tüm error property'lerini göster
    const errorKeys = Object.keys(error).join(', ');
    logger.error(`Error properties: ${errorKeys || 'none'}`);

    // Circular reference'tan kaçınmak için sadece önemli alanları logla
    if (error.status) {
      logger.error(`API Status: ${error.status}`);
    }
    if (error.statusText) {
      logger.error(`API Status Text: ${error.statusText}`);
    }
    if (error.error) {
      try {
        logger.error(`API Error: ${JSON.stringify(error.error).slice(0, 200)}`);
      } catch {
        logger.error(`API Error: [unparseable]`);
      }
    }

    // JSON parse hatası için detay
    if (error.name === 'SyntaxError') {
      logger.error('JSON parse hatası - Claude yanıtı geçerli JSON değil');
    }

    // Stack trace
    if (error.stack) {
      const stackLines = error.stack.split('\n').slice(0, 5).join('\n');
      logger.error(`Stack trace:\n${stackLines}`);
    }

    // Error'ü console.error ile de logla (Winston bypass)
    console.error('RAW ERROR:', error);

    return null;
  }
}
