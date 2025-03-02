
import { Component, OnInit } from '@angular/core';
import { HabitacionesService } from '../habitaciones/service/habitaciones.service';
import { LayoutService } from 'src/app/layout/service/app.layout.service';
import { DialogService } from 'primeng/dynamicdialog';  // Asegúrate de tener este servicio importado
import { NotfoundComponent } from 'src/app/layout/notfound/notfound.component';
import { MessageService } from 'primeng/api';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { HuespedService } from '../huespedes/services/huesped.service';

@Component({
  selector: 'app-reservas',
  templateUrl: './reservas.component.html',
  providers: [DialogService, MessageService],

})
export class ReservasComponent implements OnInit {
  listaHabitaciones: any[] = [];
  listaHabitacionesFiltradas: any[] = [];
  selectedEstados: string[] = []; // Cambiado a un array de strings para seleccionar múltiples estados
  selectedPiso: number | null = null; // Para el filtro por piso
  selectedTipoHabitacion: number | null = null; // Para el filtro por tipo de habitación
  ModalReservar:boolean = false;
  selectedHuespedCodigo:any;
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
  ref:any;
  habitacion:any=[];
  huespedes:any=[];
  filteredHuespedes: any[] = [];
  selectedHuesped: any;
  selectedHuespedID:any;
  selectedHabitacionId:number;
  habitacionesEditForm:FormGroup;

  constructor(private _HabitacionesService: HabitacionesService,
                public _layoutService: LayoutService,
                private _DialogService : DialogService,
                private messageService: MessageService,
                private fb : FormBuilder,
                private _HuespedService: HuespedService,
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

  }

  ngOnInit(): void {
    this.GetHabitaciones();
    this.getHuespedes();
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

  ObtenerHabitacionID(id: number): void {
    this.selectedHabitacionId = id;

    this._HabitacionesService.obtenerHabitacionPorId(id).subscribe(
      (data) => {
        if (data && data.habitacion) {
          console.log('datos del usuario : ', data);
          this.habitacion = data.habitacion; // Guardamos la habitación
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
//   filterHuespedes(event: any) {
//     let filtered: any[] = [];
//     let query = event.query;

//     // Preprocesar todos los huéspedes para agregar la propiedad 'displayLabel'
//     this.huespedes.forEach(huesped => {
//       huesped.displayLabel = `${huesped.numero_documento} | ${huesped.nombre} ${huesped.apellido}`;
//     });

//     // Filtrar los huéspedes por el número de documento
//     filtered = this.huespedes.filter(huesped =>
//       huesped.numero_documento.toLowerCase().includes(query.toLowerCase())
//     );

//     // Si no hay resultados, mostrar el mensaje
//     if (filtered.length === 0) {
//       this.filteredHuespedes = [{ displayLabel: 'No se encontraron resultados' }];
//     } else {
//       this.filteredHuespedes = filtered;
//     }
//   }

filterHuespedes(event: any) {
    let filtered: any[] = [];
    let query = event.query;

    // Preprocesar todos los huéspedes para agregar la propiedad 'displayLabel'
    this.huespedes.forEach(huesped => {
      huesped.displayLabel = `${huesped.numero_documento} | ${huesped.nombre} ${huesped.apellido}`;
    });

    // Filtrar los huéspedes por el número de documento
    filtered = this.huespedes.filter(huesped =>
      huesped.numero_documento.toLowerCase().includes(query.toLowerCase())
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


    console.log( 'El  ID dl huesped seleccionado es : ', this.selectedHuespedID)
  }

  MostrarDatosHuesped(){
    console.log('ID del huésped seleccionado:', this.selectedHuesped);
  }



  show() {
    // this.ref = this._DialogService.open(NotfoundComponent, {
    //     header: 'Page Not Found',
    //     width: '80vw',  // Ancho del modal (80% del ancho de la ventana)
    //     height: '70vh', // Altura del modal (70% de la altura de la ventana)
    //     contentStyle: {
    //         overflow: 'auto', // Permite el scroll si el contenido es más grande que el modal
    //         height: '100%', // Hace que el contenido ocupe toda la altura disponible
    //         padding: '20px', // Añade un pequeño espacio alrededor del contenido
    //     },
    //     baseZIndex: 10000, // Hace que el modal se muestre encima de otros componentes
    // });


    this.ModalReservar = true;
}




ngOnDestroy() {
    if (this.ref) {
        this.ref.close();
    }
}
}
