import { Injectable } from '@angular/core';
import { FigmaEvent, convertToTypedEvent, PresentedNodeChangedEvent, MousePressOrReleaseEvent, NewStateEvent } from '../models/figma-event.model';
import { FigmaNodeAnalytics, FigmaSessionAnalytics } from '../models/figma-node.model';

@Injectable({
  providedIn: 'root'
})
export class FigmaAnalyticsService {

  constructor() { }

  /**
   * Procesa eventos brutos de Figma y los convierte a eventos tipados
   * @param rawEvents Array de eventos sin procesar
   * @returns Array de eventos tipados
   */
  processRawEvents(rawEvents: any[]): FigmaEvent[] {
    if (!rawEvents || !Array.isArray(rawEvents)) return [];

    const typedEvents: FigmaEvent[] = [];

    for (const event of rawEvents) {
      const typedEvent = convertToTypedEvent(event);
      if (typedEvent) {
        typedEvents.push(typedEvent);
      }
    }

    // Ordenar eventos por timestamp
    const sortedEvents = typedEvents.sort((a, b) =>
      a.timestamp.getTime() - b.timestamp.getTime()
    );

    // Procesar eventos específicos de Figma y crear eventos sintéticos para análisis
    // Para facilitar el uso con componentes existentes
    const enhancedEvents: FigmaEvent[] = [];
    let currentNodeId: string | null = null;

    for (let i = 0; i < sortedEvents.length; i++) {
      const event = sortedEvents[i];
      enhancedEvents.push(event);

      // Procesar cambios de nodo como eventos de navegación
      if (event.type === 'PRESENTED_NODE_CHANGED') {
        const presentedNodeEvent = event as PresentedNodeChangedEvent;
        const nodeId = presentedNodeEvent.data?.presentedNodeId || '';

        // Si tenemos un nodo previo y actual, crear un evento de navegación
        if (currentNodeId && nodeId && currentNodeId !== nodeId) {
          enhancedEvents.push({
            type: 'NAVIGATION',
            timestamp: event.timestamp,
            sourceNodeId: currentNodeId,
            destinationNodeId: nodeId,
            transitionType: 'node_change'
          });
        }

        // También crear un evento de tipo FRAME_RENDER para compatibilidad
        enhancedEvents.push({
          type: 'FRAME_RENDER',
          timestamp: event.timestamp,
          nodeId: nodeId,
          nodeName: nodeId.split(':').pop() // Extraer la última parte del ID como nombre
        });

        currentNodeId = nodeId;
      }

      // Procesar eventos de clic a partir de MOUSE_PRESS_OR_RELEASE
      if (event.type === 'MOUSE_PRESS_OR_RELEASE') {
        const mouseEvent = event as MousePressOrReleaseEvent;
        const nodeId = mouseEvent.data?.targetNodeId || mouseEvent.data?.presentedNodeId || currentNodeId || '';

        // Solo procesar eventos de tipo "press" como clics (si podemos determinarlo)
        const position = mouseEvent.data?.targetNodeMousePosition ||
                         mouseEvent.data?.nearestScrollingFrameMousePosition ||
                         { x: 0, y: 0 };

        // Crear un evento sintético de clic
        enhancedEvents.push({
          type: 'CLICK',
          timestamp: event.timestamp,
          nodeId: nodeId,
          position: position,
          targetElement: mouseEvent.data?.targetNodeId,
          isMisclick: false // Por defecto asumimos que no es un misclick
        });
      }

      // Procesar carga inicial como un evento FRAME_RENDER
      if (event.type === 'INITIAL_LOAD') {
        // Para INITIAL_LOAD, usamos el primer PRESENTED_NODE_CHANGED que encontremos
        const nextPresentedNodeEvent = sortedEvents.find((e, idx) =>
          idx > i && e.type === 'PRESENTED_NODE_CHANGED'
        ) as PresentedNodeChangedEvent | undefined;

        if (nextPresentedNodeEvent) {
          const nodeId = nextPresentedNodeEvent.data?.presentedNodeId || '';
          currentNodeId = nodeId;

          enhancedEvents.push({
            type: 'FRAME_RENDER',
            timestamp: event.timestamp,
            nodeId: nodeId,
            nodeName: nodeId.split(':').pop()
          });
        }
      }

      // Procesar cambios de estado como interacciones con nodos
      if (event.type === 'NEW_STATE') {
        const stateEvent = event as NewStateEvent;
        const nodeId = stateEvent.data?.nodeId || currentNodeId || '';

        if (nodeId) {
          enhancedEvents.push({
            type: 'NODE_INTERACTION',
            timestamp: event.timestamp,
            nodeId: nodeId,
            interactionType: 'state_change',
            details: {
              currentVariantId: stateEvent.data?.currentVariantId,
              newVariantId: stateEvent.data?.newVariantId
            }
          });
        }
      }
    }

    return enhancedEvents;
  }

