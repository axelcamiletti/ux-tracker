export interface Section {
  id: string;
  type: 'open-question' | 'yes-no' | 'multiple-choice' | 'prototype-test' | 'welcome-screen' | 'thank-you';
  data: any;
  response?: any;
}
