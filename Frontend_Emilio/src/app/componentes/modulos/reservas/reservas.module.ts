import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReservasRouterModule } from './reservas.routing';
import { ReservasComponent } from './reservas.component';

import { ButtonModule } from 'primeng/button';
import { CardModule } from 'primeng/card';
import { TagModule } from 'primeng/tag';
import { TooltipModule } from 'primeng/tooltip';


import { DropdownModule } from 'primeng/dropdown';
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
import { RadioButtonModule } from 'primeng/radiobutton';
import { TriStateCheckboxModule } from 'primeng/tristatecheckbox';
import { CheckboxModule } from 'primeng/checkbox';
import { InputGroupModule } from 'primeng/inputgroup';
import { InputGroupAddonModule } from 'primeng/inputgroupaddon';

import { InputSwitchModule } from 'primeng/inputswitch';
import { InputNumberModule } from "primeng/inputnumber";

 // Importa FormsModule
import { MultiSelectModule } from 'primeng/multiselect';  // Importa MultiSelectModule
import { AutoCompleteModule } from 'primeng/autocomplete';

import { MessagesModule } from 'primeng/messages';


@NgModule({
  declarations: [
    ReservasComponent,
  ],
  imports: [
    CommonModule,
    ReservasRouterModule,
    ButtonModule,
    CardModule,
    TagModule,
    TooltipModule,
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
    InputNumberModule,
    MultiSelectModule,
    AutoCompleteModule,
    MessagesModule


  ]
})
export class ReservasModule { }
