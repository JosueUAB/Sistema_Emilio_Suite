import { Component } from '@angular/core';
import { ReporteService } from '../modulos/reportes/service/reportes.service';

@Component({
  selector: 'app-tablero',

  templateUrl: './tablero.component.html',
})
export class TableroComponent {

    reportes: any;
    errorMessage: string | null = null;

    ngOnInit(): void {
        this.obtenerReportesDashboard();

    }

    constructor(
        private _reporteService: ReporteService,

    ){

    }


    obtenerReportesDashboard(): void {
        this._reporteService.obtenerReportesDashboard().subscribe({
          next: (response) => {
            this.reportes = response.reportes;
            console.log(this.reportes)
            this.errorMessage = null;
          },
          error: (error) => {
            this.errorMessage = error.message || 'Ocurrió un error al obtener los reportes.';
            console.error(error);
          }
        });
      }

}
