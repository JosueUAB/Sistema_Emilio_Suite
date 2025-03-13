
import { Component, OnInit } from '@angular/core';
import { HabitacionesService } from '../habitaciones/service/habitaciones.service';
import { LayoutService } from 'src/app/layout/service/app.layout.service';
import { DialogService } from 'primeng/dynamicdialog';  // Asegúrate de tener este servicio importado
import { NotfoundComponent } from 'src/app/layout/notfound/notfound.component';
import { MessageService, PrimeNGConfig } from 'primeng/api';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { HuespedService } from '../huespedes/services/huesped.service';
import { DescuentoService } from '../configuracion/services/descuentos.service';
import { Message } from 'primeng/api';
import { ReservasService } from './service/reservas.service';
@Component({
  selector: 'app-reservas',
  templateUrl: './reservas.component.html',
  providers: [DialogService, MessageService],

})
export class ReservasComponent implements OnInit {
    currentDate: string = '';
    currentTime: string = '';
    private intervalId: any;
  listaHabitaciones: any[] = [];
  listaHabitacionesFiltradas: any[] = [];
  selectedEstados: string[] = []; // Cambiado a un array de strings para seleccionar múltiples estados
//   selectedPiso: number | null = null; // Para el filtro por piso
  selectedTipoHabitacion: number | null = null; // Para el filtro por tipo de habitación
  ModalReservar:boolean = false;
  selectedHuespedCodigo:any;
  reservaForm: FormGroup;
  estados: any[] = [
    { label: 'Disponible', value: 'disponible' },
    { label: 'Ocupado', value: 'ocupado' },
    { label: 'Reservado', value: 'reservado' },
    { label: 'Mantenimiento', value: 'mantenimiento' },
    { label: 'Limpieza', value: 'limpieza' }
  ];
  selectedPiso: number = 1;
  numerosPiso: { label: string, value: number }[] = []; // Lista de pisos únicos con formato {label, value}
  tiposHabitacion: { label: string, value: number }[] = []; // Lista de tipos de habitación con formato {label, value}

  selectedEstado: string = '';
  numeroHabitacion: string = '';
  precio: any | null = null;
  cantidadCamas: any | null = null;
  maxPersonas: any | null = null;
  precioMinimo: number | null = null;
  precioMaximo: number | null = null;
  ref:any;
  habitacion:any=[];
  huespedes:any=[];
  filteredHuespedes: any[] = [];
  selectedHuesped: any;
  selectedHuespedID:any;
  selectedHabitacionId:number;
  habitacionesEditForm:FormGroup;
  pagoPendienteForm:FormGroup;
  descuentos: any = [];
  filteredDescuentos: any[] = [];
   isLoading: boolean;
  search: string = '';
  page:number=1;
  duracionEstancia: number = 0;
  costo_total_sin_descuento:number=0;
  monto_descuento:number=0;
    total_con_descuento:number=0;
  costoTotal: number = 0;

  messages: Message[] = [];
  reservas: any[] = [];
  reservasPendientes: any[] = [];
  reservaPendiente: any = null; // Variable para almacenar la reserva pendiente
  isLoadingreserva: boolean = false; // Variable para manejar el estado de carga
  isLoadingReserva = false;
  errorMessage: string = '';


  ModalCHECK:boolean=false;
  ModalCHECKReserva:boolean=false;
  ModalCHECKOUT:Boolean=false;

  checkoutInfo: any;













