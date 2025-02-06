import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { TableroRoutingModule } from './tablero.routing';
import { TableroComponent } from './tablero.component';



@NgModule({

  imports: [
    CommonModule,
    TableroRoutingModule
  ],
  declarations: [TableroComponent],
})
export class TableroModule { }
