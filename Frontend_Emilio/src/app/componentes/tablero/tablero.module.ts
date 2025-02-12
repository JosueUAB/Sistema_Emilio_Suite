import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { TableroRoutingModule } from './tablero.routing';
import { TableroComponent } from './tablero.component';
import { ButtonModule } from 'primeng/button';



@NgModule({

  imports: [
    CommonModule,
    TableroRoutingModule,
    ButtonModule
  ],
  declarations: [TableroComponent],
})
export class TableroModule { }