  constructor(private _HabitacionesService: HabitacionesService,
                public _layoutService: LayoutService,
                private _DescuentoService: DescuentoService,
                private _DialogService : DialogService,
                private messageService: MessageService,
                private fb : FormBuilder,
                private _HuespedService: HuespedService,
                private primengConfig: PrimeNGConfig,

                private _reservaService: ReservasService,

  ) {


     this.habitacionesEditForm = this.fb.group({
            numero_piso: ['', [Validators.required, Validators.pattern('^[0-9]*$')]],
            numero: [``, [Validators.required, Validators.pattern('^[0-9]*$'), Validators.max(999)]],
            tipo_id: ['', Validators.required],
            cantidad_camas: ['', [Validators.required, Validators.pattern('^[0-9]*$')]],
            limite_personas: ['', [Validators.required, Validators.pattern('^[0-9]*$')]],
            descripcion: ['', ],
            costo: ['', [Validators.required, Validators.pattern('^[0-9]+(\.[0-9]{1,2})?$')]],
            tv: ['', ],
            ducha: ['', ],
            banio: ['', ],
            estado: ['', ],
        });
        this.pagoPendienteForm = this.fb.group({
            monto_pagado: [null, [Validators.required, Validators.min(1)]], // Monto a pagar
            metodo_de_pago: ['efectivo', Validators.required], // Método de pago
          });


      this.primengConfig.setTranslation({
        firstDayOfWeek: 0,
        dayNames: ["Domingo", "Lunes", "Martes", "Miércoles", "Jueves", "Viernes", "Sábado"],
        dayNamesShort: ["Dom", "Lun", "Mar", "Mié", "Jue", "Vie", "Sáb"],
        dayNamesMin: ["Do", "Lu", "Ma", "Mi", "Ju", "Vi", "Sá"],
        monthNames: ["Enero", "Febrero", "Marzo", "Abril", "Mayo", "Junio", "Julio", "Agosto", "Septiembre", "Octubre", "Noviembre", "Diciembre"],
        monthNamesShort: ["Ene", "Feb", "Mar", "Abr", "May", "Jun", "Jul", "Ago", "Sep", "Oct", "Nov", "Dic"],
        today: 'Hoy',
        clear: 'Limpiar',
        dateFormat: 'dd/mm/yy',
        weekHeader: 'Sg'
      });

      this.reservaForm = this.fb.group({
        habitacion_id: ['', Validators.required],
        huesped_id: ['', Validators.required],
        descuento_id: [''],
        fecha_inicio: ['', Validators.required],
        fecha_fin: ['', Validators.required],
        metodo_de_pago: ['', Validators.required],
        monto_pagado: ['', [Validators.required, Validators.min(0)]],
      });

  }

  ngOnInit(): void {
    this.updateTime();
    this.intervalId = setInterval(() => this.updateTime(), 1000);
    this.GetHabitaciones();
    this.getHuespedes();
    this.listarDescuentos();
    this.GetReservas();

    this.filtrarHabitaciones();


  }
  updateTime() {
    const options: Intl.DateTimeFormatOptions = {
      timeZone: 'America/La_Paz',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
      hour12: false
    };
    const dateOptions: Intl.DateTimeFormatOptions = {
      timeZone: 'America/La_Paz',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    };
    this.currentTime = new Date().toLocaleTimeString('es-BO', options);
    this.currentDate = new Date().toLocaleDateString('es-BO', dateOptions);
  }

GetHabitaciones() {
    this._reservaService.listarHabitacionesDisponiblesHoy().subscribe((data: any) => {
      if (data && data.habitaciones) {
        this.listaHabitaciones = data.habitaciones;
        console.log(data);
        this.listaHabitacionesFiltradas = [...this.listaHabitaciones];

        // Obtener los números de piso únicos con formato {label, value}
        this.numerosPiso = this.listaHabitaciones
          .map(h => h.numero_piso)
          .filter((value, index, self) => self.indexOf(value) === index)
          .map(piso => ({ label: 'Piso ' + piso, value: piso }))
          .sort((a, b) => a.value - b.value);

        // Obtener los tipos de habitación únicos con formato {label, value}
        this.tiposHabitacion = this.listaHabitaciones
          .map(h => h.tipo_habitacion)
          .filter((value, index, self) => self.findIndex(t => t.id === value.id) === index)
          .map(tipo => ({ label: tipo.nombre, value: tipo.id }));

        // Llama a filtrarHabitaciones después de que se hayan cargado las habitaciones
        this.filtrarHabitaciones();
      } else {
        console.error('La respuesta no contiene las habitaciones esperadas.');
      }
    }, error => {
      console.error('Error al obtener habitaciones:', error);
    });
  }
  getHuespedes() {
    this._HuespedService.listarHuespedes().subscribe(
      (response) => {

        this.huespedes = response.huespedes;
        console.log('Huéspedes cargados:', this.huespedes);
      },
      error => {
        console.error('Error al obtener los huéspedes', error);
      }
    );
  }
  listarDescuentos() {
    this.isLoading = true;
    this._DescuentoService.listarDescuentos(this.page, this.search).subscribe(
      data => {
        if (Array.isArray(data)) {
          this.descuentos = data;
          console.log(this.descuentos);
        } else {
          console.error('La respuesta no es un arreglo');
          this.descuentos = [];
        }
        this.isLoading = false;
      },
      error => {
        console.error('Error:', error);
        this.isLoading = false;
        this.descuentos = [];
      }
    );
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
    console.log('Filtrando habitaciones...');
    console.log('Selected Piso:', this.selectedPiso);
    console.log('Habitaciones antes del filtro:', this.listaHabitaciones);
    console.log('Habitaciones filtradas:', this.listaHabitacionesFiltradas);
  }

