import { CommonModule } from '@angular/common';
import { Component, Input, OnChanges, OnInit } from '@angular/core';
import { Section, PrototypeTestSection } from '../../../models/section.model';
import { PrototypeTestResponse, StudyResponse } from '../../../models/study-response.model';
import { MatIconModule } from '@angular/material/icon';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatButtonModule } from '@angular/material/button';
import { MatDialog } from '@angular/material/dialog';
import { ScreenDetailsDialogComponent } from '../../../dialogs/screen-details-dialog/screen-details-dialog.component';
import { StudyPrototypeService } from '../../../services/study-prototype.service';
import { StudyService } from '../../../services/study.service';
import { firstValueFrom } from 'rxjs';
import { FigmaNode, FigmaNodeAnalytics, FigmaSessionAnalytics } from '../../../models/figma-node.model';
import { FigmaAnalyticsService } from '../../../services/figma-analytics.service';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { MatCardModule } from '@angular/material/card';
import { MatTabsModule } from '@angular/material/tabs';
import { MatTableModule } from '@angular/material/table';
import { MatChipsModule } from '@angular/material/chips';

// Interface to combine node and analytics data
interface MissionScreenData extends FigmaNode {
  totalParticipants?: number;
  avgDuration?: number;
}

@Component({
  selector: 'app-prototype-test-result',
  imports: [
    CommonModule,
    MatIconModule,
    MatTooltipModule,
    MatButtonModule,
    MatProgressBarModule,
    MatCardModule,
    MatTabsModule,
    MatTableModule,
    MatChipsModule
  ],
  templateUrl: './prototype-test-result.component.html',
  styleUrl: './prototype-test-result.component.css'
})
export class PrototypeTestResultComponent {
  @Input() section!: Section;
  @Input() title: string = '';
  @Input() participants: StudyResponse[] = [];

  missionScreens: MissionScreenData[] = [];
  isLoading: boolean = true;
  errorMessage: string | null = null;

  // Analytics data
  figmaEvents: any[] = [];
  nodeAnalytics: { [nodeId: string]: FigmaNodeAnalytics } = {};
  sessionAnalytics: FigmaSessionAnalytics[] = [];
  painPoints: Array<{nodeId: string, issues: string[], score: number}> = [];
  navigationPaths: any = { paths: [], common: [] };

  // Aggregate metrics
  successRate: number = 0;
  dropoffRate: number = 0;
  misclickRate: number = 0;
  totalDropoffs: number = 0;
  avgCompletionTime: number = 0;
  fastestCompletionTime: number = 0;
  slowestCompletionTime: number = 0;

  // Tab counters
  successCount: number = 0;
  unfinishedCount: number = 0;

  // Current tab state
  activeTab: 'success' | 'unfinished' = 'success';

  // For heatmap data
  heatmapData: { [nodeId: string]: any } = {};
Object: any;

  constructor(
    private dialog: MatDialog,
    private studyPrototypeService: StudyPrototypeService,
    private studyService: StudyService,
    private figmaAnalyticsService: FigmaAnalyticsService
  ) {}

  ngOnInit() {
    this.extractMissionScreens();
    this.processParticipantData();

    // Mostrar todos los eventos de Figma en la consola al inicializar el componente
    this.logPrototypeEvents();
  }

  async extractMissionScreens() {
    const prototypeSection = this.section as PrototypeTestSection;
    this.isLoading = true;

    try {
      // Obtener el estudio actual desde el servicio
      const study = await firstValueFrom(this.studyService.getCurrentStudy());

      if (!study) {
        this.errorMessage = 'No se pudo obtener información del estudio actual';
        this.isLoading = false;
        return;
      }

      // Llamar al servicio para obtener las imágenes del prototipo
      this.studyPrototypeService.getPrototypeImages(study, prototypeSection)
        .subscribe({
          next: (result) => {
            console.log('Imágenes del prototipo:', result);
            this.isLoading = false;

            if (result.nodes && result.nodes.length > 0) {
              // Almacenar los nodos y añadir datos de analytics
              this.missionScreens = result.nodes.map(node => {
                // Crear un objeto MissionScreenData con los datos básicos del nodo
                const screenData: MissionScreenData = { ...node };

                // Calcular datos de analytics para este nodo basado en los participantes
                const nodeAnalytics = this.calculateNodeAnalytics(node.id);

                // Añadir datos de analytics
                screenData.totalParticipants = nodeAnalytics.totalParticipants;
                screenData.avgDuration = nodeAnalytics.avgDuration;

                return screenData;
              });
            } else {
              this.errorMessage = 'No se encontraron pantallas en este prototipo';
            }
          },
          error: (error) => {
            console.error('Error al obtener imágenes del prototipo:', error);
            this.isLoading = false;
            this.errorMessage = 'Error al cargar las pantallas del prototipo';
          }
        });
    } catch (error) {
      console.error('Error al obtener el estudio actual:', error);
      this.isLoading = false;
      this.errorMessage = 'Error al obtener información del estudio';
    }

    console.log('Pantallas de la misión:', this.missionScreens);
  }

