import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ConfiguracionRouterModule } from './configuracion.routing';
import { ConfiguracionComponent } from './configuracion.component';
import { CardModule } from 'primeng/card';
import { DropdownModule } from 'primeng/dropdown';
import { ButtonModule } from 'primeng/button';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { TarifasComponent } from './tarifas/tarifas.component';
import { TableModule } from 'primeng/table';
import { ToolbarModule } from 'primeng/toolbar';
import { InputTextModule } from 'primeng/inputtext';
import { ToastModule } from 'primeng/toast';
import { DialogModule } from 'primeng/dialog';
import { InputTextareaModule } from 'primeng/inputtextarea';
import { DescuentosComponent } from './descuentos/descuentos.component';
import { CalendarModule } from 'primeng/calendar';
import { TipoHabitacionComponent } from './tipo-habitacion/tipo-habitacion.component';
@NgModule({
  declarations: [ConfiguracionComponent,
    TarifasComponent,
    DescuentosComponent,
    TipoHabitacionComponent
  ],
  imports: [
    CommonModule,
    ConfiguracionRouterModule,
    CardModule,
    DropdownModule,
    ButtonModule,
    FormsModule,
    TableModule,
    ToolbarModule,
    InputTextModule,
    FormsModule,
    ReactiveFormsModule,
    ToastModule,
    ToolbarModule,
    DialogModule,
    InputTextareaModule,
    ButtonModule,
    CalendarModule,
    
    
    

  ]
})
export class ConfiguracionModule { }
