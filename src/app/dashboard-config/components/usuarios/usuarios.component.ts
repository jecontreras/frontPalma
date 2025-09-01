import { Component, OnInit } from '@angular/core';
import { UsuariosService } from 'src/app/servicesComponents/usuarios.service';
import { ToolsService } from 'src/app/services/tools.service';
import { MatDialog } from '@angular/material';
import { FormusuariosComponent } from 'src/app/dashboard-config/form/formusuarios/formusuarios.component';
import { NgxSpinnerService } from 'ngx-spinner';
import * as _ from 'lodash';
import { STORAGES } from 'src/app/interfaces/sotarage';
import { Store } from '@ngrx/store';

@Component({
  selector: 'app-usuarios',
  templateUrl: './usuarios.component.html',
  styleUrls: ['./usuarios.component.scss']
})
export class UsuariosComponent implements OnInit {

  dataTable = {
    headerRow: [],
    footerRow: [],
    dataRows: []
  };

  displayedColumns: string[] = [
    'acciones',
    'usu_nombre',
    'usu_perfil',
    'usu_email',
    'usu_telefono',
    'createdAt',
    'pro_estado'
  ];

  query: any = {
    where: {},
    page: 0
  };

  datoBusqueda = '';
  loader = true;
  scrollLoading = false;
  notscrolly = true;
  notEmptyPost = true;
  ShopConfig:any = {};
  dataUser:any = {};

  constructor(
    public dialog: MatDialog,
    private _tools: ToolsService,
    private _usuarios: UsuariosService,
    private spinner: NgxSpinnerService,
    private store: Store<STORAGES>,
  ) {
    this.store.subscribe((storeData: any) => {
      const state = storeData.name;
      this.ShopConfig = state.configuracion || {};
      this.dataUser = state.user || {};
    });
  }

  ngOnInit() {
    this.cargarTodos();
  }

  crear(obj: any) {
    const dialogRef = this.dialog.open(FormusuariosComponent, {
      data: { datos: obj || {} }
    });

    dialogRef.afterClosed().subscribe(( txt ) => {
      if( txt === 'creo' ) this.refresh();
    });
  }

  delete(obj: any, idx: number) {
    this._usuarios.delete(obj).subscribe(() => {
      this.dataTable.dataRows.splice(idx, 1);
      this._tools.presentToast("Eliminado");
    }, error => {
      console.error(error);
      this._tools.presentToast("Error del servidor");
    });
  }

onScroll() {
  console.log("***73 scroll")
  if (this.notscrolly && this.notEmptyPost) {
    this.notscrolly = false;
    this.query.page++;
    this.cargarTodos();
  }
}

  cargarTodos() { 
    this.spinner.show();
    this.scrollLoading = true;
    if( this.dataUser.usu_perfil.prf_descripcion !== 'administrador' ) this.query.where.empresa = this.ShopConfig.id;
    this._usuarios.get(this.query).subscribe(
      (res: any) => {
        this.dataTable.dataRows.push(...res.data);
        this.dataTable.dataRows = _.unionBy(this.dataTable.dataRows, res.data, 'id');

        this.loader = false;
        this.scrollLoading = false;
        this.spinner.hide();

        if (res.data.length === 0) {
          this.notEmptyPost = false;
        }

        this.notscrolly = true;
      },
      error => {
        console.error('Error', error);
        this.spinner.hide();
      }
    );
  }

  buscar() {
    this.query.page = 0;
    this.notscrolly = true;
    this.notEmptyPost = true;
    this.dataTable.dataRows = [];

    this.datoBusqueda = this.datoBusqueda.trim();

    if (this.datoBusqueda === '') {
      this.query.where = {};
    } else {
      this.query.where.or = [
        { usu_nombre: { contains: this.datoBusqueda } },
        { usu_email: { contains: this.datoBusqueda } },
        { usu_apellido: { contains: this.datoBusqueda } },
        { usu_telefono: { contains: this.datoBusqueda } }
      ];
    }

    this.cargarTodos();
  }

  refresh() {
    this.query.page = 0;
    this.dataTable.dataRows = [];
    this.cargarTodos();
  }
}
