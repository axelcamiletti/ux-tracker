import { Section } from "./section.model";

export interface Study {
  id: string;
  name: string;
  projectId: string;
  status: 'draft' | 'published' | 'completed';
  sections: Section[];
  publicUrl?: string;
  allowMultipleResponses?: boolean;
  publishedAt?: Date;
  totalResponses?: number;
  lastResponseAt?: Date;
  responseIds?: string[];  // Array de IDs de las respuestas
  createdAt: Date;
  updatedAt: Date;
}
