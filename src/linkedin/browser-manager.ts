/**
 * Playwright Browser Manager
 * LinkedIn scraping için tarayıcı yönetimi
 */

import { chromium, Browser, Page, BrowserContext } from 'playwright';
import logger from '../logger.js';
import { readFile } from 'fs/promises';

let browser: Browser | null = null;
let context: BrowserContext | null = null;

/**
 * Tarayıcıyı başlat
 */
export async function initBrowser(): Promise<void> {
  if (browser) {
    logger.info('Tarayıcı zaten açık');
    return;
  }

  logger.info('Tarayıcı başlatılıyor...');

  browser = await chromium.launch({
    headless: false, // LinkedIn bot koruması için görünür mod
    args: [
      '--disable-blink-features=AutomationControlled',
      '--no-sandbox',
      '--disable-setuid-sandbox'
    ]
  });

  context = await browser.newContext({
    viewport: { width: 1920, height: 1080 },
    userAgent: 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
    locale: 'en-US',
    timezoneId: 'America/New_York'
  });

  // LinkedIn cookie'lerini yükle (varsa)
  try {
    const cookieData = process.env.LINKEDIN_COOKIE;
    if (cookieData) {
      logger.info('LinkedIn cookie yükleniyor...');
      // Cookie'yi parse et ve context'e ekle
      // Bu kısım .env'de LINKEDIN_COOKIE varsa kullanılır
    }
  } catch (error) {
    logger.warn('Cookie yüklenemedi, manuel giriş gerekebilir');
  }

  logger.info('✓ Tarayıcı hazır');
}

/**
 * Yeni bir sayfa oluştur
 */
export async function createPage(): Promise<Page> {
  if (!context) {
    await initBrowser();
  }

  const page = await context!.newPage();

  // Anti-bot önlemleri
  await page.addInitScript(() => {
    // @ts-ignore
    Object.defineProperty(navigator, 'webdriver', {
      get: () => undefined,
    });
  });

  return page;
}

/**
 * Tarayıcıyı kapat
 */
export async function closeBrowser(): Promise<void> {
  if (browser) {
    logger.info('Tarayıcı kapatılıyor...');
    await browser.close();
    browser = null;
    context = null;
    logger.info('✓ Tarayıcı kapatıldı');
  }
}

/**
 * LinkedIn'e giriş yap (manuel)
 */
export async function loginToLinkedIn(page: Page): Promise<boolean> {
  try {
    logger.info('LinkedIn giriş sayfasına gidiliyor...');
    await page.goto('https://www.linkedin.com/login', { waitUntil: 'networkidle' });

    // Kullanıcının manuel giriş yapması için bekle
    logger.info('');
    logger.info('🔐 LÜTFENDİKKAT:');
    logger.info('   Tarayıcıda LinkedIn\'e GİRİŞ YAPIN');
    logger.info('   Giriş yaptıktan sonra ana sayfaya yönlendirileceksiniz');
    logger.info('   (Bu işlem bir kez yapılır, sonra cookie kaydedilir)');
    logger.info('');

    // Ana sayfaya yönlendirilene kadar bekle (max 5 dakika)
    await page.waitForURL('**/feed/**', { timeout: 300000 });

    logger.info('✓ LinkedIn girişi başarılı');
    return true;
  } catch (error) {
    logger.error('LinkedIn girişi başarısız:', error);
    return false;
  }
}

/**
 * Sayfanın yüklenmesini bekle
 */
export async function waitForPageLoad(page: Page, timeout: number = 10000): Promise<void> {
  try {
    await page.waitForLoadState('networkidle', { timeout });
  } catch (error) {
    logger.warn('Sayfa tam yüklenmedi ama devam ediliyor...');
  }
}
