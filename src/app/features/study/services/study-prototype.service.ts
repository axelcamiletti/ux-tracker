import { Injectable } from '@angular/core';
import { PrototypeTestResponse } from '../models/study-response.model';

@Injectable({
  providedIn: 'root',
})
export class StudyPrototypeService {
  private prototypeResponses: PrototypeTestResponse[] = [];
  private currentEvents: { [sectionId: string]: any[] } = {};

  // Save a prototype response
  saveResponse(response: PrototypeTestResponse): void {
    this.prototypeResponses.push(response);
  }

  // Get all prototype responses
  getResponses(): PrototypeTestResponse[] {
    return this.prototypeResponses;
  }

  // Clear all stored responses
  clearResponses(): void {
    this.prototypeResponses = [];
    this.currentEvents = {};
  }

  // Handle Figma events for real-time tracking
  handleFigmaEvent(event: any): void {
    console.log('StudyPrototypeService: Recibido evento de Figma:', event);

    // Procesamos el evento según su tipo
    switch (event.type) {
      case 'INITIAL_LOAD':
        this.processInitialLoad(event);
        break;
      case 'MOUSE_PRESS_OR_RELEASE':
        this.processMouseEvent(event);
        break;
      case 'PRESENTED_NODE_CHANGED':
        this.processNavigationEvent(event);
        break;
      case 'NEW_STATE':
        this.processStateChangeEvent(event);
        break;
      case 'REQUEST_CLOSE':
        this.processCloseEvent(event);
        break;
      default:
        console.log('Tipo de evento no manejado:', event.type);
    }
  }

  // Recuperar eventos por sección específica
  getEventsBySection(sectionId: string): any[] {
    return this.currentEvents[sectionId] || [];
  }

  // Métodos privados para procesar cada tipo de evento
  private processInitialLoad(event: any): void {
    const eventData = {
      type: 'initial-load',
      nodeId: event.node_id || '',
      nodeName: event.node_name || '',
      timestamp: new Date()
    };
    this.addEventToCurrentSession(eventData);
  }

  private processMouseEvent(event: any): void {
    const eventData = {
      type: 'mouse-event',
      action: event.state || 'click',
      position: event.point || { x: 0, y: 0 },
      elementId: event.element_id || '',
      frameId: event.node_id || '',
      timestamp: new Date()
    };
    this.addEventToCurrentSession(eventData);
  }

  private processNavigationEvent(event: any): void {
    const eventData = {
      type: 'navigation',
      fromNodeId: event.from_node_id || '',
      fromNodeName: event.from_node_name || '',
      toNodeId: event.node_id || '',
      toNodeName: event.node_name || '',
      timestamp: new Date()
    };
    this.addEventToCurrentSession(eventData);
  }

  private processStateChangeEvent(event: any): void {
    const eventData = {
      type: 'state-change',
      componentId: event.component_id || '',
      componentName: event.component_name || '',
      stateId: event.state_id || '',
      stateName: event.state_name || '',
      timestamp: new Date()
    };
    this.addEventToCurrentSession(eventData);
  }

  private processCloseEvent(event: any): void {
    const eventData = {
      type: 'close-request',
      timestamp: new Date()
    };
    this.addEventToCurrentSession(eventData);
  }

  private addEventToCurrentSession(eventData: any): void {
    // Aquí asumimos un ID de sección activa (esto debería ser configurado desde el componente)
    const activeSectionId = this.getCurrentActiveSectionId();

    if (!this.currentEvents[activeSectionId]) {
      this.currentEvents[activeSectionId] = [];
    }

    this.currentEvents[activeSectionId].push(eventData);
    console.log(`Evento agregado a la sesión ${activeSectionId}:`, eventData);
  }

  // Método para obtener el ID de la sección activa (debe ser configurado externamente)
  private activeSectionId: string = '';

  setActiveSectionId(sectionId: string): void {
    this.activeSectionId = sectionId;
  }

  private getCurrentActiveSectionId(): string {
    return this.activeSectionId || 'default-section';
  }

  // Método para crear un resumen y guardarlo como respuesta completa
  createSummaryResponse(sectionId: string): PrototypeTestResponse {
    const events = this.getEventsBySection(sectionId);

    // Calculamos métricas basadas en los eventos
    const startTime = events.length > 0 ? events[0].timestamp : new Date();
    const endTime = events.length > 0 ? events[events.length - 1].timestamp : new Date();
    const timeSpentMs = endTime.getTime() - startTime.getTime();

    // Formateamos los eventos como interacciones para la respuesta
    const interactions = events.map(event => {
      switch (event.type) {
        case 'mouse-event':
          return {
            elementId: event.elementId || 'unknown',
            frameId: event.frameId || 'unknown',
            action: `click-${event.action}`,
            timestamp: event.timestamp,
            position: event.position
          };
        case 'navigation':
          return {
            elementId: `navigation:${event.fromNodeId}->${event.toNodeId}`,
            action: 'navigation',
            timestamp: event.timestamp
          };
        case 'state-change':
          return {
            elementId: event.componentId,
            action: `state-change:${event.stateName || event.stateId}`,
            timestamp: event.timestamp
          };
        default:
          return {
            elementId: 'system',
            action: event.type,
            timestamp: event.timestamp
          };
      }
    });

    // Creamos y devolvemos la respuesta completa
    const response: PrototypeTestResponse = {
      sectionId: sectionId,
      timestamp: new Date(),
      type: 'prototype-test',
      response: {
        completed: true,
        timeSpent: timeSpentMs,
        interactions: interactions
      }
    };

    return response;
  }
}