  ObtenerHabitacionID(id: number): void {
    this.selectedHabitacionId = id;

    this._HabitacionesService.obtenerHabitacionPorId(id).subscribe(
      (data) => {
        if (data && data.habitacion) {
          console.log('datos del usuario : ', data);
          this.habitacion = data.habitacion; // Guardamos la habitación
          this.reservaForm.patchValue({
            habitacion_id:this.habitacion.id
          });
          this.ModalReservar = true;
        } else {
          this.messageService.add({ severity: 'error', summary: 'Error', detail: 'No se pudo cargar la habitación.' });
        }
      },
      (error) => {
        console.error('Error al cargar los datos de la habitación:', error);
        this.messageService.add({ severity: 'error', summary: 'Error', detail: 'Hubo un error al cargar los datos de la habitación.' });
      }
    );
  }


  ObtenerHabitacionIDCHECK(id: number): void {
    this.selectedHabitacionId = id;

    this._HabitacionesService.obtenerHabitacionPorId(id).subscribe(
      (data) => {
        if (data && data.habitacion) {
          console.log('datos del usuario : ', data);
          this.habitacion = data.habitacion; // Guardamos la habitación
          this.reservaForm.patchValue({
            habitacion_id:this.habitacion.id
          });
          this.ModalCHECK= true;
        } else {
          this.messageService.add({ severity: 'error', summary: 'Error', detail: 'No se pudo cargar la habitación.' });
        }
      },
      (error) => {
        console.error('Error al cargar los datos de la habitación:', error);
        this.messageService.add({ severity: 'error', summary: 'Error', detail: 'Hubo un error al cargar los datos de la habitación.' });
      }
    );
  }

filterHuespedes(event: any) {
    let filtered: any[] = [];
    let query = event.query;

    // Preprocesar todos los huéspedes para agregar la propiedad 'displayLabel'
    this.huespedes.forEach(huesped => {
      huesped.displayLabel = `${huesped.numero_documento} | ${huesped.nombre} ${huesped.apellido}`;
    });

    // Filtrar los huéspedes por el número de documento usando startsWith
    filtered = this.huespedes.filter(huesped =>
      huesped.numero_documento.toLowerCase().startsWith(query.toLowerCase())
    );

    if (filtered.length === 0) {
      this.filteredHuespedes = [{ displayLabel: 'No se encontraron resultados' }];
    } else {
      this.filteredHuespedes = filtered;
    }
}


