/**
 * Modelos para nodos de Figma
 * Define la estructura de datos para los nodos (frames, componentes, etc.) de Figma
 * y sus datos analíticos asociados
 */

// Tipo de nodo en Figma
export type FigmaNodeType =
  | 'FRAME'
  | 'COMPONENT'
  | 'INSTANCE'
  | 'GROUP'
  | 'SECTION'
  | 'PAGE'
  | string;

// Modelo base para un nodo de Figma (datos estructurales)
export interface FigmaNode {
  id: string;           // ID único del nodo en Figma
  name: string;         // Nombre del nodo
  imageUrl: string;     // URL de la imagen exportada
  type: FigmaNodeType;  // Tipo de nodo en Figma
  children?: string[];  // IDs de nodos hijos
  properties?: {        // Propiedades específicas del nodo
    [key: string]: any;
  };
}

// Modelo para datos analíticos básicos de un nodo de Figma
export interface FigmaNodeAnalytics {
  nodeId: string;               // ID del nodo (referencia a FigmaNode)

  // Métricas básicas que se almacenan
  totalParticipants: number;    // Total de participantes que interactuaron con este nodo
  visitCount: number;           // Número total de vistas
  totalTimeSpent: number;       // Tiempo total acumulado en milisegundos
  avgDuration: number;          // Tiempo promedio en milisegundos
  interactionCount: number;     // Número total de interacciones con este nodo
  clickCount: number;           // Número total de clics
  misclickCount: number;        // Número de clics erróneos

  // Referencias para navegación
  entryFromNodeIds: string[];   // Nodos desde los que se llega a este
  exitToNodeIds: string[];      // Nodos a los que se navega desde este

  // Datos para heatmap
  clickCoordinates?: Array<{    // Coordenadas x,y de los clics para heatmaps
    x: number;
    y: number;
    count: number;
    isMisclick: boolean;
    participantId?: string;     // ID del participante que hizo el clic
  }>;

  // Eventos procesados relacionados con este nodo
  events?: Array<{              // Eventos procesados para este nodo
    type: string;
    nodeId?: string;
    x?: number;
    y?: number;
    timestamp?: number;
    participantId?: string;
    [key: string]: any;         // Propiedades adicionales de los eventos
  }>;

  // Estado de la analítica
  lastUpdated: Date;            // Última vez que se actualizaron las métricas
}

// Modelo para análisis de una sesión de usuario con un prototipo
export interface FigmaSessionAnalytics {
  sessionId: string;           // ID único de la sesión
  participantId: string;       // ID del participante

  // Datos temporales
  startTime: Date;             // Inicio de la sesión
  endTime?: Date;              // Fin de la sesión (si está completa)
  totalDuration?: number;      // Duración total en milisegundos

  // Secuencia de navegación
  nodePath: string[];          // Secuencia de nodeIds visitados

  // Datos de completitud de misión
  missionCompleted: boolean;   // Si completó la misión
  reachedTargetNode: boolean;  // Si llegó al nodo objetivo

  // Datos de interacción
  nodeTimeSpent: {             // Tiempo pasado en cada nodo
    [nodeId: string]: number;  // En milisegundos
  };

  // Referencias a eventos
  eventIds: string[];          // IDs de los eventos registrados

  // Metadatos
  deviceInfo?: {
    browser: string;
    os: string;
    screenSize: string;
  };
}
