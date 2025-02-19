import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { UsuariosComponent } from './usuarios.component';
import { TableModule } from 'primeng/table';
import { DialogModule } from 'primeng/dialog';
import { ButtonModule } from 'primeng/button';
import { InputTextModule } from 'primeng/inputtext';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { ToastModule } from 'primeng/toast';
import { MessageService } from 'primeng/api';
import { UsuariosRouterRouterModule } from './usuarios.routing';
import { ToolbarModule } from 'primeng/toolbar';
import { CheckboxModule } from 'primeng/checkbox';
import { DropdownModule } from 'primeng/dropdown';
import { RadioButtonModule } from 'primeng/radiobutton';
import { InputTextareaModule } from 'primeng/inputtextarea';
import { FileUploadModule } from 'primeng/fileupload';
import { PasswordModule } from 'primeng/password';
@NgModule({
  declarations: [UsuariosComponent],
  imports: [
    CommonModule,
    UsuariosRouterRouterModule,
    TableModule,
    DialogModule,
    ButtonModule,
    InputTextModule,
    FormsModule,
    ReactiveFormsModule,
    ToastModule,
    ToolbarModule,
    CheckboxModule,
    DropdownModule,
    RadioButtonModule,
    InputTextareaModule,   
    FileUploadModule,
    PasswordModule
  ],
  providers: [MessageService]
})
export class UsuariosModule { }
