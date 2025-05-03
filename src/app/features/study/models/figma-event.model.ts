// Tipos de eventos de Figma con discriminación
export type FigmaEventType =
  | 'FRAME_RENDER'
  | 'NODE_INTERACTION'
  | 'NAVIGATION'
  | 'CLICK'
  | 'MISCLICK'
  | 'HOTSPOT_ENTER'
  | 'HOTSPOT_EXIT'
  // Tipos de eventos nativos de Figma
  | 'PRESENTED_NODE_CHANGED'
  | 'INITIAL_LOAD'
  | 'NEW_STATE'
  | 'MOUSE_PRESS_OR_RELEASE';

// Evento base con propiedades comunes
export interface BaseFigmaEvent {
  type: FigmaEventType;
  timestamp: Date;
}

// Evento de renderizado de pantalla
export interface FrameRenderEvent extends BaseFigmaEvent {
  type: 'FRAME_RENDER';
  nodeId: string;
  nodeName?: string;
  imageUrl?: string;
}

// Evento de navegación entre pantallas
export interface NavigationEvent extends BaseFigmaEvent {
  type: 'NAVIGATION';
  sourceNodeId: string;
  destinationNodeId: string;
  transitionType?: string;
}

// Evento de clic (normal o erróneo)
export interface ClickEvent extends BaseFigmaEvent {
  type: 'CLICK' | 'MISCLICK';
  nodeId: string;
  position: {x: number, y: number};
  targetElement?: string;
  isMisclick: boolean;
}

// Eventos de interacción con hotspots
export interface HotspotEvent extends BaseFigmaEvent {
  type: 'HOTSPOT_ENTER' | 'HOTSPOT_EXIT';
  nodeId: string;
  hotspotId: string;
}

// Evento genérico de interacción con un nodo
export interface NodeInteractionEvent extends BaseFigmaEvent {
  type: 'NODE_INTERACTION';
  nodeId: string;
  interactionType: string;
  details?: any;
}

// Eventos nativos de Figma
export interface PresentedNodeChangedEvent extends BaseFigmaEvent {
  type: 'PRESENTED_NODE_CHANGED';
  data: {
    presentedNodeId: string;
    isStoredInHistory?: boolean;
    stateMappings?: {[key: string]: string};
    previousNode?: string;
    currentNode?: string;
  };
}

export interface InitialLoadEvent extends BaseFigmaEvent {
  type: 'INITIAL_LOAD';
  data: Record<string, any>; // Datos iniciales vacíos o con propiedades variables
}

export interface NewStateEvent extends BaseFigmaEvent {
  type: 'NEW_STATE';
  data: {
    nodeId: string;
    currentVariantId?: string;
    newVariantId?: string;
    isStoredInHistory?: boolean;
    isTimedChange?: boolean;
    stateId?: string;
    stateName?: string;
    changes?: any;
  };
}

export interface MousePressOrReleaseEvent extends BaseFigmaEvent {
  type: 'MOUSE_PRESS_OR_RELEASE';
  data: {
    handled?: boolean;
    presentedNodeId?: string;
    targetNodeId?: string;
    nearestScrollingFrameId?: string;
    nearestScrollingFrameMousePosition?: {
      x: number;
      y: number;
    };
    nearestScrollingFrameOffset?: {
      x: number;
      y: number;
    };
    targetNodeMousePosition?: {
      x: number;
      y: number;
    };
    action?: 'press' | 'release';
    button?: 'left' | 'right' | 'middle';
    elementId?: string;
  };
}

// Unión discriminada para todos los tipos de eventos
export type FigmaEvent =
  | FrameRenderEvent
  | NavigationEvent
  | ClickEvent
  | HotspotEvent
  | NodeInteractionEvent
  | PresentedNodeChangedEvent
  | InitialLoadEvent
  | NewStateEvent
  | MousePressOrReleaseEvent;

