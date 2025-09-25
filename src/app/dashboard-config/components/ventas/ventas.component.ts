import { ChangeDetectorRef, Component, OnInit, ViewChild } from '@angular/core';
import { FormventasComponent } from '../../form/formventas/formventas.component';
import { MatDialog, MatPaginator, MatSort, MatTableDataSource } from '@angular/material';
import { ToolsService } from 'src/app/services/tools.service';
import { VentasService } from 'src/app/servicesComponents/ventas.service';
import { NgxSpinnerService } from 'ngx-spinner';
import * as _ from 'lodash';
import { STORAGES } from 'src/app/interfaces/sotarage';
import { Store } from '@ngrx/store';
import { FormpuntosComponent } from '../../form/formpuntos/formpuntos.component';
import * as moment from 'moment';
import { PDFDocument } from 'pdf-lib';
import { ActualizarGuiaComponent } from '../../dialog/actualizar-guia/actualizar-guia.component';
import { Router } from '@angular/router';

declare interface DataTable {
  headerRow: string[];
  footerRow: string[];
  dataRows: any[][];
}

declare const swal: any;
declare const $: any;

@Component({
  selector: 'app-ventas',
  templateUrl: './ventas.component.html',
  styleUrls: ['./ventas.component.scss']
})
export class VentasComponent implements OnInit {

  dataTable: DataTable;
  dataTable2: DataTable;
  pagina = 10;
  paginas = 0;
  loader = true;
  query:any = {
    where:{
      ven_sw_eliminado: 0,
      ven_estado: { '!=': 4 }
    },
    page: 0
  };
  query2:any = {
    where:{
      ven_sw_eliminado: 0,
      ven_estado: 0
    },
    sort: "createdAt ASC",
    page: 0
  };
  Header:any = [ 'seleccion','Acciones','Nombre Cliente',"Ya Compro?",'Teléfono Cliente','Fecha Venta','Cantidad','Precio','Imagen Producto','Estado', 'Tallas' ];
   // Columnas a mostrar en la tabla
   displayedColumns: string[] = ['seleccion','acciones', '#Guia', 'nombre', 'compras', 'telefono', 'fecha', 'cantidad', 'total', 'imagen', 'Estadoventa', "EstadoGuia"];
   dataSource:any = [];
   @ViewChild(MatPaginator) paginator!: MatPaginator;
   @ViewChild(MatSort) sort!: MatSort;
  $:any;
  public datoBusqueda = '';

  notscrolly:boolean=true;
  notEmptyPost:boolean = true;
  dataUser:any = {};
  activando:boolean = false;
  dateHoy = new Date().toLocaleDateString();
  sumCantidad:any = 0;
  ShopConfig:any = {};
  selectedRows: any[] = [];
  loading = false;
  counstItem: number = 0;
  ventasRealizadas: number = 0;  // cantidad de ventas actuales
  limiteVentas: number = 0;      // límite del paquete

  constructor(
    public dialog: MatDialog,
    private _tools: ToolsService,
    private _ventas: VentasService,
    private spinner: NgxSpinnerService,
    private _store: Store<STORAGES>,
    private cdr: ChangeDetectorRef,
    private router: Router
  ) {
    this._store.subscribe((store: any) => {
      store = store.name;
      this.dataUser = store.user || {};
      this.activando = false;
      if( ( this.dataUser.usu_perfil.prf_descripcion != 'administrador' && this.dataUser.usu_perfil.prf_descripcion != 'subAdministrador' ) ) this.query.where.usu_clave_int = this.dataUser.id;
      if(this.dataUser.usu_perfil.prf_descripcion == 'administrador') this.activando = true;
      this.ShopConfig = store.configuracion || {};
    });
   }

  async ngOnInit() {
    const today = new Date();
    const day = String(today.getDate()).padStart(2, '0');
    const month = String(today.getMonth() + 1).padStart(2, '0');
    const year = today.getFullYear();

    this.dateHoy = `${day}/${month}/${year}`;
    this.dataSource.paginator = this.paginator;
    this.dataSource.sort = this.sort;
    this.dataTable = {
      headerRow: this.Header,
      footerRow: this.Header,
      dataRows: []
    };
    this.dataTable2 = {
      headerRow: this.Header,
      footerRow: this.Header,
      dataRows: []
    };
    this.cargarTodos();
    this.sumCantidad = await this.getVentasHoy();
    //this.cargarLimitePaquete();
    this.cargarVentas();
  }

