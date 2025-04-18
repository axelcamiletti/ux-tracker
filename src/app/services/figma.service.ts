import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';


@Injectable({
  providedIn: 'root'
})
export class FigmaService {

  private accessToken = 'figd_nDUXhZVBXANH-PcJLFD0YNRM3rsSerxDvA3sLx-v'; // tu token personal
  private apiUrl = 'https://api.figma.com/v1';

  constructor(private http: HttpClient) {}

  // Paso 1: Obtener todos los nodos del archivo
  getFile(fileId: string) {
    const headers = new HttpHeaders().set('X-Figma-Token', this.accessToken);
    const url = `${this.apiUrl}/files/${fileId}`;
    return this.http.get<any>(url, { headers });
  }

  // Paso 2: Obtener imágenes de nodos específicos
  getImages(fileId: string, nodeIds: string[]) {
    const headers = new HttpHeaders().set('X-Figma-Token', this.accessToken);
    const ids = nodeIds.join(',');
    const url = `${this.apiUrl}/images/${fileId}?ids=${ids}&format=png`; // PNG o JPG

    return this.http.get<any>(url, { headers });
  }

}
