import { AfterViewInit, Component, ElementRef, Input, OnChanges, OnInit, SimpleChanges, ViewChild } from '@angular/core';
import { MatIconModule } from '@angular/material/icon';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { FigmaNode, FigmaNodeAnalytics } from '../../../models/figma-node.model';

interface ClickData {
  x: number;
  y: number;
  isMisclick: boolean;
  participantId: string;
}

@Component({
  selector: 'app-heatmap-section',
  standalone: true,
  imports: [MatIconModule, CommonModule, FormsModule],
  templateUrl: './heatmap-section.component.html',
  styleUrl: './heatmap-section.component.css'
})
export class HeatmapSectionComponent implements OnInit, AfterViewInit, OnChanges {
  @ViewChild('prototypeImage') prototypeImage!: ElementRef<HTMLImageElement>;
  @Input() node?: FigmaNode;
  @Input() nodeAnalytics?: FigmaNodeAnalytics;

  // Lista de prototipos disponibles (fallback si no hay nodo)
  availablePrototypes = [
    { name: 'Pantalla de inicio', path: 'assets/illustrations/welcome.svg' },
    { name: 'Pantalla de agradecimiento', path: 'assets/illustrations/thank-you.svg' }
  ];

  selectedPrototype = this.availablePrototypes[0];
  imagePath: string = '';

  // Datos de clicks procesados desde nodeAnalytics
  clickData: ClickData[] = [];
  filteredClicks: ClickData[] = [];
  selectedParticipant: string = 'all';
  showMisclicksOnly: boolean = false;

  // Métricas calculadas
  participantCount: number = 0;
  avgDuration: string = '0s';
  misclickRate: string = '0%';

  constructor() {}

  ngOnInit(): void {
    console.log("HeatmapSection initialized with node:", this.node);
    console.log("HeatmapSection initialized with analytics:", this.nodeAnalytics);
    this.processNodeData();
  }

  ngOnChanges(changes: SimpleChanges): void {
    console.log("Changes detected in HeatmapSection:", changes);
    if (changes['node'] || changes['nodeAnalytics']) {
      this.processNodeData();
    }
  }

  ngAfterViewInit(): void {
    // Asegurarse de que la imagen está cargada antes de renderizar el heatmap
    if (this.prototypeImage && this.prototypeImage.nativeElement) {
      this.prototypeImage.nativeElement.onload = () => {
        console.log("Image loaded, rendering heatmap");
        this.renderHeatmap();
      };

      // Intentar renderizar inmediatamente si la imagen ya está cargada
      if (this.prototypeImage.nativeElement.complete) {
        console.log("Image already loaded, rendering heatmap immediately");
        setTimeout(() => this.renderHeatmap(), 100);
      }
    } else {
      console.warn("prototypeImage reference not available");
    }
  }

  processNodeData(): void {
    // Procesar el nodo y los analytics recibidos
    if (this.node) {
      console.log("Processing node data:", this.node.id);
      // Usar la URL de imagen del nodo
      this.imagePath = this.node.imageUrl || this.selectedPrototype.path;
    } else {
      console.warn("No node provided, using fallback image");
      // Fallback a los prototipos por defecto
      this.imagePath = this.selectedPrototype.path;
    }

    // Procesar los datos analíticos
    if (this.nodeAnalytics) {
      console.log("Processing node analytics for node:", this.nodeAnalytics.nodeId);
      // Convertir las coordenadas de clics del nodo al formato que usa el componente
      this.clickData = this.convertAnalyticsToClickData(this.nodeAnalytics);

      // Calcular métricas
      this.participantCount = this.nodeAnalytics.totalParticipants || 0;

      // Tiempo promedio
      const avgTimeMs = this.nodeAnalytics.totalTimeSpent /
                       (this.nodeAnalytics.visitCount || 1);
      this.avgDuration = this.formatTime(avgTimeMs);

      // Tasa de misclicks
      const totalClicks = this.nodeAnalytics.clickCount || 0;
      const misclicks = this.nodeAnalytics.misclickCount || 0;
      this.misclickRate = totalClicks > 0
        ? `${Math.round((misclicks / totalClicks) * 100)}%`
        : '0%';
    } else {
      console.warn("No node analytics provided, using sample data");
      // Si no hay analytics, usar datos de ejemplo
      this.clickData = this.generateSampleClickData();
    }

    this.filteredClicks = [...this.clickData];

    // Force rendering after data is processed
    setTimeout(() => this.renderHeatmap(), 200);
  }

  generateSampleClickData(): ClickData[] {
    // Generate some sample click data for testing
    return [
      { x: 120, y: 150, isMisclick: false, participantId: 'user1' },
      { x: 250, y: 200, isMisclick: true, participantId: 'user1' },
      { x: 300, y: 180, isMisclick: false, participantId: 'user2' },
      { x: 150, y: 220, isMisclick: false, participantId: 'user2' },
      { x: 200, y: 300, isMisclick: true, participantId: 'user3' }
    ];
  }