  getVentasHoy(){
    return new Promise( resolve =>{
      this._ventas.getCount( {
        "where": {
          "ven_sw_eliminado": 0,
          "ven_estado": {
              "!=": 4
          },
          "empresa": this.ShopConfig.id,
          "create": this.dateHoy
      }
      } ).subscribe( (res:any) => resolve( res.data ) )
    })
  }

  
  cargarLimitePaquete() {
    // Aquí asignas el límite según el paquete del usuario
    // Ejemplo: esto viene del backend con el paquete de la tienda
    this.limiteVentas = this.ShopConfig?.listPaquete?.ventas_max || 0;
  }

  cargarVentas() {
    // Supongamos que tu backend ya devuelve la cantidad de ventas
    this.ventasRealizadas = this.sumCantidad; // número de ventas del mes
  }

  irAPaquetes() {
    // Redirige a la vista de paquetes para actualizar
    this.router.navigate(['/paquetes']);
  }

  generarVenta(obj:any){
    const dialogRef = this.dialog.open(FormventasComponent,{
      data: {datos: obj || {}},
      width: '100%',
      height: '610px',
      maxWidth: '100vw'
    });

    dialogRef.afterClosed().subscribe( async ( result ) => {
      //console.log(`Dialog result: ${result}`);
      if(result == 'creo') this.cargarTodos();
      if( obj.id ) {
        let filtro:any = await this.getDetallado( obj.id );
          if( !filtro ) return false;
          let idx = _.findIndex( this.dataSource, [ 'id', obj.id ] );
          //console.log("**",idx)
          if( idx >= 0 ) {
            this.dataSource[idx] = { ven_estado: filtro.ven_estado, ...filtro};
            // Forzar la actualización de la tabla
            this.updateViewAlter();
          }
      }
    });
  }

  updateViewAlter(){
    try {
      this.dataSource = new MatTableDataSource([...this.dataSource ]);
  
      // Forzar la detección de cambios en la vista
      this.cdr.detectChanges();
      
    } catch (error) {
      
    }
  }

  async getDetallado( id:any ){
    return new Promise( resolve => {
      this._ventas.get( { where: { id: id } } ).subscribe(( res:any )=>{
        res = res.data[0];
        resolve( res || false )
      },()=> resolve( false ) );
    })
  }

  darPuntos(){
    const dialogRef = this.dialog.open(FormpuntosComponent,{
      data: { datos: {} }
    });

    dialogRef.afterClosed().subscribe(result => {
      console.log(`Dialog result: ${result}`);
    });
  }

  async handleDropItem( obj:any ){
    let data:any = {
      id: obj.id,
      ven_sw_eliminado: 1
    };
    let opt = await this._tools.confirm({title:"Eliminar", detalle:"Deseas Eliminar Dato", confir:"Si Eliminar"});
    if( opt.value ){
      this.deleteItem( data, obj );
    }
  }

  deleteItem( obj:any , data:any ){
    if(data.ven_estado !== 0 ) { this._tools.presentToast("Error no puedes Eliminar esta venta "+ obj.id ); return false; }
    this._ventas.update( obj ).subscribe((res:any)=>{
      //this.dataTable.dataRows.splice(idx, 1);
      this.dataSource = this.dataSource.filter( row => row.id !== obj.id );
      this._tools.presentToast("Eliminado");
      return true;
    },(error)=>{console.error(error); this._tools.presentToast("Error de servidor"); return false; })
  }

  // Función para obtener la clase CSS según el estado
  getEstadoClass(estado: number): string {
    return {
      0: 'estado-pendiente',
      1: 'estado-exitosa',
      2: 'estado-rechazada',
      3: 'estado-despachado'
    }[estado] || '';
  }

