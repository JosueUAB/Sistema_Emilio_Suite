import { Component } from '@angular/core';
import { ReporteService } from '../modulos/reportes/service/reportes.service';

@Component({
  selector: 'app-tablero',

  templateUrl: './tablero.component.html',
})
export class TableroComponent {

    reportes: any;
    errorMessage: string | null = null;
    huespedesPorNacionalidad: any;
errorMessageHuespedesPorNacionalidad: string | null = null;
colors: string[] = [
                    'bg-orange-500',
                    'bg-cyan-500',
                    'bg-pink-500',
                    'bg-green-500',
                    'bg-purple-500',
                    'bg-teal-500'];

    ngOnInit(): void {
        this.obtenerReportesDashboard();
        this.obtenerHuespedesPorNacionalidad();

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

      obtenerHuespedesPorNacionalidad(): void {
        this._reporteService.obtenerHuespedesPorNacionalidad().subscribe({
          next: (response) => {
            this.huespedesPorNacionalidad = response.huespedes_por_nacionalidad;
            console.log(this.huespedesPorNacionalidad)
            this.errorMessageHuespedesPorNacionalidad = null;
          },
          error: (error) => {
            this.errorMessageHuespedesPorNacionalidad =
              error.message || 'Ocurrió un error al obtener los huéspedes por nacionalidad.';
            console.error(error);
          },
        });
      }

      getColor(index: number): string {
        return this.colors[index % this.colors.length]; // Usa el operador % para ciclar los colores
      }
      

}
