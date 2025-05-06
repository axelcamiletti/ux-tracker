import { HttpClient, HttpErrorResponse, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { catchError, Observable, throwError, map, from, switchMap, of } from 'rxjs';
import { environment } from '../../../../environments/environment';
import { FigmaUrl, PrototypeTestSection } from '../models/section.model';
import { FigmaNode, FigmaNodeType } from '../models/figma-node.model';
import { Study } from '../models/study.model';

@Injectable({
  providedIn: 'root',
})
export class StudyPrototypeService {
  private apiUrl = environment.figma.apiUrl;
  private accessToken = environment.figma.accessToken;
  private urlRegex = /^https:\/\/www\.figma\.com\/(proto|file)\/([a-zA-Z0-9]+)\/([^?]+)\?.*(?:node-id=([^&]+)).*(?:starting-point-node-id=([^&]+))?/;

  constructor(
    private http: HttpClient
  ) {}

  private getHeaders(): HttpHeaders {
    return new HttpHeaders().set('X-Figma-Token', this.accessToken);
  }

  getFigmaFile(fileId: string): Observable<any> {
    const headers = this.getHeaders();
    const url = `${this.apiUrl}/files/${fileId}`;
    return this.http.get<any>(url, { headers }).pipe(
      catchError(this.handleError)
    );
  }

  getFigmaImages(fileId: string, nodeIds: string[]): Observable<any> {
    const headers = this.getHeaders();
    const ids = nodeIds.join(',');
    const url = `${this.apiUrl}/images/${fileId}?ids=${ids}&format=png`;
    return this.http.get<any>(url, { headers }).pipe(
      catchError(this.handleError)
    );
  }

  extractNodesAsImages(figmaUrl: FigmaUrl): Observable<{ nodes: FigmaNode[]}> {
    return this.getFigmaFile(figmaUrl.fileKey).pipe(
      switchMap((fileResponse) => {
        const pages = fileResponse.document.children;
        const allNodes: any[] = [];

        // Encontrar todos los nodes de primer nivel en todas las páginas
        for (const page of pages) {
          const topLevelNodes = this.findTopLevelNodes(page);
          allNodes.push(...topLevelNodes);
        }

        const nodeIds = allNodes.map(node => node.id);

        // Si no hay nodes, devolver un resultado vacío
        if (nodeIds.length === 0) {
          return of({ nodes: [] });
        }

        // Obtener las imágenes para todos los nodes
        return this.getFigmaImages(figmaUrl.fileKey, nodeIds).pipe(
          map((imageResponse) => {
            // Preparar la información de todos los nodes como FigmaNode completos
            const nodesData = allNodes.map(node => ({
              id: node.id,
              name: node.name,
              imageUrl: imageResponse.images[node.id],
              type: node.type as FigmaNodeType, // Añadimos el tipo del nodo
            }));

            return {
              nodes: nodesData
            };
          })
        );
      }),
      catchError((error) => {
        console.error('Error extracting nodes from Figma:', error);
        return throwError(() => new Error('Error accessing Figma API'));
      })
    );
  }

  private findTopLevelNodes(node: any): any[] {
    let nodes: any[] = [];

    if (node.type === 'DOCUMENT' || node.type === 'CANVAS') {
      for (const child of node.children || []) {
        if (child.type === 'FRAME') {
          nodes.push(child);
        }
      }
    }

    return nodes;
  }

  processUrl(url: string): { figmaUrl: FigmaUrl | null; figmaFileName: string; embedUrl: string | null; importEnabled: boolean; } {
    try {
      const match = url.match(this.urlRegex);

      if (match) {
        const figmaUrl: FigmaUrl = {
          fileType: match[1],
          fileKey: match[2],
          fileName: decodeURIComponent(match[3]),
          nodeId: match[4],
          startingNodeId: match[5]
        };

        const figmaFileName = figmaUrl.fileName.replace(/-/g, ' ');
        const embedUrl = this.generateEmbedUrl(figmaUrl);

        return {
          figmaUrl,
          figmaFileName,
          embedUrl,
          importEnabled: true
        };
      } else {
        return {
          figmaUrl: null,
          figmaFileName: '',
          embedUrl: null,
          importEnabled: false
        };
      }
    } catch (error) {
      console.error('Error procesando URL de Figma:', error);
      return {
        figmaUrl: null,
        figmaFileName: '',
        embedUrl: null,
        importEnabled: false
      };
    }
  }

  generateEmbedUrl(figmaUrl: FigmaUrl): string {
    const startNodeId = figmaUrl.startingNodeId || figmaUrl.nodeId;
    return `https://embed.figma.com/${figmaUrl.fileType}/${figmaUrl.fileKey}/${figmaUrl.fileName}?node-id=${startNodeId}&embed-host=share&footer=false&viewport-controls=false&allow-external-events=true&client-id=fV57d1E9E5FCZ1d1hKVS3e`;
  }

  private handleError(error: HttpErrorResponse) {
    console.error('Error in Figma API:', error);
    return throwError(() => error);
  }

  getPrototypeImages(study: Study, section: PrototypeTestSection): Observable<{ nodes: FigmaNode[] }> {
    // Si ya existen nodes en la sección, retornarlos sin hacer peticiones API
    if (section.data.nodes && section.data.nodes.length > 0) {
      return of({
        nodes: section.data.nodes
      });
    }

    // Si no hay nodes guardados pero sí hay una URL, extraer las imágenes de Figma
    if (section.data.originalUrl) {
      const result = this.processUrl(section.data.originalUrl);
      if (result.figmaUrl) {
        return this.extractNodesAsImages(result.figmaUrl);
      }
    }

    // Si no hay información suficiente, devolver un resultado vacío
    return of({
      nodes: []
    });
  }
}
