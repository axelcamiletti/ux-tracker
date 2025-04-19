export interface Participant {
  id: string;
  avatar: string;
  name?: string;
  studyResponseId?: string;  // Referencia al StudyResponse asociado
}
