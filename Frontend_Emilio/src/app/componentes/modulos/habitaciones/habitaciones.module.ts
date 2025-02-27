import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HabitacionesComponent } from './habitaciones.component';
import { HabitacionesRouterModule } from './habitaciones.routing';

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
import { TagModule } from 'primeng/tag';
import { RadioButtonModule } from 'primeng/radiobutton';
import { TriStateCheckboxModule } from 'primeng/tristatecheckbox';
import { CheckboxModule } from 'primeng/checkbox';
import { InputGroupModule } from 'primeng/inputgroup';
import { InputGroupAddonModule } from 'primeng/inputgroupaddon';

import { InputSwitchModule } from 'primeng/inputswitch';
import { InputNumberModule } from "primeng/inputnumber";

@NgModule({
  declarations: [HabitacionesComponent],
  imports: [
    CommonModule,
    HabitacionesRouterModule,
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
    ConfirmDialogModule,
    TagModule,
    RadioButtonModule,
    TriStateCheckboxModule,
    CheckboxModule,
    InputGroupModule,
    InputGroupAddonModule,
    InputSwitchModule,
    InputNumberModule



  ]
})
export class HabitacionesModule { }
