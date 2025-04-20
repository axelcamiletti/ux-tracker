import { Section } from "./section.model";
import { StudyResponse } from "./study-response.model";
import { Participant } from "./participant.model";

export interface StudySettings {
  allowMultipleResponses: boolean;
  requireEmail: boolean;
  showProgressBar: boolean;
  collectDeviceInfo: boolean;
  customBranding?: {
    logo?: string;
    primaryColor?: string;
    secondaryColor?: string;
  };
}

export interface Study {
  id: string;
  name: string;
  projectId: string;
  description?: string;
  status: 'draft' | 'published' | 'completed' | 'archived';
  sections: Section[];
  settings: StudySettings;
  
  // URLs
  publicUrl?: string;
  previewUrl?: string;
  
  // Estadísticas
  stats: {
    totalResponses: number;
    completedResponses: number;
    averageCompletionTime?: number;
    lastResponseAt?: Date;
  };
  
  // Referencias a respuestas y participantes
  participantIds: string[];
  responseIds: string[];
  
  // Metadatos
  createdAt: Date;
  updatedAt: Date;
  publishedAt?: Date;
  archivedAt?: Date;
  createdBy: string;
  lastModifiedBy: string;
}
