// Frontend JavaScript - LinkedIn Analyzer Web App

let currentAnalysisId = null;

// Form submit
document.getElementById('analyzerForm').addEventListener('submit', async (e) => {
  e.preventDefault();

  // Form verilerini al
  const formData = {
    company: document.getElementById('company').value.trim(),
    role: document.getElementById('role').value.trim(),
    department: document.getElementById('department').value.trim() || undefined,
    profile_count: parseInt(document.getElementById('count').value, 10),
    include_certifications: document.getElementById('certs').checked,
    include_extras: document.getElementById('extras').checked
  };

  // Validasyon
  if (!formData.company || !formData.role) {
    showError('Lütfen şirket adı ve pozisyon alanlarını doldurun.');
    return;
  }

  if (formData.profile_count < 5 || formData.profile_count > 50) {
    showError('Profil sayısı 5-50 arasında olmalıdır.');
    return;
  }

  // UI güncellemeleri
  hideError();
  hideResults();
  showLoading('LinkedIn profilleri aranıyor...');
  disableForm(true);

  try {
    // API çağrısı
    const response = await fetch('/api/analyze', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(formData)
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.error || 'Analiz sırasında bir hata oluştu');
    }

    // Sonuçları göster
    currentAnalysisId = data.analysisId;
    hideLoading();
    displayResults(data);

  } catch (error) {
    hideLoading();
    showError(error.message);
  } finally {
    disableForm(false);
  }
});

// Sonuçları göster
function displayResults(data) {
  const resultContainer = document.getElementById('resultContainer');
  const resultContent = document.getElementById('resultContent');

  // Yetkinlik grafikleri
  const skillsHtml = data.topSkills.slice(0, 15).map(skill => `
    <div class="skill-item fade-in">
      <div class="skill-name">${skill.skill}</div>
      <div class="skill-bar-container">
        <div class="skill-bar" style="width: ${skill.percentage}%"></div>
      </div>
      <div class="skill-percentage">${skill.percentage}%</div>
    </div>
  `).join('');

  // Sertifikalar
  const certsHtml = data.commonCertifications.length > 0
    ? `
      <div style="margin-top: 40px;">
        <h3>🏆 Sık Görülen Sertifikalar</h3>
        <ul style="list-style: none; padding: 0;">
          ${data.commonCertifications.map(cert => `
            <li style="padding: 10px; margin-bottom: 8px; background: #f7fafc; border-radius: 8px; border-left: 4px solid #667eea;">
              ${cert}
            </li>
          `).join('')}
        </ul>
      </div>
    `
    : '';

  // Lisans bölümleri
  const majorsHtml = data.educationStats.bachelorsMajors.length > 0
    ? `
      <div style="margin-top: 30px;">
        <h4>Lisans Bölümleri</h4>
        <ul style="list-style: none; padding: 0;">
          ${data.educationStats.bachelorsMajors.map(major => `
            <li style="padding: 10px; margin-bottom: 8px; background: #f7fafc; border-radius: 8px; border-left: 4px solid #667eea;">
              ${major.major} <strong>(${major.percentage}%)</strong>
            </li>
          `).join('')}
        </ul>
      </div>
    `
    : '';

  // Ek aktiviteler
  const extrasHtml = data.extras
    ? `
      <div style="margin-top: 40px;">
        <h3>📦 Ek Aktiviteler</h3>
        <ul style="list-style: none; padding: 0;">
          <li style="padding: 10px; margin-bottom: 8px; background: #f7fafc; border-radius: 8px;">
            Açık kaynak katkı: <strong>${data.extras.opensourcePercentage}%</strong>
          </li>
          <li style="padding: 10px; margin-bottom: 8px; background: #f7fafc; border-radius: 8px;">
            Akademik yayın: <strong>${data.extras.publicationsPercentage}%</strong>
          </li>
          <li style="padding: 10px; margin-bottom: 8px; background: #f7fafc; border-radius: 8px;">
            Kişisel projeler: <strong>${data.extras.personalProjectsPercentage}%</strong>
          </li>
        </ul>
      </div>
    `
    : '';

  resultContent.innerHTML = `
    <div class="fade-in">
      <div style="text-align: center; margin-bottom: 30px;">
        <h2 style="color: #667eea; margin-bottom: 10px;">${data.company} — ${data.role}</h2>
        <p style="color: #666;">
          📅 ${data.analyzedAt} |
          👥 ${data.profileCount} Profil Analiz Edildi |
          🔍 ID: ${data.analysisId}
        </p>
      </div>

      <div style="margin-bottom: 40px;">
        <h3 style="margin-bottom: 20px; color: #333;">🎯 En Sık Görülen Yetkinlikler</h3>
        ${skillsHtml}
      </div>

      <div style="margin-bottom: 40px;">
        <h3 style="margin-bottom: 20px; color: #333;">🎓 Eğitim Profili</h3>
        <div class="stats-grid">
          <div class="stat-card">
            <h3>${data.educationStats.mastersPercentage}%</h3>
            <p>Yüksek Lisans</p>
          </div>
          <div class="stat-card">
            <h3>${data.educationStats.phdPercentage}%</h3>
            <p>Doktora</p>
          </div>
        </div>
        ${majorsHtml}
      </div>

      ${certsHtml}
      ${extrasHtml}
    </div>
  `;

  resultContainer.style.display = 'block';
  resultContainer.scrollIntoView({ behavior: 'smooth', block: 'start' });
}