  processParticipantData() {
    if (!this.participants || this.participants.length === 0) {
      return;
    }

    const prototypeSection = this.section as PrototypeTestSection;
    this.figmaEvents = [];

    // Extract all Figma events from participants
    this.participants.forEach(participant => {
      const sectionResponse = participant.responses.find(
        response => response.sectionId === this.section.id
      ) as PrototypeTestResponse | undefined;

      if (sectionResponse && sectionResponse.type === 'prototype-test') {
        const events = sectionResponse.response.figmaEventLog || [];

        // Process raw events
        const processedEvents = this.figmaAnalyticsService.processRawEvents(events);

        // Add participant ID to each event
        const eventsWithParticipant = processedEvents.map(event => ({
          ...event,
          participantId: participant.id
        }));

        this.figmaEvents.push(...eventsWithParticipant);

        // Create session analytics for this participant
        const targetNodeId = prototypeSection.data.selectedTargetNodeId; // Using the correct property path
        const sessionAnalytic = this.figmaAnalyticsService.createSessionAnalytics(
          participant.id,
          eventsWithParticipant,
          targetNodeId
        );

        this.sessionAnalytics.push(sessionAnalytic);
      }
    });

    // Calculate analytics for each screen
    this.calculateScreenAnalytics();

    // Calculate navigation paths
    this.navigationPaths = this.figmaAnalyticsService.analyzeNavigationPaths(this.figmaEvents);

    // Calculate pain points
    this.painPoints = this.figmaAnalyticsService.identifyPainPoints(this.nodeAnalytics);

    // Calculate aggregate metrics
    this.calculateAggregateMetrics();
  }

  calculateScreenAnalytics() {
    // Make sure mission screens are loaded
    if (this.missionScreens.length === 0) {
      return;
    }

    // Calculate analytics for each screen
    this.missionScreens.forEach(screen => {
      const analytics = this.figmaAnalyticsService.calculateNodeMetrics(screen.id, this.figmaEvents);
      this.nodeAnalytics[screen.id] = analytics;

      // Update screen data with analytics
      screen.totalParticipants = analytics.totalParticipants;
      screen.avgDuration = analytics.avgDuration;

      // Generate heatmap data
      this.heatmapData[screen.id] = this.figmaAnalyticsService.generateHeatmapData(
        screen.id,
        this.figmaEvents
      );
    });
  }

  calculateAggregateMetrics() {
    if (this.sessionAnalytics.length === 0) {
      return;
    }

    // Calculate success rate
    const completedSessions = this.sessionAnalytics.filter(session => session.missionCompleted);
    this.successCount = completedSessions.length;
    this.successRate = this.sessionAnalytics.length > 0
      ? (completedSessions.length / this.sessionAnalytics.length) * 100
      : 0;

    // Calculate drop-off rate and count
    this.unfinishedCount = this.sessionAnalytics.length - this.successCount;
    this.dropoffRate = this.sessionAnalytics.length > 0
      ? (this.unfinishedCount / this.sessionAnalytics.length) * 100
      : 0;

    // Calculate total dropoffs
    this.totalDropoffs = this.unfinishedCount;

    // Calculate average completion time (only for completed sessions)
    if (completedSessions.length > 0) {
      const totalCompletionTime = completedSessions.reduce(
        (total, session) => total + (session.totalDuration || 0),
        0
      );
      this.avgCompletionTime = totalCompletionTime / completedSessions.length;

      // Calculate fastest and slowest completion times
      this.fastestCompletionTime = completedSessions.reduce(
        (min, session) => Math.min(min, session.totalDuration || Number.MAX_VALUE),
        Number.MAX_VALUE
      );

      if (this.fastestCompletionTime === Number.MAX_VALUE) {
        this.fastestCompletionTime = 0;
      }

      this.slowestCompletionTime = completedSessions.reduce(
        (max, session) => Math.max(max, session.totalDuration || 0),
        0
      );
    }

    // Calculate misclick rate from all nodes
    let totalClicks = 0;
    let totalMisclicks = 0;

    Object.values(this.nodeAnalytics).forEach(analytics => {
      totalClicks += analytics.clickCount;
      totalMisclicks += analytics.misclickCount;
    });

    this.misclickRate = totalClicks + totalMisclicks > 0
      ? (totalMisclicks / (totalClicks + totalMisclicks)) * 100
      : 0;
  }

  setActiveTab(tab: 'success' | 'unfinished') {
    this.activeTab = tab;
  }

  formatTime(ms: number): string {
    const seconds = Math.floor(ms / 1000);
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;

    if (minutes > 0) {
      return `${minutes}m ${remainingSeconds}s`;
    }
    return `${seconds}s`;
  }

