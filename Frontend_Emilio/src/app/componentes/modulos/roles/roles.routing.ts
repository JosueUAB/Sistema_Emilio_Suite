import { RouterModule } from '@angular/router';

import { NgModule } from '@angular/core';
import { RolesComponent } from './roles.component';

@NgModule({
    imports: [RouterModule.forChild([
        { path: '', component: RolesComponent }
    ])],
    exports: [RouterModule]
})
export class RolesRouterModule { }
