import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { HuespedesComponent } from './huespedes.component';


@NgModule({
    imports: [RouterModule.forChild([
        { path: '', component: HuespedesComponent }
    ])],
    exports: [RouterModule]
})
export class HuespedesRouterModule { }
