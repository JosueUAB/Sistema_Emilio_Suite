import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HuespedesComponent } from './huespedes.component';
import { HuespedesRouterModule } from './huespedes.routing';
import { CardModule } from 'primeng/card';
import { DropdownModule } from 'primeng/dropdown';
import { ButtonModule } from 'primeng/button';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { TableModule } from 'primeng/table';
import { ToolbarModule } from 'primeng/toolbar';
import { InputTextModule } from 'primeng/inputtext';
import { ToastModule } from 'primeng/toast';
import { DialogModule } from 'primeng/dialog';
import { InputTextareaModule } from 'primeng/inputtextarea';

import { CalendarModule } from 'primeng/calendar';
import { BadgeModule } from 'primeng/badge';

import { ConfirmDialogModule } from 'primeng/confirmdialog';


@NgModule({
  declarations: [
    HuespedesComponent
  ],
  imports: [
    CommonModule,
    HuespedesRouterModule,
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
    BadgeModule,
    ConfirmDialogModule
  ]
})
export class HuespedesModule { }
