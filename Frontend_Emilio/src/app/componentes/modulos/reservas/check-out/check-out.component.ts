import { Component } from '@angular/core';
import { ReservasService } from '../service/reservas.service';
import { MessageService, PrimeNGConfig } from 'primeng/api';
import { DialogService } from 'primeng/dynamicdialog';

@Component({
  selector: 'app-check-out',
  templateUrl: './check-out.component.html',
  providers: [DialogService, MessageService],
})
export class CheckOutComponent {
  habitacionesOcupadas: any[] = []; // Todas las habitaciones ocupadas
  habitacionesOcupadasFiltradas: any[] = []; // Habitaciones filtradas
  errorMessage: string | null = null;
  currentDate: string = '';
  currentTime: string = '';

  selectedPiso: number | null = null; // Filtro por piso
  numeroHabitacion: number | null = null; // Filtro por número de habitación
  codigoReserva: string | null = null; // Filtro por código de reserva
  documentoHuesped: string | null = null; // Filtro por documento del huésped

  numerosPiso: number[] = []; // Lista de números de piso para el dropdown

  constructor(private _reservaService: ReservasService) {}

  ngOnInit(): void {
    this.updateTime();
    this.obtenerHabitacionesOcupadasParaCheckout();
  }

  // Actualizar la hora y fecha actual
  updateTime() {
    const options: Intl.DateTimeFormatOptions = {
      timeZone: 'America/La_Paz',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
      hour12: false,
    };
    const dateOptions: Intl.DateTimeFormatOptions = {
      timeZone: 'America/La_Paz',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    };
    this.currentTime = new Date().toLocaleTimeString('es-BO', options);
    this.currentDate = new Date().toLocaleDateString('es-BO', dateOptions);
  }

  // Obtener las habitaciones ocupadas para checkout
  obtenerHabitacionesOcupadasParaCheckout(): void {
    this._reservaService.obtenerHabitacionesOcupadasParaCheckout().subscribe({
      next: (response) => {
        this.habitacionesOcupadas = response.habitaciones;
        this.habitacionesOcupadasFiltradas = [...this.habitacionesOcupadas]; // Inicializar con todas las habitaciones
        this.extraerNumerosPiso(); // Extraer números de piso únicos
        console.log('Habitaciones ocupadas para checkout:', this.habitacionesOcupadas);
        this.errorMessage = null;
      },
      error: (error) => {
        this.errorMessage = error.message || 'Ocurrió un error al obtener las habitaciones ocupadas para checkout.';
        console.error(error);
      },
    });
  }

  // Extraer números de piso únicos
  extraerNumerosPiso() {
    const pisosUnicos = new Set<number>();
    this.habitacionesOcupadas.forEach((habitacion) => {
      pisosUnicos.add(habitacion.numero_piso);
    });
    this.numerosPiso = Array.from(pisosUnicos).sort((a, b) => a - b); // Ordenar de menor a mayor
  }

  // Filtrar habitaciones
  filtrarHabitaciones() {
    this.habitacionesOcupadasFiltradas = this.habitacionesOcupadas.filter((habitacion) => {
      const pisoMatch = this.selectedPiso ? habitacion.numero_piso === this.selectedPiso : true;
      const numeroMatch = this.numeroHabitacion ? habitacion.numero === this.numeroHabitacion : true;
      const codigoReservaMatch = this.codigoReserva
        ? habitacion.reservas[0].id === parseInt(this.codigoReserva)
        : true;
      const documentoHuespedMatch = this.documentoHuesped
        ? habitacion.reservas[0].huesped.numero_documento === this.documentoHuesped
        : true;

      return pisoMatch && numeroMatch && codigoReservaMatch && documentoHuespedMatch;
    });
  }
}
