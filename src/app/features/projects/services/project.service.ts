import { Injectable, inject, PLATFORM_ID, Inject } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { Firestore, collection, addDoc, getDocs, query, orderBy, deleteDoc, doc, setDoc } from '@angular/fire/firestore';
import { Storage, ref, uploadBytes, getDownloadURL } from '@angular/fire/storage';
import { Project } from '../models/project.model';
import { Observable, from, map, forkJoin, switchMap, of } from 'rxjs';
import { StudyService } from '../../study/services/study.service';
import { environment } from '../../../../environments/environment';
import { signal, computed } from '@angular/core';

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
  
  // State management with signals
  private _projects = signal<Project[]>([]);
  private _loading = signal<boolean>(false);
  private _error = signal<string | null>(null);
  
  // Public readonly state
  projects = this._projects.asReadonly();
  loading = this._loading.asReadonly();
  error = this._error.asReadonly();
  
  // Computed properties
  hasProjects = computed(() => this._projects().length > 0);
  projectCount = computed(() => this._projects().length);
  
  // Local storage for development mode
  private localImageStorage: Map<string, string> = new Map();

  constructor(@Inject(PLATFORM_ID) platformId: Object) {
    this.isBrowser = isPlatformBrowser(platformId);
  }

  // Load all projects
  loadProjects(): void {
    if (!this.isBrowser) {
      this._projects.set([]);
      return;
    }

    this._loading.set(true);
    this._error.set(null);
    
    const projectsRef = collection(this.firestore, this.collectionName);
    const q = query(projectsRef, orderBy('createdAt', 'desc'));

    from(getDocs(q)).pipe(
      map(snapshot => {
        return snapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        } as Project));
      }),
      switchMap(projects => {
        // For each project, get its studies
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
    ).subscribe({
      next: (projects) => {
        this._projects.set(projects);
        this._loading.set(false);
      },
      error: (error) => {
        console.error('Error loading projects:', error);
        this._error.set('Failed to load projects');
        this._loading.set(false);
      }
    });
  }

  // Get projects as observable (for backward compatibility)
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
        // For each project, get its studies
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

  // Get a single project by ID
  getProjectById(projectId: string): Project | null {
    return this._projects().find(p => p.id === projectId) || null;
  }

  // Create a new project
  async createProject(project: Omit<Project, 'id'>): Promise<string> {
    if (!this.isBrowser) {
      return Promise.resolve('');
    }
    
    try {
      const projectsRef = collection(this.firestore, this.collectionName);
      const newProjectRef = doc(projectsRef);
      await setDoc(newProjectRef, project);
      this.loadProjects(); // Refresh projects list
      return newProjectRef.id;
    } catch (error) {
      console.error('Error creating project:', error);
      this._error.set('Failed to create project');
      return '';
    }
  }

  // Upload project image
  async uploadProjectImage(file: File, path: string): Promise<string> {
    if (!this.isBrowser) {
      return Promise.resolve('');
    }

    // If in development mode, use local storage
    if (this.isDevMode) {
      console.log('Using development mode for image storage');
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

    // If not in development mode, try to upload to Firebase
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
      console.error('Error uploading image:', error);
      this._error.set('Failed to upload image');
      // Fall back to local storage if Firebase upload fails
      console.log('Fallback: using local storage for image');
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

  // Delete a project
  async deleteProject(projectId: string): Promise<void> {
    if (!this.isBrowser) {
      return Promise.resolve();
    }
    
    try {
      const projectRef = doc(this.firestore, this.collectionName, projectId);
      await deleteDoc(projectRef);
      
      // Update local state
      this._projects.update(projects => projects.filter(p => p.id !== projectId));
    } catch (error) {
      console.error('Error deleting project:', error);
      this._error.set('Failed to delete project');
    }
  }

  // Update an existing project
  async updateProject(projectId: string, updates: Partial<Omit<Project, 'id'>>): Promise<void> {
    if (!this.isBrowser) {
      return Promise.resolve();
    }
    
    try {
      const projectRef = doc(this.firestore, this.collectionName, projectId);
      await setDoc(projectRef, updates, { merge: true });
      
      // Update local state
      this._projects.update(projects => {
        return projects.map(p => {
          if (p.id === projectId) {
            return { ...p, ...updates };
          }
          return p;
        });
      });
    } catch (error) {
      console.error('Error updating project:', error);
      this._error.set('Failed to update project');
    }
  }

  // Clear any error
  clearError(): void {
    this._error.set(null);
  }
}
