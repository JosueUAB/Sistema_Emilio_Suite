import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RolesRouterModule } from './roles.routing';
import { RolesComponent } from './roles.component';



@NgModule({
  declarations: [
    RolesComponent

  ],
  imports: [
    CommonModule,
    RolesRouterModule,

  ]
})
export class RolesModule { }
