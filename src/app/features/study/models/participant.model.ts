import { DeviceInfo } from './study-response.model';

export interface ParticipantMetadata {
  location?: {
    country?: string;
    city?: string;
    timezone?: string;
  };
  referrer?: string;
  customFields?: {
    [key: string]: string | number | boolean;
  };
}

export interface Participant {
  id: string;
  studyId: string;
  email?: string;
  deviceInfo: DeviceInfo;
  startedAt: Date;
  completedAt?: Date;
  lastInteractionAt: Date;
  status: 'active' | 'completed' | 'abandoned';
  progress: {
    currentSectionIndex: number;
    totalSections: number;
    completedSections: string[];  // Array of completed sectionIds
  };
  metadata?: ParticipantMetadata;
}
