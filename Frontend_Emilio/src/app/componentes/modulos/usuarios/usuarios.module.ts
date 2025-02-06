import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { UsuariosRouterRouterModule } from './usuarios.routing';
import { UsuariosComponent } from './usuarios.component';



@NgModule({
  declarations: [
    UsuariosComponent
  ],
  imports: [
    CommonModule,
    UsuariosRouterRouterModule
  ]
})
export class UsuariosModule { }
