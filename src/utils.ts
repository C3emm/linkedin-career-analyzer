/**
 * Yardımcı fonksiyonlar
 */

import logger from './logger.js';

/**
 * Bot koruması için rastgele bekleme
 */
export async function randomDelay(): Promise<void> {
  const minMs = parseInt(process.env.DELAY_MIN_MS || '3000', 10);
  const maxMs = parseInt(process.env.DELAY_MAX_MS || '7000', 10);

  const delay = Math.floor(Math.random() * (maxMs - minMs + 1)) + minMs;
  logger.debug(`${delay}ms bekleniyor...`);

  await new Promise(resolve => setTimeout(resolve, delay));
}

/**
 * Benzersiz ID üretici
 */
export function generateId(): string {
  return `analysis_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;
}

/**
 * Tarih formatlayıcı
 */
export function formatDate(date: Date): string {
  return date.toISOString().split('T')[0];
}

/**
 * Yüzde hesaplayıcı
 */
export function calculatePercentage(count: number, total: number): number {
  if (total === 0) return 0;
  return Math.round((count / total) * 100);
}
