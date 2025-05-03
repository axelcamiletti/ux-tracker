import { SectionResponse } from "./study-response.model";

export interface StudyAnalytics {
  totalResponses: number;
  completionRate: number;
  averageTimeSpent: number;
  sectionAnalytics: {
    [sectionId: string]: SectionAnalytics;
  };
}

export interface SectionAnalytics {
  totalResponses: number;
  responses: SectionResponse[];
  // Para preguntas sí/no
  yesNoDistribution?: {
    yes: number;
    no: number;
  };
  // Para preguntas de elección múltiple
  optionDistribution?: {
    [optionId: string]: number;
  };
  // Para preguntas abiertas
  commonKeywords?: Array<{
    word: string;
    count: number;
  }>;
  // Para pruebas de prototipos
  prototypeInteractions?: PrototypeAnalytics;
  averageTimeSpent?: number;
}

// Nueva interfaz para analíticas detalladas de prototipos
export interface PrototypeAnalytics {
  // Eventos de click con coordenadas y elemento
  clickEvents: Array<{
    x: number;
    y: number;
    count: number;
    elementId: string | null; // null para clicks en áreas no interactivas
  }>;

  // Eventos de navegación entre pantallas
  navigationEvents: Array<{
    from: string;
    to: string;
    count: number;
  }>;

  // Cambios de estado en componentes
  stateChangeEvents: Array<{
    componentId: string;
    state: string;
    count: number;
  }>;

  // Tiempo promedio por pantalla en ms
  timeSpent: {
    [screenId: string]: number;
  };

  // Puntos donde los usuarios abandonan el flujo
  abandonmentPoints: Array<{
    screenId: string;
    count: number;
  }>;

  // Métricas de finalización
  completionMetrics: {
    successful: number;
    failed: number;
    avgTime: number; // tiempo promedio en ms
  };

  // Para análisis de camino óptimo vs real
  optimalPath?: Array<string>;
  userPaths?: Array<{
    userId: string;
    path: Array<string>;
    timeSpent: number;
  }>;
}

export interface PrototypeScreenAnalytics {
  nodeId: string;          // ID del nodo de Figma
  participants: number;    // Cantidad de participantes que vieron este nodo
  totalTimeSpent: number;  // Tiempo total (para calcular promedios)
  avgDuration: number;     // Duración promedio
  interactionCount: number; // Número total de interacciones
  misclickCount: number;   // Número de clics erróneos
  // Métricas adicionales básicas...
}