  onHuespedSelect(event: any) {
    // Asegúrate de que solo se almacene el ID
    const selectedHuesped = event.value;
    console.log('Huésped seleccionado:', selectedHuesped);

    // Si necesitas solo el 'id' del huésped seleccionado, lo almacenamos

    this.selectedHuespedID= selectedHuesped.id;
    this.reservaForm.patchValue({
        huesped_id:selectedHuesped.id

    });


    console.log( 'El  ID dl huesped seleccionado es : ', this.selectedHuespedID)
  }

  MostrarDatosHuesped(){
    console.log('ID del huésped seleccionado:', this.selectedHuesped);
  }



calcularDuracionYCosto(coste:number) {
    const fechaInicio = this.reservaForm.get('fecha_inicio')?.value;
    const fechaFin = this.reservaForm.get('fecha_fin')?.value;

    if (fechaInicio && fechaFin) {
      const inicio = new Date(fechaInicio);
      const fin = new Date(fechaFin);

      // Calcular la diferencia en milisegundos y convertirla a días
      const diferenciaMs = fin.getTime() - inicio.getTime();
      this.duracionEstancia = Math.ceil(diferenciaMs / (1000 * 60 * 60 * 24));

      // Calcular el costo total
      const habitacion = this.listaHabitaciones.find(
        (h) => h.id === this.reservaForm.get('habitacion_id')?.value
      );
console.log(coste)

        this.costoTotal = coste * this.duracionEstancia;





    }
  }





  filterDescuentos(event: any) {
    const query = event.query.toLowerCase();
    this.filteredDescuentos = this.descuentos.filter(descuento =>
      descuento.nombre.toLowerCase().includes(query)
    ).map(descuento => ({
      ...descuento,
      displayLabel: `${descuento.nombre} | ${descuento.porcentaje}%`
    }));
  }

//   onDescuentoSelect(descuento: any) {
//     // Aquí puedes hacer lo que necesites con el descuento seleccionado
//     console.log('Descuento seleccionado:', descuento);
//     console.log('Descuento id selec:', descuento.value.id);
//     // Por ejemplo, puedes asignar el ID del descuento al formulario
//     this.reservaForm.patchValue({
//         descuento_id: descuento.value.id // Asigna el ID del descuento al formulario
//     });
//   }
onDescuentoSelect(descuento: any) {
    // Aquí puedes hacer lo que necesites con el descuento seleccionado
    console.log('Descuento seleccionado:', descuento);
    console.log('Descuento id selec:', descuento.value.id);

    // Asignar el ID del descuento al formulario
    this.reservaForm.patchValue({
        descuento_id: descuento.value.id // Asigna el ID del descuento al formulario
    });

    // Calcular el costo con descuento
    const porcentajeDescuento = parseFloat(descuento.value.porcentaje); // Obtener el porcentaje de descuento
    const costoTotalSinDescuento = this.costoTotal; // Obtener el costo total sin descuento

    // Calcular el monto del descuento
    const montoDescuento = (costoTotalSinDescuento * porcentajeDescuento) / 100;

    // Calcular el costo total con descuento
    const costoTotalConDescuento = costoTotalSinDescuento - montoDescuento;

    // Almacenar los valores en variables
    this.costo_total_sin_descuento = costoTotalSinDescuento;
    this.monto_descuento = montoDescuento;
    this.total_con_descuento = costoTotalConDescuento;

    // Mostrar los resultados en consola (opcional)
    console.log('Costo total sin descuento:', this.costo_total_sin_descuento);
    console.log('Monto de descuento:', this.monto_descuento);
    console.log('Costo total con descuento:', this.total_con_descuento);
    this.reservaForm.patchValue({
        monto_pagado: this.total_con_descuento // Asigna el ID del descuento al formulario
    });
}

  GetReservas(): void {
    this.isLoadingReserva = true;
    this._reservaService.obtenerReservas().subscribe({
      next: (response) => {
        if (response && response.reservas) {

          this.reservas = response.reservas;
          console.log('all ',response)
          console.log('las reservas son : ',this.reservas)
        }
      },
      error: (error) => {
        this.errorMessage = error.message || 'Ocurrió un error al cargar las reservas';
      },
      complete: () => {
        this.isLoadingReserva = false;
      },
    });
    }


