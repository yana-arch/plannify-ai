import React from 'react';

export type Priority = 'High' | 'Medium' | 'Low';

export interface CoreRequirement {
  id: string;
  description: string;
  priority: Priority;
}

export interface CoreModule {
  moduleName: string;
  description: string;
  flows: string[];
}

export interface RolePermission {
  role: string;
  permissions: string[];
}

export interface StandardFlow {
  flowName: string;
  steps: string[];
}

export interface Risk {
  risk: string;
  impact: 'Low' | 'Medium' | 'High';
  probability: 'Low' | 'Medium' | 'High';
  mitigation: string;
}

export interface SuccessMetric {
  metric: string;
  target: string;
  timeframe: string;
}

export interface ProjectInputData {
  projectName: string;
  shortDescription: string;
  businessGoals: string;
  technicalGoals: string;
  targetUsers: string[];
  numberOfFeatures: number;
  estimatedScale: string;
  timeline: string;
  coreRequirements: CoreRequirement[];
  userFeatureRequests?: string;
  coreModules?: CoreModule[];
  rolePermissions?: RolePermission[];
  standardFlows?: StandardFlow[];
  techStack: {
    frontend: string[];
    backend: string[];
    database: string[];
    otherTools: string[];
  };
  marketAnalysis: string;
  competitors: string[];
  riskAssessment: Risk[];
  featureDependencies: { [featureId: string]: string[] };
  successMetrics: SuccessMetric[];
}

export type TemplateCategory =
  | 'web_app'
  | 'backend_service'
  | 'dashboard_analytics'
  | 'ecommerce'
  | 'b2b_saas'
  | 'ai_api'
  | 'education'
  | 'healthcare'
  | 'real_estate'
  | 'other';

export type TemplateSize = 'small' | 'medium' | 'large';

export interface TemplateMeta {
  category?: TemplateCategory;
  size?: TemplateSize;
  tags?: string[];
}

export interface TemplateData extends Partial<ProjectInputData> {
  meta?: TemplateMeta;
}

export interface FeatureSpecification {
  name: string;
  description: string;
  targetUsers: string[];
  mainFunctions: string[];
  subFeatures: string[];
  preConditions: string[];
}

export interface Milestone {
  name: string;
  description: string;
  tasks: string[];
  estimatedStartDate: string;
  estimatedDurationWeeks: number;
}

export interface ProjectPlan {
  summary: string;
  keyComponents: string[];
  recommendedTechStack: {
    frontend: string[];
    backend: string[];
    database: string[];
    other: string[];
  };
  potentialChallenges: string[];
  potentialOpportunities: string[];
  detailedFeatures: FeatureSpecification[];
  developmentPlan: {
    milestones: Milestone[];
  };
  systemArchitectureMermaid: string;
  userFlowMermaid: string;
  databaseERDMermaid: string;
}

export type ReportType = 'technical_spec' | 'product_brief' | 'executive_summary';

export interface ReportTemplate {
  id: ReportType;
  title: string;
  description: string;
  persona: string;
  icon: React.FC<React.SVGProps<SVGSVGElement>>;
}

export type Screen = 'wizard' | 'templates' | 'plan' | 'projects' | 'dashboard' | 'settings';

export type APIProviderType =
  | 'openrouter'
  | 'gemini'
  | 'ollama'
  | 'anthropic'
  | 'openai'
  | 'custom';

export interface APIProvider {
  id: string;
  name: string;
  type: APIProviderType;
  baseUrl: string;
  apiKey: string;
  model: string;
  isActive: boolean;
  createdAt: string;
  lastUsed?: string;
}

export interface AppSettings {
  activeProviderId: string | null;
  providers: APIProvider[];
}

export interface PlanHistoryEntry {
  plan: ProjectPlan;
  savedAt: string;
}

export interface SavedProject {
  id: string;
  projectName: string;
  shortDescription: string;
  createdAt: string;
  inputData: ProjectInputData;
  projectPlan: ProjectPlan;
  history?: PlanHistoryEntry[];
}

export interface CritiqueResult {
  strengths: string[];
  weaknesses: string[];
  suggestions: string[];
  score: number;
}

export interface ProjectsContextType {
  projects: SavedProject[];
  currentProject: SavedProject | null;
  isLoading: boolean;
  error: string | null;
  createNewProject: (data: ProjectInputData) => Promise<string | null>;
  loadProject: (projectId: string) => void;
  deleteProject: (projectId: string) => void;
  importProject: (project: SavedProject) => void;
  updateCurrentProjectPlan: (newPlan: ProjectPlan) => void;
  updateCurrentProjectFeatures: (
    featureIndex: number,
    updatedFeature: FeatureSpecification,
  ) => void;
  updateCurrentProjectDevPlan: (newMilestones: Milestone[]) => void;
  restoreProjectVersion: (entry: PlanHistoryEntry) => void;
  clearCurrentProject: () => void;
}
