import { Component, OnInit } from '@angular/core';
import { MatDialog } from '@angular/material';
import { EmpresaService } from 'src/app/servicesComponents/empresa.service';
import { ToolsService } from 'src/app/services/tools.service';
import { NgxSpinnerService } from 'ngx-spinner';
import * as _ from 'lodash';
import { FormEmpresaComponent } from '../../form/form-empresa/form-empresa.component';

@Component({
  selector: 'app-empresa',
  templateUrl: './empresa.component.html',
  styleUrls: ['./empresa.component.scss']
})
export class EmpresaComponent implements OnInit {

  dataEmpresas: any[] = [];
  query: any = {
    where: {},
    page: 0
  };
  loader = true;
  datoBusqueda = '';
  notscrolly = true;
  notEmptyPost = true;
  scrollLoading = false;

  constructor(
    private empresaService: EmpresaService,
    private tools: ToolsService,
    private spinner: NgxSpinnerService,
    public dialog: MatDialog
  ) {}

  ngOnInit() {
    this.cargarEmpresas();
  }

  crearEmpresa( obj ) {
    const dialogRef = this.dialog.open(FormEmpresaComponent, {
      width: '600px',
      data: obj || {}
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        this.resetList();
      }
    });
  }

  cargarEmpresas() {
    this.spinner.show();
    this.empresaService.get(this.query).subscribe(
      (res: any) => {
        this.dataEmpresas = _.unionBy(this.dataEmpresas || [], res.data, 'id');
        if (res.data.length === 0) this.notEmptyPost = false;
        this.notscrolly = true;
        this.loader = false;
        this.spinner.hide();
      },
      error => {
        this.spinner.hide();
        console.error('Error al cargar empresas', error);
      }
    );
  }

  eliminarEmpresa(item, index) {
    this.empresaService.delete({ where: { id: item.id } }).subscribe(
      res => {
        this.dataEmpresas.splice(index, 1);
        this.tools.presentToast('Empresa eliminada correctamente');
      },
      error => {
        console.error(error);
        this.tools.presentToast('Error al eliminar la empresa');
      }
    );
  }

  buscar() {
    this.datoBusqueda = this.datoBusqueda.trim();
    this.query.page = 0;
    this.dataEmpresas = [];
    this.notEmptyPost = true;
    this.notscrolly = true;

    if (!this.datoBusqueda) {
      this.query.where = {};
    } else {
      this.query.where.or = [
        { nombreTienda: { contains: this.datoBusqueda } },
        { emailTienda: { contains: this.datoBusqueda } },
        { numeroCelular: { contains: this.datoBusqueda } },
      ];
    }

    this.cargarEmpresas();
  }

  onScroll() {
    if (this.notscrolly && this.notEmptyPost) {
      this.notscrolly = false;
      this.query.page++;
      this.cargarEmpresas();
    }
  }

  resetList() {
    this.query.page = 0;
    this.dataEmpresas = [];
    this.notEmptyPost = true;
    this.notscrolly = true;
    this.cargarEmpresas();
  }
}
