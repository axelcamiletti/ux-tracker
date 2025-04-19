import { Injectable } from '@angular/core';
import { Firestore, collection, addDoc, query, where, collectionData } from '@angular/fire/firestore';
import { ParticipantResult } from '../models/participant-result.model';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class ParticipantResultService {
  private readonly COLLECTION = 'participant-results';

  constructor(private firestore: Firestore) {}

  async saveResult(result: Omit<ParticipantResult, 'id'>): Promise<string> {
    const collectionRef = collection(this.firestore, this.COLLECTION);
    const docRef = await addDoc(collectionRef, result);
    return docRef.id;
  }

  getResultsByStudyId(studyId: string): Observable<ParticipantResult[]> {
    const collectionRef = collection(this.firestore, this.COLLECTION);
    const q = query(collectionRef, where('studyId', '==', studyId));
    return collectionData(q) as Observable<ParticipantResult[]>;
  }

  getResultsByParticipantId(participantId: string): Observable<ParticipantResult[]> {
    const collectionRef = collection(this.firestore, this.COLLECTION);
    const q = query(collectionRef, where('participantId', '==', participantId));
    return collectionData(q) as Observable<ParticipantResult[]>;
  }
}
