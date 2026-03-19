/**
 * Gerçek LinkedIn Arama - Playwright ile
 */

import { Page } from 'playwright';
import { createPage, loginToLinkedIn, waitForPageLoad } from './browser-manager.js';
import logger from '../logger.js';

/**
 * LinkedIn'de profil arar ve URL'lerini döner
 */
export async function searchLinkedInProfilesReal(
  company: string,
  role: string,
  department?: string,
  count: number = 15
): Promise<string[]> {
  logger.info('🔍 Gerçek LinkedIn araması başlatılıyor...');
  logger.info(`Parametreler: ${company} - ${role}${department ? ` (${department})` : ''}`);

  const page = await createPage();
  const profileUrls: string[] = [];

  try {
    // LinkedIn'e git
    await page.goto('https://www.linkedin.com', { waitUntil: 'domcontentloaded', timeout: 60000 });

    // Giriş kontrolü - eğer giriş sayfasına yönlendirildiyse
    const currentUrl = page.url();
    if (currentUrl.includes('/login') || currentUrl.includes('/authwall')) {
      logger.warn('⚠️  LinkedIn girişi gerekli');
      const loginSuccess = await loginToLinkedIn(page);
      if (!loginSuccess) {
        throw new Error('LinkedIn girişi yapılamadı');
      }
    }

    // Arama URL'ini oluştur
    const searchQuery = `${role} ${company}${department ? ` ${department}` : ''}`;
    const encodedQuery = encodeURIComponent(searchQuery);
    const searchUrl = `https://www.linkedin.com/search/results/people/?keywords=${encodedQuery}&origin=GLOBAL_SEARCH_HEADER`;

    logger.info(`📊 Arama yapılıyor: "${searchQuery}"`);
    // domcontentloaded kullan (networkidle çok yavaş olabiliyor)
    await page.goto(searchUrl, { waitUntil: 'domcontentloaded', timeout: 60000 });
    await waitForPageLoad(page, 3000);

    // Biraz bekle (sayfanın tam yüklenmesi için)
    await page.waitForTimeout(3000);

    // Profil linklerini çıkar
    logger.info('🔗 Profil linkleri toplanıyor...');

    // Arama sonuçlarının yüklenmesini bekle
    try {
      await page.waitForSelector('.reusable-search__result-container, .search-results-container, div[data-chameleon-result-urn]', { timeout: 10000 });
    } catch (e) {
      logger.warn('Arama sonuçları container bulunamadı, devam ediliyor...');
    }

    // Daha fazla bekle
    await page.waitForTimeout(2000);

    // LinkedIn arama sonuçlarındaki profil linklerini bul (birden fazla selector dene)
    const links = await page.evaluate(() => {
      const profileLinks: string[] = [];

      // Farklı selector'lar dene
      const selectors = [
        'a.app-aware-link[href*="/in/"]',
        'a[href*="/in/"]:not([href*="/company/"])',
        '.entity-result__title-text a',
        '.reusable-search__result-container a[href*="/in/"]'
      ];

      for (const selector of selectors) {
        const elements = document.querySelectorAll(selector);
        elements.forEach((el) => {
          const href = el.getAttribute('href');
          if (href && href.includes('/in/') && !href.includes('/company/')) {
            const url = href.split('?')[0];
            const fullUrl = url.startsWith('http') ? url : `https://www.linkedin.com${url}`;
            profileLinks.push(fullUrl);
          }
        });

        if (profileLinks.length > 0) break;
      }

      return profileLinks;
    });

    // Benzersiz URL'leri al
    const uniqueLinks = [...new Set(links)];
    profileUrls.push(...uniqueLinks.slice(0, count));

    logger.info(`✓ ${profileUrls.length} profil URL'si bulundu`);

    // Eğer yeterli profil bulunamadıysa, kaydır ve daha fazla yükle
    if (profileUrls.length < count) {
      logger.info('⏬ Daha fazla profil için sayfa kaydırılıyor...');

      for (let i = 0; i < 3; i++) {
        await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight));
        await page.waitForTimeout(3000);

        const moreLinks = await page.evaluate(() => {
          const links: string[] = [];
          const selectors = [
            'a.app-aware-link[href*="/in/"]',
            'a[href*="/in/"]:not([href*="/company/"])',
            '.entity-result__title-text a'
          ];

          for (const selector of selectors) {
            const elements = document.querySelectorAll(selector);
            elements.forEach((el) => {
              const href = el.getAttribute('href');
              if (href && href.includes('/in/') && !href.includes('/company/')) {
                const url = href.split('?')[0];
                links.push(url.startsWith('http') ? url : `https://www.linkedin.com${url}`);
              }
            });
            if (links.length > 0) break;
          }
          return links;
        });

        const newUniqueLinks = [...new Set(moreLinks)].filter(
          (link) => !profileUrls.includes(link)
        );

        profileUrls.push(...newUniqueLinks);

        if (profileUrls.length >= count) {
          break;
        }
      }
    }

    await page.close();

    const finalUrls = profileUrls.slice(0, count);
    logger.info(`✓ Toplam ${finalUrls.length} profil URL'si hazır`);

    return finalUrls;
  } catch (error: any) {
    logger.error('LinkedIn arama hatası:', error.message);
    await page.close().catch(() => {});
    throw error;
  }
}
