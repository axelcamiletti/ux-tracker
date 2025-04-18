import { Section } from "./section.model";

export interface Study {
  id: string;
  name: string;
  projectId: string;
  status: 'draft' | 'published' | 'completed';
  sections: Section[];
  publicUrl?: string;
  responses?: any[];
  createdAt: Date;
  updatedAt: Date;
} 