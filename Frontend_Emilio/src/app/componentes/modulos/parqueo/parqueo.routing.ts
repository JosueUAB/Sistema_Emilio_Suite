import { Routes, RouterModule } from '@angular/router';

import { NgModule } from '@angular/core';
import { ParqueoComponent } from './parqueo.component';
;

@NgModule({
    imports: [RouterModule.forChild([
        { path: '', component: ParqueoComponent }
    ])],
    exports: [RouterModule]
})
export class ParqueoRouterModule { }
