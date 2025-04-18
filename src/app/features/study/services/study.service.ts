import { Injectable, PLATFORM_ID, Inject } from '@angular/core';
import { BehaviorSubject, Observable, from, map } from 'rxjs';
import { isPlatformBrowser } from '@angular/common';
import { Firestore, collection, addDoc, getDocs, query, where, doc, updateDoc, getDoc, deleteDoc } from '@angular/fire/firestore';
import { Study } from '../models/study.model';
import { StudyResponse } from '../models/study-response.model';
import { AngularFirestore } from '@angular/fire/compat/firestore';
import { environment } from '../../../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class StudyService {
  private currentStudy = new BehaviorSubject<Study | null>(null);
  private responses = new BehaviorSubject<StudyResponse[]>([]);
  private isBrowser: boolean;
  private readonly collectionName = 'studies';

  constructor(
    @Inject(PLATFORM_ID) platformId: Object,
    private firestore: Firestore,
    private angularFirestore: AngularFirestore
  ) {
    this.isBrowser = isPlatformBrowser(platformId);
    if (this.isBrowser) {
      this.loadFromLocalStorage();
    }
  }

  // Obtener el estudio actual
  getCurrentStudy(): Observable<Study | null> {
    return this.currentStudy.asObservable();
  }

  // Establecer el estudio actual
  setCurrentStudy(study: Study): void {
    this.currentStudy.next(study);
    if (this.isBrowser) {
      this.saveToLocalStorage();
    }
  }

  // Obtener un estudio por ID
  getStudyById(studyId: string): Observable<Study> {
    const studyRef = doc(this.firestore, this.collectionName, studyId);
    return from(getDoc(studyRef)).pipe(
      map(doc => ({
        id: doc.id,
        ...doc.data()
      } as Study))
    );
  }

  // Obtener todos los estudios de un proyecto
  getStudiesByProjectId(projectId: string): Observable<Study[]> {
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
    const studiesRef = collection(this.firestore, this.collectionName);
    const docRef = await addDoc(studiesRef, study);
    return docRef.id;
  }

  // Actualizar un estudio
  async updateStudy(studyId: string, data: Partial<Study>): Promise<void> {
    const studyRef = doc(this.firestore, this.collectionName, studyId);
    await updateDoc(studyRef, data);
  }

  // Guardar una respuesta
  saveResponse(response: StudyResponse): void {
    const currentResponses = this.responses.value;
    currentResponses.push(response);
    this.responses.next(currentResponses);
    if (this.isBrowser) {
      this.saveToLocalStorage();
    }
  }

  // Obtener todas las respuestas
  getResponses(): Observable<StudyResponse[]> {
    return this.responses.asObservable();
  }

  // Obtener respuestas por sección
  getResponsesBySection(sectionId: string): StudyResponse[] {
    return this.responses.value.filter(r => r.sectionId === sectionId);
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
    this.currentStudy.next(null);
    this.responses.next([]);
    if (this.isBrowser) {
      localStorage.removeItem('study_data');
    }
  }

  // Eliminar un estudio
  deleteStudy(studyId: string): Promise<void> {
    const studyRef = doc(this.firestore, this.collectionName, studyId);
    return deleteDoc(studyRef);
  }

  async publishStudy(studyId: string): Promise<void> {
    const publicUrl = `${environment.baseUrl}/study-public/${studyId}`;
    const studyRef = doc(this.firestore, this.collectionName, studyId);
    
    await updateDoc(studyRef, {
      status: 'published',
      publicUrl: publicUrl,
      updatedAt: new Date()
    });
  }
} 