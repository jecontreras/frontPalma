import { Component, OnInit, Inject } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { NgxSpinnerService } from "ngx-spinner";
import { ArchivosService } from 'src/app/servicesComponents/archivos.service';
import { PaqueteService } from 'src/app/servicesComponents/paquete.service';
import * as _ from 'lodash';

@Component({
  selector: 'app-form-admin-paquetes',
  templateUrl: './form-admin-paquetes.component.html',
  styleUrls: ['./form-admin-paquetes.component.scss']
})
export class FormAdminPaquetesComponent implements OnInit {

  loading: boolean = false;

  constructor(
    private paqueteService: PaqueteService,
    private _archivos: ArchivosService,
    private spinner: NgxSpinnerService,
    public dialogRef: MatDialogRef<FormAdminPaquetesComponent>,
    @Inject(MAT_DIALOG_DATA) public data: any
  ) {}

  ngOnInit(): void {
    // si es nuevo, inicializar data
    if (!this.data) {
      this.data = {
        titulo: '',
        descripcion: '',
        precio: 0,
        productos_max: 0,
        ventas_max: 0,
        imagen: ''
      };
    }
  }

  // ✅ Subida de imagen con tu servicio this._archivos.create(form)
  subirImagen(event: any) {
    const file = event.target.files[0];
    if (file) {
      const form = new FormData();
      form.append('file', file);

      this.loading = true;
      this.spinner.show();

      this._archivos.create(form).subscribe(
        (res: any) => {
          this.loading = false;
          this.spinner.hide();
          if (res && res.files) {
            this.data.imagen = res.files; // guardamos la URL devuelta por el backend
          }
        },
        (err: any) => {
          this.loading = false;
          this.spinner.hide();
          console.error('Error al subir imagen', err);
        }
      );
    }
  }

  // ✅ Guardar o actualizar paquete
  guardar() {
    this.loading = true;
    this.spinner.show();

    if (this.data.id) {
      // actualizar
      this.data = _.omitBy(this.data, _.isNull);
      this.paqueteService.update(this.data).subscribe(
        (res: any) => {
          this.loading = false;
          this.spinner.hide();
          this.dialogRef.close(true);
        },
        (err: any) => {
          this.loading = false;
          this.spinner.hide();
          console.error('Error al actualizar paquete', err);
        }
      );
    } else {
      // crear
      this.paqueteService.create(this.data).subscribe(
        (res: any) => {
          this.loading = false;
          this.spinner.hide();
          this.dialogRef.close(true);
        },
        (err: any) => {
          this.loading = false;
          this.spinner.hide();
          console.error('Error al crear paquete', err);
        }
      );
    }
  }

  cancelar() {
    this.dialogRef.close();
  }

}
