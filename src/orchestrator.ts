/**
 * Ana orkestrasyon mantığı
 * LinkedIn arama, scraping ve analiz süreçlerini yönetir
 */

import type { AnalyzerConfig, AnalysisResult, ProfileData } from './types.js';
import logger from './logger.js';
import { searchLinkedInProfiles } from './linkedin/searcher.js';
import { scrapeProfile } from './linkedin/scraper.js';
import { searchLinkedInProfilesReal } from './linkedin/real-searcher.js';
import { scrapeProfileReal } from './linkedin/real-scraper.js';
import { initBrowser, closeBrowser } from './linkedin/browser-manager.js';
import { analyzeProfiles } from './analyzer/profile-analyzer.js';
import { generateReport } from './ui/report-generator.js';
import { randomDelay } from './utils.js';

export async function orchestrate(config: AnalyzerConfig): Promise<AnalysisResult> {
  logger.info('Orkestrasyon başlatılıyor...');

  // Çevre değişkeninden mod seç (mock veya real)
  // NOT: Bu kontrol fonksiyon içinde yapılmalı, çünkü dotenv.config() çağrılmadan önce
  // module scope'ta tanımlanan değişkenler undefined olabilir
  const USE_REAL_SCRAPING = process.env.USE_REAL_SCRAPING === 'true';

  logger.info(`DEBUG: process.env.USE_REAL_SCRAPING = "${process.env.USE_REAL_SCRAPING}"`);
  logger.info(`DEBUG: USE_REAL_SCRAPING = ${USE_REAL_SCRAPING}`);

  if (USE_REAL_SCRAPING) {
    logger.info('🌐 MOD: Gerçek LinkedIn Scraping (Playwright)');
  } else {
    logger.info('🎭 MOD: Mock/Demo Veri');
  }

  // Gerçek scraping için tarayıcıyı başlat
  if (USE_REAL_SCRAPING) {
    await initBrowser();
  }

  try {
    // Adım 1: LinkedIn'de profil ara
    logger.info(`Adım 1/4: LinkedIn'de "${config.role}" pozisyonunda "${config.company}" şirketinde çalışanlar aranıyor...`);

    const profileUrls = USE_REAL_SCRAPING
      ? await searchLinkedInProfilesReal(
          config.company,
          config.role,
          config.department,
          config.profileCount
        )
      : await searchLinkedInProfiles(
          config.company,
          config.role,
          config.department,
          config.profileCount
        );

  logger.info(`✓ ${profileUrls.length} profil URL'si bulundu`);

  if (profileUrls.length === 0) {
    throw new Error('Hiç profil bulunamadı. Lütfen arama kriterlerini kontrol edin.');
  }

    // Adım 2: Her profili scrape et
    logger.info(`Adım 2/4: Profiller scrape ediliyor... (Bu işlem birkaç dakika sürebilir)`);
    const profiles: ProfileData[] = [];
    let successCount = 0;
    let failCount = 0;

    for (let i = 0; i < profileUrls.length; i++) {
      const url = profileUrls[i];
      logger.info(`[${i + 1}/${profileUrls.length}] Profil scrape ediliyor...`);

      try {
        const profileData = USE_REAL_SCRAPING
          ? await scrapeProfileReal(url, {
              includeCertifications: config.includeCertifications,
              includeExtras: config.includeExtras
            })
          : await scrapeProfile(url, {
              includeCertifications: config.includeCertifications,
              includeExtras: config.includeExtras
            });

        if (profileData) {
          profiles.push(profileData);
          successCount++;
          logger.info(`  ✓ Başarılı: ${profileData.title}`);
        } else {
          failCount++;
          logger.warn(`  ✗ Profil verisi çıkarılamadı`);
        }
      } catch (error) {
        failCount++;
        logger.error(`  ✗ Hata:`, error);
      }

      // Bot koruması: Her profil arasında rastgele bekle
      if (i < profileUrls.length - 1) {
        await randomDelay();
      }
    }

    logger.info(`✓ Scraping tamamlandı: ${successCount} başarılı, ${failCount} başarısız`);

    if (profiles.length === 0) {
      throw new Error('Hiç profil verisi çıkarılamadı.');
    }

    // Adım 3: Profilleri analiz et
    logger.info(`Adım 3/4: ${profiles.length} profil Claude ile analiz ediliyor...`);
    const analysisResult = await analyzeProfiles(config, profiles);
    logger.info(`✓ Analiz tamamlandı`);

    // Adım 4: Rapor üret
    logger.info(`Adım 4/4: Rapor oluşturuluyor...`);
    await generateReport(analysisResult, config.outputFormat);
    logger.info(`✓ Rapor oluşturuldu`);

    return analysisResult;
  } finally {
    // Gerçek scraping için tarayıcıyı kapat
    if (USE_REAL_SCRAPING) {
      await closeBrowser();
    }
  }
}