  convertAnalyticsToClickData(analytics: FigmaNodeAnalytics): ClickData[] {
    const result: ClickData[] = [];

    // Si hay coordenadas de clics en los analytics
    if (analytics.clickCoordinates && analytics.clickCoordinates.length > 0) {
      console.log("Found click coordinates:", analytics.clickCoordinates.length);
      analytics.clickCoordinates.forEach(coord => {
        // Para cada coordenada, agregamos la cantidad de veces que se hizo clic en ese punto
        for (let i = 0; i < (coord.count || 1); i++) {
          result.push({
            x: coord.x,
            y: coord.y,
            isMisclick: !!coord.isMisclick,
            participantId: coord.participantId || `user${Math.floor(Math.random() * 5) + 1}`
          });
        }
      });
    } else if (analytics.events && analytics.events.length > 0) {
      // Alternatively try to extract click data from events
      console.log("No click coordinates, extracting from events:", analytics.events.length);
      const clickEvents = analytics.events.filter(e =>
        e.type === 'CLICK' || e.type === 'DRAG' || e.type === 'MOUSE_DOWN');

      clickEvents.forEach(event => {
        if (event.x !== undefined && event.y !== undefined) {
          result.push({
            x: event.x,
            y: event.y,
            isMisclick: event.type === 'MISCLICK' || false,
            participantId: event.participantId || 'unknown'
          });
        }
      });
    }

    console.log("Converted to click data:", result.length, "points");
    return result;
  }

  getUniqueParticipants(): string[] {
    // Get a list of unique participant IDs from the click data
    if (!this.clickData || this.clickData.length === 0) {
      return [];
    }

    const uniqueParticipants = new Set<string>();
    this.clickData.forEach(click => {
      if (click.participantId) {
        uniqueParticipants.add(click.participantId);
      }
    });

    return Array.from(uniqueParticipants);
  }

  formatTime(milliseconds: number): string {
    if (milliseconds < 1000) {
      return `${milliseconds}ms`;
    } else if (milliseconds < 60000) {
      return `${(milliseconds / 1000).toFixed(2)}s`;
    } else {
      const minutes = Math.floor(milliseconds / 60000);
      const seconds = ((milliseconds % 60000) / 1000).toFixed(0);
      return `${minutes}m ${seconds}s`;
    }
  }

  changePrototype(prototypePath: string): void {
    const prototype = this.availablePrototypes.find(p => p.path === prototypePath);
    if (prototype) {
      this.selectedPrototype = prototype;
      // Re-renderizar el heatmap cuando la imagen cambie
      setTimeout(() => {
        this.renderHeatmap();
      }, 100);
    }
  }

  filterClicks(): void {
    this.filteredClicks = this.clickData.filter(click => {
      const participantMatch = this.selectedParticipant === 'all' || click.participantId === this.selectedParticipant;
      const misclickMatch = !this.showMisclicksOnly || click.isMisclick;
      return participantMatch && misclickMatch;
    });

    this.renderHeatmap();
  }

  renderHeatmap(): void {
    const overlay = document.querySelector('.heatmap-overlay') as HTMLElement;
    if (!overlay) {
      console.error("Heatmap overlay element not found");
      return;
    }

    console.log("Rendering heatmap with", this.filteredClicks.length, "click points");

    // Limpiar overlay existente
    overlay.innerHTML = '';

    // Verificar que tenemos la referencia de la imagen
    if (!this.prototypeImage || !this.prototypeImage.nativeElement) {
      console.error("Missing prototype image reference");
      return;
    }

    // Obtener dimensiones de la imagen
    const imageWidth = this.prototypeImage.nativeElement.clientWidth || 400;
    const imageHeight = this.prototypeImage.nativeElement.clientHeight || 600;

    console.log("Image dimensions:", imageWidth, "x", imageHeight);

    // Add a base layer to help visualize if the overlay is rendering
    const baseLayer = document.createElement('div');
    baseLayer.style.position = 'absolute';
    baseLayer.style.top = '0';
    baseLayer.style.left = '0';
    baseLayer.style.width = '100%';
    baseLayer.style.height = '100%';
    baseLayer.style.pointerEvents = 'none';
    overlay.appendChild(baseLayer);

    // If we have no clicks, add some sample clicks for testing
    if (this.filteredClicks.length === 0 && (!this.nodeAnalytics || !this.node)) {
      console.log("No click data, adding sample clicks for testing");
      this.filteredClicks = this.generateSampleClickData();
    }

    // Renderizar cada punto en el heatmap
    this.filteredClicks.forEach((click, index) => {
      // Ensure coordinates are valid numbers
      const x = typeof click.x === 'number' ? click.x : 200;
      const y = typeof click.y === 'number' ? click.y : 200;

      const point = document.createElement('div');
      point.className = 'heatmap-point';
      point.style.position = 'absolute';
      point.style.left = `${(x / 800) * imageWidth}px`;
      point.style.top = `${(y / 800) * imageHeight}px`;
      point.style.width = '20px';
      point.style.height = '20px';
      point.style.borderRadius = '50%';
      point.style.transform = 'translate(-50%, -50%)';
      point.style.opacity = '0.7';
      point.style.zIndex = '30';
      point.style.boxShadow = '0 0 5px rgba(0,0,0,0.3)';
      point.style.background = click.isMisclick ? 'rgba(255, 0, 0, 0.5)' : 'rgba(0, 255, 0, 0.5)';

      // Add a tooltip with click info
      point.title = `Click ${index + 1} - ${click.isMisclick ? 'Misclick' : 'Click'} (${x}, ${y})`;

      overlay.appendChild(point);
    });

    console.log("Heatmap rendering complete");
  }

  toggleMisclicks(): void {
    this.showMisclicksOnly = !this.showMisclicksOnly;
    this.filterClicks();
  }

  setParticipantFilter(participantId: string): void {
    this.selectedParticipant = participantId;
    this.filterClicks();
  }
}
