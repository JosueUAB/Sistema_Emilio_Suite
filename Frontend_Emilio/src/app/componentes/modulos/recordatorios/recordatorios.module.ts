import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RecordatoriosRouterModule } from './recordatorios.routing';
import { RecordatoriosComponent } from './recordatorios.component';



@NgModule({
  declarations: [
    RecordatoriosComponent
  ],
  imports: [
    CommonModule,
    RecordatoriosRouterModule
  ]
})
export class RecordatoriosModule { }
