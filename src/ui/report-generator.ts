/**
 * HTML/JSON rapor üretici
 */

import { writeFile, mkdir } from 'fs/promises';
import { join } from 'path';
import type { AnalysisResult } from '../types.js';
import logger from '../logger.js';

const OUTPUT_DIR = process.env.OUTPUT_DIR || './reports';

/**
 * Analiz sonucundan rapor oluşturur
 */
export async function generateReport(
  result: AnalysisResult,
  format: 'html' | 'json' | 'both'
): Promise<void> {
  // Çıktı dizinini oluştur
  await mkdir(OUTPUT_DIR, { recursive: true });

  const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
  const baseFilename = `${result.company}_${result.role}_${timestamp}`;

  // JSON raporu
  if (format === 'json' || format === 'both') {
    const jsonPath = join(OUTPUT_DIR, `${baseFilename}.json`);
    await writeFile(jsonPath, JSON.stringify(result, null, 2), 'utf-8');
    logger.info(`JSON rapor kaydedildi: ${jsonPath}`);
  }

  // HTML raporu
  if (format === 'html' || format === 'both') {
    const html = generateHtmlReport(result);
    const htmlPath = join(OUTPUT_DIR, `${baseFilename}.html`);
    await writeFile(htmlPath, html, 'utf-8');
    logger.info(`HTML rapor kaydedildi: ${htmlPath}`);

    // Tarayıcıda aç
    logger.info(`Raporu görüntülemek için: open ${htmlPath}`);
  }
}

/**
 * HTML rapor şablonu üretir
 */
function generateHtmlReport(result: AnalysisResult): string {
  const skillBars = result.topSkills
    .slice(0, 15)
    .map(
      skill => `
      <div class="skill-item">
        <div class="skill-name">${skill.skill}</div>
        <div class="skill-bar-container">
          <div class="skill-bar" style="width: ${skill.percentage}%"></div>
        </div>
        <div class="skill-percentage">${skill.percentage}%</div>
      </div>
    `
    )
    .join('');

  const certList = result.commonCertifications
    .map(cert => `<li>${cert}</li>`)
    .join('');

  const majorsList = result.educationStats.bachelorsMajors
    .map(major => `<li>${major.major} (${major.percentage}%)</li>`)
    .join('');

  const extrasSection = result.extras
    ? `
    <div class="section">
      <h2>📦 Ek Aktiviteler</h2>
      <ul>
        <li>Açık kaynak katkı: <strong>${result.extras.opensourcePercentage}%</strong></li>
        <li>Akademik yayın: <strong>${result.extras.publicationsPercentage}%</strong></li>
        <li>Kişisel projeler: <strong>${result.extras.personalProjectsPercentage}%</strong></li>
      </ul>
    </div>
  `
    : '';

  return `<!DOCTYPE html>
<html lang="tr">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${result.company} - ${result.role} Analizi</title>
  <style>
    * { margin: 0; padding: 0; box-sizing: border-box; }
    body {
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      padding: 40px 20px;
      line-height: 1.6;
    }
    .container {
      max-width: 1000px;
      margin: 0 auto;
      background: white;
      border-radius: 16px;
      box-shadow: 0 20px 60px rgba(0,0,0,0.3);
      overflow: hidden;
    }
    .header {
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      color: white;
      padding: 40px;
      text-align: center;
    }
    .header h1 { font-size: 2.5em; margin-bottom: 10px; }
    .header p { font-size: 1.2em; opacity: 0.9; }
    .meta {
      display: flex;
      justify-content: center;
      gap: 30px;
      margin-top: 20px;
      font-size: 0.95em;
    }
    .content { padding: 40px; }
    .section { margin-bottom: 40px; }
    .section h2 {
      font-size: 1.8em;
      margin-bottom: 20px;
      color: #333;
      border-bottom: 3px solid #667eea;
      padding-bottom: 10px;
    }
    .skill-item {
      display: grid;
      grid-template-columns: 200px 1fr 60px;
      gap: 15px;
      align-items: center;
      margin-bottom: 15px;
    }
    .skill-name { font-weight: 600; color: #333; }
    .skill-bar-container {
      background: #e0e0e0;
      border-radius: 10px;
      height: 24px;
      overflow: hidden;
    }
    .skill-bar {
      background: linear-gradient(90deg, #667eea, #764ba2);
      height: 100%;
      border-radius: 10px;
      transition: width 0.3s ease;
    }
    .skill-percentage { text-align: right; font-weight: 600; color: #667eea; }
    ul { list-style: none; padding-left: 0; }
    li {
      padding: 10px;
      margin-bottom: 8px;
      background: #f5f5f5;
      border-radius: 8px;
      border-left: 4px solid #667eea;
    }
    .stats-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
      gap: 20px;
      margin-top: 20px;
    }
    .stat-card {
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      color: white;
      padding: 25px;
      border-radius: 12px;
      text-align: center;
    }
    .stat-card h3 { font-size: 2.5em; margin-bottom: 10px; }
    .stat-card p { opacity: 0.9; }
    .footer {
      background: #f5f5f5;
      padding: 20px;
      text-align: center;
      color: #666;
      font-size: 0.9em;
    }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h1>📊 ${result.company} — ${result.role}</h1>
      <p>Kariyer İstihbarat Analizi</p>
      <div class="meta">
        <span>📅 ${result.analyzedAt}</span>
        <span>👥 ${result.profileCount} Profil</span>
        <span>🔍 Analiz ID: ${result.analysisId}</span>
      </div>
    </div>

    <div class="content">
      <div class="section">
        <h2>🎯 En Sık Görülen Yetkinlikler</h2>
        ${skillBars}
      </div>

      <div class="section">
        <h2>🎓 Eğitim Profili</h2>
        <div class="stats-grid">
          <div class="stat-card">
            <h3>${result.educationStats.mastersPercentage}%</h3>
            <p>Yüksek Lisans</p>
          </div>
          <div class="stat-card">
            <h3>${result.educationStats.phdPercentage}%</h3>
            <p>Doktora</p>
          </div>
        </div>
        <h3 style="margin-top: 30px; margin-bottom: 15px;">Lisans Bölümleri</h3>
        <ul>
          ${majorsList}
        </ul>
      </div>

      ${
        result.commonCertifications.length > 0
          ? `
      <div class="section">
        <h2>🏆 Sık Görülen Sertifikalar</h2>
        <ul>
          ${certList}
        </ul>
      </div>
      `
          : ''
      }

      ${extrasSection}
    </div>

    <div class="footer">
      <p>🤖 LinkedIn Career Intelligence Analyzer ile oluşturuldu</p>
      <p>Bu rapor ${result.profileCount} LinkedIn profilinin analiziyle hazırlanmıştır.</p>
    </div>
  </div>
</body>
</html>`;
}
