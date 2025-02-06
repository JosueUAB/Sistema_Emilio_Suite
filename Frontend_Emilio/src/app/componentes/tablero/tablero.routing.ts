import { Routes, RouterModule } from '@angular/router';
import { TableroComponent } from './tablero.component';
import { NgModule } from '@angular/core';


@NgModule({
    imports: [RouterModule.forChild([
        { path: '', component: TableroComponent }
    ])],
    exports: [RouterModule]
})

export class TableroRoutingModule { }
