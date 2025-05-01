import { Injectable, PLATFORM_ID, Inject, inject } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { Firestore, collection, addDoc, updateDoc, doc, query, where, getDocs, getDoc, DocumentData, arrayUnion, increment } from '@angular/fire/firestore';
import {
  StudyResponse,
  SectionResponse,
  DeviceInfo
} from '../models/study-response.model';
import { StudyAnalytics } from '../models/study-analytics.model';

@Injectable({
  providedIn: 'root'
})
export class StudyResponsesService {
  private isBrowser: boolean;
  private firestore = inject(Firestore);

  constructor(@Inject(PLATFORM_ID) platformId: Object) {
    this.isBrowser = isPlatformBrowser(platformId);
    console.log('StudyResponsesService: Inicializando, isPlatformBrowser:', this.isBrowser);
  }

  async createStudyResponse(studyId: string): Promise<string> {
    console.log('Creando nueva respuesta de estudio para:', studyId);
    if (!this.isBrowser) {
      console.warn('Intento de crear respuesta en el servidor');
      return '';
    }

    try {
      const studyResponse: StudyResponse = {
        id: '',
        studyId,
        userId: crypto.randomUUID(),
        responses: [],
        startedAt: new Date(),
        status: 'in-progress',
        deviceInfo: this.getDeviceInfo()
      };

      console.log('Datos de respuesta inicial:', studyResponse);
      const docRef = await addDoc(collection(this.firestore, 'study-responses'), studyResponse);
      console.log('Respuesta creada con ID:', docRef.id);
      return docRef.id;
    } catch (error) {
      console.error('Error al crear respuesta de estudio:', error);
      throw error;
    }
  }

  async updateSectionResponse(
    responseId: string,
    sectionId: string,
    response: {
      type: 'open-question' | 'multiple-choice' | 'yes-no' | 'prototype-test' | 'welcome-screen' | 'thank-you';
      value: any;
    }
  ): Promise<void> {
    console.log('Actualizando respuesta de sección:', {
      responseId,
      sectionId,
      response
    });

    if (!this.isBrowser) {
      console.warn('Intento de actualizar respuesta en el servidor');
      return;
    }

    try {
      const docRef = doc(this.firestore, 'study-responses', responseId);
      const responseDoc = await getDoc(docRef);

      if (!responseDoc.exists()) {
        console.error('No se encontró el documento de respuesta');
        throw new Error('Respuesta no encontrada');
      }

      const currentData = responseDoc.data() as StudyResponse;
      const sectionResponse = {
        sectionId,
        type: response.type,
        response: response.value,
        timestamp: new Date()
      } as SectionResponse;

      // Eliminar respuesta anterior si existe
      const responses = currentData.responses.filter(r => r.sectionId !== sectionId);
      responses.push(sectionResponse);

      console.log('Actualizando documento con respuestas:', responses);
      await updateDoc(docRef, {
        responses,
        lastInteractionAt: new Date()
      });

      console.log('Respuesta de sección actualizada exitosamente');
    } catch (error) {
      console.error('Error al actualizar respuesta de sección:', error);
      throw error;
    }
  }

  async completeStudy(responseId: string): Promise<void> {
    console.log('Completando estudio para respuesta:', responseId);
    if (!this.isBrowser) {
      console.warn('Intento de completar estudio en el servidor');
      return;
    }

    try {
      const responseRef = doc(this.firestore, 'study-responses', responseId);
      const responseDoc = await getDoc(responseRef);

      if (!responseDoc.exists()) {
        console.error('No se encontró el documento de respuesta');
        throw new Error('Respuesta no encontrada');
      }

      const response = responseDoc.data() as StudyResponse;
      console.log('Datos actuales de la respuesta:', response);

      await updateDoc(responseRef, {
        status: 'completed',
        completedAt: new Date()
      });

      const studyRef = doc(this.firestore, 'studies', response.studyId);
      await updateDoc(studyRef, {
        'stats.totalResponses': increment(1),
        'stats.lastResponseAt': new Date(),
        'stats.completedResponses': increment(1)
      });

      console.log('Estudio completado exitosamente');
    } catch (error) {
      console.error('Error al completar el estudio:', error);
      throw error;
    }
  }

  async getCompletedStudyResponses(studyId: string): Promise<StudyResponse[]> {
    console.log('StudyResponsesService: Iniciando getCompletedStudyResponses para studyId:', studyId);

    try {
      const q = query(
        collection(this.firestore, 'study-responses'),
        where('studyId', '==', studyId),
        where('status', '==', 'completed')
      );
      console.log('StudyResponsesService: Ejecutando query para respuestas completadas...');

      const querySnapshot = await getDocs(q);
      console.log('StudyResponsesService: Respuestas completadas encontradas:', querySnapshot.size);

      const responses = querySnapshot.docs.map(doc => {
        console.log('StudyResponsesService: Procesando respuesta completada:', doc.id);
        const data = doc.data();
        try {
          // Asegurarse de que los datos base estén presentes
          if (!data['userId'] || !data['startedAt']) {
            console.warn('StudyResponsesService: Datos incompletos en respuesta:', doc.id);
            return null;
          }

          // Convertir fechas y asegurar que las respuestas sean un array
          const response: StudyResponse = {
            id: doc.id,
            studyId: data['studyId'],
            userId: data['userId'],
            status: data['status'] || 'completed',
            deviceInfo: data['deviceInfo'] || undefined,
            startedAt: data['startedAt']?.toDate?.() || new Date(data['startedAt']),
            completedAt: data['completedAt']?.toDate?.() || new Date(data['completedAt']),
            responses: Array.isArray(data['responses']) ? data['responses'].map((response: any) => ({
              ...response,
              timestamp: response['timestamp']?.toDate?.() || new Date(response['timestamp'])
            })) : []
          };

          console.log('StudyResponsesService: Respuesta completada procesada exitosamente:', {
            id: doc.id,
            responsesCount: response.responses.length
          });
          return response;
        } catch (error) {
          console.error('StudyResponsesService: Error procesando respuesta completada:', doc.id, error);
          return null;
        }
      })
      .filter((response): response is StudyResponse => response !== null);

      console.log('StudyResponsesService: Todas las respuestas completadas procesadas:', responses.length);
      return responses;
    } catch (error) {
      console.error('StudyResponsesService: Error en getCompletedStudyResponses:', error);
      throw error;
    }
  }

  private getDeviceInfo(): DeviceInfo {
    return {
      browser: this.getBrowserInfo(),
      os: this.getOSInfo(),
      screenSize: `${window.screen.width}x${window.screen.height}`,
      userAgent: navigator.userAgent
    };
  }

  private getBrowserInfo(): string {
    const ua = navigator.userAgent;
    if (ua.includes('Firefox')) return 'Firefox';
    if (ua.includes('Chrome')) return 'Chrome';
    if (ua.includes('Safari')) return 'Safari';
    if (ua.includes('Edge')) return 'Edge';
    if (ua.includes('Opera')) return 'Opera';
    return 'Unknown';
  }

  private getOSInfo(): string {
    const ua = navigator.userAgent;
    if (ua.includes('Windows')) return 'Windows';
    if (ua.includes('Mac OS')) return 'MacOS';
    if (ua.includes('Linux')) return 'Linux';
    if (ua.includes('Android')) return 'Android';
    if (ua.includes('iOS')) return 'iOS';
    return 'Unknown';
  }
}