  // Función para obtener el texto del estado
  getEstadoTexto(estado: number): string {
    return {
      0: 'Pendiente',
      1: 'Venta Exitosa',
      2: 'Rechazada',
      3: 'Despachado'
    }[estado] || 'Desconocido';
  }

  onScroll(){
    if (this.notscrolly && this.notEmptyPost) {
       this.notscrolly = false;
       this.query.page++;
       this.cargarTodos();
     }
  }

  cargarTodos() {
    //this.spinner.show();
    this.query.where.empresa = this.ShopConfig.id;
    if( this.datoBusqueda ) delete this.query.where.empresa;
    this.loader = true;
    this._ventas.get(this.query)
    .subscribe(
      (response: any) => {
        this.counstItem = response.count;
        this.dataTable.headerRow = this.dataTable.headerRow;
        this.dataTable.footerRow = this.dataTable.footerRow;
        this.dataTable.dataRows.push(... response.data)
        this.dataTable.dataRows = _.unionBy(this.dataTable.dataRows || [], this.dataTable.dataRows, 'id');
        this.dataSource = this.dataTable.dataRows;
        this.loader = false;
          //this.spinner.hide();

          if (response.data.length === 0 ) {
            this.notEmptyPost =  false;
          }
          this.notscrolly = true;
      },
      error => {
        console.log('Error', error);
      });
  }

  async buscar() {
    this.loader = false;
    this.notscrolly = true
    this.notEmptyPost = true;
    this.dataTable.dataRows = [];
    //console.log(this.datoBusqueda);
    this.datoBusqueda = this.datoBusqueda.trim();
    if (this.datoBusqueda === '') {
      this.query = {
        where:{
          ven_sw_eliminado: 0,
          ven_estado: { '!=': 4 }
        },
        page: 0
      }
      if(this.dataUser.usu_perfil.prf_descripcion != 'administrador') this.query.where.usu_clave_int = this.dataUser.id;
      this.cargarTodos();
    } else {
      this.query.where.or = [
        {
          ven_nombre_cliente: {
            contains: this.datoBusqueda|| ''
          }
        },
        {
          ven_usu_creacion: {
            contains: this.datoBusqueda|| ''
          }
        },
        {
          ven_telefono_cliente: {
            contains: this.datoBusqueda|| ''
          }
        },
        {
          ven_direccion_cliente: {
            contains: this.datoBusqueda|| ''
          }
        },
        {
          ven_fecha_venta: {
            contains: this.datoBusqueda|| ''
          }
        },
        {
          ven_tallas: {
            contains: this.datoBusqueda|| ''
          }
        },
      ];
      this.cargarTodos();
      this.sumCantidad = await this.getVentasHoy();
    }
  }

  // ✅ Manejo de selección de registros
  toggleSelection(row: any) {
    const index = this.selectedRows.indexOf(row);
    if (index === -1) {
      this.selectedRows.push(row);
    } else {
      this.selectedRows.splice(index, 1);
    }
  }

  isSelected(row: any): boolean {
    return this.selectedRows.includes(row);
  }

  toggleAll(event: any) {
    if (event.checked) {
      this.selectedRows = [...this.dataSource];
    } else {
      this.selectedRows = [];
    }
  }

  isAllSelected(): boolean {
    try {
      return this.selectedRows.length === this.dataSource.length;
    } catch (error) {
      
    }
  }

  async generarGuia() {
    this.loading = true;
    console.log("Generando guía'¿'¿0'¿¿ para:", this.selectedRows);
    let lista = this.selectedRows.filter( item => item.ven_numero_guia === "" ||  item.ven_numero_guia === null );
    for( let row of lista ){
      row.listProductoJson = this.handleDropTransformArt( row.ven_observacion );
    }
    if( lista.length === 0 ) return this.loading = false;
    console.log("**349", lista)
    this._tools.generarResumen( lista );
    try {
      if( lista ){
        for( let item of lista ){
          //console.log("***363", this.dataSource)
          try {
            let index = this.dataSource.findIndex(row => row.id === item.id );
            if (index !== -1) {
              //console.log(`Elemento encontrado en la posición: ${index}`, this.dataSource[index]);
              this.dataSource[index].ven_sw_aprobada = 1;
              this.dataSource[index].stateGuide = "IMPRIMIDA";
              console.log("***375", item)
              await this.handleUpdateR( { 
                ven_estado: 5,
                id: this.dataSource[index].id,
                stateGuide: "IMPRIMIDA",
              } );
            } else {
              console.log("Elemento no encontrado");
            }
          } catch (error) {
            console.log("***ERROR CONTROLADO", error)
          }
        }
        console.log("**195", this.dataSource)
        this._tools.presentToast( 'Actualizado' );
      }
    } catch (error) {
      
    }
    this.loading = false;
  }