  /**
   * Calcula métricas básicas y derivadas para un nodo específico
   * @param nodeId ID del nodo de Figma
   * @param events Array de eventos tipados relacionados con el nodo
   * @returns Objeto con métricas del nodo
   */
  calculateNodeMetrics(nodeId: string, events: FigmaEvent[]): FigmaNodeAnalytics {
    if (!nodeId || !events || events.length === 0) {
      return this.createEmptyNodeAnalytics(nodeId);
    }

    // Filtrar eventos relevantes para este nodo
    const nodeEvents = events.filter(event => {
      // Incluir eventos que ocurren en este nodo
      if ('nodeId' in event && event.nodeId === nodeId) return true;

      // Incluir eventos de navegación que involucran este nodo
      if (event.type === 'NAVIGATION') {
        return event.sourceNodeId === nodeId || event.destinationNodeId === nodeId;
      }

      return false;
    });

    // Si no hay eventos para este nodo, devolver analítica vacía
    if (nodeEvents.length === 0) {
      return this.createEmptyNodeAnalytics(nodeId);
    }

    // Inicializar analítica
    const analytics: FigmaNodeAnalytics = {
      nodeId,
      totalParticipants: 0,
      visitCount: 0,
      totalTimeSpent: 0,
      avgDuration: 0,
      interactionCount: 0,
      clickCount: 0,
      misclickCount: 0,
      entryFromNodeIds: [],
      exitToNodeIds: [],
      clickCoordinates: [],
      lastUpdated: new Date()
    };

    // Set para participantes únicos
    const uniqueParticipants = new Set<string>();

    // Procesar cada evento
    for (let i = 0; i < nodeEvents.length; i++) {
      const event = nodeEvents[i];

      // Contar participantes únicos (asumiendo que hay una propiedad participantId)
      if ('participantId' in event) {
        uniqueParticipants.add(event.participantId as string);
      }

      // Contar visitas (eventos FRAME_RENDER)
      if (event.type === 'FRAME_RENDER') {
        analytics.visitCount++;
      }

      // Contar clics y misclicks
      if (event.type === 'CLICK' || event.type === 'MISCLICK') {
        analytics.interactionCount++;

        if (event.type === 'MISCLICK' || event.isMisclick) {
          analytics.misclickCount++;
        } else {
          analytics.clickCount++;
        }

        // Agregar coordenadas para heatmap
        if (!analytics.clickCoordinates) {
          analytics.clickCoordinates = [];
        }

        // Buscar si ya existe una entrada con estas coordenadas
        const existingCoordinate = analytics.clickCoordinates.find(
          c => c.x === event.position.x && c.y === event.position.y && c.isMisclick === event.isMisclick
        );

        if (existingCoordinate) {
          existingCoordinate.count++;
        } else {
          analytics.clickCoordinates.push({
            x: event.position.x,
            y: event.position.y,
            count: 1,
            isMisclick: event.isMisclick
          });
        }
      }

      // Registrar nodos de entrada/salida en eventos de navegación
      if (event.type === 'NAVIGATION') {
        if (event.destinationNodeId === nodeId && !analytics.entryFromNodeIds.includes(event.sourceNodeId)) {
          analytics.entryFromNodeIds.push(event.sourceNodeId);
        }

        if (event.sourceNodeId === nodeId && !analytics.exitToNodeIds.includes(event.destinationNodeId)) {
          analytics.exitToNodeIds.push(event.destinationNodeId);
        }
      }

      // Interacciones generales
      if (event.type === 'NODE_INTERACTION' || event.type === 'HOTSPOT_ENTER' || event.type === 'HOTSPOT_EXIT') {
        analytics.interactionCount++;
      }
    }

    // Asignar participantes únicos
    analytics.totalParticipants = uniqueParticipants.size;

    return analytics;
  }

