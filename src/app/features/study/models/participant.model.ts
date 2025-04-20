export interface Participant {
  id: string;
  studyId: string;
  email?: string;
  deviceInfo: {
    browser: string;
    os: string;
    screenSize: string;
    userAgent?: string;
  };
  startedAt: Date;
  completedAt?: Date;
  lastInteractionAt: Date;
  status: 'active' | 'completed' | 'abandoned';
  progress: {
    currentSectionIndex: number;
    totalSections: number;
    completedSections: string[];  // Array de sectionIds completadas
  };
  metadata?: {
    [key: string]: any;  // Datos adicionales que podríamos querer guardar
  };
}
