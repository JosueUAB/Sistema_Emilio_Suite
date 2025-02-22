
import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Tipo_habitacionService } from '../services/tipo_habitacion.service';
import Swal from 'sweetalert2';
import { MessageService } from 'primeng/api';
@Component({
  selector: 'app-tipo-habitacion',


  templateUrl: './tipo-habitacion.component.html',
  providers: [MessageService],
})
export class TipoHabitacionComponent {
    tiposHabitacion: any[] = [];
    habitacionForm: FormGroup;
    editDialog: boolean = false;
    habitacionSeleccionada: any = null;
  
    constructor(
      private fb: FormBuilder,
      private _TipoHabitacionService: Tipo_habitacionService,
      private messageService: MessageService
    ) {
      this.habitacionForm = this.fb.group({
        nombre: ['', Validators.required],
        descripcion: ['', Validators.required],
      });
    }
  
    ngOnInit(): void {
      this.listarTiposHabitacion();
    }
  
    listarTiposHabitacion(): void {
      this._TipoHabitacionService.listarTipoHabitaciones().subscribe(
        (data) => {
          this.tiposHabitacion = data;
        },
        (error) => {
          console.error('Error al listar los tipos de habitación', error);
        }
      );
    }
  
    guardarTipoHabitacion(): void {
        if (this.habitacionForm.invalid) return;
      
        const tipoHabitacionData = this.habitacionForm.value;
        this._TipoHabitacionService.registrarTipoHabitacion(tipoHabitacionData).subscribe(
          (response) => {
            Swal.fire('¡Éxito!', 'El tipo de habitación ha sido guardado correctamente.', 'success');
            this.listarTiposHabitacion();
            this.habitacionForm.reset();
          },
          (error) => {
            // Mostrar el mensaje específico del error si existe
            if (error.message === 'El nombre de la habitación ya existe.') {
              Swal.fire('¡Error!', error.message, 'error');
            } else {
              Swal.fire('¡Error!', 'Hubo un problema al guardar el tipo de habitación.', 'error');
            }
          }
        );
      }
      
  
    editarTipoHabitacion(tipo: any): void {
      this.habitacionSeleccionada = tipo;
      this.habitacionForm.setValue({
        nombre: tipo.nombre,
        descripcion: tipo.descripcion,
      });
      this.editDialog = true;
    }
  
    guardarTipoHabitacionActualizada(): void {
        if (this.habitacionForm.invalid) return;
      
        const tipoHabitacionData = this.habitacionForm.value;
        this._TipoHabitacionService
          .actualizarTipoHabitacion(this.habitacionSeleccionada.id, tipoHabitacionData)
          .subscribe(
            (response) => {
              Swal.fire('¡Éxito!', 'El tipo de habitación ha sido actualizado correctamente.', 'success');
              this.listarTiposHabitacion();
              this.cancelarEdicion();
            },
            (error) => {
              // Aquí manejamos el error 403 y mostramos el mensaje adecuado
              if (error.message === 'El nombre de la habitación ya existe. Por favor elige otro.') {
                this.messageService.add({ severity: 'error', summary: 'Error', detail: 'Este tipo de habitacion ya existe. Por favor elige otro.' });
              } else {
                Swal.fire('¡Error!', 'Hubo un problema al actualizar el tipo de habitación.', 'error');
              }
            }
          );
      }
      
  
    eliminarTipoHabitacion(id: number): void {
      Swal.fire({
        title: '¿Estás seguro?',
        text: 'Esta acción eliminará permanentemente el tipo de habitación.',
        icon: 'warning',
        showCancelButton: true,
      }).then((result) => {
        if (result.isConfirmed) {
          this._TipoHabitacionService.eliminarTipoHabitacion(id).subscribe(
            (response) => {
              this.listarTiposHabitacion();
              this.messageService.add({
                severity: 'success',
                summary: '¡Éxito!',
                detail: 'El tipo de habitación ha sido eliminado correctamente.',
              });
            },
            (error) => {
              Swal.fire('¡Error!', 'Hubo un problema al eliminar el tipo de habitación.', 'error');
            }
          );
        }
      });
    }
  
    cancelarEdicion(): void {
      this.editDialog = false;
      this.habitacionForm.reset();
    }

}
