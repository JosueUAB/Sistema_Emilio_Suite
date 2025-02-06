import { Routes, RouterModule } from '@angular/router';

import { NgModule } from '@angular/core';
import { ReportesComponent } from './reportes.component';

@NgModule({
    imports: [RouterModule.forChild([
        { path: '', component: ReportesComponent }
    ])],
    exports: [RouterModule]
})
export class ReportesRouterModule { }
