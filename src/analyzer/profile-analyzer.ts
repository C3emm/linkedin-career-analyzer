/**
 * Profil analiz motoru
 * Toplanan profil verilerini analiz eder ve özetler
 */

import Anthropic from '@anthropic-ai/sdk';
import type { AnalyzerConfig, AnalysisResult, ProfileData, SkillFrequency } from '../types.js';
import { generateId, formatDate, calculatePercentage } from '../utils.js';
import logger from '../logger.js';

const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY
});

/**
 * Toplanan profil verilerini analiz eder
 */
export async function analyzeProfiles(
  config: AnalyzerConfig,
  profiles: ProfileData[]
): Promise<AnalysisResult> {
  logger.info(`${profiles.length} profil analiz ediliyor...`);

  // Basit istatistiksel analiz
  const skillCounts = new Map<string, number>();
  const certificationCounts = new Map<string, number>();
  const majorCounts = new Map<string, number>();
  let mastersCount = 0;
  let phdCount = 0;

  // Profil verilerini topla
  for (const profile of profiles) {
    // Yetkinlikleri say
    for (const skill of profile.skills) {
      skillCounts.set(skill, (skillCounts.get(skill) || 0) + 1);
    }

    // Sertifikaları say
    for (const cert of profile.certifications) {
      certificationCounts.set(cert, (certificationCounts.get(cert) || 0) + 1);
    }

    // Eğitim istatistikleri
    for (const edu of profile.education) {
      if (edu.degree.toLowerCase().includes('bachelor')) {
        const major = edu.field || 'Unknown';
        majorCounts.set(major, (majorCounts.get(major) || 0) + 1);
      }
      if (edu.degree.toLowerCase().includes('master')) {
        mastersCount++;
      }
      if (edu.degree.toLowerCase().includes('phd') || edu.degree.toLowerCase().includes('doctorate')) {
        phdCount++;
      }
    }
  }

  // En sık görülen yetkinlikleri sırala
  const topSkills: SkillFrequency[] = Array.from(skillCounts.entries())
    .map(([skill, count]) => ({
      skill,
      frequency: count,
      percentage: calculatePercentage(count, profiles.length)
    }))
    .sort((a, b) => b.frequency - a.frequency)
    .slice(0, 20);

  // En sık görülen sertifikaları al
  const commonCertifications = Array.from(certificationCounts.entries())
    .sort((a, b) => b[1] - a[1])
    .slice(0, 10)
    .map(([cert]) => cert);

  // Eğitim bölümleri
  const bachelorsMajors = Array.from(majorCounts.entries())
    .map(([major, count]) => ({
      major,
      percentage: calculatePercentage(count, profiles.length)
    }))
    .sort((a, b) => b.percentage - a.percentage)
    .slice(0, 5);

  // Teknoloji yığını kategorilere ayır
  const techStack = categorizeTechStack(topSkills);

  const result: AnalysisResult = {
    analysisId: generateId(),
    company: config.company,
    role: config.role,
    department: config.department,
    profileCount: profiles.length,
    analyzedAt: formatDate(new Date()),
    topSkills,
    educationStats: {
      bachelorsMajors,
      mastersPercentage: calculatePercentage(mastersCount, profiles.length),
      phdPercentage: calculatePercentage(phdCount, profiles.length)
    },
    commonCertifications,
    techStack
  };

  // Ek analizler varsa
  if (config.includeExtras) {
    let opensourceCount = 0;
    let publicationsCount = 0;
    let projectsCount = 0;

    for (const profile of profiles) {
      if (profile.extras?.opensource && profile.extras.opensource.length > 0) {
        opensourceCount++;
      }
      if (profile.extras?.publications && profile.extras.publications.length > 0) {
        publicationsCount++;
      }
      if (profile.extras?.projects && profile.extras.projects.length > 0) {
        projectsCount++;
      }
    }

    result.extras = {
      opensourcePercentage: calculatePercentage(opensourceCount, profiles.length),
      publicationsPercentage: calculatePercentage(publicationsCount, profiles.length),
      personalProjectsPercentage: calculatePercentage(projectsCount, profiles.length)
    };
  }

  logger.info('Analiz tamamlandı');
  return result;
}

/**
 * Yetkinlikleri kategorilere ayırır
 */
function categorizeTechStack(skills: SkillFrequency[]): any[] {
  const categories: Record<string, string[]> = {
    'Programming Languages': ['python', 'java', 'javascript', 'typescript', 'go', 'rust', 'c++', 'c#', 'ruby', 'php', 'swift', 'kotlin'],
    'Frontend': ['react', 'vue', 'angular', 'html', 'css', 'next.js', 'svelte'],
    'Backend': ['node.js', 'express', 'django', 'flask', 'spring', 'asp.net', 'fastapi'],
    'Database': ['postgresql', 'mysql', 'mongodb', 'redis', 'elasticsearch', 'cassandra', 'dynamodb'],
    'Cloud & DevOps': ['aws', 'azure', 'gcp', 'docker', 'kubernetes', 'terraform', 'jenkins', 'github actions'],
    'Data & ML': ['tensorflow', 'pytorch', 'scikit-learn', 'pandas', 'spark', 'airflow', 'kafka']
  };

  const techStack: any[] = [];

  for (const skill of skills) {
    const skillLower = skill.skill.toLowerCase();
    let category = 'Other';

    for (const [cat, keywords] of Object.entries(categories)) {
      if (keywords.some(kw => skillLower.includes(kw))) {
        category = cat;
        break;
      }
    }

    techStack.push({
      technology: skill.skill,
      category,
      frequency: skill.frequency
    });
  }

  return techStack;
}
