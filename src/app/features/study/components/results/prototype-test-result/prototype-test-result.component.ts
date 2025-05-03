import { CommonModule } from '@angular/common';
import { Component, Input, OnChanges, OnInit } from '@angular/core';
import { Section } from '../../../models/section.model';
import { PrototypeTestResponse, StudyResponse } from '../../../models/study-response.model';
import { MatIconModule } from '@angular/material/icon';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatButtonModule } from '@angular/material/button';
import { StudyService } from '../../../services/study.service';
import { Study } from '../../../models/study.model';

interface MissionScreen {
  id: string;
  title: string;
  image: string;
  participants?: number;
  avgDuration?: number;
}

@Component({
  selector: 'app-prototype-test-result',
  imports: [CommonModule, MatIconModule, MatTooltipModule, MatButtonModule],
  templateUrl: './prototype-test-result.component.html',
  styleUrl: './prototype-test-result.component.css'
})
export class PrototypeTestResultComponent implements OnChanges, OnInit {
  @Input() section!: Section;
  @Input() title: string = '';
  @Input() participants: StudyResponse[] = [];

  missionScreens: MissionScreen[] = [];
  isLoading: boolean = true;
  errorMessage: string | null = null;

  // Métricas de la misión
  successRate: number = 0;
  dropoffRate: number = 0;
  misclickRate: number = 68.9; // Valor por defecto, actualizar según cálculo real

  // Métrica adicional
  totalDropoffs: number = 0;

  // Contadores para las pestañas
  successCount: number = 0;
  unfinishedCount: number = 0;

  // Estado actual de la pestaña
  activeTab: 'success' | 'unfinished' = 'unfinished';

  constructor(private studyService: StudyService) {}

  ngOnInit() {
    console.log('PrototypeTestResultComponent initialized');
    this.loadStudyData();
    this.checkData();
    this.logPrototypeEvents();
    this.calculateTotalDropoffs();
  }

  ngOnChanges() {
    this.checkData();
  }

  loadStudyData() {
    this.studyService.getCurrentStudy().subscribe((study: Study | null) => {
      if (study && study.prototype && study.prototype.frames && study.prototype.frames.length > 0) {
        console.log('Found prototype frames in study:', study.prototype.frames.length);

        // Create mission screens from the prototype frames
        const prototypeScreens = study.prototype.frames.map(frame => ({
          id: frame.id,
          title: frame.name,
          image: frame.imageUrl,
          participants: 0, // Will be updated when processing participant data
          avgDuration: 0 // Default value for average duration
        }));

        // Merge with any existing screens or replace if none exist
        if (this.missionScreens.length === 0) {
          this.missionScreens = prototypeScreens;
        } else {
          // Merge by updating existing screens and adding new ones
          for (const protoScreen of prototypeScreens) {
            const existingScreen = this.missionScreens.find(screen => screen.id === protoScreen.id);
            if (existingScreen) {
              // Keep participant count if it exists
              protoScreen.participants = existingScreen.participants || 0;
              protoScreen.avgDuration = existingScreen.avgDuration || 0;
            }
            // Add if not already in the array
            if (!existingScreen) {
              this.missionScreens.push(protoScreen);
            }
          }
        }

        console.log('Updated mission screens from study prototype data:', this.missionScreens);
      } else {
        console.log('No prototype frames found in study or study is null');
      }
    });
  }

  checkData() {
    this.isLoading = true;
    this.errorMessage = null;

    if (!this.section) {
      console.warn('Section data is missing');
      this.errorMessage = 'Section data is missing. Please check if it was correctly passed to the component.';
    } else if (!this.participants || this.participants.length === 0) {
      console.warn('Participants data is missing or empty');
      this.errorMessage = 'No participant data available for this section.';
    } else {
      this.calculateSuccessRate();
      this.extractMissionScreens();
    }

    this.isLoading = false;
  }

  calculateSuccessRate(): number {
    if (!this.section || !this.participants || this.participants.length === 0) {
      this.successRate = 0;
      return 0;
    }

    // Cast section to PrototypeTestSection to access target node id
    const prototypeSection = this.section as any;
    const targetNodeId = prototypeSection.data?.selectedTargetNodeId;

    // If no target node is set, we can't calculate success
    if (!targetNodeId) {
      console.warn('No target node set for prototype test section');
      this.successRate = 0;
      return 0;
    }

    let successfulParticipants = 0;
    let totalParticipantsAttempted = 0;

    // Iterate through participants to find those who completed the task
    for (const participant of this.participants) {
      // Find the response for this section
      const sectionResponse = participant.responses.find(
        response => response.sectionId === this.section.id
      ) as PrototypeTestResponse | undefined;

      if (sectionResponse && sectionResponse.type === 'prototype-test') {
        totalParticipantsAttempted++;

        // Check if participant reached the target node
        const reachedTarget = sectionResponse.response.figmaEventLog.some(
          event => event['nodeId'] === targetNodeId || event['destination'] === targetNodeId
        );

        if (reachedTarget) {
          successfulParticipants++;
          this.successCount++;
        } else {
          this.unfinishedCount++;
        }
      }
    }

    // Calculate success rate as a percentage
    this.successRate = totalParticipantsAttempted > 0
      ? (successfulParticipants / totalParticipantsAttempted) * 100
      : 0;

    // Round to one decimal place
    this.successRate = Math.round(this.successRate * 10) / 10;

    return this.successRate;
  }

