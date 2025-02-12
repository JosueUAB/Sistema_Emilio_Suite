// edit-rol.component.ts
import { Component, OnInit } from '@angular/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { ButtonModule } from 'primeng/button';
import { CheckboxModule } from 'primeng/checkbox';
import { DialogModule } from 'primeng/dialog';
import { DropdownModule } from 'primeng/dropdown';
import { FileUploadModule } from 'primeng/fileupload';
import { InputNumberModule } from 'primeng/inputnumber';
import { InputTextModule } from 'primeng/inputtext';
import { InputTextareaModule } from 'primeng/inputtextarea';
import { MessageModule } from 'primeng/message';
import { MessagesModule } from 'primeng/messages';
import { RadioButtonModule } from 'primeng/radiobutton';
import { RatingModule } from 'primeng/rating';
import { RippleModule } from 'primeng/ripple';
import { TableModule } from 'primeng/table';
import { ToastModule } from 'primeng/toast';
import { ToolbarModule } from 'primeng/toolbar';
import { RolesService } from 'src/app/services/roles.service'; // Servicio para obtener datos del rol
import { SharedService } from 'src/app/services/SharedService.service';

@Component({
  selector: 'app-edit-rol',
  templateUrl: './edit-rol.component.html',
  styleUrls: ['./edit-rol.component.scss'],
  standalone: true,
  imports:[
    TableModule,
            FileUploadModule,
            FormsModule,
            ButtonModule,
            RippleModule,
            ToastModule,
            ToolbarModule,
            RatingModule,
            InputTextModule,
            InputTextareaModule,
            DropdownModule,
            RadioButtonModule,
            InputNumberModule,
            DialogModule,
            CheckboxModule,
            MessagesModule,
            InputTextModule,
            MessagesModule,
            MessageModule,
            ReactiveFormsModule,
            ToastModule,

  ],
})
export class EditRolComponent implements OnInit {
  roleId: number | null = null;
  productDialog: boolean = false;

  constructor(
    private sharedService: SharedService,
    private rolesService: RolesService,
  ) {}

  ngOnInit(): void {
    // Suscríbete a los cambios del ID del rol
    this.sharedService.currentRoleId.subscribe((roleId) => {
      this.roleId = roleId;
      if (roleId !== null) {
        this.loadRoleData(roleId); // Carga los datos del rol
      }
    });

    // Suscríbete a los cambios para abrir/cerrar el modal
    this.sharedService.openModal.subscribe((isOpen) => {
      this.productDialog = isOpen;
    });
  }

  loadRoleData(roleId: number) {
    this.rolesService.getRoleById(roleId).subscribe((roleData) => {
      // Aquí puedes cargar los datos del rol en el formulario
      console.log('Datos del rol:', roleData);
    });
  }

  hideDialog() {
    this.sharedService.setOpenModal(false); // Cierra el modal
  }

  // roles.service.ts
}
