import { Pipe, PipeTransform } from '@angular/core';
import { Timestamp } from '@angular/fire/firestore';

@Pipe({
  name: 'firebaseDate',
  standalone: true
})
export class FirebaseDatePipe implements PipeTransform {
  transform(value: Timestamp | Date | string | undefined | null, format: string = 'mediumDate'): string {
    if (!value) return '';

    let date: Date;

    try {
      if (value instanceof Timestamp) {
        date = value.toDate();
      } else if (typeof value === 'string') {
        date = new Date(value);
      } else if (typeof value === 'object' && 'seconds' in value && 'nanoseconds' in value) {
        // Manejar objetos de timestamp de Firestore serializados
        date = new Date((value as any).seconds * 1000);
      } else {
        date = value as Date;
      }

      // Check if date is valid before formatting
      if (isNaN(date.getTime())) {
        return 'Invalid date';
      }

      return new Intl.DateTimeFormat('es-ES', {
        dateStyle: format === 'mediumDate' ? 'medium' : 'short'
      }).format(date);
    } catch (error) {
      console.warn('Error formatting date:', error, value);
      return 'Invalid date';
    }
  }
}
