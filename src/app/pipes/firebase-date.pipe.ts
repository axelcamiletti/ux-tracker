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
    
    if (value instanceof Timestamp) {
      date = value.toDate();
    } else if (typeof value === 'string') {
      date = new Date(value);
    } else {
      date = value;
    }
    
    return new Intl.DateTimeFormat('es-ES', {
      dateStyle: format === 'mediumDate' ? 'medium' : 'short'
    }).format(date);
  }
} 