  calculateTotalDropoffs(): number {
    if (!this.participants || this.participants.length === 0) {
      console.log('No hay participantes para calcular drop-offs');
      this.totalDropoffs = 0;
      return 0;
    }

    let totalDropoffCount = 0;

    this.participants.forEach((participant) => {
      // Encontrar respuesta para esta sección
      const sectionResponse = participant.responses.find(
        response => response.sectionId === this.section.id
      ) as PrototypeTestResponse | undefined;

      if (!sectionResponse || sectionResponse.type !== 'prototype-test') {
        return;
      }

      const events = sectionResponse.response.figmaEventLog;

      if (!events || events.length === 0) {
        return;
      }

      // Contar eventos PROTOTYPE_STOP
      const dropoffCount = events.filter(event =>
        event['type'] === 'PROTOTYPE_STOP' ||
        event['eventType'] === 'PROTOTYPE_STOP'
      ).length;

      totalDropoffCount += dropoffCount;

      console.log(`Participante ${participant.id}: ${dropoffCount} drop-offs`);
    });

    console.log(`Total de drop-offs en todos los participantes: ${totalDropoffCount}`);
    this.totalDropoffs = totalDropoffCount;

    return totalDropoffCount;
  }

  setActiveTab(tab: 'success' | 'unfinished') {
    this.activeTab = tab;
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

  extractMissionScreens() {
    if (!this.section) {
      console.warn('Cannot extract mission screens: missing section data');
      return;
    }

    console.log('=== EXTRACTING MISSION SCREENS ===');
    console.log('Section:', this.section);

    // First load the frames from the study model if we haven't already
    if (this.missionScreens.length === 0) {
      this.loadStudyData();
    }

    // If we have no participants, we still want to show the frames from the study
    if (!this.participants || this.participants.length === 0) {
      console.log('No participants data, but showing prototype frames from Study model');
      return;
    }

    console.log('Number of participants:', this.participants.length);

    // Map to track screens from participant data
    const screenMap = new Map<string, MissionScreen>();

    // First add any screens we already have from the Study model
    this.missionScreens.forEach(screen => {
      screenMap.set(screen.id, {...screen, participants: 0}); // Reset participant count for recalculation
    });

    // Now process participant data to update or add screens
    this.participants.forEach((participant, index) => {
      console.log(`Analyzing participant ${index + 1} (ID: ${participant.id})`);

      // Find the response for this section
      const sectionResponse = participant.responses.find(
        response => response.sectionId === this.section.id
      ) as PrototypeTestResponse | undefined;

      if (!sectionResponse) {
        console.log(`  No response found for section ${this.section.id}`);
        return;
      }

      if (sectionResponse.type !== 'prototype-test') {
        console.log(`  Response type is not prototype-test, it's: ${sectionResponse.type}`);
        return;
      }

      const events = sectionResponse.response.figmaEventLog || [];

      // Process events to extract screens and update participant counts
      events.forEach(event => {
        if (
          (event['type'] === 'FRAME_RENDER' ||
           event['eventType'] === 'FRAME_RENDER' ||
           event['type'] === 'NODE_INTERACTION')
        ) {
          const nodeId = event['nodeId'] || event['source'] || '';
          const nodeName = event['nodeName'] || event['name'] || `Screen ${nodeId.substring(0, 6)}`;
          const imageUrl = event['imageUrl'] || event['thumbnailUrl'] || '';

          if (nodeId) {
            if (screenMap.has(nodeId)) {
              // Increment participant count if the screen already exists
              const existingScreen = screenMap.get(nodeId);
              if (existingScreen) {
                existingScreen.participants = (existingScreen.participants || 0) + 1;
              }
            } else if (imageUrl) {
              // Only add new screens from participant data if they have an image URL
              screenMap.set(nodeId, {
                id: nodeId,
                title: nodeName,
                image: imageUrl,
                participants: 1
              });
            }
          }
        }
      });
    });

    // Convert the map to an array and sort by participants count (descending)
    this.missionScreens = Array.from(screenMap.values())
      .sort((a, b) => (b.participants || 0) - (a.participants || 0));

    console.log(`Extracted ${this.missionScreens.length} unique mission screens:`, this.missionScreens);
    console.log('=== END MISSION SCREENS EXTRACTION ===');
  }
}