  /**
   * Genera datos para visualización de heatmap
   * @param nodeId ID del nodo
   * @param events Eventos de Figma
   * @returns Datos formateados para heatmap
   */
  generateHeatmapData(nodeId: string, events: FigmaEvent[]): any {
    const analytics = this.calculateNodeMetrics(nodeId, events);

    if (!analytics.clickCoordinates || analytics.clickCoordinates.length === 0) {
      return {
        points: [],
        totalClicks: 0,
        misclickRate: 0
      };
    }

    // Calcular tasa de misclicks
    const totalClicks = analytics.clickCount + analytics.misclickCount;
    const misclickRate = totalClicks > 0
      ? (analytics.misclickCount / totalClicks) * 100
      : 0;

    return {
      points: analytics.clickCoordinates,
      totalClicks,
      misclickRate: Math.round(misclickRate * 10) / 10 // Redondear a 1 decimal
    };
  }

  /**
   * Analiza el patrón de navegación a través de nodos
   * @param events Eventos de Figma ordenados cronológicamente
   * @returns Análisis de caminos de navegación
   */
  analyzeNavigationPaths(events: FigmaEvent[]): any {
    if (!events || events.length === 0) {
      return { paths: [], common: [] };
    }

    // Extraer eventos de navegación
    const navigationEvents = events.filter(
      event => event.type === 'NAVIGATION'
    ) as Array<import('../models/figma-event.model').NavigationEvent>;

    if (navigationEvents.length === 0) {
      return { paths: [], common: [] };
    }

    // Agrupar eventos por participante
    const participantPaths: {[participantId: string]: string[]} = {};

    for (const event of navigationEvents) {
      // Asumiendo que hay una propiedad participantId en el evento
      const participantId = 'participantId' in event ? event.participantId as string : 'unknown';

      if (!participantPaths[participantId]) {
        participantPaths[participantId] = [event.sourceNodeId];
      }

      // Añadir destino si no es el último nodo ya agregado
      const currentPath = participantPaths[participantId];
      if (currentPath[currentPath.length - 1] !== event.destinationNodeId) {
        currentPath.push(event.destinationNodeId);
      }
    }

    // Contar frecuencia de transiciones entre nodos
    const transitions: {[key: string]: number} = {};

    for (const event of navigationEvents) {
      const key = `${event.sourceNodeId}:${event.destinationNodeId}`;
      transitions[key] = (transitions[key] || 0) + 1;
    }

    // Ordenar transiciones por frecuencia
    const sortedTransitions = Object.entries(transitions)
      .sort((a, b) => b[1] - a[1])
      .map(([key, count]) => {
        const [source, destination] = key.split(':');
        return { source, destination, count };
      });

    return {
      paths: Object.entries(participantPaths).map(([id, path]) => ({ participantId: id, path })),
      common: sortedTransitions
    };
  }