  async handleUpdateBuyGuide(){
    this.loading = true;
    console.log("Generando guía'¿'¿0'¿¿ para:", this.selectedRows);
    let lista = this.selectedRows.filter( item => item.ven_numero_guia === "" ||  item.ven_numero_guia === null );
    for( let row of lista ){
      row.listProductoJson = this.handleDropTransformArt( row.ven_observacion );
    }
    if( lista.length === 0 ) return this.loading = false;
    console.log("**349", lista)
    this.dialog.open(ActualizarGuiaComponent, {
      width: '90%',
      height: '90%',
      data: lista  // las ventas ya cargadas
    }).afterClosed().subscribe(res=>{
      try {
        if( res ){
          for( let item of res ){
            //console.log("***363", this.dataSource)
            try {
              let index = this.dataSource.findIndex(row => row.id === item.id && row.stateGuide === 'DESPACHADO');
              if (index !== -1) {
                //console.log(`Elemento encontrado en la posición: ${index}`, this.dataSource[index]);
                this.dataSource[index].ven_sw_aprobada = 1;
                this.dataSource[index].ven_imagen_guia= item.ven_imagen_guia;
                this.dataSource[index].ven_numero_guia= item.ven_numero_guia;
                this.dataSource[index].transport= item.transport;
                this.dataSource[index].stateGuide = "GENERADA";
                this.dataSource[index].priceFlete = item.priceFlete;
              } else {
                console.log("Elemento no encontrado");
              }
            } catch (error) {
              console.log("***ERROR CONTROLADO", error)
            }
          }
          console.log("**195", this.dataSource)
          this._tools.presentToast( 'Actualizado' );
        }
      } catch (error) {
        
      }
    });

    this.loading = false;
  }
  /*
  // ✅ Generar Guías con Spinner
  async generarGuia() {
    this.loading = true;
    console.log("Generando guía'¿'¿0'¿¿ para:", this.selectedRows);
    let lista = this.selectedRows.filter( item => item.ven_numero_guia === "" );
    for( let row of lista ){
      row.listProductoJson = this.handleDropTransformArt( row.ven_observacion );
    }
    if( lista.length === 0 ) return this.loading = false;
    let alertInputR:any = await this._tools.alertInput( { title: "Nombre Producto Dropi", confirme: "Confirmar" } );
    alertInputR = alertInputR.value;
    console.log("***338", alertInputR)

    let resp:any = await this.handleCreateGuide( {
      listBuy: _.map( lista, item=>{
        return {
          departmentId: item.departament,
          rate_type: item.ven_tipo === 'PAGA EN CASA' ? "CON RECAUDO" : "",
          EnvioConCobro: item.ven_tipo === true ? "CON RECAUDO" : false,
          total_order: item.ven_precio,
          notes: "Enviar urgente",
          name: item.ven_nombre_cliente,
          surname: "",
          dir: item.ven_direccion_cliente,
          country: "COLOMBIA",
          state: item.departamento,
          city: item.ven_ciudad,
          phone: item.ven_telefono_cliente,
          client_email: "",
          payment_method_id: 1,
          quantity: _.sumBy(item.listProductoJson, 'Cantidad'),
          productsId: alertInputR || item.listProductoJson[0].Color,
          id: item.id
        }
      }),
      user: "67a01c478e1ac400027f889c"
    });
    this.loading = false;
    
    try {
      if( resp.data.length ){
        for( let item of resp.data ){
          //console.log("***363", this.dataSource)
          try {
            let index = this.dataSource.findIndex(row => row.id === item.ids);
            if (index !== -1) {
              //console.log(`Elemento encontrado en la posición: ${index}`, this.dataSource[index]);
              this.dataSource[index].ven_sw_aprobada = 1;
              this.dataSource[index].ven_imagen_guia= item.sticker;
              this.dataSource[index].ven_numero_guia= item.shipping_guide;
              this.dataSource[index].transport= item.shipping_company;
              this.dataSource[index].stateGuide = "GENERADA";
              this.dataSource[index].idDropi = item.id;
              this.dataSource[index].priceFlete = item.GrFlete.precioEnvio;
              console.log("***375", item)
              await this.handleUpdateR( { 
                ven_estado: 3,
                ven_sw_aprobada: 1, 
                id: this.dataSource[index].id,
                ven_imagen_guia: item.sticker,
                ven_numero_guia: item.shipping_guide,
                transport: item.shipping_company,
                stateGuide: "GENERADA",
                printInt: 1,
                idDropi: item.id,
                priceFlete: item.GrFlete.precioEnvio
              } );
            } else {
              console.log("Elemento no encontrado");
            }
          } catch (error) {
            console.log("***ERROR CONTROLADO", error)
          }
        }
        console.log("**195", this.dataSource)
        this._tools.presentToast( 'Actualizado' );
      }
    } catch (error) {
      
    }

    // ERROR POSIBLES
    for( let item of resp.error ){
      try {
        let row = this.dataSource.find(row => row.id === item.id);
        if (row) {
          row.ven_sw_aprobada = 1;
          row.ven_imagen_conversacion = item.createGuide.data;
          await this.handleUpdateR( { ven_sw_aprobada: 1, id: item.ids } );
          this._tools.presentToast( item.createGuide.data );
        }
      } catch (error) {
        
      }
    }
    this.updateViewAlter();
  }

  */

