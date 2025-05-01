import { HttpClient, HttpErrorResponse, HttpHeaders } from '@angular/common/http';
import { StudyResponsesService } from './study-responses.service';
import { Injectable } from '@angular/core';
import { catchError, Observable, throwError } from 'rxjs';
import { environment } from '../../../../environments/environment';

@Injectable({
  providedIn: 'root',
})
export class StudyPrototypeService {

  private apiUrl = environment.figma.apiUrl;
  private accessToken = environment.figma.accessToken;

  constructor(
    private studyResponsesService: StudyResponsesService,
    private http: HttpClient
  ) {}

  private getHeaders(): HttpHeaders {
    return new HttpHeaders().set('X-Figma-Token', this.accessToken);
  }

  getFile(fileId: string): Observable<any> {
    const headers = this.getHeaders();
    const url = `${this.apiUrl}/files/${fileId}`;
    return this.http.get<any>(url, { headers }).pipe(
      catchError(this.handleError)
    );
  }

  getImages(fileId: string, nodeIds: string[]): Observable<any> {
    const headers = this.getHeaders();
    const ids = nodeIds.join(',');
    const url = `${this.apiUrl}/images/${fileId}?ids=${ids}&format=png`;
    return this.http.get<any>(url, { headers }).pipe(
      catchError(this.handleError)
    );
  }

  private handleError(error: HttpErrorResponse) {
    console.error('Error in Figma API:', error);
    return throwError(() => error);
  }

  async getFigmaEvent(event: any, responseId: string, sectionId: string): Promise<void> {
    const enrichedEvent = {
      ...event,
      timestamp: new Date(),
    };

    console.log('Registrando evento de Figma:', enrichedEvent);

    try {
      await this.studyResponsesService.updateSectionResponse(responseId, sectionId, {
        type: 'prototype-test',
        value: {
          figmaEventLog: [enrichedEvent],
        },
      });
    } catch (error) {
      console.error('Error saving Figma event:', error);
    }
  }
}
