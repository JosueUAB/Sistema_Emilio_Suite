import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RecordatoriosRouterModule } from './recordatorios.routing';
import { RecordatoriosComponent } from './recordatorios.component';

// Importa CheckboxModule de PrimeNG
import { CheckboxModule } from 'primeng/checkbox';

// Importa FormsModule para ngModel
import { FormsModule } from '@angular/forms';

@NgModule({
  declarations: [
    RecordatoriosComponent
  ],
  imports: [
    CommonModule,
    RecordatoriosRouterModule,
    CheckboxModule,   // Importa solo CheckboxModule
    FormsModule       // Importa FormsModule para usar ngModel
  ]
})
export class RecordatoriosModule { }
