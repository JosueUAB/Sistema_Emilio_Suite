
import { Component, OnInit } from '@angular/core';
import { ReporteService } from '../modulos/reportes/service/reportes.service';
import { ChartModule } from 'primeng/chart';

@Component({
  selector: 'app-tablero',
  templateUrl: './tablero.component.html',
})
export class TableroComponent implements OnInit {

  reportes: any;
  errorMessage: string | null = null;
  huespedesPorNacionalidad: any;
  errorMessageHuespedesPorNacionalidad: string | null = null;
  clientesIngresosDiarios: any;
  errorMessageClientesIngresosDiarios: string | null = null;
  ClientesIngresosMensuales: any;
  errorMessageClientesIngresosMensuales: string | null = null;

  // Datos para PrimeNG Charts
  dataDiarios: any;
  dataMensuales: any;
  options: any;

  colors: string[] = [
    'bg-orange-500',
    'bg-cyan-500',
    'bg-pink-500',
    'bg-green-500',
    'bg-purple-500',
    'bg-teal-500'
  ];

  constructor(private _reporteService: ReporteService) {}

  ngOnInit(): void {
    this.obtenerReportesDashboard();
    this.obtenerHuespedesPorNacionalidad();
    this.obtenerClientesPorDiaYIngresosDiarios();
    this.obtenerClientesPorSemanaYIngresosSemanales();
    this.configurarOpcionesChart();
  }

  obtenerReportesDashboard(): void {
    this._reporteService.obtenerReportesDashboard().subscribe({
      next: (response) => {
        this.reportes = response.reportes;
        console.log(this.reportes);
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
        console.log(this.huespedesPorNacionalidad);
        this.errorMessageHuespedesPorNacionalidad = null;
      },
      error: (error) => {
        this.errorMessageHuespedesPorNacionalidad = error.message || 'Ocurrió un error al obtener los huéspedes por nacionalidad.';
        console.error(error);
      },
    });
  }

  obtenerClientesPorDiaYIngresosDiarios(): void {
    this._reporteService.obtenerClientesPorDiaYIngresosDiarios().subscribe({
      next: (response) => {
        this.clientesIngresosDiarios = response;
        console.log(this.clientesIngresosDiarios);
        this.errorMessageClientesIngresosDiarios = null;
        this.prepararDatosDiariosChart();
      },
      error: (error) => {
        this.errorMessageClientesIngresosDiarios = error.message || 'Ocurrió un error al obtener los clientes e ingresos diarios.';
        console.error(error);
      }
    });
  }

  obtenerClientesPorSemanaYIngresosSemanales(): void {
    this._reporteService.obtenerClientesPorSemanaYIngresosMensuales().subscribe({
      next: (response) => {
        this.ClientesIngresosMensuales = response;
        console.log(this.ClientesIngresosMensuales);
        this.errorMessageClientesIngresosMensuales = null;
        this.prepararDatosMensualesChart();
      },
      error: (error) => {
        this.errorMessageClientesIngresosMensuales = error.message || 'Ocurrió un error al obtener los clientes e ingresos semanales.';
        console.error(error);
      }
    });
  }

  prepararDatosDiariosChart(): void {
    this.dataDiarios = {
      labels: this.clientesIngresosDiarios.labels,
      datasets: [
        {
          label: this.clientesIngresosDiarios.datasets[0].label,
          data: this.clientesIngresosDiarios.datasets[0].data,
          borderColor: '#42A5F5',
          tension: 0.4,
          fill: false,
          type: 'line'
        },
        {
          label: this.clientesIngresosDiarios.datasets[1].label,
          data: this.clientesIngresosDiarios.datasets[1].data,
          backgroundColor: '#66BB6A',
          fill: false,
          type: 'bar',
          hidden: true // Oculto por defecto
        },
        {
          label: this.clientesIngresosDiarios.datasets[2].label,
          data: this.clientesIngresosDiarios.datasets[2].data,
          backgroundColor: '#FFA726',
          fill: false,
          type: 'bar',
          hidden: true // Oculto por defecto
        }
      ]
    };
  }


  prepararDatosMensualesChart(): void {
    this.dataMensuales = {
      labels: this.ClientesIngresosMensuales.labels,
      datasets: [
        {
          label: this.ClientesIngresosMensuales.datasets[0].label,
          data: this.ClientesIngresosMensuales.datasets[0].data,
          borderColor: '#42A5F5',
          tension: 0.4,
          fill: false,
          type: 'line'
        },
        {
          label: this.ClientesIngresosMensuales.datasets[1].label,
          data: this.ClientesIngresosMensuales.datasets[1].data,
          backgroundColor: '#66BB6A',
          type: 'bar',
          hidden: true // Oculto por defecto
        },
        {
          label: this.ClientesIngresosMensuales.datasets[2].label,
          data: this.ClientesIngresosMensuales.datasets[2].data,
          backgroundColor: '#FFA726',
          type: 'bar'
        }
      ]
    };
  }

configurarOpcionesChart(): void {
    const documentStyle = getComputedStyle(document.documentElement);


    this.options = {
      maintainAspectRatio: false, // Permite ajustar el tamaño manualmente
      aspectRatio: 0.8, // Relación de aspecto más pequeña
      plugins: {
        legend: {
          labels: {

          },
        },
      },
      scales: {
        x: {
          ticks: {

          },
          grid: {

          },
        },
        y: {
          ticks: {

          },
          grid: {

          },
        },
      },
    };
  }

  getColor(index: number): string {
    return this.colors[index % this.colors.length];
  }
}
