import { Component, Inject } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material';
import { TipoTallasService } from 'src/app/servicesComponents/tipo-tallas.service';

@Component({
  selector: 'app-form-tipo-medida',
  templateUrl: './form-tipo-medida.component.html',
  styleUrls: ['./form-tipo-medida.component.scss']
})
export class FormTipoMedidaComponent {
  descripcionTipo: string = '';
  tipoId: any = null;
  tallas: any[] = [];

  constructor(
    public dialogRef: MatDialogRef<FormTipoMedidaComponent>,
    private _tipoTallasService: TipoTallasService,
    @Inject(MAT_DIALOG_DATA) public data: any
  ) {}

  ngOnInit() {
    if (this.data) {
      this.descripcionTipo = this.data.tit_descripcion;
      this.tipoId = this.data.id;
      this._tipoTallasService.getTalla({ where: { tal_tipo: this.tipoId, tal_sw_activo: 0 } }).subscribe((res: any) => {
        this.tallas = res.data;
      });
    }
  }

  agregarTalla() {
    this.tallas.push({ tal_descripcion: '' });
  }

  eliminarTalla(index: number) {
    const talla = this.tallas[index];
    if (talla.id) {
      this._tipoTallasService.deleteTalla({ id: talla.id }).subscribe(() => {
        this.tallas.splice(index, 1);
      });
    } else {
      this.tallas.splice(index, 1);
    }
  }

  guardar() {
    const payload = { tit_descripcion: this.descripcionTipo };

    if (this.tipoId) {
      this._tipoTallasService.update({ id: this.tipoId, ...payload }).subscribe(() => {
        this.guardarTallas(this.tipoId);
      });
    } else {
      this._tipoTallasService.create(payload).subscribe((res: any) => {
        this.guardarTallas(res.id);
      });
    }
  }

  guardarTallas(tipoId: any) {
    const tareas = this.tallas.map(talla => {
      const payload = {
        tal_descripcion: talla.tal_descripcion,
        tal_tipo: tipoId,
        tal_sw_activo: 0
      };

      if (talla.id) {
        return this._tipoTallasService.updateTalla({ ...talla, ...payload }).toPromise();
      } else {
        return this._tipoTallasService.createTalla(payload).toPromise();
      }
    });

    Promise.all(tareas).then(() => {
      this.dialogRef.close(true);
    });
  }

  cerrar() {
    this.dialogRef.close(false);
  }
}