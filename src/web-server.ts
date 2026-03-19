#!/usr/bin/env node

/**
 * Express Web Server
 * LinkedIn Career Analyzer'ı web arayüzü ile sunar
 */

import express from 'express';
import cors from 'cors';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import dotenv from 'dotenv';
import { orchestrate } from './orchestrator.js';
import type { AnalyzerConfig, AnalysisResult } from './types.js';
import logger from './logger.js';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.static(join(__dirname, '../public')));

// In-memory cache for results (production'da Redis/Database kullanılmalı)
const resultsCache = new Map<string, AnalysisResult>();

// Ana sayfa
app.get('/', (req, res) => {
  res.sendFile(join(__dirname, '../public/index.html'));
});

// Health check
app.get('/api/health', (req, res) => {
  res.json({
    status: 'ok',
    timestamp: new Date().toISOString(),
    service: 'LinkedIn Career Analyzer'
  });
});

// Analiz endpoint'i
app.post('/api/analyze', async (req, res) => {
  try {
    const {
      company,
      role,
      department,
      profile_count = 15,
      include_certifications = false,
      include_extras = false
    } = req.body;

    // Validasyon
    if (!company || !role) {
      return res.status(400).json({
        error: 'Şirket adı ve pozisyon zorunludur'
      });
    }

    if (profile_count < 5 || profile_count > 50) {
      return res.status(400).json({
        error: 'Profil sayısı 5-50 arasında olmalıdır'
      });
    }

    // API key kontrolü
    if (!process.env.ANTHROPIC_API_KEY) {
      return res.status(500).json({
        error: 'ANTHROPIC_API_KEY yapılandırılmamış'
      });
    }

    // Config oluştur
    const config: AnalyzerConfig = {
      company,
      role,
      department,
      profileCount: profile_count,
      includeCertifications: include_certifications,
      includeExtras: include_extras,
      outputFormat: 'json'
    };

    logger.info(`Yeni analiz isteği: ${company} - ${role}`);

    // Analizi başlat
    const result = await orchestrate(config);

    // Sonucu cache'e kaydet
    resultsCache.set(result.analysisId, result);

    logger.info(`Analiz tamamlandı: ${result.analysisId}`);

    // Sonucu döndür
    res.json(result);

  } catch (error: any) {
    logger.error('Analiz hatası:', error);
    res.status(500).json({
      error: error.message || 'Analiz sırasında bir hata oluştu'
    });
  }
});

// Rapor indirme endpoint'i
app.get('/api/report/:analysisId', (req, res) => {
  const { analysisId } = req.params;

  const result = resultsCache.get(analysisId);

  if (!result) {
    return res.status(404).json({
      error: 'Rapor bulunamadı'
    });
  }

  // JSON raporu indir
  res.setHeader('Content-Type', 'application/json');
  res.setHeader('Content-Disposition', `attachment; filename="analysis_${analysisId}.json"`);
  res.json(result);
});

// Analiz durumu kontrolü (opsiyonel - future use)
app.get('/api/analysis/:analysisId', (req, res) => {
  const { analysisId } = req.params;

  const result = resultsCache.get(analysisId);

  if (!result) {
    return res.status(404).json({
      error: 'Analiz bulunamadı'
    });
  }

  res.json(result);
});

// 404 handler
app.use((req, res) => {
  res.status(404).json({
    error: 'Endpoint bulunamadı'
  });
});

// Error handler
app.use((err: any, req: express.Request, res: express.Response, next: express.NextFunction) => {
  logger.error('Server hatası:', err);
  res.status(500).json({
    error: 'Sunucu hatası',
    message: err.message
  });
});

// Sunucuyu başlat
app.listen(PORT, () => {
  logger.info(`🚀 LinkedIn Career Analyzer Web sunucusu başlatıldı`);
  logger.info(`📡 http://localhost:${PORT}`);
  logger.info(`📊 API: http://localhost:${PORT}/api/health`);
  logger.info('');
  logger.info('Kullanmak için tarayıcınızda açın: http://localhost:${PORT}');
});

// Graceful shutdown
process.on('SIGTERM', () => {
  logger.info('SIGTERM sinyali alındı, sunucu kapatılıyor...');
  process.exit(0);
});

process.on('SIGINT', () => {
  logger.info('SIGINT sinyali alındı, sunucu kapatılıyor...');
  process.exit(0);
});
