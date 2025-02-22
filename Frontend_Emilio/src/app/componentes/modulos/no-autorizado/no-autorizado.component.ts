import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { RouterModule } from '@angular/router';
import { ButtonModule } from 'primeng/button';
import { environment } from 'src/environments/environment';

@Component({
  selector: 'app-no-autorizado',
  standalone: true,
  imports: [CommonModule,
            RouterModule,
            ButtonModule
  ],
  templateUrl: './no-autorizado.component.html',
})
export class NoAutorizadoComponent {

    logo:string= environment.logo_dark;

}
