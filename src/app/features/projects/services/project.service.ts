import { Injectable, inject, Injector } from '@angular/core';
import { Firestore, collection, addDoc, getDocs, query, orderBy, deleteDoc, doc } from '@angular/fire/firestore';
import { Project } from '../models/project.model';
import { Observable, from, map, forkJoin, switchMap } from 'rxjs';
import { StudyService } from '../../study/services/study.service';

@Injectable({
  providedIn: 'root'
})
export class ProjectService {
  private readonly collectionName = 'projects';
  private firestore = inject(Firestore);
  private injector = inject(Injector);
  private studyService = inject(StudyService);

  // Obtener todos los proyectos
  getProjects(): Observable<Project[]> {
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
  createProject(project: Omit<Project, 'id'>): Promise<string> {
    const projectsRef = collection(this.firestore, this.collectionName);
    return addDoc(projectsRef, project).then(docRef => docRef.id);
  }

  // Eliminar un proyecto
  deleteProject(projectId: string): Promise<void> {
    const projectRef = doc(this.firestore, this.collectionName, projectId);
    return deleteDoc(projectRef);
  }
} 