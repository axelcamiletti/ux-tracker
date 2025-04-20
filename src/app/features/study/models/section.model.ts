export interface BaseSection {
  id: string;
  title: string;
  description?: string;
  required: boolean;
}

export interface OpenQuestionSection extends BaseSection {
  type: 'open-question';
  data: {
    placeholder?: string;
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
    selectedOption?: string;
  };
}

export interface PrototypeTestSection extends BaseSection {
  type: 'prototype-test';
  data: {
    prototypeUrl: string;
    instructions?: string;
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

export type Section =
  | OpenQuestionSection
  | MultipleChoiceSection
  | YesNoSection
  | PrototypeTestSection
  | WelcomeScreenSection
  | ThankYouSection;
