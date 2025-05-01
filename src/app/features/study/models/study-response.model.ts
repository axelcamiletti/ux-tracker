export interface DeviceInfo {
  browser: string;
  os: string;
  screenSize: string;
  userAgent?: string;
}

export interface BaseSectionResponse {
  sectionId: string;
  timestamp: Date;
  type: 'open-question' | 'yes-no' | 'multiple-choice' | 'prototype-test' | 'welcome-screen' | 'thank-you';
}

export interface OpenQuestionResponse extends BaseSectionResponse {
  type: 'open-question';
  response: {
    text: string;
  };
}

export interface MultipleChoiceResponse extends BaseSectionResponse {
  type: 'multiple-choice';
  response: {
    selectedOptionIds: string[];
  };
}

export interface YesNoResponse extends BaseSectionResponse {
  type: 'yes-no';
  response: {
    answer: boolean;
  };
}

export interface PrototypeTestResponse extends BaseSectionResponse {
  type: 'prototype-test';
  response: {
    figmaEventLog: Array<{
      timestamp: Date;
      [key: string]: any; // Permite cualquier propiedad adicional para adaptarse a diferentes formatos de eventos
    }>;
  }
}

export interface WelcomeScreenResponse extends BaseSectionResponse {
  type: 'welcome-screen';
  response: {
    viewed: boolean;
  };
}

export interface ThankYouResponse extends BaseSectionResponse {
  type: 'thank-you';
  response: {
    viewed: boolean;
  };
}

export type SectionResponse =
  | OpenQuestionResponse
  | MultipleChoiceResponse
  | YesNoResponse
  | PrototypeTestResponse
  | WelcomeScreenResponse
  | ThankYouResponse;

export interface StudyResponse {
  id: string;
  studyId: string;
  userId: string;
  responses: SectionResponse[];
  startedAt: Date;
  completedAt?: Date;
  status: 'in-progress' | 'completed' | 'abandoned';
  deviceInfo?: DeviceInfo;
  sectionTimes?: { [sectionId: string]: number };
}