  async handleUpdateR( obj ){
    return new Promise( resolve =>{
      this._ventas.update( obj ).subscribe((res:any)=>{
        resolve( res );
      }, ()=> resolve( false ) );
    })
  }

  handleDropTransformArt( item ){
    // Paso 1: Envolver el string con corchetes
    let jsonString = `[${item}]`;
    // Paso 2: Limpiar el formato con expresiones regulares
    jsonString = jsonString
    .replace(/"(\w+)"\s*:\s*"/g, (match) => match) // Asegura que las claves y valores no se rompan
    .replace(/:\s*"https:\/{2,}/g, ': "https://') // Corrige URLs con barras duplicadas
    .replace(/"\s+"/g, '", "') // Inserta comas entre propiedades mal separadas
    .replace(/,\s*$/, ''); // Elimina comas finales extrañas
    jsonString = jsonString.replace(/,\s*]$/, ']');
    // Paso 3: Parsear el string como JSON
    console.log("***118", jsonString)
    try {
      const jsonArray = JSON.parse(jsonString);
      console.log('Array JSON válido:', jsonArray);
      return jsonArray;
    } catch (error) {
      console.error('Error al parsear JSON:', error);
    }
  }

  handleCreateGuide(row){
    return new Promise( resolve =>{
      this._ventas.createGuide( this.ShopConfig.urlBackendSocial+"/googleSheet/createGuideLanding", row ).subscribe( res =>{
        return resolve( res );
      }, ()=> resolve( false ) );
    })
  }

  // ✅ Eliminar seleccionados
  async eliminarSeleccionados() {
    let opt = await this._tools.confirm({title:"Eliminar", detalle:"Deseas Eliminar Dato", confir:"Si Eliminar"});
    if( opt.value ) {
      for( let row of this.selectedRows ){
        await this.deleteItem( { id:row.id, ven_sw_eliminado: 1 }, row );
      }
    }
    return true;
  }

  cambiarEstado(row: any) {
    console.log("Cambiar estado del pedido de:", row);
  }
  cargando2:boolean = false;
  async handleCancelGuide(){
    this.cargando2 = true;
    let listSelect = this.selectedRows.filter(row => row.ven_numero_guia);
    for( let row of listSelect ){
      if( !row.ven_numero_guia )continue;
      let res = await this.handleNextCancelGuide( row );
      if( res === false ) continue;
      
      await this.handleUpdateR( {
        id: row.id,
        ven_sw_aprobada: 0,
        stateGuide :"PENDIENTE",
        priceFlete: 0,
        ven_numero_guia: "",
        transport: "",
        ven_imagen_guia: "",
        ven_estado: 0
      } );

      row.ven_sw_aprobada =  0;
      row.stateGuide  = "PENDIENTE";
      row.priceFlete =  0;
      row.ven_estado = 0;
      row.ven_numero_guia =  "";
      row.transport =  "";
      row.ven_imagen_guia = "";
    }
    this.cargando2 = false;
    this._tools.presentToast( "actualizado" );
    this.updateViewAlter();
  }

  handleNextCancelGuide( row ){
    return new Promise( resolve =>{
      this._ventas.cancelGuide( this.ShopConfig.urlBackendSocial+"/googleSheet/cancelGuide", {
        idGuia: Number( row.idDropi ),
        id: row.id,
        user: "67a01c478e1ac400027f889c"
      }).subscribe( res =>{
        resolve( true );
      },()=>resolve( false) );
    })
  }

  async imprimirGuia() {
    this.cargando2 = true; // Activar spinner

    let listSelect:any = this.selectedRows.filter(row => row.ven_imagen_guia);
    for( let row of listSelect ){
      row.listProductoJson = ( this.handleDropTransformArt( row.ven_observacion ) ) || [];
      row.txtProduct = "";
      for( let item of row.listProductoJson ) row.txtProduct+=item.Color+" x "+item.Cantidad || 1 + " ";
    }
    const urlsPDF: string[] = listSelect.map(row => row.ven_imagen_guia);

    // 📌 Obtener la lista de productos desde la selección
    console.log("***514", listSelect)
    const listProducto = listSelect.map(row => ({
        producto: row.txtProduct || "Sin descripción",
        cantidad: 0,
        precio: 0
    }));

    for (let row of this.selectedRows) {
        if (!row.ven_imagen_guia) continue;
        await this.handleUpdateR( { ven_sw_aprobada: 2, id: row.id } );
    }

    try {
        if (urlsPDF.length === 0) {
            this._tools.basic("No hay datos de impresión");
            return (this.cargando2 = false);
        }

        console.log("📌 URLs de PDFs:", urlsPDF);
        console.log("📌 Detalles de productos:", listProducto);

        const mergedPdf = await this.unirPDFs(urlsPDF, listProducto);
        const url = URL.createObjectURL(mergedPdf);
        window.open(url, '_blank');
    } catch (error) {
        this._tools.basic( "Error");
        console.error("❌ Error al unir los PDFs:", error);
    } finally {
        this.cargando2 = false;
    }
}


async unirPDFs(urls: string[], listProducto: any[]): Promise<Blob> {
  const mergedPdf = await PDFDocument.create();

  for (let i = 0; i < urls.length; i++) {
      try {
          const url = urls[i];
          const productoInfo = listProducto[i]; // 📌 Obtener detalles del producto correspondiente

          console.log("📌 Descargando PDF desde:", url);
          console.log("📌 Producto Info:", productoInfo);

          // Llamar a Sails.js y enviar `TXTPRODUCTO`
          const proxyUrl = `${this.ShopConfig.urlBackendSocial}/archivos/proxyPDF?url=${encodeURIComponent(url)}&producto=${encodeURIComponent(productoInfo.producto)}&cantidad=${productoInfo.cantidad}&precio=${productoInfo.precio}`;
          const response = await fetch(proxyUrl);

          if (!response.ok) {
              throw new Error(`❌ Error al descargar ${url}: ${response.status} ${response.statusText}`);
          }

          const pdfBytes = await response.arrayBuffer();
          const pdf = await PDFDocument.load(pdfBytes);
          const copiedPages = await mergedPdf.copyPages(pdf, pdf.getPageIndices());
          copiedPages.forEach(page => mergedPdf.addPage(page));

      } catch (error) {
          console.error("❌ Error al procesar PDF:", error);
      }
  }

  const pdfBytesFinal = await mergedPdf.save();
  return new Blob([pdfBytesFinal], { type: "application/pdf" });
}



}
