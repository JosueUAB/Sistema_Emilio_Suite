import { Component } from '@angular/core';
import { ReservasService } from '../service/reservas.service';
import { MessageService, PrimeNGConfig } from 'primeng/api';
import { DialogService } from 'primeng/dynamicdialog';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';


import QRCode from 'qrcode';
import JsBarcode from 'jsbarcode';




import pdfMake from "pdfmake/build/pdfmake";
import pdfFonts from "pdfmake/build/vfs_fonts";

(pdfMake as any).vfs = pdfFonts.pdfMake.vfs;
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


imprimirTicket(idReserva: number): void {
    console.log('El ID que se manda es: ', idReserva);

    this._reservaService.obtenerHabitacionOcupadaPorIdReserva(idReserva).subscribe(
        (response) => {
            if (response) {
                const reserva = response.reserva;
                console.log('Respuesta obtenida:', reserva);

                // Generar el ticket de salida en PDF con QR y código de barras
                this.generarTicketPDF(reserva);
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






// generarTicketPDF(reserva: any): void {
//   const qrData = `ID de Reserva: ${reserva.id}\nHabitación: ${reserva.habitacion.numero}\nCliente: ${reserva.huesped.nombre} ${reserva.huesped.apellido}`;

//   // Generar el código QR
//   QRCode.toDataURL(qrData, { errorCorrectionLevel: 'H' }, (err, qrUrl) => {
//     if (err) {
//       console.error('Error al generar el código QR:', err);
//       return;
//     }

//     // Generar el código de barras
//     const canvas = document.createElement('canvas');
//     JsBarcode(canvas, reserva.id.toString(), {
//       format: 'CODE128',
//       displayValue: true,
//       fontSize: 10,
//       height: 20,
//     });

//     const barcodeDataUrl = canvas.toDataURL('image/png');

//     // Definir el contenido del PDF
//     const content: any[] = [
//       { text: '**************************', alignment: 'center', fontSize: 10 },
//       { text: '****** Emilio Suite ******', alignment: 'center', style: 'header', fontSize: 12 },
//       { text: '***** NIT: xxxxxxxxxxx *****', alignment: 'center', fontSize: 10 },
//       { text: '**************************', alignment: 'center', fontSize: 10 },
//       { text: '\n' }, // Espacio en blanco

//       { text: `Código de Reserva: ${reserva.id}`, alignment: 'center', style: 'subheader', fontSize: 10 },
//       { text: `Fecha de Generación: ${new Date().toLocaleDateString('es-BO')}`, alignment: 'center', style: 'subheader', fontSize: 10 },
//       { text: '\n' }, // Espacio en blanco

//       { text: '------------------------------', alignment: 'center', fontSize: 10 },
//       { text: 'Código QR', alignment: 'center', style: 'subheader', fontSize: 10 },
//       { image: qrUrl, width: 80, alignment: 'center' }, // Reducir el tamaño del QR
//       { text: '------------------------------', alignment: 'center', fontSize: 10 },
//       { text: '\n' }, // Espacio en blanco

//       // Detalles del Huésped
//       { text: 'Detalles del Huésped', style: 'subheader', fontSize: 10 },
//       {
//         table: {
//           widths: ['auto', '*'], // Ajustar el ancho de las columnas
//           body: [
//             ['Nombre', `${reserva.huesped.nombre} ${reserva.huesped.apellido}`],
//             ['Documento', reserva.huesped.numero_documento],
//             ['Correo', reserva.huesped.correo],
//             ['Teléfono', reserva.huesped.telefono],
//             ['Dirección', reserva.huesped.direccion],
//           ],
//         },
//         layout: 'noBorders', // Sin bordes para una apariencia limpia
//         fontSize: 8, // Reducir el tamaño de la fuente de la tabla
//       },
//       { text: '------------------------------', alignment: 'center', fontSize: 10 },
//       { text: '\n' }, // Espacio en blanco

//       // Detalles de la Habitación
//       { text: 'Detalles de la Habitación', style: 'subheader', fontSize: 10 },
//       {
//         table: {
//           widths: ['auto', '*'], // Ajustar el ancho de las columnas
//           body: [
//             ['Número', reserva.habitacion.numero],
//             ['Piso', reserva.habitacion.numero_piso],
//             ['Tipo', reserva.habitacion.tipo_habitacion.nombre],
//             ['Descripción', reserva.habitacion.descripcion],
//           ],
//         },
//         layout: 'noBorders',
//         fontSize: 8, // Reducir el tamaño de la fuente de la tabla
//       },
//       { text: '------------------------------', alignment: 'center', fontSize: 10 },
//       { text: '\n' }, // Espacio en blanco

//       // Detalles del Pago
//       { text: 'Detalles del Pago', style: 'subheader', fontSize: 10 },
//       {
//         table: {
//           widths: ['auto', '*'], // Ajustar el ancho de las columnas
//           body: [
//             ['Precio por Noche', `Bs. ${reserva.detalles_pago.costo_por_noche}`],
//             ['Días de Hospedaje', reserva.detalles_pago.dias_hospedaje],
//             ['Descuento Aplicado', `Bs. ${reserva.detalles_pago.monto_descuento}`],
//             ['Total a Pagar', `Bs. ${reserva.detalles_pago.total_con_descuento}`],
//             ['Método de Pago', reserva.pago.metodo_de_pago],
//           ],
//         },
//         layout: 'noBorders',
//         fontSize: 8, // Reducir el tamaño de la fuente de la tabla
//       },
//       { text: '------------------------------', alignment: 'center', fontSize: 10 },
//       { text: '\n' }, // Espacio en blanco

//       // Tiempo Restante para Checkout
//       { text: 'Tiempo Restante para el Checkout', style: 'subheader', fontSize: 10 },
//       { text: reserva.tiempo_restante_checkout.mensaje, style: 'details', fontSize: 8 },
//       { text: '------------------------------', alignment: 'center', fontSize: 10 },
//       { text: '\n' }, // Espacio en blanco

//       // Código de Barras
//       { text: 'Código de Barras', alignment: 'center', style: 'subheader', fontSize: 10 },
//       { image: barcodeDataUrl, width: 150, alignment: 'center' }, // Reducir el tamaño del código de barras
//       { text: '\n' }, // Espacio en blanco
//     ];

//     // Definir estilos
//     const styles = {
//       header: {
//         fontSize: 12,
//         bold: true,
//         alignment: 'center' as const,
//       },
//       subheader: {
//         fontSize: 10,
//         bold: true,
//         alignment: 'left' as const,
//       },
//       details: {
//         fontSize: 8,
//         alignment: 'left' as const,
//       },
//     };

//     // Crear el documento PDF
//     const docDefinition = {
//         content: content,  // contenido del PDF
//         styles: styles,    // estilos para el contenido
//         pageSize: 'A5',    // tamaño de la página A5
//         pageOrientation: 'portrait', // orientación de la página (portrait o landscape)
//         pageMargins: [5, 5, 5, 5],   // márgenes: [izquierda, arriba, derecha, abajo] (4 elementos)
//       };

//     // Generar y abrir el PDF
//     pdfMake.createPdf(docDefinition).open();
//   });
// }

generarTicketPDF(reserva: any): void {
    const qrData = `ID de Reserva: ${reserva.id}\nHabitación: ${reserva.habitacion.numero}\nCliente: ${reserva.huesped.nombre} ${reserva.huesped.apellido}`;

    // Generar el código QR
    QRCode.toDataURL(qrData, { errorCorrectionLevel: 'H' }, (err, qrUrl) => {
      if (err) {
        console.error('Error al generar el código QR:', err);
        return;
      }

      // Generar el código de barras
      const canvas = document.createElement('canvas');
      JsBarcode(canvas, reserva.id.toString(), {
        format: 'CODE128',
        displayValue: true,
        fontSize: 10,
        height: 20,
      });

      const barcodeDataUrl = canvas.toDataURL('image/png');

      // Definir el contenido del PDF
      const content: any[] = [
        { text: '*****************************************', alignment: 'left', fontSize: 10 },
        { text: '********** Emilio Suite **********', alignment: 'left', style: 'header', fontSize: 12 },
        { text: '*********** NIT: xxxxxxxxxxx ************', alignment: 'left', fontSize: 10 },
        { text: '*****************************************', alignment: 'left', fontSize: 10 },
        { text: '\n' }, // Espacio en blanco

        { text: `Código de Reserva: ${reserva.id}`, alignment: 'left', style: 'subheader', fontSize: 10 },
        { text: `Fecha de Generación: ${new Date().toLocaleDateString('es-BO')}`, alignment: 'left', style: 'subheader', fontSize: 10 },
        { text: '\n' }, // Espacio en blanco

        { text: '----------------------------------------------------------------------', alignment: 'left', fontSize: 10 },
        { text: 'Código QR', alignment: 'left', style: 'subheader', fontSize: 10 },
        { image: qrUrl, width: 80, alignment: 'left' }, // Reducir el tamaño del QR
        { text: '----------------------------------------------------------------------', alignment: 'left', fontSize: 10 },
        { text: '\n' }, // Espacio en blanco

        // Detalles del Huésped
        { text: 'Detalles del Huésped', style: 'subheader', fontSize: 10 },
        {
          table: {
            widths: ['auto', '*'], // Ajustar el ancho de las columnas
            body: [
              ['Nombre', `${reserva.huesped.nombre} ${reserva.huesped.apellido}`],
              ['Documento', reserva.huesped.numero_documento],
              ['Correo', reserva.huesped.correo],
              ['Teléfono', reserva.huesped.telefono],
              ['Dirección', reserva.huesped.direccion],
            ],
          },
          layout: 'noBorders', // Sin bordes para una apariencia limpia
          fontSize: 8, // Reducir el tamaño de la fuente de la tabla
        },
        { text: '----------------------------------------------------------------------', alignment: 'left', fontSize: 10 },
        { text: '\n' }, // Espacio en blanco

        // Detalles de la Habitación
        { text: 'Detalles de la Habitación', style: 'subheader', fontSize: 10 },
        {
          table: {
            widths: ['auto', '*'], // Ajustar el ancho de las columnas
            body: [
              ['Número', reserva.habitacion.numero],
              ['Piso', reserva.habitacion.numero_piso],
              ['Tipo', reserva.habitacion.tipo_habitacion.nombre],
              ['Descripción', reserva.habitacion.descripcion],
            ],
          },
          layout: 'noBorders',
          fontSize: 8, // Reducir el tamaño de la fuente de la tabla
        },
        { text: '----------------------------------------------------------------------', alignment: 'left', fontSize: 10 },
        { text: '\n' }, // Espacio en blanco

        // Detalles del Pago
        { text: 'Detalles del Pago', style: 'subheader', fontSize: 10 },
        {
          table: {
            widths: ['auto', '*'], // Ajustar el ancho de las columnas
            body: [
              ['Precio por Noche', `Bs. ${reserva.detalles_pago.costo_por_noche}`],
              ['Días de Hospedaje', reserva.detalles_pago.dias_hospedaje],
              ['Descuento Aplicado', `Bs. ${reserva.detalles_pago.monto_descuento}`],
              ['Total a Pagar', `Bs. ${reserva.detalles_pago.total_con_descuento}`],
              ['Método de Pago', reserva.pago.metodo_de_pago],
            ],
          },
          layout: 'noBorders',
          fontSize: 8, // Reducir el tamaño de la fuente de la tabla
        },
        { text: '----------------------------------------------------------------------', alignment: 'left', fontSize: 10 },
        { text: '\n' }, // Espacio en blanco

        // Tiempo Restante para Checkout
        { text: 'Tiempo Restante para el Checkout', style: 'subheader', fontSize: 10 },
        { text: reserva.tiempo_restante_checkout.mensaje, style: 'details', fontSize: 8 },
        { text: '----------------------------------------------------------------------', alignment: 'left', fontSize: 10 },
        { text: '\n' }, // Espacio en blanco

        // Código de Barras
        { text: 'Código de Barras', alignment: 'left', style: 'subheader', fontSize: 10 },
        { image: barcodeDataUrl, width: 100, alignment: 'left' }, // Reducir el tamaño del código de barras
        { text: '\n' }, // Espacio en blanco
      ];

      // Definir estilos
      const styles = {
        header: {
          fontSize: 12,
          bold: true,
          alignment: 'left' as const,
        },
        subheader: {
          fontSize: 10,
          bold: true,
          alignment: 'left' as const,
        },
        details: {
          fontSize: 8,
          alignment: 'left' as const,
        },
      };

      // Crear el documento PDF
      const docDefinition = {
        content: content,  // contenido del PDF
        styles: styles,    // estilos para el contenido


      };

      // Generar y abrir el PDF
      pdfMake.createPdf(docDefinition).open();
    });
  }



cerrarModalCheckOut(){

    this.ModalCHECKOUT=false;
    this.obtenerHabitacionesOcupadasParaCheckout();
    this.pagoPendienteForm.reset();
}


}
