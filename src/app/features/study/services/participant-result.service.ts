import { Injectable } from '@angular/core';
import { AngularFirestore } from '@angular/fire/compat/firestore';
import { ParticipantResult } from '../models/participant-result.model';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class ParticipantResultService {
  private readonly COLLECTION = 'participant-results';

  constructor(private firestore: AngularFirestore) {}

  saveResult(result: Omit<ParticipantResult, 'id'>): Promise<string> {
    const id = this.firestore.createId();
    return this.firestore.collection(this.COLLECTION)
      .doc(id)
      .set({ ...result, id })
      .then(() => id);
  }

  getResultsByStudyId(studyId: string): Observable<ParticipantResult[]> {
    return this.firestore.collection<ParticipantResult>(this.COLLECTION, ref =>
      ref.where('studyId', '==', studyId)
    ).valueChanges();
  }

  getResultsByParticipantId(participantId: string): Observable<ParticipantResult[]> {
    return this.firestore.collection<ParticipantResult>(this.COLLECTION, ref =>
      ref.where('participantId', '==', participantId)
    ).valueChanges();
  }
} 