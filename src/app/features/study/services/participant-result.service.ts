import { Injectable, inject } from '@angular/core';
import { Firestore, collection, addDoc, query, where, collectionData } from '@angular/fire/firestore';
import { Observable } from 'rxjs';
import { Participant } from '../models/participant.model';

@Injectable({
  providedIn: 'root'
})
export class ParticipantResultService {
  private readonly COLLECTION = 'participant-results';
  private firestore = inject(Firestore);

  async saveResult(result: Omit<Participant, 'id'>): Promise<string> {
    const collectionRef = collection(this.firestore, this.COLLECTION);
    const docRef = await addDoc(collectionRef, result);
    return docRef.id;
  }

  getResultsByStudyId(studyId: string): Observable<Participant[]> {
    const collectionRef = collection(this.firestore, this.COLLECTION);
    const q = query(collectionRef, where('studyId', '==', studyId));
    return collectionData(q) as Observable<Participant[]>;
  }

  getResultsByParticipantId(participantId: string): Observable<Participant[]> {
    const collectionRef = collection(this.firestore, this.COLLECTION);
    const q = query(collectionRef, where('participantId', '==', participantId));
    return collectionData(q) as Observable<Participant[]>;
  }
}
