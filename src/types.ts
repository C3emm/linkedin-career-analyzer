/**
 * Temel tip tanımları
 */

export interface ProfileData {
  title: string;
  currentPosition: string;
  education: EducationEntry[];
  experience: ExperienceEntry[];
  skills: string[];
  certifications: string[];
  languages: string[];
  extras?: {
    projects?: string[];
    publications?: string[];
    opensource?: string[];
  };
}

export interface EducationEntry {
  school: string;
  degree: string;
  field?: string;
  year?: string;
}

export interface ExperienceEntry {
  company: string;
  position: string;
  duration: string;
}

export interface AnalysisResult {
  analysisId: string;
  company: string;
  role: string;
  department?: string;
  profileCount: number;
  analyzedAt: string;
  topSkills: SkillFrequency[];
  educationStats: EducationStats;
  commonCertifications: string[];
  techStack: TechStackEntry[];
  extras?: ExtraStats;
}

export interface SkillFrequency {
  skill: string;
  frequency: number;
  percentage: number;
}

export interface EducationStats {
  bachelorsMajors: { major: string; percentage: number }[];
  mastersPercentage: number;
  phdPercentage: number;
}

export interface TechStackEntry {
  technology: string;
  category: string;
  frequency: number;
}

export interface ExtraStats {
  opensourcePercentage: number;
  publicationsPercentage: number;
  personalProjectsPercentage: number;
}

export interface AnalyzerConfig {
  company: string;
  role: string;
  department?: string;
  profileCount: number;
  includeCertifications: boolean;
  includeExtras: boolean;
  outputFormat: 'html' | 'json' | 'both';
}

export interface SkillGapReport {
  missingSkills: string[];
  matchingSkills: string[];
  recommendedLearning: LearningRecommendation[];
}

export interface LearningRecommendation {
  skill: string;
  priority: 'high' | 'medium' | 'low';
  reason: string;
  resources?: string[];
}
