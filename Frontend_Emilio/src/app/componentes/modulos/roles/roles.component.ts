import { JsonPipe } from '@angular/common';
import { Component } from '@angular/core';
import { FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';

import { MessageService } from 'primeng/api';
import { Toast } from 'primeng/toast';
import { RolesService } from 'src/app/services/roles.service';
import { SharedService } from 'src/app/services/SharedService.service';
import { SIDEBAR } from 'src/environments/environment';
import mensaje from 'sweetalert2'
@Component({
  selector: 'app-roles',
  templateUrl: './roles.component.html',
  styleUrl: './roles.component.scss',

  providers: [MessageService],
})
export class RolesComponent {
    editDialog: boolean = false;
    editForm: FormGroup;
    cols: any[] = [];
    productDialog: boolean = false;
    deleteProductsDialog: boolean = false;

    selectedPermissions: { [key: string]: boolean } = {};


    permisosvacio=true;

    products: any= [];
    selectedRoleId:any;



    search:string = '';
    ROLES:any=[];
    SIDEBAR:any = SIDEBAR;
    permisions:any = [];
    name:string = '';
    myGroup:FormGroup;
    rolesForm:FormGroup;
    // selectedPermissions:[]=[];
    selectedPermissionsState: Record<string, boolean> = {};


    constructor( private _rolesService:RolesService,
        private fb: FormBuilder,
        private toast : MessageService,
        private _sharedService : SharedService,
    ){


    this.myGroup = new FormGroup({
        name: new FormControl('', [Validators.required])  // Validación personalizada para nombre
    });

    this.editForm = this.fb.group({
        name: ['', [Validators.required]],
        permissions: [[]] // Array vacío para los permisos seleccionados.
      });


    }

ngOnInit(): void {
    //Called after the constructor, initializing input properties, and the first call to ngOnChanges.
    //Add 'implements OnInit' to the class.
    this.listarRoles();
    this.cols = [
        { field: 'id', header: 'Código' },
        { field: 'name', header: 'Rol' },
        { field: 'permission_pluck', header: 'Permisos' },
        { field: 'created_at', header: 'Fecha de Registro' },
        { field: 'actions', header: 'Acciones' },
      ];


}
    // `event.target.value` obtiene el valor de la caja de texto de búsqueda
    // `event.target.value` obtiene el valor de la caja de texto de búsqueda
 // Cargar los detalles del rol a editar



// En el método loadRoleDetails
loadRoleDetails(roleId: number) {
    this._rolesService.getRoleById(roleId).subscribe((role) => {
      if (role) {
        this.editForm.patchValue({
          name: role.role.name,
        });

        // Inicializa el estado de los permisos seleccionados
        this.selectedPermissionsState = {}; // Limpiar el estado anterior
        role.role.permission_pluck.forEach((permiso: string) => {
          this.selectedPermissionsState[permiso] = true; // Marcamos como seleccionado
        });

        console.log('Permisos seleccionados:', this.selectedPermissionsState);

        this.editDialog = true; // Mostrar el modal
      }
    });
  }





  // Lógica para agregar o quitar permisos
 // Modificar el método togglePermission para manejar los cambios de estado de los checkboxes
 togglePermission(event: any, permiso: string) {
    this.selectedPermissionsState[permiso] = event.checked;
    console.log('Estado de permisos:', this.selectedPermissionsState);
}


  editRole(roleId: number) {
    this.selectedRoleId = roleId; // Guardar el ID del rol seleccionado
    this.loadRoleDetails(roleId); // Cargar los detalles del rol

  }

  openEditDialog(role: any) {
    this.selectedPermissions = role.permisos; // Asegúrate de que 'role.permisos' sea un arreglo de permisos seleccionados
    this.editForm.setValue({
      name: role.name,
      // Otras propiedades si las tienes
    });
    this.editDialog = true;
  }


  // Actualizar el rol
 // Actualizar el rol
//  updateRole() {
//     if (this.editForm.valid) {
//       // Filtrar solo los permisos seleccionados (los que tienen valor true)
//       const selectedPermissions = Object.keys(this.selectedPermissionsState)
//         .filter(permiso => this.selectedPermissionsState[permiso] === true);

//       const updatedRole = {
//         name: this.editForm.value.name, // Nombre del rol
//         permissions: selectedPermissions // Permisos seleccionados
//       };

//       // Verificar que los permisos están siendo enviados correctamente
//       console.log('Permisos seleccionados:', selectedPermissions);

//       // Llamada al servicio para actualizar el rol
//       this._rolesService.updateRol(this.selectedRoleId, updatedRole).subscribe((response) => {
//         if (response) {
//           this.toast.add({ severity: 'success', summary: 'Éxito', detail: 'Rol actualizado con éxito' });
//           this.editDialog = false; // Cerrar el modal de edición
//           this.listarRoles(); // Cargar los roles actualizados
//         } else {
//           this.toast.add({ severity: 'error', summary: 'Error', detail: 'No se pudo actualizar el rol' });
//         }
//         console.log(response); // Ver respuesta del backend
//       });
//     } else {
//       console.log('El formulario no es válido');
//     }
//   }
updateRole() {
    if (this.editForm.valid) {
      // Filtrar solo los permisos seleccionados (los que tienen valor true)
      const selectedPermissions = Object.keys(this.selectedPermissionsState)
        .filter(permiso => this.selectedPermissionsState[permiso] === true);
      console.log('Permisos seleccionadosxxxx:', selectedPermissions);

      const updatedRole = {
        name: this.editForm.value.name,  // Nombre del rol
        permissions: selectedPermissions, // Cambié 'permission' a 'permissions'
      };

      // Verificar que los permisos están siendo enviados correctamente
      console.log('Permisos seleccionados:', selectedPermissions);

      // Llamada al servicio para actualizar el rol
      this._rolesService.updateRol(this.selectedRoleId, updatedRole).subscribe((response) => {
        if (response) {
          this.toast.add({ severity: 'success', summary: 'Éxito', detail: 'Rol actualizado con éxito' });
          this.editDialog = false;  // Cerrar el modal de edición
          this.listarRoles();  // Cargar los roles actualizados
        } else {
          this.toast.add({ severity: 'error', summary: 'Error', detail: 'No se pudo actualizar el rol' });
        }
        console.log(response);  // Ver respuesta del backend
      });
    } else {
      console.log('El formulario no es válido');
    }
  }

  // Eliminar rol
eliminarRol(roleId: number) {
    // Confirmación de eliminación antes de proceder
    mensaje.fire({
      title: '¿Estás seguro?',
      text: '¡Este rol será eliminado permanentemente!',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonText: 'Sí, eliminar',
      cancelButtonText: 'Cancelar',
    }).then((result) => {
      if (result.isConfirmed) {
        // Si el usuario confirma la eliminación
        this._rolesService.eliminarRol(roleId).subscribe((response) => {
          if (response) {
            this.toast.add({ severity: 'success', summary: 'Éxito', detail: 'Rol eliminado con éxito' });
            this.listarRoles(); // Recargar los roles después de la eliminación
          } else {
            this.toast.add({ severity: 'error', summary: 'Error', detail: 'No se pudo eliminar el rol' });
          }
        });
      }
    });
  }


    loadRoles() {
        throw new Error('Metodo no implementado.');
    }




  // Cerrar el modal de edición

  closeEditDialog() {
    this.editForm.reset();
    this.selectedPermissionsState = {}; // Limpiar los permisos seleccionados
    this.editDialog = false;
  }

// Función que maneja el filtro global


onGlobalFilter(dt: any, event: Event) {
    // `event.target.value` obtiene el valor de la caja de texto de búsqueda
    dt.filterGlobal((event.target as HTMLInputElement).value, 'contains');
}


openNew() {

    this.productDialog = true;
}
hideDialog(){
    this.productDialog = false;
   console.log(this.productDialog)
   this.permisions.splice(0, this.permisions.length);
   console.log('dialogocerrado')

}

showErrorViaToast() {

    this.toast.add({ key: 'tst', severity: 'error', summary: 'Error Message', detail: 'Validation failed' });
}



    addPermission(permiso: string) {
        const index = this.permisions.indexOf(permiso); // Encuentra el índice del permiso en el arreglo

        if (index === -1) {
          // Si el permiso no está, lo agregamos al arreglo
          this.permisions.push(permiso);
        } else {
          // Si ya está, lo eliminamos del arreglo
          this.permisions.splice(index, 1);
        }

        console.log(this.permisions); // Para ver qué permisos están seleccionados
      }


      store(){

        if (!this.myGroup.value.name) {
            console.log('el nombre es requerido');
            this.toast.add({ severity: 'error', summary: 'ERROR', detail: 'el nombre es requerido' });
        }
        if(this.permisions.length == 0){
            console.log('se debe seleccionar al menos un permiso');
            this.toast.add({ severity: 'error', summary: 'ERROR', detail: 'e debe seleccionar al menos un permiso' });
            this.permisosvacio=true;
        }


        let data= {
            name:this.myGroup.value.name,
            permisions: this.permisions
        }
        this._rolesService.registrarRol(data).subscribe((resp:any)=>{
            console.log(resp);
            if (resp.message===403) {
                this.toast.add({ severity: 'error', summary: 'ERROR', detail: 'El Rol ya Existe' });
                console.log('toast error 403')
               }
            if (resp.message  !=403) {
                this.toast.add({ severity: 'success', summary: 'Rol Registrado Exitosamente', detail: 'exito' });
                this.listarRoles();
                this.myGroup.reset();
                this.hideDialog();
                //**vaciar el arrary permission */



            }



        })

      }

      //**listar roles */

      listarRoles(page=1){

        this._rolesService.ListarRoles(page,this.search).subscribe((resp:any)=>{
           console.log(resp);


           this.ROLES = resp;


        })

      }



}