    // guardarReserva() {
    //     if (this.reservaForm.valid) {
    //         console.log('Formulario enviado:', this.reservaForm.value);
    //         this.isLoadingReserva = true;

    //         // Obtener los datos del formulario
    //         const formData = this.reservaForm.value;

    //         // Realizar el parseo de las fechas aquí antes de enviarlas al servicio
    //         const parsedData = this.parsearFechas(formData);

    //         // Llamamos al servicio para registrar la reserva
    //         this._reservaService.registrarReserva(parsedData).subscribe({
    //             next: (response) => {
    //                 if (response && response.reserva) {
    //                     this.CerrarModalGuardar();
    //                     console.log('Reserva guardada exitosamente:', response.reserva);
    //                     this.messageService.add({
    //                         severity: 'success',
    //                         summary: 'Éxito',
    //                         detail: 'Reserva realizado exitosamente.',
    //                       });
    //                 }
    //             },
    //             error: (error) => {
    //                 this.errorMessage = error.mensaje || 'Ocurrió un error al guardar la reserva';
    //                 console.error(this.errorMessage);
    //                 this.messageService.add({
    //                     severity: 'error',
    //                     summary: 'Error',
    //                     detail: 'Ocurrió un error al guardar la reserva ',
    //                   });
    //             },
    //             complete: () => {
    //                 this.isLoadingReserva = false;
    //             },
    //         });
    //     } else {
    //         console.log('Formulario inválido');
    //     }
    // }

    guardarReserva() {
        if (this.reservaForm.valid) {
            console.log('Formulario enviado:', this.reservaForm.value);
            this.isLoadingReserva = true;

            // Obtener los datos del formulario
            const formData = this.reservaForm.value;

            // Realizar el parseo de las fechas aquí antes de enviarlas al servicio
            const parsedData = this.parsearFechas(formData);

            // Llamamos al servicio para registrar la reserva
            this._reservaService.registrarReserva(parsedData).subscribe({
                next: (response) => {
                    if (response && response.reserva) {
                        this.CerrarModalGuardar();
                        console.log('Reserva guardada exitosamente:', response.reserva);
                        this.messageService.add({
                            severity: 'success',
                            summary: 'Éxito',
                            detail: 'Reserva realizada exitosamente.',
                        });
                    }
                },
                error: (error) => {
                    // Capturar el mensaje de error del backend
                    const errorMessage = error.error?.mensaje || 'Ocurrió un error al guardar la reserva.';
                    const reservaExistente = error.error?.reserva_existente;

                    // Mostrar el mensaje de error en el toast
                    this.messageService.add({
                        severity: 'error',
                        summary: 'Error',
                        detail: errorMessage,
                    });

                    // Si hay una reserva existente, mostrar sus fechas
                    if (reservaExistente) {
                        const fechaInicio = reservaExistente.fecha_inicio;
                        const fechaFin = reservaExistente.fecha_fin;
                        console.log('Reserva existente:', reservaExistente);

                        // Mostrar un segundo toast con las fechas de la reserva existente
                        this.messageService.add({
                            severity: 'warn',
                            summary: 'Conflicto de fechas',
                            detail: `La habitación ya está reservada desde ${fechaInicio} hasta ${fechaFin}.`,
                        });
                    }

                    console.error('Error al guardar la reserva:', error);
                },
                complete: () => {
                    this.isLoadingReserva = false;
                },
            });
        } else {
            console.log('Formulario inválido');
        }
    }
      // Método para parsear las fechas antes de enviarlas
      private parsearFechas(data: any) {
        // Convertir las fechas de formato Date a formato 'YYYY-MM-DD'
        const fechaInicio = new Date(data.fecha_inicio);
        const fechaFin = new Date(data.fecha_fin);

        // Asegurarnos de que el formato sea 'YYYY-MM-DD'
        const formattedFechaInicio = `${fechaInicio.getFullYear()}-${(fechaInicio.getMonth() + 1).toString().padStart(2, '0')}-${fechaInicio.getDate().toString().padStart(2, '0')}`;
        const formattedFechaFin = `${fechaFin.getFullYear()}-${(fechaFin.getMonth() + 1).toString().padStart(2, '0')}-${fechaFin.getDate().toString().padStart(2, '0')}`;

        // Retornar los datos con las fechas formateadas
        return {
          ...data,
          fecha_inicio: formattedFechaInicio,
          fecha_fin: formattedFechaFin,
        };
      }

