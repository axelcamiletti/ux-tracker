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

// Actualizamos la interfaz PrototypeTestResponse para incluir más detalle sobre las interacciones
export interface PrototypeTestResponse extends BaseSectionResponse {
  type: 'prototype-test';
  response: {
    completed: boolean;
    timeSpent: number;
    interactions?: Array<{
      elementId: string;
      action: string;
      timestamp: Date;
      position?: { x: number; y: number }; // Posición para clicks
    }>;
    // Nuevos campos para analíticas detalladas
    screenTimes?: { [screenId: string]: number }; // Tiempo por pantalla
    navigationPath?: Array<{ from: string; to: string; timestamp: Date }>; // Camino de navegación
    completionSuccess?: boolean; // Si el usuario completó el flujo esperado
  };
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
