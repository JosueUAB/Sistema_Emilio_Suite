
// import { Component, OnInit } from '@angular/core';
// import { HabitacionesService } from '../habitaciones/service/habitaciones.service';

// @Component({
//   selector: 'app-reservas',
//   templateUrl: './reservas.component.html',
// })
// export class ReservasComponent implements OnInit {
//   listaHabitaciones: any[] = [];
//   listaHabitacionesFiltradas: any[] = [];
//   selectedEstados: string[] = []; // Cambiado a un array de strings para seleccionar múltiples estados

//   estados: any[] = [
//     { label: 'Disponible', value: 'disponible' },
//     { label: 'Ocupado', value: 'ocupado' },
//     { label: 'Reservado', value: 'reservado' },
//     { label: 'Mantenimiento', value: 'mantenimiento' },
//     { label: 'Limpieza', value: 'limpieza' }
//   ];
//   selectedEstado: string = '';
//   numeroHabitacion: string = '';
//   precio: any | null = null;
//   cantidadCamas: any | null = null;
//   maxPersonas: any | null = null;
//   precioMinimo: number | null = null;
//   precioMaximo: number | null = null;

//   constructor(private _HabitacionesService: HabitacionesService) {}

//   ngOnInit(): void {
//     this.GetHabitaciones();
//   }

//   GetHabitaciones() {
//     this._HabitacionesService.obtenerHabitaciones().subscribe((data: any) => {
//       this.listaHabitaciones = data.habitaciones;
//       this.listaHabitacionesFiltradas = [...this.listaHabitaciones];
//     });
//   }


// filtrarHabitaciones() {
//     this.listaHabitacionesFiltradas = this.listaHabitaciones.filter(habitacion => {
//       // Filtrar por estado: verificar si el estado de la habitación está en los estados seleccionados
//       const coincideEstado = this.selectedEstados.length === 0 || this.selectedEstados.includes(habitacion.estado);

//      // Filtrar por número de habitación (buscar coincidencias parciales)
// const coincideNumero = !this.numeroHabitacion || habitacion.numero.toString().includes(this.numeroHabitacion);


//       // Filtrar por precio
//       const precioHabitacion = Math.floor(parseFloat(habitacion.costo)); // Ignorar decimales
//       const coincidePrecioMinimo = !this.precioMinimo || precioHabitacion >= this.precioMinimo;
//       const coincidePrecioMaximo = !this.precioMaximo || precioHabitacion <= this.precioMaximo;

//       // Filtrar por cantidad de camas
//       const coincideCamas = !this.cantidadCamas || habitacion.cantidad_camas === this.cantidadCamas;

//       // Filtrar por máximo de personas
//       const coincidePersonas = !this.maxPersonas || habitacion.limite_personas === this.maxPersonas;

//       // Retornar si todos los filtros coinciden
//       return coincideEstado && coincideNumero && coincidePrecioMinimo && coincidePrecioMaximo && coincideCamas && coincidePersonas;
//     });
//   }

// }
import { Component, OnInit } from '@angular/core';
import { HabitacionesService } from '../habitaciones/service/habitaciones.service';
import { LayoutService } from 'src/app/layout/service/app.layout.service';

@Component({
  selector: 'app-reservas',
  templateUrl: './reservas.component.html',
})
export class ReservasComponent implements OnInit {
  listaHabitaciones: any[] = [];
  listaHabitacionesFiltradas: any[] = [];
  selectedEstados: string[] = []; // Cambiado a un array de strings para seleccionar múltiples estados
  selectedPiso: number | null = null; // Para el filtro por piso
  selectedTipoHabitacion: number | null = null; // Para el filtro por tipo de habitación

  estados: any[] = [
    { label: 'Disponible', value: 'disponible' },
    { label: 'Ocupado', value: 'ocupado' },
    { label: 'Reservado', value: 'reservado' },
    { label: 'Mantenimiento', value: 'mantenimiento' },
    { label: 'Limpieza', value: 'limpieza' }
  ];

  numerosPiso: { label: string, value: number }[] = []; // Lista de pisos únicos con formato {label, value}
  tiposHabitacion: { label: string, value: number }[] = []; // Lista de tipos de habitación con formato {label, value}

  selectedEstado: string = '';
  numeroHabitacion: string = '';
  precio: any | null = null;
  cantidadCamas: any | null = null;
  maxPersonas: any | null = null;
  precioMinimo: number | null = null;
  precioMaximo: number | null = null;

  constructor(private _HabitacionesService: HabitacionesService,
                public _layoutService: LayoutService,
  ) {}

  ngOnInit(): void {
    this.GetHabitaciones();
  }

  GetHabitaciones() {
    this._HabitacionesService.obtenerHabitaciones().subscribe((data: any) => {
      this.listaHabitaciones = data.habitaciones;
      this.listaHabitacionesFiltradas = [...this.listaHabitaciones];

      // Obtener los números de piso únicos con formato {label, value}
      this.numerosPiso = this.listaHabitaciones
      .map(h => h.numero_piso)
      .filter((value, index, self) => self.indexOf(value) === index) // Obtener valores únicos
      .map(piso => ({ label: 'Piso ' + piso, value: piso }))
      .sort((a, b) => a.value - b.value);

      // Obtener los tipos de habitación únicos con formato {label, value}
      this.tiposHabitacion = this.listaHabitaciones
        .map(h => h.tipo_habitacion)
        .filter((value, index, self) => self.findIndex(t => t.id === value.id) === index) // Obtener valores únicos
        .map(tipo => ({ label: tipo.nombre, value: tipo.id }));
    });
  }

  filtrarHabitaciones() {
    this.listaHabitacionesFiltradas = this.listaHabitaciones.filter(habitacion => {
      // Filtrar por estado
      const coincideEstado = this.selectedEstados.length === 0 || this.selectedEstados.includes(habitacion.estado);

      // Filtrar por número de habitación
      const coincideNumero = !this.numeroHabitacion || habitacion.numero.toString().includes(this.numeroHabitacion);

      // Filtrar por precio
      const precioHabitacion = Math.floor(parseFloat(habitacion.costo));
      const coincidePrecioMinimo = !this.precioMinimo || precioHabitacion >= this.precioMinimo;
      const coincidePrecioMaximo = !this.precioMaximo || precioHabitacion <= this.precioMaximo;

      // Filtrar por cantidad de camas
      const coincideCamas = !this.cantidadCamas || habitacion.cantidad_camas === this.cantidadCamas;

      // Filtrar por máximo de personas
      const coincidePersonas = !this.maxPersonas || habitacion.limite_personas === this.maxPersonas;

      // Filtrar por número de piso
      const coincidePiso = this.selectedPiso === null || habitacion.numero_piso === this.selectedPiso;

      // Filtrar por tipo de habitación
      const coincideTipoHabitacion = this.selectedTipoHabitacion === null || habitacion.tipo_habitacion.id === this.selectedTipoHabitacion;

      // Retornar si todos los filtros coinciden
      return coincideEstado && coincideNumero && coincidePrecioMinimo && coincidePrecioMaximo && coincideCamas && coincidePersonas && coincidePiso && coincideTipoHabitacion;
    });
  }
}