// Helper para convertir un evento genérico a un evento tipado
export function convertToTypedEvent(event: any): FigmaEvent | null {
  if (!event || !event.type) return null;

  // Asegurarse que timestamp es un objeto Date
  const timestamp = event.timestamp instanceof Date
    ? event.timestamp
    : new Date(event.timestamp?.seconds * 1000 + event.timestamp?.nanoseconds / 1000000 || 0);

  switch (event.type) {
    case 'FRAME_RENDER':
      return {
        type: 'FRAME_RENDER',
        timestamp,
        nodeId: event.nodeId || event.node_id || '',
        nodeName: event.nodeName || event.node_name,
        imageUrl: event.imageUrl || event.image_url
      } as FrameRenderEvent;

    case 'NAVIGATION':
      return {
        type: 'NAVIGATION',
        timestamp,
        sourceNodeId: event.sourceNodeId || event.source_node_id || event.source || '',
        destinationNodeId: event.destinationNodeId || event.destination_node_id || event.destination || '',
        transitionType: event.transitionType || event.transition_type
      } as NavigationEvent;

    case 'CLICK':
    case 'MISCLICK':
      return {
        type: event.type,
        timestamp,
        nodeId: event.nodeId || event.node_id || '',
        position: event.position || { x: event.x || 0, y: event.y || 0 },
        targetElement: event.targetElement || event.target_element,
        isMisclick: event.type === 'MISCLICK' || event.isMisclick || false
      } as ClickEvent;

    case 'HOTSPOT_ENTER':
    case 'HOTSPOT_EXIT':
      return {
        type: event.type,
        timestamp,
        nodeId: event.nodeId || event.node_id || '',
        hotspotId: event.hotspotId || event.hotspot_id || ''
      } as HotspotEvent;

    case 'NODE_INTERACTION':
      return {
        type: 'NODE_INTERACTION',
        timestamp,
        nodeId: event.nodeId || event.node_id || '',
        interactionType: event.interactionType || event.interaction_type || 'unknown',
        details: event.details || {}
      } as NodeInteractionEvent;

    // Eventos nativos de Figma - actualizados con estructura real
    case 'PRESENTED_NODE_CHANGED':
      return {
        type: 'PRESENTED_NODE_CHANGED',
        timestamp,
        data: {
          presentedNodeId: event.data?.presentedNodeId || '',
          isStoredInHistory: event.data?.isStoredInHistory,
          stateMappings: event.data?.stateMappings || {},
          previousNode: event.data?.previousNode,
          currentNode: event.data?.currentNode
        }
      } as PresentedNodeChangedEvent;

    case 'INITIAL_LOAD':
      return {
        type: 'INITIAL_LOAD',
        timestamp,
        data: event.data || {}
      } as InitialLoadEvent;

    case 'NEW_STATE':
      return {
        type: 'NEW_STATE',
        timestamp,
        data: {
          nodeId: event.data?.nodeId || '',
          currentVariantId: event.data?.currentVariantId,
          newVariantId: event.data?.newVariantId,
          isStoredInHistory: event.data?.isStoredInHistory,
          isTimedChange: event.data?.isTimedChange,
          stateId: event.data?.stateId,
          stateName: event.data?.stateName,
          changes: event.data?.changes
        }
      } as NewStateEvent;

    case 'MOUSE_PRESS_OR_RELEASE':
      return {
        type: 'MOUSE_PRESS_OR_RELEASE',
        timestamp,
        data: {
          handled: event.data?.handled,
          presentedNodeId: event.data?.presentedNodeId,
          targetNodeId: event.data?.targetNodeId,
          nearestScrollingFrameId: event.data?.nearestScrollingFrameId,
          nearestScrollingFrameMousePosition: event.data?.nearestScrollingFrameMousePosition,
          nearestScrollingFrameOffset: event.data?.nearestScrollingFrameOffset,
          targetNodeMousePosition: event.data?.targetNodeMousePosition,
          action: event.data?.action || 'press',
          button: event.data?.button || 'left',
          elementId: event.data?.elementId
        }
      } as MousePressOrReleaseEvent;

    default:
      // Si no coincide con ninguno de los tipos conocidos,
      // tratar como evento genérico de interacción
      return {
        type: 'NODE_INTERACTION',
        timestamp,
        nodeId: event.nodeId || event.node_id || '',
        interactionType: event.type,
        details: event
      } as NodeInteractionEvent;
  }
}
