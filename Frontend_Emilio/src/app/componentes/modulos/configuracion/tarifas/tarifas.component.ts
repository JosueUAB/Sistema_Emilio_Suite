import { Component } from '@angular/core';
import { TarifasService } from '../services/tarifas.service';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import Swal from 'sweetalert2';

import { MessageService } from 'primeng/api';

@Component({
  selector: 'app-tarifas',
  templateUrl: './tarifas.component.html',
  providers: [MessageService]

})
export class TarifasComponent {

    tarifas: any = [];  // Para almacenar las tarifas obtenidas
    isLoading: boolean = false;
    page: number = 1;  // Paginación (inicialmente en la página 1)
    search: string = '';  // Filtro de búsqueda
    iterador: number = 0; //
    tarifaForm:FormGroup;


    editDialog: boolean = false; // Para controlar la visibilidad del modal de edición
  tarifaSeleccionada: any = null; // Para almacenar la tarifa seleccionada para editar



    constructor( private _TarifasService: TarifasService,
        private fb: FormBuilder,
        private messageService: MessageService,
    )
    {


        this.tarifaForm= this.fb.group({
            nombre: ['', Validators.required],
            precio_base: ['', Validators.required],
        });



    }
    ngOnInit(): void {
        //Called after the constructor, initializing input properties, and the first call to ngOnChanges.
        //Add 'implements OnInit' to the class.
        this.ListarTarifas();
    }

    ListarTarifas(){
        this.isLoading = true;  // Mostrar el indicador de carga
        this._TarifasService.listarTarifas(this.page, this.search).subscribe(
            data => {
                // Ahora asumimos que 'data' es directamente el array de tarifas
                if (Array.isArray(data)) {  // Verificamos si es un array
                    this.tarifas = data;
                    console.log(this.tarifas);
                } else {
                    console.error('La respuesta no es un arreglo');
                    this.tarifas = [];
                }
                this.isLoading = false;  // Ocultar el indicador de carga
            },
            error => {
                console.error('Error:', error);
                this.isLoading = false;  // Ocultar el indicador de carga
                this.tarifas = [];  // Asignar un arreglo vacío en caso de error
            }
        );
    }




    // Función para guardar una tarifa
    guardarTarifa() {
        if (this.tarifaForm.invalid) {
            return;
        }

        const tarifaData = this.tarifaForm.value;

        this._TarifasService.registrarTarifa(tarifaData).subscribe(
            (response) => {
                // Si la respuesta es exitosa
                Swal.fire({
                    icon: 'success',
                    title: '¡Éxito!',
                    text: 'La tarifa se ha guardado correctamente.',
                    confirmButtonText: 'Aceptar'
                }).then(() => {
                    this.ListarTarifas();  // Refrescar la lista de tarifas
                    this.tarifaForm.reset();  // Limpiar el formulario
                });
            },


            (error) => {
                if (error && error.message === 'Este nombre de tarifa ya existe. Por favor elige otro.') {
                    Swal.fire({
                        icon: 'error',
                        title: 'Error',
                        text: 'Este nombre de tarifa ya existe. Por favor elige otro.',
                        confirmButtonText: 'Aceptar'
                    });
                } else {
                    Swal.fire({
                        icon: 'error',
                        title: 'Error',
                        text: 'Hubo un problema al guardar la tarifa. Intenta nuevamente.',
                        confirmButtonText: 'Aceptar'
                    });
                }
            }
        );
    }



      // Función para guardar los cambios de la tarifa

    // Función para eliminar una tarifa
    eliminarTarifa(id: number) {
        Swal.fire({
            title: '¿Estás seguro?',
            text: 'Esta tarifa será eliminada permanentemente.',
            icon: 'warning',
            showCancelButton: true,
            confirmButtonText: 'Sí, eliminar',
            cancelButtonText: 'Cancelar'
        }).then((result) => {
            if (result.isConfirmed) {
                this._TarifasService.eliminarTarifa(id).subscribe(
                    (response) => {
                        this.ListarTarifas();
                        this.messageService.add({ severity: 'success', summary: 'Éxito', detail: 'La Tarifa se ha eliminado correctamente' });
                    },
                    (error) => {
                        Swal.fire({
                            icon: 'error',
                            title: 'Error',
                            text: 'Hubo un problema al eliminar la tarifa. Intenta nuevamente.',
                            confirmButtonText: 'Aceptar'
                        });
                    }
                );
            }
        });
    }






    editarTarifa(tarifa: any) {
        this.tarifaSeleccionada = tarifa;  // Guardamos la tarifa seleccionada para su actualización
        this.tarifaForm.setValue({
          nombre: tarifa.nombre,
          precio_base: tarifa.precio_base,
        });
        this.editDialog = true; // Mostramos el modal para editar
      }



      guardarTarifaActualizada() {
        if (this.tarifaForm.invalid) {
          return; // No guardar si el formulario es inválido
        }

        const tarifaData = this.tarifaForm.value;

        if (this.tarifaSeleccionada) {
          this._TarifasService
            .actualizarTarifa(this.tarifaSeleccionada.id, tarifaData)
            .subscribe(
              (response) => {
                this.cancelarEdicion();
                Swal.fire({
                  icon: 'success',
                  title: '¡Éxito!',
                  text: 'La tarifa se ha actualizado correctamente.',
                  confirmButtonText: 'Aceptar',
                }).then(() => {
                  this.ListarTarifas(); // Refrescar la lista de tarifas
                  this.tarifaForm.reset(); // Limpiar el formulario
                  this.editDialog = false; // Solo cerrar el modal después de la actualización
                });
              },
              (error) => {
                if (error.status === 403 && error.message_text === 'Este nombre de tarifa ya existe. Por favor elige otro.') {
                  // Mostrar el mensaje específico cuando el nombre ya existe
                  this.messageService.add({ severity: 'error', summary: 'Error', detail: 'Este nombre de tarifa ya existe. Por favor elige otro.' });
                } else {
                  // Mostrar el mensaje genérico si hay otro tipo de error
                  Swal.fire({
                    icon: 'error',
                    title: 'Error',
                    text: error.message_text || 'Hubo un problema al actualizar la tarifa. Intenta nuevamente.',
                    confirmButtonText: 'Aceptar',
                  });
                }
              }
            );
        }
      }



      cancelarEdicion() {
        this.editDialog = false; // Cerramos el modal de edición
        this.tarifaForm.reset(); // Limpiamos el formulario
        this.tarifaSeleccionada = null; // Limpiamos la tarifa seleccionada
      }






}