  /**
   * Crea una analítica de sesión a partir de eventos de un participante
   * @param participantId ID del participante
   * @param events Eventos de Figma ordenados cronológicamente
   * @param targetNodeId ID del nodo objetivo (opcional)
   * @returns Analítica de sesión
   */
  createSessionAnalytics(
    participantId: string,
    events: FigmaEvent[],
    targetNodeId?: string
  ): FigmaSessionAnalytics {
    if (!events || events.length === 0) {
      return {
        sessionId: `session_${Date.now()}`,
        participantId,
        startTime: new Date(),
        nodePath: [],
        missionCompleted: false,
        reachedTargetNode: false,
        nodeTimeSpent: {},
        eventIds: []
      };
    }

    // Ordenar eventos por timestamp
    const sortedEvents = [...events].sort(
      (a, b) => a.timestamp.getTime() - b.timestamp.getTime()
    );

    // Times por nodo
    const nodeTimeSpent: {[nodeId: string]: number} = {};
    const nodeVisits: {[nodeId: string]: {enter: Date, leave?: Date}[]} = {};

    // Path de navegación
    const nodePath: string[] = [];
    let currentNodeId: string | null = null;

    // Procesar cada evento para calcular tiempos y path
    for (const event of sortedEvents) {
      // Identificar cambios de nodo
      if (event.type === 'FRAME_RENDER' && 'nodeId' in event) {
        const nodeId = event.nodeId;

        // Si es un nuevo nodo, agregar al path
        if (currentNodeId !== nodeId) {
          // Si había un nodo actual, registrar tiempo de salida
          if (currentNodeId) {
            const visits = nodeVisits[currentNodeId];
            if (visits && visits.length > 0) {
              const lastVisit = visits[visits.length - 1];
              if (!lastVisit.leave) {
                lastVisit.leave = event.timestamp;
              }
            }
          }

          // Registrar nuevo nodo actual
          currentNodeId = nodeId;

          // Agregar al path si es nuevo
          if (nodePath.length === 0 || nodePath[nodePath.length - 1] !== nodeId) {
            nodePath.push(nodeId);
          }

          // Inicializar tiempo de entrada para este nodo
          if (!nodeVisits[nodeId]) {
            nodeVisits[nodeId] = [];
          }

          nodeVisits[nodeId].push({
            enter: event.timestamp
          });
        }
      }

      // Identificar navegación entre nodos
      if (event.type === 'NAVIGATION') {
        // Si hay un nodo de origen, registrar tiempo de salida
        if (currentNodeId === event.sourceNodeId) {
          const visits = nodeVisits[event.sourceNodeId];
          if (visits && visits.length > 0) {
            const lastVisit = visits[visits.length - 1];
            if (!lastVisit.leave) {
              lastVisit.leave = event.timestamp;
            }
          }
        }

        // Actualizar nodo actual al destino
        currentNodeId = event.destinationNodeId;

        // Agregar al path si es nuevo
        if (nodePath.length === 0 || nodePath[nodePath.length - 1] !== event.destinationNodeId) {
          nodePath.push(event.destinationNodeId);
        }

        // Inicializar tiempo de entrada para el nodo destino
        if (!nodeVisits[event.destinationNodeId]) {
          nodeVisits[event.destinationNodeId] = [];
        }

        nodeVisits[event.destinationNodeId].push({
          enter: event.timestamp
        });
      }
    }

    // Si el último nodo no tiene tiempo de salida, usar el timestamp del último evento
    if (currentNodeId && nodeVisits[currentNodeId]) {
      const visits = nodeVisits[currentNodeId];
      if (visits && visits.length > 0) {
        const lastVisit = visits[visits.length - 1];
        if (!lastVisit.leave) {
          lastVisit.leave = sortedEvents[sortedEvents.length - 1].timestamp;
        }
      }
    }

    // Calcular tiempo total por nodo
    for (const [nodeId, visits] of Object.entries(nodeVisits)) {
      let totalTime = 0;

      for (const visit of visits) {
        if (visit.leave) {
          totalTime += visit.leave.getTime() - visit.enter.getTime();
        }
      }

      nodeTimeSpent[nodeId] = totalTime;
    }

    // Verificar si alcanzó el nodo objetivo
    const reachedTargetNode = targetNodeId ? nodePath.includes(targetNodeId) : false;

    // Crear analítica de sesión
    return {
      sessionId: `session_${participantId}_${Date.now()}`,
      participantId,
      startTime: sortedEvents[0].timestamp,
      endTime: sortedEvents[sortedEvents.length - 1].timestamp,
      totalDuration: sortedEvents[sortedEvents.length - 1].timestamp.getTime() - sortedEvents[0].timestamp.getTime(),
      nodePath,
      missionCompleted: reachedTargetNode, // Consideramos misión completada si alcanzó el objetivo
      reachedTargetNode,
      nodeTimeSpent,
      eventIds: [] // Idealmente aquí irían referencias a IDs de eventos almacenados
    };
  }

