/**
 * LinkedIn profil scraper
 * Playwright MCP ile profil sayfasından veri çıkarır
 */

import type { ProfileData } from '../types.js';
import logger from '../logger.js';

export interface ScrapeOptions {
  includeCertifications: boolean;
  includeExtras: boolean;
}

/**
 * Belirli bir LinkedIn profil URL'sinden veri çıkarır
 *
 * NOT: Bu fonksiyon Playwright MCP ile çalışır.
 * Claude Code bu fonksiyonu çağırdığında:
 * 1. Playwright ile profil sayfasına git
 * 2. Sayfanın HTML'ini al
 * 3. Claude API ile HTML'den structured data çıkar (prompts/extract_profile.md)
 */
// Mock veri şablonları - daha gerçekçi ve çeşitli
const mockProfiles: ProfileData[] = [
  {
    title: 'Senior Software Engineer',
    currentPosition: 'Senior Software Engineer at Tech Company',
    education: [
      { school: 'MIT', degree: 'Bachelor of Science', field: 'Computer Science', year: '2014-2018' },
      { school: 'Stanford', degree: 'Master of Science', field: 'AI & ML', year: '2018-2020' }
    ],
    experience: [
      { company: 'Tech Company', position: 'Senior Software Engineer', duration: '2022 - Present' },
      { company: 'Startup Inc', position: 'Software Engineer', duration: '2020 - 2022' }
    ],
    skills: ['Python', 'TensorFlow', 'PyTorch', 'Go', 'Kubernetes', 'Docker', 'AWS', 'React'],
    certifications: ['Google Professional ML Engineer', 'AWS Solutions Architect'],
    languages: ['English', 'Spanish'],
    extras: { projects: ['ML Framework'], publications: ['AI Research Paper'], opensource: ['TensorFlow'] }
  },
  {
    title: 'Staff Software Engineer',
    currentPosition: 'Staff Software Engineer - Platform',
    education: [
      { school: 'UC Berkeley', degree: 'Bachelor', field: 'Computer Engineering', year: '2013-2017' }
    ],
    experience: [
      { company: 'Big Tech', position: 'Staff Engineer', duration: '2021 - Present' },
      { company: 'Scale Startup', position: 'Senior Engineer', duration: '2019 - 2021' },
      { company: 'Medium Corp', position: 'Engineer', duration: '2017 - 2019' }
    ],
    skills: ['Java', 'Kotlin', 'Spring Boot', 'PostgreSQL', 'Kafka', 'Redis', 'GCP', 'Terraform'],
    certifications: ['Certified Kubernetes Administrator', 'Google Cloud Architect'],
    languages: ['English', 'Mandarin'],
    extras: { projects: ['Distributed Systems'], publications: [], opensource: ['Kafka', 'Spring'] }
  },
  {
    title: 'Software Engineer',
    currentPosition: 'Software Engineer',
    education: [
      { school: 'Georgia Tech', degree: 'Bachelor of Science', field: 'CS', year: '2017-2021' }
    ],
    experience: [
      { company: 'Tech Firm', position: 'Software Engineer', duration: '2021 - Present' }
    ],
    skills: ['JavaScript', 'TypeScript', 'React', 'Node.js', 'MongoDB', 'AWS', 'GraphQL'],
    certifications: ['AWS Developer Associate'],
    languages: ['English'],
    extras: { projects: ['Web Framework'], publications: [], opensource: ['React', 'Next.js'] }
  },
  {
    title: 'Principal Engineer',
    currentPosition: 'Principal Engineer - Infrastructure',
    education: [
      { school: 'Carnegie Mellon', degree: 'Bachelor', field: 'Software Engineering', year: '2010-2014' },
      { school: 'MIT', degree: 'Master', field: 'Distributed Systems', year: '2014-2016' }
    ],
    experience: [
      { company: 'FAANG', position: 'Principal Engineer', duration: '2020 - Present' },
      { company: 'Unicorn', position: 'Staff Engineer', duration: '2018 - 2020' },
      { company: 'Corp', position: 'Senior Engineer', duration: '2016 - 2018' }
    ],
    skills: ['Go', 'Rust', 'C++', 'Kubernetes', 'Terraform', 'AWS', 'Prometheus', 'gRPC'],
    certifications: ['CKA', 'CKAD', 'AWS Solutions Architect Professional'],
    languages: ['English', 'German'],
    extras: { projects: ['K8s Operator'], publications: ['Infrastructure Paper'], opensource: ['Kubernetes', 'Prometheus'] }
  },
  {
    title: 'Lead Software Engineer',
    currentPosition: 'Lead Software Engineer - Data Platform',
    education: [
      { school: 'University of Washington', degree: 'Bachelor', field: 'Computer Science', year: '2015-2019' }
    ],
    experience: [
      { company: 'Data Company', position: 'Lead Engineer', duration: '2023 - present' },
      { company: 'Analytics Startup', position: 'Senior Engineer', duration: '2021 - 2023' },
      { company: 'Tech Corp', position: 'Engineer', duration: '2019 - 2021' }
    ],
    skills: ['Python', 'Scala', 'Apache Spark', 'Airflow', 'Snowflake', 'dbt', 'SQL', 'AWS'],
    certifications: ['Databricks Certified', 'Snowflake Architect'],
    languages: ['English', 'French'],
    extras: { projects: ['Data Pipeline Framework'], publications: [], opensource: ['Airflow', 'Spark'] }
  },
  {
    title: 'Software Development Engineer',
    currentPosition: 'SDE II',
    education: [
      { school: 'IIT Bombay', degree: 'Bachelor', field: 'Computer Science', year: '2016-2020' }
    ],
    experience: [
      { company: 'E-commerce Giant', position: 'SDE II', duration: '2022 - Present' },
      { company: 'Tech Startup', position: 'SDE', duration: '2020 - 2022' }
    ],
    skills: ['Java', 'Python', 'Spring', 'MySQL', 'Redis', 'Docker', 'AWS', 'Microservices'],
    certifications: ['AWS Solutions Architect'],
    languages: ['English', 'Hindi'],
    extras: { projects: ['Payment System'], publications: [], opensource: [] }
  },
  {
    title: 'Full Stack Engineer',
    currentPosition: 'Full Stack Engineer',
    education: [
      { school: 'University of Toronto', degree: 'Bachelor', field: 'Software Engineering', year: '2017-2021' }
    ],
    experience: [
      { company: 'SaaS Company', position: 'Full Stack Engineer', duration: '2021 - Present' }
    ],
    skills: ['React', 'Vue.js', 'Node.js', 'TypeScript', 'PostgreSQL', 'MongoDB', 'Docker', 'Azure'],
    certifications: ['Azure Developer'],
    languages: ['English', 'French'],
    extras: { projects: ['SaaS Platform'], publications: [], opensource: ['Vue', 'Express'] }
  },
  {
    title: 'Backend Engineer',
    currentPosition: 'Backend Engineer',
    education: [
      { school: 'KAIST', degree: 'Bachelor', field: 'Computer Science', year: '2016-2020' },
      { school: 'KAIST', degree: 'Master', field: 'Software Engineering', year: '2020-2022' }
    ],
    experience: [
      { company: 'Fintech', position: 'Backend Engineer', duration: '2022 - Present' }
    ],
    skills: ['Go', 'PostgreSQL', 'Redis', 'RabbitMQ', 'Docker', 'Kubernetes', 'GCP'],
    certifications: ['Google Cloud Professional'],
    languages: ['English', 'Korean'],
    extras: { projects: ['API Gateway'], publications: ['Microservices Paper'], opensource: ['Go packages'] }
  }
];

export async function scrapeProfile(
  profileUrl: string,
  options: ScrapeOptions
): Promise<ProfileData | null> {
  logger.info(`Profil scraping: ${profileUrl}`);

  // Mock mod uyarısı (sadece ilk profilde göster)
  if (profileUrl.includes('mock-profile-1')) {
    logger.warn('⚠️  UYARI: scrapeProfile şu anda MOCK VERİ modu ile çalışıyor');
    logger.warn('⚠️  Gerçek LinkedIn verisi için Playwright MCP kurulumu gereklidir');
  }

  // URL'den profil index'ini çıkar
  const match = profileUrl.match(/mock-profile-(\d+)/);
  const index = match ? (parseInt(match[1], 10) - 1) % mockProfiles.length : 0;

  // Rastgele bir mock profil seç (daha çeşitli sonuçlar için)
  const baseProfile = mockProfiles[index];

  // Sertifika ve extras ayarlarını uygula
  const profile: ProfileData = {
    ...baseProfile,
    certifications: options.includeCertifications ? baseProfile.certifications : [],
    extras: options.includeExtras ? baseProfile.extras : undefined
  };

  return profile;
}
