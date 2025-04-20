import { Section } from "./section.model";
import { StudyResponse } from "./study-response.model";
import { Participant } from "./participant.model";

export interface StudySettings {
  allowMultipleResponses: boolean;
  requireEmail: boolean;
  showProgressBar: boolean;
  collectDeviceInfo: boolean;
  timeoutSettings?: {
    enableTimeout: boolean;
    timeoutMinutes: number;
    showWarning: boolean;
    warningAtMinutes: number;
  };
  notifications?: {
    onNewResponse: boolean;
    onCompletion: boolean;
    emailAddresses: string[];
  };
  customBranding?: {
    logo?: string;
    primaryColor?: string;
    secondaryColor?: string;
    fontFamily?: string;
    customCss?: string;
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

  // Public access URLs
  publicUrl?: string;
  previewUrl?: string;

  // Statistics
  stats: {
    totalResponses: number;
    completedResponses: number;
    averageCompletionTime?: number;
    lastResponseAt?: Date;
  };

  // Reference to responses and participants
  participantIds: string[];
  responseIds: string[];

  // Metadata
  createdAt: Date;
  updatedAt: Date;
  publishedAt?: Date;
  archivedAt?: Date;
  createdBy: string;
  lastModifiedBy: string;
}
