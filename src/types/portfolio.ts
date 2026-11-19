export interface PortfolioProfile {
  name: string;
  role: string;
  year: string;
  institution: string;
  email: string;
  portraitUrl: string;
  resumeUrl: string;
  headline: string;
  objective: string;
}

export interface PortfolioMetric {
  label: string;
  value: string;
  detail: string;
}

export interface SgpaRecord {
  semester: string;
  value: number;
}

export interface EducationEntry {
  id: string;
  institution: string;
  degree: string;
  period: string;
  scoreSummary: string;
  sgpa: SgpaRecord[];
  focusAreas: string[];
}

export interface ProjectStage {
  stage: string;
  detail: string;
}

export interface ProjectEntry {
  id: string;
  title: string;
  subtitle: string;
  year: string;
  summary: string;
  highlights: string[];
  stack: string[];
  architecture: ProjectStage[];
}

export interface SkillEntry {
  id: string;
  name: string;
  category: string;
  context: string;
  summary: string;
}

export interface StrengthEntry {
  id: string;
  title: string;
  category: string;
  description: string;
}

export interface AutomationTask {
  id: number;
  title: string;
  source: string;
  completed: boolean;
  createdAt: string;
}

export interface PortfolioPayload {
  profile: PortfolioProfile;
  metrics: PortfolioMetric[];
  education: EducationEntry[];
  projects: ProjectEntry[];
  skills: SkillEntry[];
  strengths: StrengthEntry[];
  tasks: AutomationTask[];
  pythonRuntime: string;
}

export interface VoiceCommandResponse {
  command: string;
  intent: string;
  handler: string;
  reply: string;
  executionMs: number;
  runtime: string;
  timestamp: string;
  tasks?: AutomationTask[];
}

export interface HealthStatus {
  status: string;
  backend: string;
  pythonVersion: string;
  database: string;
  messagesStored: number;
  tasksStored: number;
}
