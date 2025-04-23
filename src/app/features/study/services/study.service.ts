import { Injectable, PLATFORM_ID, Inject, inject } from '@angular/core';
import { BehaviorSubject, Observable, from, map, of, tap } from 'rxjs';
import { isPlatformBrowser } from '@angular/common';
import { Firestore, collection, addDoc, getDocs, query, where, doc, updateDoc, getDoc, deleteDoc } from '@angular/fire/firestore';
import { Study } from '../models/study.model';
import { StudyResponse } from '../models/study-response.model';
import { environment } from '../../../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class StudyService {
  private currentStudy = new BehaviorSubject<Study | null>(null);
  private studies = new BehaviorSubject<Study[]>([]);
  private responses = new BehaviorSubject<StudyResponse[]>([]);
  private isBrowser: boolean;
  private readonly collectionName = 'studies';
  private firestore = inject(Firestore);

  constructor(@Inject(PLATFORM_ID) platformId: Object) {
    this.isBrowser = isPlatformBrowser(platformId);
    // Solo cargar del localStorage si estamos en el navegador
    if (this.isBrowser) {
      console.log('StudyService: Ejecutando en el navegador');
      this.loadFromLocalStorage();
    } else {
      console.log('StudyService: No ejecutando en el navegador');
    }
  }

  // Obtener el estudio actual
  getCurrentStudy(): Observable<Study | null> {
    console.log('StudyService: Solicitando estudio actual');
    return this.currentStudy.asObservable();
  }

  // Establecer el estudio actual
  setCurrentStudy(study: Study): void {
    console.log('StudyService: Estableciendo estudio actual:', study);
    if (!this.isBrowser) {
      console.log('StudyService: No en navegador, ignorando setCurrentStudy');
      return;
    }
    this.currentStudy.next(study);
    this.saveToLocalStorage();
  }

  // Obtener un estudio por ID
  getStudyById(studyId: string): Observable<Study> {
    console.log('StudyService: Obteniendo estudio por ID:', studyId);
    return from(getDoc(doc(this.firestore, 'studies', studyId))).pipe(
      map(doc => {
        if (doc.exists()) {
          const study = { id: doc.id, ...doc.data() } as Study;
          console.log('StudyService: Estudio encontrado:', study);
          this.setCurrentStudy(study);
          return study;
        }
        throw new Error('Estudio no encontrado');
      })
    );
  }

  // Obtener todos los estudios de un proyecto
  getStudiesByProjectId(projectId: string): Observable<Study[]> {
    if (!this.isBrowser) {
      return of([]);
    }
    const studiesRef = collection(this.firestore, this.collectionName);
    const q = query(studiesRef, where('projectId', '==', projectId));

    return from(getDocs(q)).pipe(
      map(snapshot => {
        return snapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        } as Study));
      })
    );
  }

  // Crear un nuevo estudio
  async createStudy(study: Omit<Study, 'id'>): Promise<string> {
    if (!this.isBrowser) {
      return '';
    }
    const studiesRef = collection(this.firestore, this.collectionName);
    const docRef = await addDoc(studiesRef, study);
    return docRef.id;
  }

  // Actualizar un estudio
  async updateStudy(studyId: string, data: Partial<Study>): Promise<void> {
    console.log('StudyService: Actualizando estudio:', { studyId, data });
    if (!this.isBrowser) {
      console.log('StudyService: No en navegador, ignorando updateStudy');
      return;
    }
    const studyRef = doc(this.firestore, this.collectionName, studyId);
    try {
      await updateDoc(studyRef, data);
      console.log('StudyService: Estudio actualizado exitosamente');

      // Actualizar el estudio actual con los cambios
      if (this.currentStudy.value && this.currentStudy.value.id === studyId) {
        this.setCurrentStudy({
          ...this.currentStudy.value,
          ...data
        });
      }
    } catch (error) {
      console.error('StudyService: Error actualizando estudio:', error);
      throw error;
    }
  }

  // Guardar una respuesta
  saveResponse(response: StudyResponse): void {
    if (!this.isBrowser) return;
    const currentResponses = this.responses.value;
    currentResponses.push(response);
    this.responses.next(currentResponses);
    this.saveToLocalStorage();
  }

  // Obtener todas las respuestas
  getResponses(): Observable<StudyResponse[]> {
    if (!this.isBrowser) {
      return of([]);
    }
    return this.responses.asObservable();
  }

  // Obtener respuestas por sección
  getResponsesBySection(sectionId: string): StudyResponse[] {
    if (!this.isBrowser) {
      return [];
    }
    return this.responses.value.filter(r => r.id === sectionId);
  }

  // Persistencia en localStorage
  private saveToLocalStorage(): void {
    if (this.isBrowser) {
      const data = {
        study: this.currentStudy.value,
        responses: this.responses.value
      };
      localStorage.setItem('study_data', JSON.stringify(data));
    }
  }

  private loadFromLocalStorage(): void {
    if (this.isBrowser) {
      const data = localStorage.getItem('study_data');
      if (data) {
        const parsed = JSON.parse(data);
        this.currentStudy.next(parsed.study);
        this.responses.next(parsed.responses);
      }
    }
  }

  // Limpiar datos del estudio actual
  clearStudyData(): void {
    if (!this.isBrowser) return;
    this.currentStudy.next(null);
    this.responses.next([]);
    localStorage.removeItem('study_data');
  }

  // Eliminar un estudio
  deleteStudy(studyId: string): Promise<void> {
    if (!this.isBrowser) {
      return Promise.resolve();
    }
    const studyRef = doc(this.firestore, this.collectionName, studyId);
    return deleteDoc(studyRef);
  }

  // Publicar un estudio y generar URL pública
  async publishStudy(studyId: string): Promise<void> {
    if (!this.isBrowser) return;
    const studyRef = doc(this.firestore, this.collectionName, studyId);
    const publicUrl = `${environment.baseUrl}/study-public/${studyId}`;

    await updateDoc(studyRef, {
      status: 'published',
      publicUrl: publicUrl,
      publishedAt: new Date(),
      updatedAt: new Date()
    });
  }
}
