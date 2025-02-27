import { Component } from '@angular/core';
import { HabitacionesService } from './service/habitaciones.service';
import { MessageService, ConfirmationService } from 'primeng/api';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Tipo_habitacionService } from '../configuracion/services/tipo_habitacion.service';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-habitaciones',

  templateUrl: './habitaciones.component.html',
providers: [MessageService,ConfirmationService],
})
export class HabitacionesComponent {

habitaciones: any[] = [];
tiposHabitacion:any[] = [];
  isLoading: boolean = false;
  page: number = 1;
  HabitacionDialog:boolean = false;
  HabitacionDialogEdit:boolean = false;
  selectedHabitacionId:number;

  //**formulario de registro */

  habitacionesForm : FormGroup;
  habitacionesEditForm : FormGroup;


  constructor(
    private _habitacionesService: HabitacionesService,
    private messageService: MessageService,
    private _tipo_HabitacionServce: Tipo_habitacionService,
    private fb: FormBuilder,

) {

    this.habitacionesForm = this.fb.group({
        numero_piso: [null, [Validators.required, Validators.pattern('^[0-9]*$')]],
        numero: [null, [Validators.required, Validators.pattern('^[0-9]*$'), Validators.max(999)]],
        tipo_id: ['', Validators.required],
        cantidad_camas: [1, [Validators.required, Validators.pattern('^[0-9]*$')]],
        limite_personas: [1, [Validators.required, Validators.pattern('^[0-9]*$')]],
        descripcion: ['', [ Validators.pattern('^[a-zA-Z0-9\s]*$')]],
        costo: ['', [Validators.required, Validators.pattern('^[0-9]+(\.[0-9]{1,2})?$')]],
        tv: [0, ],
        ducha: [0, ],
        banio: [0, ],
        estado: ['disponible', ],

    });

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
    this.obtenerHabitaciones();
    this.GetHabitaciones();
  }

  obtenerHabitaciones(): void {
    this.isLoading = true;
    this._habitacionesService.obtenerHabitaciones(this.page).subscribe(
      (data) => {
        if (data) {
          this.habitaciones = data.habitaciones;
          console.log(this.habitaciones);
        } else {
          console.error('No se pudieron obtener las habitaciones.');
        }
        this.isLoading = false;
      },
      (error) => {
        console.error('Error al obtener las habitaciones:', error);
        this.isLoading = false;
      }
    );
  }
  GetHabitaciones(): void {
    this._tipo_HabitacionServce.listarTipoHabitaciones().subscribe(
      (data) => {
        this.tiposHabitacion = data;
        console.log(this.tiposHabitacion);
      },
      (error) => {
        console.error('Error al listar los tipos de habitación', error);
      }
    );
  }



  CerrarModalGuardar(){

    this.HabitacionDialog = false;
    this.habitacionesForm.reset({
        numero_piso:null,
        numero:null,
        cantidad_camas:1,
        limite_personas:1,
        tv:0,
        ducha:0,
        banio:0,
        estado: 'disponible',
    });
  }