  getFastestCompletionTime(): string {
    return this.formatTime(this.fastestCompletionTime);
  }

  getSlowestCompletionTime(): string {
    return this.formatTime(this.slowestCompletionTime);
  }

  calculateNodeAnalytics(nodeId: string): { totalParticipants: number, avgDuration: number } {
    let participantCount = 0;
    let totalDuration = 0;

    // Iterar sobre todos los participantes
    this.participants.forEach(participant => {
      // Encontrar respuesta para esta sección
      const sectionResponse = participant.responses.find(
        response => response.sectionId === this.section.id
      ) as PrototypeTestResponse | undefined;

      if (!sectionResponse || sectionResponse.type !== 'prototype-test') {
        return;
      }

      const events = sectionResponse.response.figmaEventLog || [];

      // Encontrar eventos relacionados con este nodo
      const nodeEvents = events.filter(event =>
        event['node_id'] === nodeId ||
        (event.type === 'NAVIGATE' && event['node_id'] === nodeId)
      );

      if (nodeEvents.length > 0) {
        participantCount++;

        // Si hay analytics en la respuesta, usar esos datos
        if (sectionResponse.response.analytics?.avgTimePerNode?.[nodeId]) {
          totalDuration += sectionResponse.response.analytics.avgTimePerNode[nodeId];
        } else {
          // Si no hay datos procesados, añadir un valor por defecto
          totalDuration += 5; // 5 segundos por defecto
        }
      }
    });

    // Calcular promedio de duración
    const avgDuration = participantCount > 0 ? Math.round(totalDuration / participantCount) : 0;

    return {
      totalParticipants: participantCount,
      avgDuration: avgDuration
    };
  }

  openScreenDetailsDialog(nodeId: string) {
    // Buscamos el nodo seleccionado en nuestro array de nodos
    console.log(this.missionScreens);

    const selectedNode = this.missionScreens.find(node => node.id === nodeId);

    if (!selectedNode) {
      console.error('Nodo no encontrado:', nodeId);
      return;
    }

    this.dialog.open(ScreenDetailsDialogComponent, {
      width: '100%',
      maxWidth: '90vw',
      data: {
        screen: selectedNode,
        section: this.section,
        participants: this.participants
      }
    });
  }

  logPrototypeEvents() {
    if (!this.participants || this.participants.length === 0) {
      console.log('No hay participantes para mostrar eventos');
      return;
    }

    console.log('=== EVENTOS DE TODOS LOS PARTICIPANTES EN EL PROTOTIPO ===');

    this.participants.forEach((participant, participantIndex) => {
      console.log(`\n--- Participante ${participantIndex + 1} (ID: ${participant.id}) ---`);

      // Encontrar respuesta para esta sección
      const sectionResponse = participant.responses.find(
        response => response.sectionId === this.section.id
      ) as PrototypeTestResponse | undefined;

      if (!sectionResponse) {
        console.log(`Este participante no tiene respuesta para la sección ${this.section.id}`);
        return;
      }

      if (sectionResponse.type !== 'prototype-test') {
        console.log(`La respuesta del participante no es de tipo prototype-test, es: ${sectionResponse.type}`);
        return;
      }

      const events = sectionResponse.response.figmaEventLog;

      if (!events || events.length === 0) {
        console.log('No hay eventos registrados para este participante');
        return;
      }

      console.log(`Total de eventos: ${events.length}`);
      console.table(events);
    });

    console.log('=== FIN DE EVENTOS ===');
  }

  /**
   * Get helper methods for display purposes
   */
  getScreenName(nodeId: string): string {
    // Find the screen with this node ID
    const screen = this.missionScreens.find(s => s.id === nodeId);
    return screen ? screen.name : nodeId.split(':').pop() || 'Unknown';
  }

  /**
   * Gets the top N nodes by time spent from a node time spent object
   */
  getTopTimeSpentNodes(nodeTimeSpent: {[nodeId: string]: number}, limit: number): Array<{nodeId: string, time: number}> {
    // Convert object to array of entries
    const entries = Object.entries(nodeTimeSpent).map(([nodeId, time]) => ({
      nodeId,
      time
    }));

    // Sort by time spent (descending)
    const sorted = entries.sort((a, b) => b.time - a.time);

    // Return top N entries
    return sorted.slice(0, limit);
  }

  // Adding methods to filter the sessions
  getCompletedSessions(): FigmaSessionAnalytics[] {
    return this.sessionAnalytics.filter(s => s.missionCompleted);
  }

  getUnfinishedSessions(): FigmaSessionAnalytics[] {
    return this.sessionAnalytics.filter(s => !s.missionCompleted);
  }

  // Helper methods for templates
  hasNodeTimeSpent(session: FigmaSessionAnalytics): boolean {
    return !!session.nodeTimeSpent && Object.keys(session.nodeTimeSpent).length > 0;
  }
}
