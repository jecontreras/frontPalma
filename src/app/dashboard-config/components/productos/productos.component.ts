import { Component, OnInit, ViewChild } from '@angular/core';
import { ToolsService } from 'src/app/services/tools.service';
import { MatDialog, MatPaginator, MatSort } from '@angular/material';
import { ProductoService } from 'src/app/servicesComponents/producto.service';
import { FormproductosComponent } from '../../form/formproductos/formproductos.component';
import { NgxSpinnerService } from 'ngx-spinner';
import * as _ from 'lodash';
import { CART } from 'src/app/interfaces/sotarage';
import { Store } from '@ngrx/store';
import { EstadistService } from 'src/app/servicesComponents/estadist.service';

declare interface DataTable {
  headerRow: string[];
  footerRow: string[];
  dataRows: any[][];
}

declare const swal: any;
declare const $: any;


@Component({
  selector: 'app-productos',
  templateUrl: './productos.component.html',
  styleUrls: ['./productos.component.scss']
})
export class ProductosComponent implements OnInit {

  dataTable: DataTable;
  pagina = 10;
  paginas = 0;
  loader = true;
  query:any = {
    where:{
      pro_activo: 0
    },
    page: 0,
    limit: 10
  };
  Header:any = [ 'Acciones','Foto','Nombre','Visitas', 'Precio', 'Categoria','Estado', 'Creado'];
  displayedColumns: string[] = ['acciones', 'foto', 'nombre', 'estadisticas', 'precio', 'categoria', 'estado', 'fecha'];
  @ViewChild(MatPaginator) paginator!: MatPaginator;
  @ViewChild(MatSort) sort!: MatSort;

  dataSource:any = Array();
  $:any;
  public datoBusqueda = '';
  notscrolly:boolean=true;
  notEmptyPost:boolean = true;
  tiendaInfo:any = {};
  listEstadist:any = [];

  constructor(
    public dialog: MatDialog,
    private _tools: ToolsService,
    private _productos: ProductoService,
    private spinner: NgxSpinnerService,
    private _store: Store<CART>,
    private _estadist: EstadistService
  ) {
    this._store.subscribe((store: any) => {
      store = store.name;
      if(!store) return false;
      this.tiendaInfo = store.configuracion || {};
    });
  }

  async ngOnInit() {
    this.dataTable = {
      headerRow: this.Header,
      footerRow: this.Header,
      dataRows: []
    };
    await this.cargarTodos();
    await this.getEstadistica();
    this.ProccesStatis();
  }

  getEstadistica(){
    return new Promise( resolve =>{
      this._estadist.getProduct( {} ).subscribe( res =>{
        this.listEstadist = res;
        resolve( res );
      },()=> resolve( [ ] ) );
    });
  }

  ProccesStatis(){
    for( let row of this.dataTable.dataRows ){
      let filter = this.listEstadist.find( item => item.id === row['id'] )
      console.log("+*86", filter)
      if( !filter ) continue;
      row['estadistCount'] = filter.total_visitas;
    }
  }

  crear(obj:any){
    const dialogRef = this.dialog.open(FormproductosComponent,{
      data: {datos: obj || {}},
      height:  '',
      width: '100%',
      maxWidth: "100%"
    });

    dialogRef.afterClosed().subscribe(result => {
      console.log(`Dialog result: ${result}`);
    });
  }
  delete(obj:any){
    let datos = {
      id: obj.id,
      pro_activo: 1
    }
    this._tools.confirm({title:"Eliminar", detalle:"Deseas Eliminar Dato", confir:"Si Eliminar"}).then((opt)=>{
      if(opt.value){
        this._productos.update(datos).subscribe((res:any)=>{
          //this.dataTable.dataRows.splice(idx, 1);
          this.dataSource = this.dataSource.filter( row => row.id !== obj.id );
          this._tools.presentToast("Eliminado")
        },(error)=>{console.error(error); this._tools.presentToast("Error de servidor") })
      }
    });
  }
  async onScroll(){
    if (this.notscrolly && this.notEmptyPost) {
       this.notscrolly = false;
       this.query.page++;
       await this.cargarTodos();
       this.ProccesStatis();
     }
   }

  cargarTodos() {
    return new Promise( resolve =>{
      this.spinner.show();
      if( this.tiendaInfo.id ) this.query.where.empresa = this.tiendaInfo.id;
      this._productos.get(this.query)
      .subscribe(
        (response: any) => {
          console.log(response);
          this.dataTable.headerRow = this.dataTable.headerRow;
          this.dataTable.footerRow = this.dataTable.footerRow;
          this.dataTable.dataRows.push(... response.data);
          this.dataTable.dataRows =_.unionBy(this.dataTable.dataRows || [], response.data, 'id');
          this.dataSource = this.dataTable.dataRows;
          this.loader = false;
          this.spinner.hide();
  
          if (response.data.length === 0 ) {
            this.notEmptyPost =  false;
          }
          this.notscrolly = true;
          resolve( response );
        },
        error => {
          resolve( false );
          console.log('Error', error);
        });
    });
  }

  buscar() {
    this.loader = false;
    this.notscrolly = true
    this.notEmptyPost = true;
    this.dataTable.dataRows = [];
    //console.log(this.datoBusqueda);
    this.datoBusqueda = this.datoBusqueda.trim();
    if (this.datoBusqueda === '') {
      this.query = {
        where:{
          pro_activo: 0
        },
        limit: 10
      }
      this.cargarTodos();
    } else {
      this.query.where.or = [
        {
          pro_nombre: {
            contains: this.datoBusqueda|| ''
          }
        },
        {
          pro_descripcion: {
            contains: this.datoBusqueda|| ''
          }
        },
        {
          pro_descripcionbreve: {
            contains: this.datoBusqueda|| ''
          }
        },
        {
          pro_codigo: {
            contains: this.datoBusqueda|| ''
          }
        }
      ];
      this.cargarTodos();
    }
  }

}
