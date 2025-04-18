export interface MultipleChoiceOption {
  id: number;
  label: string;
}

export interface MultipleChoiceData {
  title: string;
  subtitle: string;
  selectionType: 'single' | 'multiple';
  options: MultipleChoiceOption[];
}
