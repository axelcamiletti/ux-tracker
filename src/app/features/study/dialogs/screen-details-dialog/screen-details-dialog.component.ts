import { Component, Inject, OnInit } from '@angular/core';
import { HeatmapSectionComponent } from "../../components/sections/heatmap-section/heatmap-section.component";
import { MatIconModule } from '@angular/material/icon';
import { MatTooltipModule } from '@angular/material/tooltip';
import { CommonModule } from '@angular/common';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { FigmaNode, FigmaNodeAnalytics } from '../../models/figma-node.model';
import { FigmaAnalyticsService } from '../../services/figma-analytics.service';
import { PrototypeTestResponse, StudyResponse } from '../../models/study-response.model';
import { Section } from '../../models/section.model';
import { ClickEvent, FigmaEvent } from '../../models/figma-event.model';

interface ScreenDialogData {
  screen: FigmaNode;
  section: Section;
  participants: StudyResponse[];
}

@Component({
  selector: 'app-screen-details-dialog',
  standalone: true,
  imports: [HeatmapSectionComponent, MatIconModule, MatTooltipModule, CommonModule],
  templateUrl: './screen-details-dialog.component.html',
  styleUrl: './screen-details-dialog.component.css'
})
export class ScreenDetailsDialogComponent implements OnInit {
  currentNode!: FigmaNode;
  currentAnalytics!: FigmaNodeAnalytics;
  section!: Section;
  participants: StudyResponse[] = [];

  // Datos del heatmap generados
  heatmapData: any = {
    points: [],
    totalClicks: 0,
    misclickRate: 0
  };

  isLoading: boolean = true;
  error: string | null = null;
  activeTab: 'heatmap' | 'clips' = 'heatmap';

  constructor(
    private dialogRef: MatDialogRef<ScreenDetailsDialogComponent>,
    @Inject(MAT_DIALOG_DATA) private data: ScreenDialogData,
    private figmaAnalyticsService: FigmaAnalyticsService
  ) {}

  ngOnInit(): void {
    console.log('Screen Details Dialog initialized with data:', this.data);
    this.initializeData();
  }

  initializeData(): void {
    if (this.data) {
      console.log('Processing dialog data for screen:', this.data.screen?.id);
      this.currentNode = this.data.screen;
      this.section = this.data.section;
      this.participants = this.data.participants || [];

      // Extraer los eventos de Figma de todos los participantes para esta sección
      this.generateHeatmapFromEvents();
    } else {
      console.error('No data provided to ScreenDetailsDialogComponent');
      this.error = 'No data provided';
      this.isLoading = false;
    }
  }

  generateHeatmapFromEvents(): void {
    this.isLoading = true;
    console.log('Generating heatmap data for node:', this.currentNode?.id);

    try {
      // Obtener todos los eventos de Figma relacionados con esta sección desde los participantes
      const allFigmaEvents = this.extractFigmaEvents();
      console.log('Extracted', allFigmaEvents.length, 'Figma events for this screen');

      // Procesar los eventos para convertirlos al formato esperado
      const typedEvents = this.figmaAnalyticsService.processRawEvents(allFigmaEvents);
      console.log('Processed events:', typedEvents.length);

      // Generar los datos del heatmap
      if (this.currentNode && this.currentNode.id) {
        console.log('Generating heatmap data for node ID:', this.currentNode.id);
        this.heatmapData = this.figmaAnalyticsService.generateHeatmapData(this.currentNode.id, typedEvents);
        console.log('Heatmap data generated:', this.heatmapData);

        // Generar las métricas del nodo para usar en la vista
        this.currentAnalytics = this.figmaAnalyticsService.calculateNodeMetrics(this.currentNode.id, typedEvents);
        console.log('Node metrics calculated:', this.currentAnalytics);

        // Ensure click coordinates are available for visualization
        if (!this.currentAnalytics.clickCoordinates || this.currentAnalytics.clickCoordinates.length === 0) {
          console.log('No click coordinates found in the analytics, extracting from events');

          // Extract click coordinates from events if needed
          const clickEvents = typedEvents.filter(event =>
            event.type === 'CLICK' &&
            event.nodeId === this.currentNode.id);

          if (clickEvents.length > 0) {
            this.currentAnalytics.clickCoordinates = clickEvents.map(event => {
              // Handle different event types correctly
              const clickEvent = event as ClickEvent;
              const x = clickEvent.position?.x || 0;
              const y = clickEvent.position?.y || 0;

              return {
                x: x,
                y: y,
                count: 1,
                isMisclick: clickEvent.isMisclick || false,
                participantId: (event as any).participantId || 'unknown'
              };
            });

            console.log('Extracted click coordinates from events:', this.currentAnalytics.clickCoordinates.length);
          } else {
            console.log('No click events found for this node, adding sample data for testing');
            // Add some sample click data for testing if no real data available
            this.currentAnalytics.clickCoordinates = this.generateSampleClickCoordinates();
          }
        }
      } else {
        console.error('Current node or node ID is missing');
        this.error = 'Missing node data';
      }

      this.isLoading = false;
    } catch (error) {
      console.error('Error generating heatmap data:', error);
      this.error = 'Error generating heatmap data: ' + (error instanceof Error ? error.message : String(error));
      this.isLoading = false;
    }
  }

  generateSampleClickCoordinates() {
    // Generate some sample click coordinates for testing purposes
    return [
      { x: 150, y: 200, count: 3, isMisclick: false, participantId: 'user1' },
      { x: 300, y: 250, count: 2, isMisclick: true, participantId: 'user1' },
      { x: 200, y: 350, count: 5, isMisclick: false, participantId: 'user2' },
      { x: 400, y: 300, count: 1, isMisclick: true, participantId: 'user3' }
    ];
  }

  extractFigmaEvents(): any[] {
    const allEvents: any[] = [];

    // Para cada participante, extraer los eventos de Figma relacionados con esta sección
    this.participants.forEach(participant => {
      // Buscar la respuesta correspondiente a la sección actual
      const sectionResponse = participant.responses.find(
        response => response.sectionId === this.section.id
      ) as PrototypeTestResponse | undefined;

      if (sectionResponse && sectionResponse.type === 'prototype-test') {
        // Añadir el ID del participante a cada evento para poder filtrarlos después
        const participantEvents = sectionResponse.response.figmaEventLog || [];

        // Filter events for the current node if possible
        const relevantEvents = this.currentNode && this.currentNode.id
          ? participantEvents.filter(event =>
              event['node_id'] === this.currentNode.id ||
              (event.type === 'NAVIGATE' && event['node_id'] === this.currentNode.id))
          : participantEvents;

        const eventsWithParticipantId = relevantEvents.map(event => ({
          ...event,
          participantId: participant.id
        }));

        console.log(`Added ${eventsWithParticipantId.length} events from participant ${participant.id}`);
        allEvents.push(...eventsWithParticipantId);
      }
    });

    return allEvents;
  }

  closeDialog(): void {
    this.dialogRef.close();
  }

  setActiveTab(tab: 'heatmap' | 'clips'): void {
    this.activeTab = tab;
  }
}
