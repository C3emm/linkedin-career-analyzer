#!/usr/bin/env node

import { Command } from 'commander';
import dotenv from 'dotenv';
import { orchestrate } from './orchestrator.js';
import logger from './logger.js';
import type { AnalyzerConfig } from './types.js';

dotenv.config();

const program = new Command();

program
  .name('linkedin-analyzer')
  .description('LinkedIn Career Intelligence Analyzer')
  .version('1.0.0')
  .requiredOption('--company <company>', 'Hedef şirket adı (örn: "Google", "Trendyol")')
  .requiredOption('--role <role>', 'Hedef pozisyon (örn: "Software Engineer")')
  .option('--department <department>', 'Departman filtresi (örn: "Machine Learning")')
  .option('--count <number>', 'Analiz edilecek profil sayısı', '15')
  .option('--output <format>', 'Çıktı formatı (html|json|both)', 'html')
  .option('--certs', 'Sertifika analizini dahil et', false)
  .option('--extras', 'Yan projeler, yayınlar, açık kaynak katkılarını dahil et', false);

program.parse();

const options = program.opts();

const config: AnalyzerConfig = {
  company: options.company,
  role: options.role,
  department: options.department,
  profileCount: parseInt(options.count, 10),
  includeCertifications: options.certs,
  includeExtras: options.extras,
  outputFormat: options.output as 'html' | 'json' | 'both'
};

// Validasyon
if (config.profileCount < 5 || config.profileCount > 50) {
  logger.error('Profil sayısı 5-50 arasında olmalıdır');
  process.exit(1);
}

if (!process.env.ANTHROPIC_API_KEY) {
  logger.error('ANTHROPIC_API_KEY çevre değişkeni tanımlanmamış');
  logger.info('Lütfen .env dosyasında ANTHROPIC_API_KEY değişkenini tanımlayın');
  process.exit(1);
}

logger.info(`LinkedIn Analiz başlatılıyor...`);
logger.info(`Şirket: ${config.company}`);
logger.info(`Pozisyon: ${config.role}`);
if (config.department) {
  logger.info(`Departman: ${config.department}`);
}
logger.info(`Profil sayısı: ${config.profileCount}`);

orchestrate(config)
  .then((result) => {
    logger.info('✓ Analiz tamamlandı!');
    logger.info(`Rapor ID: ${result.analysisId}`);
    logger.info(`Analiz edilen profil: ${result.profileCount}`);
    logger.info(`En sık görülen 5 yetkinlik:`);
    result.topSkills.slice(0, 5).forEach((skill, index) => {
      logger.info(`  ${index + 1}. ${skill.skill} (${skill.percentage.toFixed(0)}%)`);
    });
  })
  .catch((error) => {
    logger.error('Analiz sırasında hata oluştu:', error);
    process.exit(1);
  });
