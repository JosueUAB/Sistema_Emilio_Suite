import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { TableroRoutingModule } from './tablero.routing';
import { TableroComponent } from './tablero.component';
import { ButtonModule } from 'primeng/button';
import { FormsModule } from '@angular/forms';
import { MenuModule } from 'primeng/menu';
import { TableModule } from 'primeng/table';
import { ChartModule } from 'primeng/chart';
import { StyleClassModule } from 'primeng/styleclass';
import { PanelMenuModule } from 'primeng/panelmenu';
@NgModule({

  imports: [
    CommonModule,
    TableroRoutingModule,
    ButtonModule,
    FormsModule,
    ChartModule,
    MenuModule,
    TableModule,
    StyleClassModule,
    PanelMenuModule,
    MenuModule

  ],
  declarations: [TableroComponent],
})
export class TableroModule { }
