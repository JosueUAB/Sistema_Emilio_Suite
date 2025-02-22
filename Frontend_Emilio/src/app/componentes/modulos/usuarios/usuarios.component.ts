import { Component, OnInit } from '@angular/core';
import { AbstractControl, FormBuilder, FormGroup, ValidationErrors, Validators } from '@angular/forms';
import { MessageService } from 'primeng/api';
import { UsuariosService } from 'src/app/services/usuarios.service';
import { AuthService } from 'src/app/services/auth.service';
import { RolesService } from 'src/app/services/roles.service';
import mensaje from 'sweetalert2'


@Component({
  selector: 'app-usuarios',
  templateUrl: './usuarios.component.html',
  providers: [MessageService]
})
export class UsuariosComponent implements OnInit {
  usuarios: any[] = [];
  usuarioForm: FormGroup;
  editUsuarioForm: FormGroup;
  guardarDialog: boolean = false;
  editDialog: boolean = false;

  selectedUsuario: any;
  roles: any[] = [];
  tiposDocumento = ['CI', 'CARNET DE EXTRANJERIA', 'PASAPORTE','LIBRETA DE SERVICIO MILITAR'];
  imagenPrevisualiza: string | ArrayBuffer | null = null;
  file: File | null = null;
  file_name: string | null = null;
    toast: any;

  constructor(
    private usuariosService: UsuariosService,
    private _roleservice: RolesService,
    private fb: FormBuilder,
    private fc: FormBuilder,
    private messageService: MessageService,
    private authService: AuthService
  ) {
    this.usuarioForm = this.fb.group({
      name: ['', Validators.required],
      surname: ['', Validators.required],
      email: ['', [Validators.required, Validators.email]],
      phone: ['', Validators.required],
      role_id: ['', Validators.required],
      gender: ['', Validators.required],
      type_document: ['', Validators.required],
      n_document: ['', Validators.required],
      address: ['', Validators.required],
      password: ['', Validators.required],
      password_repit: ['', Validators.required],
      avatar: [null]
    });
    this.editUsuarioForm = this.fc.group({
      name: ['', Validators.required],
      surname: ['', Validators.required],
      email: ['', [Validators.required, Validators.email]],
      phone: ['', Validators.required],
      role_id: ['', Validators.required],
      gender: ['', Validators.required],
      type_document: ['', Validators.required],
      n_document: ['', Validators.required],
      address: ['', Validators.required],
      avatar: [null]  // Mantener el campo para la imagen en edición
    });
  }

  ngOnInit(): void {
    this.listarUsuarios();
    this.cargarRoles();
  }

  listarUsuarios(): void {
    this.usuariosService.listarUsuarios().subscribe(
      (response) => {
        if (response && response.users) {
          this.usuarios = response.users;
          console.log(response)
        } else {
          console.error('La respuesta no contiene los usuarios esperados');
        }
      },
      (error) => {
        console.error('Error al listar usuarios:', error);
      }
    );
  }

  cargarRoles(): void {
    this._roleservice.ListarRoles().subscribe(
      (response) => {
        if (response && response.roles) {
          this.roles = response.roles; // Asignar la lista de roles
          console.log('Roles cargados:', this.roles); // Verificar en consola
        } else {
          console.error('La respuesta no contiene los roles esperados');
        }
      },
      (error) => {
        console.error('Error al cargar roles:', error);
      }
    );
  }

  openNew(): void {
    this.guardarDialog = true;
  }

  hideDialog(): void {
    this.guardarDialog = false;
    this.usuarioForm.reset();
    this.imagenPrevisualiza = null;
    this.file = null;
    this.file_name = null;
  }

  // Verificación de tipo de archivo y carga de imagen
  onFileSelect(event: any): void {
    this.file = event.files[0];
    if (this.file) {
      const fileType = this.file.type.split('/')[0];
      if (fileType === 'image') {
        this.file_name = this.file.name; // Guardar nombre de la imagen
        const reader = new FileReader();
        reader.onload = () => {
          this.imagenPrevisualiza = reader.result;
        };
        reader.readAsDataURL(this.file);
      } else {
        this.messageService.add({ severity: 'error', summary: 'Error', detail: 'El archivo seleccionado no es una imagen válida.' });
        this.file = null;
      }
    }
  }

