import { AfterViewInit, Component, ElementRef, OnInit, ViewChild } from '@angular/core';
import { MatIconModule } from '@angular/material/icon';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

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
export class HeatmapSectionComponent implements OnInit, AfterViewInit {
  @ViewChild('prototypeImage') prototypeImage!: ElementRef<HTMLImageElement>;

  // Lista de prototipos disponibles
  availablePrototypes = [
    { name: 'Pantalla de inicio', path: 'assets/illustrations/welcome.svg' },
    { name: 'Pantalla de agradecimiento', path: 'assets/illustrations/thank-you.svg' }
  ];

  selectedPrototype = this.availablePrototypes[0];

  // Datos simulados de clicks (normalmente vendrían de una API)
  clickData: ClickData[] = [
    { x: 120, y: 150, isMisclick: false, participantId: 'user1' },
    { x: 250, y: 200, isMisclick: true, participantId: 'user1' },
    { x: 300, y: 180, isMisclick: false, participantId: 'user2' },
    { x: 150, y: 220, isMisclick: false, participantId: 'user2' },
    { x: 200, y: 300, isMisclick: true, participantId: 'user3' }
  ];

  filteredClicks: ClickData[] = [];
  selectedParticipant: string = 'all';
  showMisclicksOnly: boolean = false;

  constructor() {}

  ngOnInit(): void {
    this.filteredClicks = [...this.clickData];
  }

  ngAfterViewInit(): void {
    // Asegurarse de que la imagen está cargada antes de renderizar el heatmap
    this.prototypeImage.nativeElement.onload = () => {
      this.renderHeatmap();
    };
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
    if (!overlay) return;

    // Limpiar overlay existente
    overlay.innerHTML = '';

    // Obtener dimensiones de la imagen
    const imageWidth = this.prototypeImage.nativeElement.clientWidth;
    const imageHeight = this.prototypeImage.nativeElement.clientHeight;

    // Renderizar cada punto en el heatmap
    this.filteredClicks.forEach(click => {
      const point = document.createElement('div');
      point.className = 'heatmap-point';
      point.style.position = 'absolute';
      point.style.left = `${(click.x / 400) * imageWidth}px`;
      point.style.top = `${(click.y / 600) * imageHeight}px`;
      point.style.width = '20px';
      point.style.height = '20px';
      point.style.borderRadius = '50%';
      point.style.transform = 'translate(-50%, -50%)';
      point.style.background = click.isMisclick ? 'rgba(255, 0, 0, 0.5)' : 'rgba(0, 255, 0, 0.5)';

      overlay.appendChild(point);
    });
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
