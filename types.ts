
export type Priority = 'High' | 'Medium' | 'Low';

export interface CoreRequirement {
  id: string;
  description: string;
  priority: Priority;
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
  techStack: {
    frontend: string[];
    backend: string[];
    database: string[];
    otherTools: string[];
  };
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
}