  guardarUsuario(): void {
    if (this.usuarioForm.valid && this.usuarioForm.value.password === this.usuarioForm.value.password_repit) {
      const formData = new FormData();

      // Añadir datos del formulario al FormData
      Object.keys(this.usuarioForm.value).forEach(key => {
        if (key !== 'avatar' && key !== 'password_repit') {
          formData.append(key, this.usuarioForm.value[key]);
        }
      });

      // Añadir la imagen al FormData si existe
      if (this.file) {
        formData.append("imagen", this.file, this.file_name); // Añadir imagen con su nombre original
      }


      console.log('el form data es el siguiente : ', formData)

      this.usuariosService.registrarUsuario(formData).subscribe(
        (response) => {
          this.messageService.add({ severity: 'success', summary: 'Éxito', detail: 'Usuario registrado con éxito' });
          console.log(response)
          this.listarUsuarios();
          this.hideDialog();
        },
        (error) => {
          this.messageService.add({ severity: 'error', summary: 'Error', detail: 'No se pudo registrar el usuario' });
        }
      );
    } else {
      this.messageService.add({ severity: 'error', summary: 'Error', detail: 'Por favor, complete el formulario correctamente' });
    }
  }

  editarUsuario(usuario: any): void {
    this.selectedUsuario = { ...usuario }; // Cargar los datos del usuario

    // Verificar que la lista de roles esté cargada
    if (this.roles.length === 0) {
      this.cargarRoles(); // Cargar roles si no están cargados
    }

    // Pre-cargar datos en el formulario de edición
    this.editUsuarioForm.patchValue({
      name: usuario.name,
      surname: usuario.surname,
      email: usuario.email,
      phone: usuario.phone,
      role_id: usuario.role ? usuario.role.id : '',  // Verifica si el rol está presente
      gender: usuario.gender,
      type_document: usuario.type_document,
      n_document: usuario.n_document,
      address: usuario.address
    });

    // Verificar si el usuario tiene una imagen y cargarla para la previsualización
    if (usuario.avatar) {
      this.imagenPrevisualiza = usuario.avatar;  // Asumimos que `usuario.avatar` es la URL de la imagen
    }

    // Usar setTimeout para asegurar que el p-dropdown se actualice
    setTimeout(() => {
      this.editDialog = true; // Abrir el modal de edición
    }, 0);
  }
  // Cerrar el modal de edición
  hideEditDialog(): void {
    this.editDialog = false;
    this.imagenPrevisualiza = null; // Limpiar la imagen previsualizada
    this.file = null;  // Limpiar el archivo seleccionado
  }


eliminarUsuario(id: number): void {
  // Muestra el cuadro de confirmación de SweetAlert2
  mensaje.fire({
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
      this.usuariosService.eliminarUsuario(id).subscribe(
        (response) => {
          if (response) {
            this.messageService.add({ severity: 'success', summary: 'Éxito', detail: 'Usuario eliminado correctamente' });
            this.listarUsuarios(); // Recargar la lista de usuarios
          }
        },
        (error) => {
          this.messageService.add({ severity: 'error', summary: 'Error', detail: 'Error al eliminar el usuario' });
        }
      );
    } else {
      // Si el usuario cancela, no hacer nada
      mensaje.fire('Cancelado', 'La eliminación ha sido cancelada', 'info');
    }
  });
  this.hideEditDialog(); // Cerrar el modal después de eliminar
}


// guardarUsuarioEditado(): void {
//   const data = { ...this.editUsuarioForm.value };

//   // Crear FormData para incluir la imagen si es que existe
//   const formData = new FormData();

//   // Si hay una imagen seleccionada, agregarla al FormData
//   if (this.file) {
//     formData.append("imagen", this.file, this.file.name);  // Aquí se agrega la imagen
//   } else if (this.imagenPrevisualiza) {
//     // Si la imagen previsualizada es base64 (string)
//     if (typeof this.imagenPrevisualiza === 'string') {
//       // Agregar la imagen base64 directamente al FormData
//       formData.append("imagen", this.imagenPrevisualiza); // Ya no convertimos a Blob
//     }
//   }

//   // Agregar los demás datos al FormData, excluyendo la imagen ya agregada
//   Object.keys(data).forEach(key => {
//     if (data[key] !== null && data[key] !== undefined && key !== 'avatar') { // Excluimos avatar para no añadirlo dos veces
//       formData.append(key, data[key]);
//     }
//   });

