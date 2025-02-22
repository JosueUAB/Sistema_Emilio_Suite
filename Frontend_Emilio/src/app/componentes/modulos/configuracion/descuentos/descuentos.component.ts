import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';

import { MessageService } from 'primeng/api';
import Swal from 'sweetalert2';
import { DescuentoService } from '../services/descuentos.service';

@Component({
  selector: 'app-descuentos',
  templateUrl: './descuentos.component.html',
  providers: [MessageService]
})
export class DescuentosComponent implements OnInit {

  descuentos: any = [];  // Para almacenar los descuentos obtenidos
  isLoading: boolean = false;
  page: number = 1;  // Paginación
  search: string = '';  // Filtro de búsqueda
  descuentoForm: FormGroup;
  editDialog: boolean = false; // Para controlar la visibilidad del modal de edición
  descuentoSeleccionado: any = null; // Para almacenar el descuento seleccionado para editar

  constructor(
    private _DescuentoService: DescuentoService,
    private fb: FormBuilder,
    private messageService: MessageService
  ) {
    this.descuentoForm = this.fb.group({
      nombre: ['', Validators.required],
      porcentaje: ['', [Validators.required, Validators.min(0), Validators.max(100)]],
      fecha_inicio: ['', Validators.required],
      fecha_fin: ['', Validators.required]
    });
  }

  ngOnInit(): void {
    this.listarDescuentos();
  }

  // Listar descuentos
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

  // Función para guardar un descuento
  guardarDescuento() {
    if (this.descuentoForm.invalid) {
      return;
    }

    const descuentoData = this.descuentoForm.value;

    this._DescuentoService.registrarDescuento(descuentoData).subscribe(
      response => {
        Swal.fire({
          icon: 'success',
          title: '¡Éxito!',
          text: 'El descuento se ha guardado correctamente.',
          confirmButtonText: 'Aceptar'
        }).then(() => {
          this.listarDescuentos();
          this.descuentoForm.reset();
        });
      },
      error => {
        if (error && error.message === 'Este nombre de descuento ya existe. Por favor elige otro.') {
          Swal.fire({
            icon: 'error',
            title: 'Error',
            text: 'Este nombre de descuento ya existe. Por favor elige otro.',
            confirmButtonText: 'Aceptar'
          });
        } else {
          Swal.fire({
            icon: 'error',
            title: 'Error',
            text: 'Hubo un problema al guardar el descuento. Intenta nuevamente.',
            confirmButtonText: 'Aceptar'
          });
        }
      }
    );
  }

  // Función para editar un descuento
  editarDescuento(descuento: any) {
    this.descuentoSeleccionado = descuento;
    this.descuentoForm.setValue({
      nombre: descuento.nombre,
      porcentaje: descuento.porcentaje,
      fecha_inicio: descuento.fecha_inicio,
      fecha_fin: descuento.fecha_fin,
    });
    this.editDialog = true;  // Mostramos el modal para editar
  }

  // Función para guardar los cambios de un descuento
  guardarDescuentoActualizado() {
    if (this.descuentoForm.invalid) {
      return;
    }

    const descuentoData = this.descuentoForm.value;

    if (this.descuentoSeleccionado) {
      this._DescuentoService.actualizarDescuento(this.descuentoSeleccionado.id, descuentoData).subscribe(
        response => {
          this.cancelarEdicion();
          Swal.fire({
            icon: 'success',
            title: '¡Éxito!',
            text: 'El descuento se ha actualizado correctamente.',
            confirmButtonText: 'Aceptar'
          }).then(() => {
            this.listarDescuentos();
            this.descuentoForm.reset();
            this.editDialog = false;
          });
        },
        error => {
          if (error.status === 403 && error.message_text === 'Este nombre de descuento ya existe. Por favor elige otro.') {
            this.messageService.add({ severity: 'error', summary: 'Error', detail: 'Este nombre de descuento ya existe. Por favor elige otro.' });
          } else {
            Swal.fire({
              icon: 'error',
              title: 'Error',
              text: error.message_text || 'Hubo un problema al actualizar el descuento. Intenta nuevamente.',
              confirmButtonText: 'Aceptar'
            });
          }
        }
      );
    }
  }

  // Función para eliminar un descuento
  eliminarDescuento(id: number) {
    Swal.fire({
      title: '¿Estás seguro?',
      text: 'Este descuento será eliminado permanentemente.',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonText: 'Sí, eliminar',
      cancelButtonText: 'Cancelar'
    }).then((result) => {
      if (result.isConfirmed) {
        this._DescuentoService.eliminarDescuento(id).subscribe(
          response => {
            this.listarDescuentos();
            this.messageService.add({ severity: 'success', summary: 'Éxito', detail: 'El descuento se ha eliminado correctamente' });
            this.listarDescuentos();  // Refrescar la lista de descuentos
          },
          error => {
            Swal.fire({
              icon: 'error',
              title: 'Error',
              text: 'Hubo un problema al eliminar el descuento. Intenta nuevamente.',
              confirmButtonText: 'Aceptar'
            });
          }
        );
      }
    });
  }

  // Cancelar la edición
  cancelarEdicion() {
    this.editDialog = false;
    this.descuentoForm.reset();
    this.descuentoSeleccionado = null;
  }
}
