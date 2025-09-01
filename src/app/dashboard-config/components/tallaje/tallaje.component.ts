import { Component, OnInit } from '@angular/core';
import { MatDialog } from '@angular/material';
import { TipoTallasService } from 'src/app/servicesComponents/tipo-tallas.service';
import { FormTipoMedidaComponent } from '../../form/form-tipo-medida/form-tipo-medida.component';

@Component({
  selector: 'app-tallaje',
  templateUrl: './tallaje.component.html',
  styleUrls: ['./tallaje.component.scss']
})
export class TallajeComponent implements OnInit {
  listTiposTalla: any[] = [];

  constructor(
    private _dialog: MatDialog,
    private _tipoTallasService: TipoTallasService
  ) {}

  ngOnInit() {
    this.loadTiposTalla();
  }

  loadTiposTalla() {
    this._tipoTallasService.get({ where: { tit_sw_activo: 0 } }).subscribe((res: any) => {
      res= res.data;
      this.listTiposTalla = res;
    });
  }

  openDialogCrear(tipo: any = null) {
    const dialogRef = this._dialog.open(FormTipoMedidaComponent, {
      width: '400px',
      data: tipo
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        this.loadTiposTalla();
      }
    });
  }
}