    //   checkinDirecto() {
    //     if (this.reservaForm.valid) {
    //         console.log('Formulario enviado:', this.reservaForm.value);
    //         this.isLoadingReserva = true;

    //         // Obtener los datos del formulario
    //         const formData = this.reservaForm.value;

    //         // Realizar el parseo de las fechas aquí antes de enviarlas al servicio
    //         const parsedData = this.parsearFechas(formData);

    //         // Llamamos al servicio para realizar el check-in directo
    //         this._reservaService.checkinDirecto(parsedData).subscribe({
    //             next: (response) => {
    //                 if (response) {
    //                     this.CerrarModalCHECK(); // Cerrar el modal si es necesario
    //                     console.log('Check-in directo realizado exitosamente:', response);
    //                     this.messageService.add({
    //                         severity: 'success',
    //                         summary: 'Éxito',
    //                         detail: 'Check-in directo realizado exitosamente.',
    //                       });
    //                 }
    //             },
    //             error: (error) => {
    //                 this.errorMessage = error.mensaje || 'Ocurrió un error al realizar el check-in directo';
    //                 console.error(this.errorMessage);
    //                 let mensajedeerror=this.errorMessage;
    //                 this.messageService.add({
    //                     severity: 'error',
    //                     summary: 'Error',
    //                     detail: 'Ocurrió un error al realizar el check-in directo: ',
    //                   });
    //             },
    //             complete: () => {
    //                 this.isLoadingReserva = false;
    //             },
    //         });
    //     } else {
    //         console.log('Formulario inválido');
    //     }
    // }
    checkinDirecto() {
        if (this.reservaForm.valid) {
            console.log('Formulario enviado:', this.reservaForm.value);
            this.isLoadingReserva = true;

            // Obtener los datos del formulario
            const formData = this.reservaForm.value;

            // Realizar el parseo de las fechas aquí antes de enviarlas al servicio
            const parsedData = this.parsearFechas(formData);

            // Llamamos al servicio para realizar el check-in directo
            this._reservaService.checkinDirecto(parsedData).subscribe({
                next: (response) => {
                    if (response) {
                        this.CerrarModalCHECK(); // Cerrar el modal si es necesario
                        console.log('Check-in directo realizado exitosamente:', response);
                        this.messageService.add({
                            severity: 'success',
                            summary: 'Éxito',
                            detail: 'Check-in directo realizado exitosamente.',
                        });
                    }
                },
                error: (error) => {
                    // Capturar el mensaje de error y el código de estado
                    const errorMessage = error.error?.mensaje || 'Ocurrió un error al realizar el check-in directo.';
                    const errorStatus = error.status || 'Desconocido';

                    // Mostrar el mensaje de error y el código de estado en el toast
                    this.messageService.add({
                        severity: 'error',
                        summary: `Error (Código: ${errorStatus})`,
                        detail: errorMessage,
                    });

                    // Si hay una reserva existente, mostrar sus fechas
                    if (error.error?.reserva_existente) {
                        const reservaExistente = error.error.reserva_existente;
                        const fechaInicio = reservaExistente.fecha_inicio;
                        const fechaFin = reservaExistente.fecha_fin;

                        this.messageService.add({
                            severity: 'warn',
                            summary: 'Conflicto de fechas',
                            detail: `La habitación ya está reservada desde ${fechaInicio} hasta ${fechaFin}.`,
                        });
                    }

                    console.error('Error al realizar el check-in directo:', error);
                },
                complete: () => {
                    this.isLoadingReserva = false;
                },
            });
        } else {
            console.log('Formulario inválido');
            this.messageService.add({
                severity: 'error',
                summary: 'Error',
                detail: 'El formulario no es válido. Verifica los datos ingresados.',
            });
        }
    }

