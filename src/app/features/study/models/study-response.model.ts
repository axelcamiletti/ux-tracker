export interface StudyResponse {
  id: string;  // Ya no es opcional
  studyId: string;
  userId: string;
  responses: SectionResponse[];
  startedAt: Date;
  completedAt?: Date;
  status: 'in-progress' | 'completed' | 'abandoned';
}

export interface SectionResponse {
  sectionId: string;
  type: string;
  response: any;
  timestamp: Date;
}

export interface StudyAnalytics {
  totalResponses: number;
  completionRate: number;
  averageTimeSpent: number;
  sectionAnalytics: {
    [sectionId: string]: SectionAnalytics;
  };
}

export interface SectionAnalytics {
  totalResponses: number;
  responses: any[];
  // Para preguntas de opción múltiple
  optionDistribution?: {
    [optionId: string]: number;
  };
  // Para preguntas sí/no
  yesNoDistribution?: {
    yes: number;
    no: number;
  };
  // Para preguntas abiertas
  commonKeywords?: {
    word: string;
    count: number;
  }[];
}
