export interface ParticipantResult {
  id: string;
  studyId: string;
  participantId: string;
  responses: {
    sectionId: string;
    type: 'open-question' | 'yes-no' | 'multiple-choice';
    answer: any;
    timestamp: Date;
  }[];
  startedAt: Date;
  completedAt: Date;
} 