  RegistrarHabitacion(): void {
    // Verifica si el formulario es inválido
    if (this.habitacionesForm.invalid) {
        return; // No hacer nada si el formulario es inválido
    }

    // Crear el objeto con los datos del formulario
    const habitacionData = this.habitacionesForm.value;
    console.log('Datos de la habitación:', habitacionData);

    // Llamada al servicio para registrar la habitación
    this._habitacionesService.registrarHabitacion(habitacionData).subscribe(
        response => {
            // Recargar la lista de habitaciones
            this.obtenerHabitaciones();  // O cualquier otro método para obtener habitaciones
           
            this.CerrarModalGuardar();  // Cerrar el modal

            // Mostrar un mensaje de éxito con SweetAlert
            Swal.fire({
                icon: 'success',
                title: '¡Éxito!',
                text: 'La habitación se ha registrado correctamente.',
                confirmButtonText: 'Aceptar'
            }).then(() => {
                // Aquí puedes realizar alguna acción adicional si es necesario
            });
        },
        error => {
            // Si ocurre un error, mostrar mensajes de error usando el servicio de mensajes
            console.error('Error al registrar la habitación:', error);

            if (error.error && error.error.msg) {
                console.log('Mensaje de error:', error.error.msg);  // Ver el mensaje del error

                // Mostrar toast para cada mensaje de error
                if (error.error.msg === 'La habitación con este número ya existe.') {
                    this.messageService.add({ severity: 'error', summary: 'Error', detail: 'El numero de habitación ya se encuentra registrada.' });
                    console.log('Se ingresó al error habitación duplicada');
                } else {
                    this.messageService.add({ severity: 'error', summary: 'Error', detail: 'Hubo un error al registrar la habitación.' });
                }
            } else {
                this.messageService.add({ severity: 'error', summary: 'Error', detail: 'Hubo un ERROR al registrar la habitación' });
            }
        }
    );
}
eliminarHabitacion(id: number): void {
    // Muestra el cuadro de confirmación de SweetAlert2
    Swal.fire({
        title: '¿Estás seguro?',
        text: '¡No podrás revertir esta acción!',
        icon: 'warning',
        showCancelButton: true,
        confirmButtonText: 'Sí, eliminar',
        cancelButtonText: 'Cancelar',
        reverseButtons: true
    }).then((result) => {
        if (result.isConfirmed) {
            // Si el usuario confirma, proceder con la eliminación
            this._habitacionesService.eliminarHabitacion(id).subscribe(
                (response) => {
                    if (response) {
                        // Recargar la lista de habitaciones
                        this.obtenerHabitaciones();
                        this.messageService.add({ severity: 'success', summary: 'Éxito', detail: 'Habitación eliminada correctamente' });
                    }
                },
                (error) => {
                    this.messageService.add({ severity: 'error', summary: 'Error', detail: 'Error al eliminar la habitación' });
                }
            );
        } else {
            // Si el usuario cancela, no hacer nada
            Swal.fire('Cancelado', 'La eliminación ha sido cancelada', 'info');
        }
    });
}


// Método para cargar los datos de la habitación que se desea editar
ObtenerHabitacionID(id: number): void {
    this.selectedHabitacionId = id;

    this._habitacionesService.obtenerHabitacionPorId(id).subscribe(
      (data) => {
        if (data) {
            console.log('datos del usuario : ', data);
          const habitacion = data.habitacion;
          this.habitacionesEditForm.patchValue({
            numero_piso: habitacion.numero_piso,
            numero: habitacion.numero,
            tipo_id: habitacion.tipo_id,
            cantidad_camas: habitacion.cantidad_camas,
            limite_personas: habitacion.limite_personas,
            descripcion: habitacion.descripcion,
            costo: habitacion.costo,
            tv: habitacion.tv===1,
            ducha: habitacion.ducha===1,
            banio: habitacion.banio===1,
            estado: habitacion.estado,
          });
          this.HabitacionDialogEdit=true;
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

  // Método para actualizar la habitación
  actualizarHabitacion(): void {
    if (this.habitacionesEditForm.invalid) {

      console.log('El formulario de habitación es inválido.' , this.habitacionesEditForm);
      return;
    }

    const habitacionData = this.habitacionesEditForm.value;
    console.log('Datos de la habitación a actualizar:', habitacionData);

    // Llamar al servicio para actualizar la habitación
    if (this.selectedHabitacionId) {
      this._habitacionesService.actualizarHabitacion(this.selectedHabitacionId, habitacionData).subscribe(
        (response) => {
          if (response) {
            // Recargar la lista de habitaciones
            this.HabitacionDialogEdit=false;
            this.obtenerHabitaciones();
            this.habitacionesForm.reset();  // Limpiar el formulario
            Swal.fire({
              icon: 'success',
              title: '¡Éxito!',
              text: 'La habitación ha sido actualizada correctamente.',
              confirmButtonText: 'Aceptar',
            });
          }
        },
        (error) => {

            console.error('Error al registrar la habitación:', error);

            if (error.error && error.error.msg) {
                console.log('Mensaje de error:', error.error.msg);  // Ver el mensaje del error

                // Mostrar toast para cada mensaje de error
                if (error.error.msg === 'El número de habitación ya está en uso. Elige otro.') {
                    this.messageService.add({ severity: 'error', summary: 'Error', detail: 'El numero de habitación ya se encuentra registrada. Porfavor Ingresa Otro' });
                    console.log('Se ingresó al error habitación duplicada');
                } else {
                    this.messageService.add({ severity: 'error', summary: 'Error', detail: 'Hubo un error al registrar la habitación.' });
                }
            }

        }
      );
    }
  }


}
