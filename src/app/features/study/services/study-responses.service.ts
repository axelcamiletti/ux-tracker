import { Injectable, PLATFORM_ID, Inject, inject } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { Firestore, collection, addDoc, updateDoc, doc, query, where, getDocs, getDoc, DocumentData, arrayUnion } from '@angular/fire/firestore';
import { Observable, from, map, of } from 'rxjs';
import {
  SectionAnalytics,
  StudyAnalytics,
  StudyResponse,
  SectionResponse,
  YesNoResponse,
  MultipleChoiceResponse,
  OpenQuestionResponse
} from '../models/study-response.model';
import { Study } from '../models/study.model';

@Injectable({
  providedIn: 'root'
})
export class StudyResponsesService {
  private isBrowser: boolean;
  private firestore = inject(Firestore);

  constructor(@Inject(PLATFORM_ID) platformId: Object) {
    this.isBrowser = isPlatformBrowser(platformId);
  }

  // Crear una nueva respuesta de estudio
  async createStudyResponse(studyId: string): Promise<string> {
    if (!this.isBrowser) return '';

    const studyResponse: StudyResponse = {
      id: '',
      studyId,
      userId: crypto.randomUUID(),
      responses: [],
      startedAt: new Date(),
      status: 'in-progress'
    };

    const docRef = await addDoc(collection(this.firestore, 'study-responses'), studyResponse);
    return docRef.id;
  }

  // Actualizar una respuesta de sección
  async updateSectionResponse(
    responseId: string,
    sectionId: string,
    response: {
      type: 'open-question' | 'multiple-choice' | 'yes-no' | 'prototype-test' | 'welcome-screen' | 'thank-you';
      value: { text: string } | { selectedOptionIds: string[] } | { answer: boolean } | { completed: boolean; timeSpent: number; interactions?: { elementId: string; action: string; timestamp: Date }[] }
    }
  ): Promise<void> {
    if (!this.isBrowser) return;

    const docRef = doc(this.firestore, 'study-responses', responseId);
    const sectionResponse = {
      sectionId,
      type: response.type,
      response: response.value,
      timestamp: new Date()
    } as SectionResponse;

    await updateDoc(docRef, {
      responses: arrayUnion(sectionResponse),
      lastUpdated: new Date()
    });
  }

  // Finalizar un estudio y actualizar el contador de respuestas
  async completeStudy(responseId: string): Promise<void> {
    if (!this.isBrowser) return;

    const responseRef = doc(this.firestore, 'study-responses', responseId);
    const responseDoc = await getDoc(responseRef);
    const response = responseDoc.data() as StudyResponse;

    await updateDoc(responseRef, {
      status: 'completed',
      completedAt: new Date()
    });

    const studyRef = doc(this.firestore, 'studies', response.studyId);
    await updateDoc(studyRef, {
      'stats.totalResponses': arrayUnion(responseId),
      'stats.lastResponseAt': new Date()
    });
  }

  // Obtener analíticas de un estudio
  async getStudyAnalytics(studyId: string): Promise<StudyAnalytics> {
    if (!this.isBrowser) {
      return {
        totalResponses: 0,
        completionRate: 0,
        averageTimeSpent: 0,
        sectionAnalytics: {}
      };
    }

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

  // Add new method
  async getCompletedStudyResponses(studyId: string): Promise<StudyResponse[]> {
    if (!this.isBrowser) return [];

    const q = query(
      collection(this.firestore, 'study-responses'),
      where('studyId', '==', studyId),
      where('status', '==', 'completed')
    );

    const querySnapshot = await getDocs(q);
    return querySnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    } as StudyResponse));
  }

  // Calcular analíticas
  private calculateAnalytics(responses: StudyResponse[]): StudyAnalytics {
    const totalResponses = responses.length;
    const completedResponses = responses.filter(r => r.status === 'completed').length;
    const averageTimeSpent = this.calculateAverageTimeSpent(responses);
    const sectionAnalytics = this.calculateSectionAnalytics(responses);

    return {
      totalResponses,
      completionRate: totalResponses > 0 ? (completedResponses / totalResponses) * 100 : 0,
      averageTimeSpent,
      sectionAnalytics
    };
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
            responses: [],
            yesNoStats: { yes: 0, no: 0 },
            multipleChoiceStats: {},
            commonKeywords: [],
            averageTimeSpent: 0
          };
        }

        const section = sectionAnalytics[sectionResponse.sectionId];
        section.responses.push(sectionResponse);
        section.totalResponses++;

        switch (sectionResponse.type) {
          case 'yes-no':
            const yesNoResponse = sectionResponse as YesNoResponse;
            if (yesNoResponse.response.answer) {
              section.yesNoStats.yes++;
            } else {
              section.yesNoStats.no++;
            }
            break;

          case 'multiple-choice':
            const multipleChoiceResponse = sectionResponse as MultipleChoiceResponse;
            multipleChoiceResponse.response.selectedOptionIds.forEach(optionId => {
              section.multipleChoiceStats[optionId] = (section.multipleChoiceStats[optionId] || 0) + 1;
            });
            break;

          case 'open-question':
            const openQuestionResponse = sectionResponse as OpenQuestionResponse;
            if (openQuestionResponse.response.text) {
              this.updateKeywordAnalysis(section, openQuestionResponse.response.text);
            }
            break;
        }
      });
    });

    return sectionAnalytics;
  }

  private updateKeywordAnalysis(section: SectionAnalytics, response: string): void {
    const words = response.toLowerCase().split(/\s+/);
    const wordCount: { [key: string]: number } = {};

    words.forEach(word => {
      if (word.length > 3) {
        wordCount[word] = (wordCount[word] || 0) + 1;
      }
    });

    section.commonKeywords = Object.entries(wordCount)
      .map(([word, count]) => ({ word, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 10);
  }
}
