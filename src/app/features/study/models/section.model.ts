export interface BaseSection {
  id: string;
  title: string;
  description?: string;
  required: boolean;
}

export interface OpenQuestionSection extends BaseSection {
  type: 'open-question';
  data: {
    minLength?: number;
    maxLength?: number;
  };
}

export interface MultipleChoiceSection extends BaseSection {
  type: 'multiple-choice';
  data: {
    options: Array<{
      id: string;
      text: string;
    }>;
    allowMultiple: boolean;
  };
}

export interface YesNoSection extends BaseSection {
  type: 'yes-no';
  data: {
    yesLabel: string;
    noLabel: string;
    yesDescription?: string;
    noDescription?: string;
    selectedOption?: 'yes' | 'no';
    buttonStyle?: 'default' | 'emoji' | 'thumbs';
  };
}

export interface PrototypeTestSection extends BaseSection {
  type: 'prototype-test';
  data: {
    originalUrl: string;
    embedUrl: string;
    startingNodeId?: string;
    selectedTargetNodeId?: string;
    // Utilizar la referencia a nodos sin datos analíticos
    nodes?: Array<{
      id: string;
      name: string;
      imageUrl: string;
      type?: string;
    }>;
    // Mantener frames para compatibilidad con código existente
    frames?: Array<{
      id: string;
      name: string;
      imageUrl: string;
    }>;
  };
}

export interface WelcomeScreenSection extends BaseSection {
  type: 'welcome-screen';
  data: {
    welcomeMessage: string;
    imageUrl?: string;
  };
}

export interface ThankYouSection extends BaseSection {
  type: 'thank-you';
  data: {
    thankYouMessage: string;
    imageUrl?: string;
    redirectUrl?: string;
  };
}

export interface FigmaUrl {
  fileType: string;
  fileKey: string;
  fileName: string;
  nodeId: string;
  startingNodeId?: string;
}

export type Section =
  | OpenQuestionSection
  | MultipleChoiceSection
  | YesNoSection
  | PrototypeTestSection
  | WelcomeScreenSection
  | ThankYouSection;