// Loading göster
function showLoading(message) {
  const loadingStatus = document.getElementById('loadingStatus');
  const loadingMessage = document.getElementById('loadingMessage');
  const progressFill = document.getElementById('progressFill');

  loadingMessage.textContent = message;
  loadingStatus.style.display = 'block';

  // Progress bar animasyonu
  progressFill.style.width = '0%';
  setTimeout(() => {
    progressFill.style.width = '30%';
  }, 100);
  setTimeout(() => {
    progressFill.style.width = '60%';
  }, 2000);
  setTimeout(() => {
    progressFill.style.width = '90%';
  }, 4000);
}

// Loading gizle
function hideLoading() {
  const loadingStatus = document.getElementById('loadingStatus');
  const progressFill = document.getElementById('progressFill');

  progressFill.style.width = '100%';
  setTimeout(() => {
    loadingStatus.style.display = 'none';
    progressFill.style.width = '0%';
  }, 500);
}

// Hata göster
function showError(message) {
  const errorMessage = document.getElementById('errorMessage');
  const errorText = document.getElementById('errorText');

  errorText.textContent = message;
  errorMessage.style.display = 'block';
  errorMessage.scrollIntoView({ behavior: 'smooth', block: 'center' });
}

// Hata gizle
function hideError() {
  const errorMessage = document.getElementById('errorMessage');
  errorMessage.style.display = 'none';
}

// Sonuçları gizle
function hideResults() {
  const resultContainer = document.getElementById('resultContainer');
  resultContainer.style.display = 'none';
}

// Form disable/enable
function disableForm(disabled) {
  const form = document.getElementById('analyzerForm');
  const button = document.getElementById('analyzeBtn');
  const inputs = form.querySelectorAll('input, button');

  inputs.forEach(input => {
    input.disabled = disabled;
  });

  if (disabled) {
    button.querySelector('.btn-text').style.display = 'none';
    button.querySelector('.btn-loader').style.display = 'inline';
  } else {
    button.querySelector('.btn-text').style.display = 'inline';
    button.querySelector('.btn-loader').style.display = 'none';
  }
}

// Rapor indir
async function downloadReport() {
  if (!currentAnalysisId) {
    showError('İndirilecek rapor bulunamadı.');
    return;
  }

  try {
    const response = await fetch(`/api/report/${currentAnalysisId}`);

    if (!response.ok) {
      throw new Error('Rapor indirilemedi');
    }

    const blob = await response.blob();
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `linkedin_analysis_${currentAnalysisId}.json`;
    document.body.appendChild(a);
    a.click();
    window.URL.revokeObjectURL(url);
    document.body.removeChild(a);
  } catch (error) {
    showError('Rapor indirilirken hata oluştu: ' + error.message);
  }
}

// Sayfa yüklendiğinde
document.addEventListener('DOMContentLoaded', () => {
  console.log('LinkedIn Career Analyzer başlatıldı');
});
