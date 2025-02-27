import { Component } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { HuespedService } from './services/huesped.service';
import { MessageService, ConfirmationService } from 'primeng/api';
import { PrimeNGConfig } from 'primeng/api';  // Importar PrimeNGConfig
import { DatePipe } from '@angular/common';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-huespedes',

  templateUrl: './huespedes.component.html',
providers: [MessageService,DatePipe,ConfirmationService],
})
export class HuespedesComponent {




  huespedes: any[] = [];


  modal: boolean = false;
  modalx: boolean = false;
  editDialog:boolean = false;
  deleteHuespedDialog: boolean=false;
  HuespedSeleccionado:number;


  huespedForm: FormGroup;

  huespedFormEdit: FormGroup;

  constructor( private fb: FormBuilder,
    private fc: FormBuilder,
    private _huespedService: HuespedService,
    private messageService: MessageService,
    private primengConfig: PrimeNGConfig,
    private datePipe: DatePipe,
    private confirmationService: ConfirmationService,

) {
    this.huespedForm = this.fb.group({
        tipo_de_huesped: ['', Validators.required],
        tipo_de_documento: ['', Validators.required],
        numero_documento: ['', [Validators.required]],
        nombre: ['', Validators.required],
        apellido: ['', Validators.required],
        fecha_de_nacimiento: ['', Validators.required],
        estado_civil: ['', Validators.required],
        correo: ['', [Validators.required, Validators.email]],
        nacionalidad: ['', Validators.required],
        procedencia: ['', Validators.required],
        direccion: ['', Validators.required],
        telefono: ['', [Validators.required]]
      });

      this.huespedFormEdit= this.fc.group({

        tipo_de_huesped: ['', Validators.required],
        tipo_de_documento: ['', Validators.required],
        numero_documento: ['', [Validators.required]],
        nombre: ['', Validators.required],
        apellido: ['', Validators.required],
        fecha_de_nacimiento: ['', Validators.required],
        estado_civil: ['', Validators.required],
        correo: ['', [Validators.required, Validators.email]],
        nacionalidad: ['', Validators.required],
        procedencia: ['', Validators.required],
        direccion: ['', Validators.required],
        telefono: ['', [Validators.required]]

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


  }
verificarformulario(){
    console.log(this.huespedForm);
    this.deleteHuespedDialog=true;

}
  ngOnInit(): void {
    this.getHuespedes(); // Cargar la lista de huéspedes cuando se inicie el componente.
    console.log(this.huespedForm); // Verify if the form is still defined
  }

  // Método para obtener la lista de los huéspedes desde el servicio
  getHuespedes() {
    this._huespedService.listarHuespedes().subscribe(
      (response) => {

        this.huespedes = response.huespedes;
        console.log('Huéspedes cargados:', this.huespedes);
      },
      error => {
        console.error('Error al obtener los huéspedes', error);
      }
    );
  }

  ModalHuesped() {
    this.modal = true;
    this.huespedForm.reset();
  }

  // Cerrar el modal
  CerrarModal() {
    this.modal = false;
    this.editDialog = false;
  }

  // Guardar el huésped
  guardarHuesped() {
    if (this.huespedForm.invalid) {
      return;
    }

    const huespedData = this.huespedForm.value;

    // Convertir la fecha de nacimiento al formato 'YYYY-MM-DD'
    const fechaNacimiento = this.datePipe.transform(huespedData.fecha_de_nacimiento, 'yyyy-MM-dd');

    // Crear el objeto con los datos para enviar al servicio
    const dataToSend = {
      ...huespedData,
      fecha_de_nacimiento: fechaNacimiento,
    };

    console.log('Datos a enviar:', dataToSend);

    this._huespedService.registrarHuesped(dataToSend).subscribe(
      response => {
        this.getHuespedes();  // Recargar la lista de huéspedes
        this.huespedForm.reset();  // Limpiar el formulario
        this.CerrarModal();  // Cerrar el modal
        Swal.fire({
          icon: 'success',
          title: '¡Éxito!',
          text: 'El huésped se ha registrado correctamente.',
          confirmButtonText: 'Aceptar'
        }).then(() => {});
      },
      error => {
        console.log('Error recibido en el componente:', error);  // Verificar error completo

        if (error.error && error.error.msg) {
          console.log('Mensaje de error:', error.error.msg);  // Ver el mensaje del error

          // Mostrar toast para cada mensaje de error
          if (error.error.msg === 'El correo ya existe') {
            this.messageService.add({ severity: 'error', summary: 'Error', detail: 'El Correo ya se Encuentra Registrado. Por favor elige otro.' });
            console.log('Se ingresó al error correo');
          } else if (error.error.msg === 'El numero de documento ya existe') {
            this.messageService.add({ severity: 'error', summary: 'Error', detail: 'El Número de Documento ya se Encuentra Registrado. Por favor elige otro.' });
            console.log('Se ingresó al error documento');
          }
        } else {
            this.messageService.add({ severity: 'error', summary: 'Error', detail: 'Hubo un ERROR al registrar el Huesped' });
          console.log('No se pudo obtener el mensaje de error');
        }
      }

    );
  }
  eliminarHuesped(id: number): void {
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
        this._huespedService.eliminarHuesped(id).subscribe(
          (response) => {
            if (response) {
                this.getHuespedes();
              this.messageService.add({ severity: 'success', summary: 'Éxito', detail: 'Huésped eliminado correctamente' });
              // Recargar la lista de huéspedes
            }
          },
          (error) => {
            this.messageService.add({ severity: 'error', summary: 'Error', detail: 'Error al eliminar el huésped' });
          }
        );
      } else {
        // Si el usuario cancela, no hacer nada
        Swal.fire('Cancelado', 'La eliminación ha sido cancelada', 'info');
      }
    });

  }

 // Load the selected guest's data into the form
 EditarHuesped(huespedID: number) {
    this.HuespedSeleccionado = huespedID;  // Store the selected guest's ID

    // Fetch guest details from the service based on the selected ID
    this._huespedService.getHuespedById(huespedID).subscribe((response) => {
      if (response && response.huesped) {
        const huesped = response.huesped;  // Get the guest data from the response

        console.log('Fetched huesped:', huesped);  // Log the fetched guest data

        // Populate the edit form with the fetched data
        this.huespedFormEdit.patchValue({
          tipo_de_huesped: huesped.tipo_de_huesped,
          tipo_de_documento: huesped.tipo_de_documento,
          numero_documento: huesped.numero_documento,
          nombre: huesped.nombre,
          apellido: huesped.apellido,
          fecha_de_nacimiento: huesped.fecha_de_nacimiento ? new Date(huesped.fecha_de_nacimiento) : null,
          estado_civil: huesped.estado_civil,
          correo: huesped.correo,
          direccion: huesped.direccion,
          telefono: huesped.telefono,
          nacionalidad: huesped.nacionalidad,
          procedencia: huesped.procedencia,

        });

        this.editDialog = true;  // Open the dialog to edit the guest
      }
    }, (error) => {
      console.error('Error fetching huesped data:', error);
      // Optionally, handle the error if needed
    });
  }