//   console.log("Form Data que se está enviando:", formData);



//   this.usuariosService.actualizarUsuario(this.selectedUsuario.id, formData).subscribe(
//     (response) => {
//       console.log("Respuesta del servidor:", response); // Muestra toda la respuesta del servidor

//       // Verifica si el campo 'message' en la respuesta tiene un valor esperado
//       if (response.message_text && response.message_text === 'USUARIO ACTUALIZADO EXITOSAMENTE') {
//         // Si el mensaje es correcto, muestra el Toast de éxito
//         this.messageService.add({ severity: 'success', summary: 'Éxito', detail: response.message_text });
//         this.listarUsuarios(); // Recargar la lista de usuarios
//         this.hideEditDialog(); // Cerrar el diálogo de edición
//       } else {
//         // Si la respuesta no es lo que esperas, muestra un mensaje de error
//         this.messageService.add({ severity: 'error', summary: 'Error', detail: response.message_text || 'Error al actualizar el usuario' });
//       }
//     },
//     (error) => {
//       // Maneja cualquier error de conexión o respuesta inesperada
//       this.messageService.add({ severity: 'error', summary: 'Error', detail: 'Error en la solicitud al servidor' });
//       console.error('Error en la solicitud:', error);
//     }
//   );


// }


guardarUsuarioEditado(): void {
  const data = { ...this.editUsuarioForm.value };

  // Crear FormData para incluir la imagen si es que existe
  const formData = new FormData();

  // Si hay una imagen seleccionada, agregarla al FormData
  if (this.file) {
    formData.append("imagen", this.file, this.file.name);
  } else if (this.imagenPrevisualiza) {
    // Si la imagen previsualizada es base64 (string)
    if (typeof this.imagenPrevisualiza === 'string') {
      formData.append("imagen", this.imagenPrevisualiza);
    }
  }

  // Agregar los demás datos al FormData
  Object.keys(data).forEach(key => {
    if (data[key] !== null && data[key] !== undefined && key !== 'avatar') {
      formData.append(key, data[key]);
    }
  });

  // Mostrar el contenido de FormData como JSON (para depuración)
  const formDataJSON = {};
  formData.forEach((value, key) => {
    formDataJSON[key] = value instanceof File ? 'Archivo' : value; // Muestra "Archivo" para valores de tipo File
  });
  console.log("Datos que se enviarán al servidor:", JSON.stringify(formDataJSON, null, 2));

  // Actualizar el usuario en el backend
  this.usuariosService.actualizarUsuario(this.selectedUsuario.id, formData).subscribe(
    (response) => {
      console.log("Respuesta del servidor:", response);

      if (response.message_text === 'USUARIO ACTUALIZADO EXITOSAMENTE') {
        this.messageService.add({ severity: 'success', summary: 'Éxito', detail: response.message_text });

        // Recargar la lista de usuarios después de la actualización
        this.listarUsuarios(); // Aquí hacemos la llamada para obtener la lista completa de usuarios

        this.hideEditDialog(); // Cerrar el modal de edición
      } else {
        this.messageService.add({ severity: 'error', summary: 'Error', detail: response.message_text || 'Error al actualizar el usuario' });
      }
    },
    (error) => {
      this.messageService.add({ severity: 'error', summary: 'Error', detail: 'Error en la solicitud al servidor' });
      console.error('Error en la solicitud:', error);
    }
  );
}



base64ToBlob(base64: string) {
  try {
    const binary = atob(base64);
    const length = binary.length;
    const array = new Uint8Array(length);

    for (let i = 0; i < length; i++) {
      array[i] = binary.charCodeAt(i);
    }

    return new Blob([array], { type: 'application/octet-stream' });
  } catch (e) {
    console.error('Error decodificando Base64: ', e);
    return null;
  }
}



processFile($event: any) {
  if ($event.target.files[0].type.indexOf("image") < 0) {
    this.toast.warning("WARN", "El archivo no es una imagen");
    return;
  }
  this.file = $event.target.files[0]; // Almacenamos el archivo seleccionado
  let reader = new FileReader();
  reader.readAsDataURL(this.file);
  reader.onloadend = () => this.imagenPrevisualiza = reader.result; // Previsualización de la imagen
}


}
