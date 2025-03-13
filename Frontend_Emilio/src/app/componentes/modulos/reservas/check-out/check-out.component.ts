import { Component } from '@angular/core';
import { ReservasService } from '../service/reservas.service';
import { MessageService, PrimeNGConfig } from 'primeng/api';
import { DialogService } from 'primeng/dynamicdialog';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';

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
  pagoPendienteForm:FormGroup;
  numerosPiso: number[] = []; // Lista de números de piso para el dropdown
  ModalCHECKOUT:boolean=false;


  checkoutInfo: any;
  idReserva: number;
  constructor(
                private _reservaService: ReservasService,
                private fb :FormBuilder,
                private messageService: MessageService,

  ) {
     this.pagoPendienteForm = this.fb.group({
                monto_pagado: [null, [Validators.required, Validators.min(1)]], // Monto a pagar
                metodo_de_pago: ['efectivo', Validators.required], // Método de pago
              });
  }

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


  completarPago(reservaId: number) {
    if (this.pagoPendienteForm.invalid) {
      // Mostrar mensaje de error si el formulario es inválido
      this.messageService.add({
        severity: 'error',
        summary: 'Error',
        detail: 'Por favor, complete todos los campos correctamente.',
      });
      return;
    }

    const { monto_pagado, metodo_de_pago } = this.pagoPendienteForm.value;

    // Llamar al servicio para completar el pago
    this._reservaService.completarPago(reservaId, monto_pagado, metodo_de_pago).subscribe({
      next: (respuesta) => {
        console.log('Pago completado exitosamente:', respuesta);
        this.messageService.add({
          severity: 'success',
          summary: 'Éxito',
          detail: 'Pago completado exitosamente.',
        });
        this.pagoPendienteForm.reset();
        this.cerrarModalCheckOut();


      },
      error: (error) => {
        console.error('Error al completar el pago:', error);
        this.messageService.add({
          severity: 'error',
          summary: 'Error',
          detail: 'Ocurrió un error al completar el pago.',
        });
      },
    });
  }

  obtenerDetallesHabitacion(idReserva: number): void {
    console.log('El ID que se manda es: ', idReserva);

    this._reservaService.obtenerHabitacionOcupadaPorIdReserva(idReserva).subscribe(
        (response) => {
            if (response) {
                this.checkoutInfo  = response.reserva;
                console.log('Respuesta obtenida:', this.checkoutInfo );
                this.ModalCHECKOUT=true;
            } else {
                console.log('No se encontraron datos para la reserva.');
            }
        },
        (error) => {
            // Manejar errores
            this.errorMessage = 'Error al obtener los detalles de la habitación.';
            console.error('Error:', error);
        }
    );
}



cerrarModalCheckOut(){

    this.ModalCHECKOUT=false;
    this.obtenerHabitacionesOcupadasParaCheckout();
    this.pagoPendienteForm.reset();
}


}