guardarHuespedEdit() {
    if (this.huespedFormEdit.invalid) {
      return;  // No hacer nada si el formulario es inválido
    }

    const updatedHuespedData = this.huespedFormEdit.value;

    // Convertir la fecha de nacimiento actualizada al formato 'YYYY-MM-DD'
    const updatedFechaNacimiento = this.datePipe.transform(updatedHuespedData.fecha_de_nacimiento, 'yyyy-MM-dd');

    // Preparar los datos para enviar al servicio
    const dataToUpdate = {
      ...updatedHuespedData,
      fecha_de_nacimiento: updatedFechaNacimiento,
      id: this.HuespedSeleccionado // Incluir el ID del huésped para actualizar
    };

    console.log('Datos a actualizar:', dataToUpdate);

    this._huespedService.actualizarHuesped(this.HuespedSeleccionado, dataToUpdate).subscribe(
      response => {
        // Recargar la lista de huéspedes y cerrar el modal
        this.getHuespedes();
        this.messageService.add({ severity: 'success', summary: 'Éxito', detail: 'El huésped ha sido actualizado correctamente.' });
        this.editDialog = false;  // Cerrar el modal de edición
      },
      error => {
        console.log('Error al actualizar el huésped:', error);

        // Verificar el error completo para revisar la estructura
        console.log('Estructura completa del error:', error);

        // Verificar la presencia de error.msg
        if (error.error && error.error.msg) {
          console.log('Mensaje de error:', error.error.msg);  // Ver el mensaje del error

          // Mostrar toast para cada mensaje de error
          if (error.error.msg === 'El correo ya existe') {
            this.messageService.add({ severity: 'error', summary: 'Error', detail: 'El Correo ya se Encuentra Registrado. Por favor elige otro.' });
            console.log('Error: Correo ya registrado');
          } else if (error.error.msg === 'El numero de documento ya existe') {
            this.messageService.add({ severity: 'error', summary: 'Error', detail: 'El Número de Documento ya se Encuentra Registrado. Por favor elige otro.' });
            console.log('Error: Número de documento ya registrado');
          } else {
            console.log('No se pudo obtener el mensaje de error');
            this.messageService.add({ severity: 'error', summary: 'Error', detail: 'Hubo un ERROR al actualizar el Huesped' });
          }
        } else {
          console.log('El error no tiene la propiedad msg');
          this.messageService.add({ severity: 'error', summary: 'Error', detail: 'Hubo un ERROR al actualizar el Huesped' });
        }
      }
    );
  }






}
