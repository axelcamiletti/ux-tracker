import { HttpClient, HttpHeaders, HttpErrorResponse } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { environment } from '../../../../environments/environment';
import { Observable, catchError, throwError } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class FigmaService {
  private apiUrl = 'https://api.figma.com/v1';
  private accessToken = 'figd_2TOANzgLNQWD_4iuBAtWxg0Q2zgG-QcSmppRv-YY';

  constructor(private http: HttpClient) {}

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
}