      CerrarModalGuardar(){
        this.ModalReservar=false;
        this.reservaForm.reset();
        this.selectedHuesped=[];
        this.GetHabitaciones();
        this.filteredDescuentos = [];
        this.duracionEstancia=0
        this.costo_total_sin_descuento=0
        this.monto_descuento=0
        this.total_con_descuento=0
        this.costoTotal=0
      }

      CerrarModalCHECK(){
        this.ModalCHECK=false;
        this.ModalCHECKReserva=false;
        this.ModalCHECKOUT=false;
        this.reservaForm.reset();
        this.selectedHuesped=[];
        this.GetHabitaciones();
        this.filteredDescuentos = [];
        this.duracionEstancia=0
        this.costo_total_sin_descuento=0
        this.monto_descuento=0
        this.total_con_descuento=0
        this.costoTotal=0
      }

      obtenerReservaPendiente(id: number) {
        this.isLoadingreserva = true; // Activar el estado de carga

        this._reservaService.obtenerReservaPendienteHoyPorId(id).subscribe({
          next: (response) => {
            if (response && response.reserva) {
              this.reservaPendiente = response; // Almacenar la respuesta completa
              console.log('Reserva pendiente:', this.reservaPendiente);
              this.ModalCHECKReserva=true;
            } else {
              console.log('No se encontró una reserva pendiente para esta habitación.');
            }
          },
          error: (error) => {
            console.error('Error al obtener la reserva pendiente:', error);
          },
          complete: () => {
            this.isLoadingReserva = false; // Desactivar el estado de carga
          }
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
            this.CerrarModalCHECK();

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




      checkout(reservaId: number): void {
        this._reservaService.checkout(reservaId).subscribe({
          next: (respuesta) => {
            console.log('Checkout realizado exitosamente:', respuesta);
            this.messageService.add({
              severity: 'success',
              summary: 'Éxito',
              detail: 'Checkout realizado exitosamente.',
            });
          },
          error: (error) => {
            console.error('Error al realizar el checkout:', error);
            this.messageService.add({
              severity: 'error',
              summary: 'Error',
              detail: 'Ocurrió un error al realizar el checkout.',
            });
          },
        });
      }

      realizarCheckinReserva(reservaId: number): void {
        this._reservaService.checkin(reservaId).subscribe({
          next: (respuesta) => {
            console.log('Check-in realizado exitosamente:', respuesta);
            this.messageService.add({
              severity: 'success',
              summary: 'Éxito',
              detail: 'Check-in realizado exitosamente.',
            });
            this.GetHabitaciones();
            this.CerrarModalCHECK();

          },
          error: (error) => {
            console.error('Error al realizar el check-in:', error);
            this.messageService.add({
              severity: 'error',
              summary: 'Error',
              detail: error.message, // Aquí se mostrará el mensaje que se genera en manejarError
            });
          },
        });
      }








      obtenerCheckout(habitacionId:number): void {
        this._reservaService.obtenerCheckoutPorHabitacionId(habitacionId).subscribe({
          next: (response) => {
            this.checkoutInfo = response;

            console.log(this.checkoutInfo)
            this.ModalCHECKOUT=true;
            this.errorMessage = null;
          },
          error: (error) => {
            this.errorMessage = error.message || 'Ocurrió un error al obtener el checkout.';
            console.error(error);
          },
        });
      }




  mostrar(){
    console.log(this.reservaForm.value)
  }



ngOnDestroy() {
    if (this.ref) {
        this.ref.close();
    }
}
}
