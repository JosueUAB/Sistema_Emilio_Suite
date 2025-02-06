import { Component } from '@angular/core';
import { RolesService } from 'src/app/services/roles.service';
import { SIDEBAR } from 'src/environments/environment';

@Component({
  selector: 'app-roles',
  templateUrl: './roles.component.html',

})
export class RolesComponent {
    products:[] = [];
    cols: any[] = [];
    productDialog: boolean = false;
    deleteProductsDialog: boolean = false;






    search:string = '';
    ROLES:any=[];
    SIDEBAR:any = SIDEBAR;
    permisions:any = [];
    name:string = '';

    selectedPermissions:[]=[];



    constructor( private _rolesService:RolesService){


    }

ngOnInit(): void {
    //Called after the constructor, initializing input properties, and the first call to ngOnChanges.
    //Add 'implements OnInit' to the class.
    this.listarRoles();

}

openNew() {
 
    this.productDialog = true;
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

        if (!this.name) {
            console.log('el nombrees requerido');



        }
        if(this.permisions.length == 0){
            console.log('se debe seleccionar al menos un permiso');

        }

        let data= {
            name: this.name,
            permisions: this.permisions

        }
        this._rolesService.registrarRol(data).subscribe((resp:any)=>{
            console.log(resp);
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


