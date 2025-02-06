import { Routes, RouterModule } from '@angular/router';

import { NgModule } from '@angular/core';
import { UsuariosComponent } from './usuarios.component';

@NgModule({
    imports: [RouterModule.forChild([
        { path: '', component: UsuariosComponent }
    ])],
    exports: [RouterModule]
})
export class UsuariosRouterRouterModule { }
