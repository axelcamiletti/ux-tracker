import { Injectable, inject, Injector, PLATFORM_ID, Inject } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { Firestore, collection, addDoc, getDocs, query, orderBy, deleteDoc, doc, setDoc } from '@angular/fire/firestore';
import { Storage, ref, uploadBytes, getDownloadURL } from '@angular/fire/storage';
import { Project } from '../models/project.model';
import { Observable, from, map, forkJoin, switchMap, of } from 'rxjs';
import { StudyService } from '../../study/services/study.service';
import { environment } from '../../../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class ProjectService {
  private readonly collectionName = 'projects';
  private firestore = inject(Firestore);
  private studyService = inject(StudyService);
  private storage = inject(Storage);
  private isBrowser: boolean;
  private isDevMode = !environment.production;
  // Almacenamiento en memoria para modo de desarrollo
  private localImageStorage: Map<string, string> = new Map();

  constructor(@Inject(PLATFORM_ID) platformId: Object) {
    this.isBrowser = isPlatformBrowser(platformId);
  }

  // Obtener todos los proyectos
  getProjects(): Observable<Project[]> {
    if (!this.isBrowser) {
      return of([]);
    }

    const projectsRef = collection(this.firestore, this.collectionName);
    const q = query(projectsRef, orderBy('createdAt', 'desc'));

    return from(getDocs(q)).pipe(
      map(snapshot => {
        return snapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        } as Project));
      }),
      switchMap(projects => {
        // Para cada proyecto, obtener sus estudios
        const projectObservables = projects.map(project =>
          this.studyService.getStudiesByProjectId(project.id).pipe(
            map(studies => ({
              ...project,
              studies
            }))
          )
        );
        return forkJoin(projectObservables);
      })
    );
  }

  // Crear un nuevo proyecto
  async createProject(project: Omit<Project, 'id'>): Promise<string> {
    if (!this.isBrowser) {
      return Promise.resolve('');
    }
    const projectsRef = collection(this.firestore, this.collectionName);
    const newProjectRef = doc(projectsRef);
    await setDoc(newProjectRef, project);
    return newProjectRef.id;
  }

  // Subir imagen de un proyecto
  async uploadProjectImage(file: File, path: string): Promise<string> {
    if (!this.isBrowser) {
      return Promise.resolve('');
    }

    // Si estamos en modo desarrollo, usar almacenamiento local
    if (this.isDevMode) {
      console.log('Usando modo desarrollo para almacenamiento de imágenes');
      return new Promise((resolve) => {
        const reader = new FileReader();
        reader.onload = () => {
          const dataUrl = reader.result as string;
          this.localImageStorage.set(path, dataUrl);
          resolve(dataUrl);
        };
        reader.readAsDataURL(file);
      });
    }

    // Si no estamos en modo desarrollo, intentar subir a Firebase
    try {
      const storageRef = ref(this.storage, path);
      const metadata = {
        contentType: file.type,
        customMetadata: {
          'origin': window.location.origin
        }
      };
      const snapshot = await uploadBytes(storageRef, file, metadata);
      return await getDownloadURL(snapshot.ref);
    } catch (error) {
      console.error('Error al subir la imagen:', error);
      // Si falla la subida a Firebase, caer en modo local como respaldo
      console.log('Fallback: usando almacenamiento local para la imagen');
      return new Promise((resolve) => {
        const reader = new FileReader();
        reader.onload = () => {
          const dataUrl = reader.result as string;
          this.localImageStorage.set(path, dataUrl);
          resolve(dataUrl);
        };
        reader.readAsDataURL(file);
      });
    }
  }

  // Eliminar un proyecto
  async deleteProject(projectId: string): Promise<void> {
    if (!this.isBrowser) {
      return Promise.resolve();
    }
    const projectRef = doc(this.firestore, this.collectionName, projectId);
    await deleteDoc(projectRef);
  }

  // Actualizar un proyecto existente
  async updateProject(projectId: string, updates: Partial<Omit<Project, 'id'>>): Promise<void> {
    if (!this.isBrowser) {
      return Promise.resolve();
    }
    const projectRef = doc(this.firestore, this.collectionName, projectId);
    await setDoc(projectRef, updates, { merge: true });
  }
}
