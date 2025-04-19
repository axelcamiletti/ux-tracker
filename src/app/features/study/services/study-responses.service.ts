import { Injectable } from '@angular/core';
import { Firestore, collection, addDoc, updateDoc, doc, query, where, getDocs, getDoc, DocumentData, arrayUnion } from '@angular/fire/firestore';
import { Observable, from, map } from 'rxjs';
import { SectionAnalytics, StudyAnalytics, StudyResponse, SectionResponse } from '../models/study-response.model';
import { Study } from '../models/study.model';

@Injectable({
  providedIn: 'root'
})
export class StudyResponsesService {
  constructor(private firestore: Firestore) {}

  // Crear una nueva respuesta de estudio
  async createStudyResponse(studyId: string): Promise<string> {
    const studyResponse: StudyResponse = {
      studyId,
      userId: crypto.randomUUID(), // Generamos un ID único para el participante
      responses: [],
      startedAt: new Date(),
      sectionId: '',
      status: 'in-progress'
    };

    const docRef = await addDoc(collection(this.firestore, 'study-responses'), studyResponse);
    return docRef.id;
  }

  // Actualizar una respuesta de sección
  async updateSectionResponse(responseId: string, sectionId: string, response: any): Promise<void> {
    const docRef = doc(this.firestore, 'study-responses', responseId);
    const sectionResponse: SectionResponse = {
      sectionId,
      type: response.type,
      response: response.value,
      timestamp: new Date()
    };

    await updateDoc(docRef, {
      responses: arrayUnion(sectionResponse),
      lastUpdated: new Date()
    });
  }

  // Finalizar un estudio y actualizar el contador de respuestas
  async completeStudy(responseId: string): Promise<void> {
    // 1. Obtener la respuesta actual
    const responseRef = doc(this.firestore, 'study-responses', responseId);
    const responseDoc = await getDoc(responseRef);
    const response = responseDoc.data() as StudyResponse;

    // 2. Marcar la respuesta como completada
    await updateDoc(responseRef, {
      status: 'completed',
      completedAt: new Date()
    });

    // 3. Obtener el estudio y actualizar el contador de respuestas
    const studyRef = doc(this.firestore, 'studies', response.studyId);
    const studyDoc = await getDoc(studyRef);
    const study = studyDoc.data() as Study;

    // 4. Incrementar el contador de respuestas
    await updateDoc(studyRef, {
      totalResponses: (study.totalResponses || 0) + 1,
      updatedAt: new Date()
    });
  }

  // Obtener analíticas de un estudio
  async getStudyAnalytics(studyId: string): Promise<StudyAnalytics> {
    const q = query(
      collection(this.firestore, 'study-responses'),
      where('studyId', '==', studyId)
    );

    const querySnapshot = await getDocs(q);
    const responses: StudyResponse[] = [];
    querySnapshot.forEach((doc) => {
      responses.push({ id: doc.id, ...doc.data() } as StudyResponse);
    });

    return this.calculateAnalytics(responses);
  }

  // Calcular analíticas
  private calculateAnalytics(responses: StudyResponse[]): StudyAnalytics {
    const totalResponses = responses.length;
    const completedResponses = responses.filter(r => r.status === 'completed').length;

    const analytics: StudyAnalytics = {
      totalResponses,
      completionRate: totalResponses > 0 ? (completedResponses / totalResponses) * 100 : 0,
      averageTimeSpent: this.calculateAverageTimeSpent(responses),
      sectionAnalytics: this.calculateSectionAnalytics(responses)
    };

    return analytics;
  }

  // Calcular tiempo promedio
  private calculateAverageTimeSpent(responses: StudyResponse[]): number {
    const completedResponses = responses.filter(r => r.status === 'completed' && r.completedAt);
    if (completedResponses.length === 0) return 0;

    const totalTime = completedResponses.reduce((sum, response) => {
      const timeSpent = response.completedAt!.getTime() - response.startedAt.getTime();
      return sum + timeSpent;
    }, 0);

    return totalTime / completedResponses.length;
  }

  // Calcular analíticas por sección
  private calculateSectionAnalytics(responses: StudyResponse[]): { [key: string]: SectionAnalytics } {
    const sectionAnalytics: { [key: string]: SectionAnalytics } = {};

    responses.forEach(response => {
      response.responses.forEach(sectionResponse => {
        if (!sectionAnalytics[sectionResponse.sectionId]) {
          sectionAnalytics[sectionResponse.sectionId] = {
            totalResponses: 0,
            responses: []
          };
        }

        const section = sectionAnalytics[sectionResponse.sectionId];
        section.totalResponses++;
        section.responses.push(sectionResponse.response);

        switch (sectionResponse.type) {
          case 'yes-no':
            this.updateYesNoDistribution(section, sectionResponse.response);
            break;
          case 'multiple-choice':
            this.updateOptionDistribution(section, sectionResponse.response);
            break;
          case 'open-question':
            this.updateKeywordAnalysis(section, sectionResponse.response);
            break;
        }
      });
    });

    return sectionAnalytics;
  }

  private updateYesNoDistribution(section: SectionAnalytics, response: 'yes' | 'no'): void {
    if (!section.yesNoDistribution) {
      section.yesNoDistribution = { yes: 0, no: 0 };
    }
    section.yesNoDistribution[response]++;
  }

  private updateOptionDistribution(section: SectionAnalytics, response: number[]): void {
    if (!section.optionDistribution) {
      section.optionDistribution = {};
    }
    response.forEach(optionId => {
      section.optionDistribution![optionId] = (section.optionDistribution![optionId] || 0) + 1;
    });
  }

  private updateKeywordAnalysis(section: SectionAnalytics, response: string): void {
    if (!section.commonKeywords) {
      section.commonKeywords = [];
    }

    // Análisis simple de palabras clave (se podría mejorar con NLP)
    const words = response.toLowerCase().split(/\s+/);
    const stopWords = new Set(['el', 'la', 'los', 'las', 'un', 'una', 'y', 'o', 'pero', 'si', 'no', 'en', 'con', 'por']);

    words
      .filter(word => word.length > 3 && !stopWords.has(word))
      .forEach(word => {
        const existing = section.commonKeywords!.find(k => k.word === word);
        if (existing) {
          existing.count++;
        } else {
          section.commonKeywords!.push({ word, count: 1 });
        }
      });

    // Ordenar por frecuencia y mantener solo las top 10 palabras
    section.commonKeywords.sort((a, b) => b.count - a.count);
    section.commonKeywords = section.commonKeywords.slice(0, 10);
  }
}
