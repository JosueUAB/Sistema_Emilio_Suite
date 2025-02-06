import { Routes, RouterModule } from '@angular/router';

import { NgModule } from '@angular/core';
import { RecordatoriosComponent } from './recordatorios.component';

@NgModule({
    imports: [RouterModule.forChild([
        { path: '', component: RecordatoriosComponent }
    ])],
    exports: [RouterModule]
})
export class RecordatoriosRouterModule { }
