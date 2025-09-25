import { Component, Inject, OnInit } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA, MatDialog } from '@angular/material';
import { EmpresaService } from 'src/app/servicesComponents/empresa.service';
import { ToolsService } from 'src/app/services/tools.service';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ArchivosService } from 'src/app/servicesComponents/archivos.service';
import { FormusuariosComponent } from '../formusuarios/formusuarios.component';
import { UsuariosService } from 'src/app/servicesComponents/usuarios.service';
import { PaqueteService } from 'src/app/servicesComponents/paquete.service';
import { SuscripcionService } from 'src/app/servicesComponents/suscripcion.service';

@Component({
  selector: 'app-form-empresa',
  templateUrl: './form-empresa.component.html',
  styleUrls: ['./form-empresa.component.scss']
})
export class FormEmpresaComponent implements OnInit {

  form: FormGroup;
  data: any = {};
  logoPreview: string | ArrayBuffer;
  usuarios: any[] = [];
  paquetes: any[] = [];
  paqueteSeleccionado: any;
  suscripciones: any[] = [];
  paqueteActual: any = null;


  constructor(
    public dialogRef: MatDialogRef<FormEmpresaComponent>,
    @Inject(MAT_DIALOG_DATA) public datas: any,
    private fb: FormBuilder,
    private _empresa: EmpresaService,
    private _tools: ToolsService,
    private _archivos: ArchivosService,
    private dialog: MatDialog,
    private _usuarios: UsuariosService,
    private _paquetes: PaqueteService,
    private suscripcionService: SuscripcionService
  ) {
    this.data = this.datas || {};
  }

  ngOnInit() {
    let configT = {
      colorFondo: '#ffffff',
      colorTexto: '#000000',
      tipografia: 'Arial',
      colorFondoWeb: "#000000",
      colorTextoWeb: "#000000",
      colorBotonCompra: "#000000",
      colorBotonCarrito: "#000000",
      txtCompra: "CLIC PARA COMPRAR",
      txtComprauna: "COMPRAR DE UNA",
      txtagregarCarrito: "AGREGAR AL CARRITO Y COMPRAR MAS",
      listComent: [],
      where: {}
    }
    this.form = this.fb.group({
      nombreTienda: [this.data.nombreTienda || '', Validators.required],
      numeroCelular: [this.data.numeroCelular || '', Validators.required],
      emailTienda: [this.data.emailTienda || '', [Validators.required, Validators.email]],
      direccionTienda: [this.data.direccionTienda || '', Validators.required],
      decripcion: [this.data.decripcion || ''],
      logo: [this.data.logo || ''],
      configuracion: [ this.data.configuracion || configT ],
      dominio: [this.data.dominio || ''],
      urlBackend: [ this.data.urlBackend || ''],
      urlSocket: [ this.data.urlSocket || '' ],
      urlBackendFile: [ this.data.urlBackendFile || '' ],
      urlBackendSocial: [ this.data.urlBackendSocial || '' ],
      pixel_facebook: [ this.data.pixel_facebook || ''],
      paquete: [this.data.paquete || null]   // 👈 agregado para seleccionar paquete
    });

    if (this.data.logo) {
      this.logoPreview = this.data.logo;
    }
    if (this.data.id) {
      this.cargarUsuariosEmpresa(this.data.id);
      this.cargarSuscripciones();
    }
     this.cargarPaquetes();
    console.log("***51", this.data)

  }

  actualizarPreviewPaquete() {
    console.log("***86", this.form.value )
    this.paqueteSeleccionado = this.paquetes.find(p => p.id === this.form.value.paquete);
  }

  cargarUsuariosEmpresa(idEmpresa: number) {
    this._usuarios.get({ where: { usu_empresa: idEmpresa } }).subscribe((res: any) => {
      this.usuarios = res.data || [];
    });
  }

  cargarSuscripciones() {
    this.suscripcionService.reporte(this.data.id).subscribe({
      next: (res: any) => {
        this.suscripciones = res;
        this.paqueteActual = this.suscripciones.find((s: any) => s.estado === 'activo') || null;
      },
      error: (err) => console.error(err)
    });
  }

  cargarPaquetes() {
    this._paquetes.get({ where: {} }).subscribe({
      next: (res: any) => {
        this.paquetes = res.data || res;
      },
      error: (err) => console.error(err)
    });
  }

  cambiarPaquete() {
    if (!this.paqueteSeleccionado || !this.data.id) return;

    this.suscripcionService.create({
      empresa_id: this.data.id,
      paquete_id: this.paqueteSeleccionado
    }).subscribe({
      next: () => {
        this._tools.basic("Paquete asignado/actualizado con éxito");
        this.cargarSuscripciones();
      },
      error: (err) => this._tools.basic(err.error.message || 'Error al cambiar de paquete')
    });
  }

  renovarPaquete(paqueteId: number) {
    this.suscripcionService.renovar({
      empresa_id: this.data.id,
      paquete_id: paqueteId
    }).subscribe({
      next: () => {
        alert('Suscripción renovada con éxito');
        this.cargarSuscripciones();
      },
      error: (err) => alert(err.error.message || 'Error al renovar')
    });
  }

  editarUsuario(usuario: any) {
  const dialogRef = this.dialog.open(FormusuariosComponent, {
    data: { datos: usuario }
  });

  dialogRef.afterClosed().subscribe(res => {
    if (res) this.cargarUsuariosEmpresa(this.data.id);
  });
}


  subirLogo(event: any) {
    const file = event.target.files[0];
    if (!file) return;

    const formData = new FormData();
    formData.append('file', file);

    this._archivos.create(formData).subscribe((res: any) => {
      this.form.patchValue({ logo: res.url });
      this.logoPreview = res.url;
    }, err => {
      this._tools.presentToast("Error subiendo el archivo");
      console.error(err);
    });
  }

  guardar() {
    if (this.form.invalid) return this._tools.presentToast("Formulario inválido");

    const formData = this.form.value;

    if (this.data.id) {
      // Actualizar
      formData.id = this.data.id;
      formData.paquete= this.form.value.paquete;
      this._empresa.update( formData ).subscribe(res => {
        this._tools.presentToast("Empresa actualizada");
        //this.dialogRef.close(true);
      });
    } else {
      // Crear
      formData.paquete= this.form.value.paquete;
      this._empresa.create(formData).subscribe(res => {
        this._tools.presentToast("Empresa creada");
        this.dialogRef.close(true);
      });
    }
  }

  crearSubadmin() {
    const dialogRef = this.dialog.open(FormusuariosComponent, {
      data: {
        datos: {
          usu_nombre: '',
          usu_email: '',
          usu_telefono: '',
          usu_empresa: this.data.id || null,
          usu_perfil: 'subadmin'
        }
      }
    });

    dialogRef.afterClosed().subscribe(res => {
      if (res) this._tools.presentToast("Subadministrador creado");
      if (res) this.cargarUsuariosEmpresa(this.data.id); // Recarga tabla al cerrar
    });
  }

  eliminarUsuario(user: any) {
  if (!confirm(`¿Estás seguro de eliminar al usuario ${user.usu_nombre}?`)) return;

  this._usuarios.delete({ where: { id: user.id } }).subscribe(() => {
    this._tools.basic('Usuario eliminado');
    this.cargarUsuariosEmpresa(this.data.id); // Refresca lista
  }, err => {
    this._tools.error('No se pudo eliminar el usuario');
    console.error(err);
  });
}

  cerrar() {
    this.dialogRef.close();
  }

}