  /**
   * Identifica puntos problemáticos en un flujo de prototipo
   * @param nodeAnalytics Mapa de análisis por nodo
   * @param threshold Umbral para considerar un nodo como problemático (por defecto: 3 problemas)
   * @returns Lista de nodos problemáticos con razones
   */
  identifyPainPoints(
    nodeAnalytics: {[nodeId: string]: FigmaNodeAnalytics},
    threshold: number = 3
  ): Array<{nodeId: string, issues: string[], score: number}> {
    if (!nodeAnalytics || Object.keys(nodeAnalytics).length === 0) {
      return [];
    }

    const painPoints: Array<{nodeId: string, issues: string[], score: number}> = [];

    for (const [nodeId, analytics] of Object.entries(nodeAnalytics)) {
      const issues: string[] = [];
      let issueScore = 0;

      // Alta tasa de misclicks (>15%)
      const misclickRate = analytics.clickCount + analytics.misclickCount > 0
        ? (analytics.misclickCount / (analytics.clickCount + analytics.misclickCount)) * 100
        : 0;

      if (misclickRate > 15) {
        issues.push(`Alta tasa de misclicks: ${Math.round(misclickRate)}%`);
        issueScore += Math.floor(misclickRate / 5); // +1 por cada 5% por encima del 15%
      }

      // Tiempo excesivo en el nodo
      const avgTimeSpent = analytics.totalParticipants > 0
        ? analytics.totalTimeSpent / analytics.totalParticipants
        : 0;

      // Si el tiempo promedio es mayor a 20 segundos
      if (avgTimeSpent > 20000) {
        issues.push(`Tiempo excesivo: ${Math.round(avgTimeSpent / 1000)}s en promedio`);
        issueScore += Math.floor(avgTimeSpent / 10000); // +1 por cada 10s adicionales
      }

      // Muchas interacciones sin navegación
      if (analytics.exitToNodeIds.length === 0 && analytics.interactionCount > 5) {
        issues.push(`${analytics.interactionCount} interacciones sin salida`);
        issueScore += 2;
      }

      // Si el nodo tiene suficientes problemas, agregarlo a pain points
      if (issues.length > 0 && issueScore >= threshold) {
        painPoints.push({
          nodeId,
          issues,
          score: issueScore
        });
      }
    }

    // Ordenar por score (de mayor a menor)
    return painPoints.sort((a, b) => b.score - a.score);
  }

  // Helper para crear una estructura de analítica de nodo vacía
  private createEmptyNodeAnalytics(nodeId: string): FigmaNodeAnalytics {
    return {
      nodeId,
      totalParticipants: 0,
      visitCount: 0,
      totalTimeSpent: 0,
      avgDuration: 0,         // Adding the missing property
      interactionCount: 0,
      clickCount: 0,
      misclickCount: 0,
      entryFromNodeIds: [],
      exitToNodeIds: [],
      lastUpdated: new Date()
    };
  }
}
