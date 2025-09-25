import { Component, OnInit, Inject, Input } from '@angular/core';
import { MatDialog, MatDialogRef, MAT_DIALOG_DATA, MatTableDataSource } from '@angular/material';
import { UsuariosService } from 'src/app/servicesComponents/usuarios.service';
import { ToolsService } from 'src/app/services/tools.service';
import * as _ from 'lodash';
import * as moment from 'moment';
import { ProductoService } from 'src/app/servicesComponents/producto.service';
import { VentasService } from 'src/app/servicesComponents/ventas.service';
import { ServiciosService } from 'src/app/services/servicios.service';
import { environment } from 'src/environments/environment';
import { ArchivosService } from 'src/app/servicesComponents/archivos.service';
import { STORAGES } from 'src/app/interfaces/sotarage';
import { Store } from '@ngrx/store';
import { NotificacionesService } from 'src/app/servicesComponents/notificaciones.service';
import { TipoTallasService } from 'src/app/servicesComponents/tipo-tallas.service';
import { EstadoDespacho } from 'src/app/interfaces/interfaces';
import { EstadoDespachoService } from 'src/app/servicesComponents/estado-despacho.service';
import { departamentDrop } from 'src/app/JSON/departmentDrop';
import { ProductoCartComponent } from '../../dialog/producto-cart/producto-cart.component';
import { dataAmerica } from 'src/app/JSON/dataAmericaPhone';

const URL = environment.url;

@Component({
  selector: 'app-formventas',
  templateUrl: './formventas.component.html',
  styleUrls: ['./formventas.component.scss']
})
export class FormventasComponent implements OnInit {

  data: any = {
    ven_tipo: 'whatsapp'
  };
  clone: any = {};
  id: any;
  titulo: string = "Crear";
  files: File[] = [];
  list_files: any = [];
  listProductos: any = [];
  superSub: boolean = false;
  dataUser: any = {};
  disabledButton: boolean = false;
  disabled: boolean = false;
  listTallas: any = [];

  filesGuias:File[] = [];
  mensajeWhat:string;

  disableBtnFile:boolean = false;
  urlImagen:any;
  aumentarPrecio:number = 0;
  ShopConfig:any = {};
  listCart:any[] = [];
  estados: EstadoDespacho[] = [];
  formatoMoneda:any = {};
  listDepartament:any = departamentDrop;
  listCiudad:any = [];
  loadingCity:boolean = false;
  displayedColumns: string[] = ['foto', 'color', 'talla', 'cantidad', 'precio', 'acciones'];
  dataSource = new MatTableDataSource<any>();
  americanCountries = dataAmerica;

   @Input() urlGuia: string; // esta es tu ven_imagen_guia
  mostrarGuia: boolean = false;

  listaUsuarios: any[] = [];
  isAdmin: boolean = false; // ajusta si tienes roles



  constructor(
    public dialog: MatDialog,
    private _ventas: VentasService,
    private _notificacion: NotificacionesService,
    private _tools: ToolsService,
    private _productos: ProductoService,
    private _model: ServiciosService,
    public dialogRef: MatDialogRef<FormventasComponent>,
    @Inject(MAT_DIALOG_DATA) public datas: any,
    private _archivos: ArchivosService,
    private _store: Store<STORAGES>,
    private _tallas: TipoTallasService,
    private estadoService: EstadoDespachoService,
    private _usuarioService: UsuariosService
  ) {
    this.formatoMoneda = this._tools.currency;
    this._store.subscribe((store: any) => {
      store = store.name;
      this.dataUser = store.user || {};
      this.ShopConfig = store.configuracion || {};
      if( !this.ShopConfig.id ) this.ShopConfig = this.dataUser.usu_empresa;
      if (this.dataUser.usu_perfil.prf_descripcion == 'administrador' || this.dataUser.usu_perfil.prf_descripcion == 'subAdministrador') this.superSub = true;
      else this.superSub = false;

      if( store.ciudad ) if( store.ciudad.ciudad != 'Cúcuta') this.aumentarPrecio = 10000;
    });

  }

  ngOnInit() {
    this.obtenerUsuarios();

    if (this.dataUser && (this.dataUser.usu_perfil.prf_descripcion === 'administrador' || this.dataUser.usu_perfil.prf_descripcion === 'subAdministrador')) {
      this.isAdmin = true;
    }
    this.getDepartament();
    if (Object.keys(this.datas.datos).length > 0) {
      this.clone = _.clone(this.datas.datos);
      this.data = _.clone(this.datas.datos);
      this.id = this.data.id;
      this.urlGuia = this.data.ven_imagen_guia || '';
      this.titulo = "Actualizar";
      this.data.usu_clave_int = this.data.usu_clave_int.id;
      this.handleDropTransformArt();
      if (this.data.cat_activo === 0) this.data.cat_activo = true;
      if (this.data.pro_clave_int) this.data.pro_clave_int = this.data.pro_clave_int.id;
      if ( this.data.ven_tipo == "WHATSAPP" ) { if( !this.data.ven_imagen_producto ) this.data.ven_imagen_producto = "./assets/noimagen.jpg"; this.data.ven_tipo = "whatsapp"; }
      if ( this.data.ven_tipo == "CARRITO" ) { this.data.ven_tipo = "carrito"; }
      this.data.departamento = Number( this.data.departament );
      this.handleProcessDepartament();
      //this.data.ven_ciudad = this.data.idCiudad;
      this.data.pagaFlete = this.data.pagaFlete || "cliente";
      this.getEstados();
    } else {
      this.id = "";
      this.data.usu_clave_int = this.dataUser.id;
      this.data.ven_usu_creacion = this.dataUser.usu_email;
      this.data.ven_fecha_venta = moment().format('YYYY-MM-DD');
      this.data.ven_indicativo_cliente = ( this.americanCountries.find( row => row.name === 'Colombia') ).dialCode;
      this.data.pagaFlete = "cliente";
    }
    //this.getArticulos();
    console.log(this.data)
  }

  obtenerUsuarios() {
  this._usuarioService.get({ where: { usu_empresa: this.ShopConfig.id }, limit: 50 }).subscribe((res: any) => {
    this.listaUsuarios = res.data || [];
  });
}


  handleOpenCart(){
    const dialogRef = this.dialog.open(ProductoCartComponent,{
        data: {},
        width: '100%',
        height: '610px',
        maxWidth: '100vw'
      });
  
      dialogRef.afterClosed().subscribe( async ( result ) => {
        if( !result )return false;
        if( result.length === 0 ) return false;
        this.listCart.push( ...result );
        this.dataSource.data = this.listCart;
        this.suma();
      });
  }

  getDepartament(){
    this._ventas.getDepartment( this.ShopConfig.urlBackendSocial+"/googleSheet/getDepartamento", { } ).subscribe( (res:any) =>{
      this.listDepartament = res.objects || this.listDepartament;
    });
  }

  handleProcessDepartament(){
    let idDepartamen = this.listDepartament.find( row => row.id === this.data.departamento );
    if( !idDepartamen ) return this._tools.presentToast("No encontre departamento");
    this.listCiudad =  idDepartamen.listCity;
    /*this.loadingCity= true;
    this._ventas.getDepartment( this.ShopConfig.urlBackendSocial+"/googleSheet/getCity", {  where: { 
      idDept: idDepartamen.id,
      rate_type: "CON RECAUDO"
    } } ).subscribe( res =>{
      this.listCiudad = res.objects.cities || this.listCiudad;
      this.loadingCity= false;
    });*/
  }

  getEstados(){
    this.estadoService.get({ where: { idVenta: this.id } } ).subscribe((data:any) => {
      this.estados = data.sort((a, b) => new Date(b.fecha).getTime() - new Date(a.fecha).getTime());
    });
  }

  handleDropTransformArt(){
    // Paso 1: Envolver el string con corchetes
    let jsonString = `[${this.data.ven_observacion}]`;
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
      this.listCart = jsonArray;
      this.dataSource.data = this.listCart;
    } catch (error) {
      console.error('Error al parsear JSON:', error);
    }
  }

  getArticulos() {
    this._productos.get({ where: { pro_activo: 0 }, limit: 10000 }).subscribe((res: any) => {
      this.listProductos = res.data;
      for(let row of this.listProductos) row.pro_uni_venta = Number(row.pro_uni_venta+this.aumentarPrecio);
    }, (error) => { console.error(error); this._tools.presentToast("Error de servidor") });
  }

  onSelect(event: any) {
    //console.log(event, this.files);
    this.files = [event.addedFiles[0]]
  }

  onRemove(event) {
    //console.log(event);
    this.files.splice(this.files.indexOf(event), 1);
  }
  
  // async subirFile(opt: boolean) {
  //   this.disabled = true;
  //   this.disableBtnFile = true;
  //   this.disabledButton = true;
  //   let form: any = new FormData();
  //   form.append('file', this.files[0]);
  //   this._tools.ProcessTime({});
  //   this.urlImagen = await this._archivos.getBase64(this.files[0]);
  //   this.disabled = false;
  //   this.disableBtnFile = false;
  //   this.disabledButton = false;
  //   if (this.id) this.submit();
  //   else {
  //     if (opt) if ( ( this.data.ven_tipo == 'whatsapp' || this.data.ven_tipo == 'WHATSAPP' ) && this.urlImagen) this.submit();
  //   }

  // }

  subirFile(opt: boolean) {
    this.disabled = true;
    this.disableBtnFile = true;
    this.disabledButton = true;
    let form: any = new FormData();
    form.append('file', this.files[0]);
    this._tools.ProcessTime({});
    this._archivos.create(form).subscribe((res: any) => {
      this.data.ven_imagen_producto = res.files;
      this.disabled = false;
      this.disableBtnFile = false;
      this.disabledButton = false;
      if (this.id) this.submit();
      else {
        if (opt) if ( ( this.data.ven_tipo == 'whatsapp' || this.data.ven_tipo == 'WHATSAPP' ) && this.data.ven_imagen_producto) this.submit();
      }
    }, (error) => { console.error(error); this._tools.presentToast("Error de servidor al subir una imagen"); this.disableBtnFile = false; this.disabledButton = false; });

  }

  PrecioPush() {
    let idx = _.findIndex(this.listProductos, ['id', Number(this.data.pro_clave_int)])
    if (idx >= 0) {
      this.data.ven_precio = this.listProductos[idx].pro_uni_venta;
      this.productoTallas(this.listProductos[idx]);
    }
  }

  productoTallas(item: any) {
    if (!item.pro_sw_tallas) return false;
    this._tallas.getTalla({ tal_tipo: item.pro_sw_tallas }).subscribe((res: any) => {
      this.listTallas = res.data;
    });
  }

  async handleDropCart(producto){
    let opt = await this._tools.confirm({title:"Eliminar", detalle:"Deseas Eliminar Dato", confir:"Si Eliminar"});
    if( opt.value ){
      this.listCart = this.listCart.filter( producto => producto.codigo !== producto.codigo);
      this._tools.basic("Borrado articulo");
      this.dataSource.data = this.listCart;
      this.suma();
    }
  }

  suma() {
    this.data.ven_total = 0;
    this.data.ven_cantidad = 0;
    console.log("**290", this.listCart)
    for( let row of this.listCart ){
      console.log("**252", row, this.data)
      this.data.ven_total+= row.precioAplicado * row.Cantidad;
      this.data.ven_cantidad+= row.Cantidad;
    }
    this.data.ven_precio= this.data.ven_total;
    if (this.data.pagaFlete === 'cliente') {
      this.data.ven_total = this.data.ven_precio + this.data.priceFlete;
    } else {
      this.data.ven_total = this.data.ven_precio;
    }
  }

  submit() {
    this.disabled = true;
    this.suma();
    this.disabledButton = true;
    this.data.empresa = this.ShopConfig.id || this.ShopConfig;
    if (this.id) {
      if (!this.superSub) if (this.clone.ven_estado == 1) { this._tools.presentToast("Error no puedes ya editar la venta ya esta aprobada"); return false; }
      this.updates();
    }
    else { this.guardar(); }
  }

  guardar() {

    this.data.ven_estado = 0;
    this.data.create = moment().format('DD-MM-YYYY');
    if( this.dataUser.cabeza ) if( this.dataUser.cabeza.usu_perfil == 3 ) this.data.ven_subVendedor = 1;
    this.guardarVenta();
    /*this._ventas.get({ where: { ven_estado: 0, ven_sw_eliminado: 1 } }).subscribe((res: any) => {
      res = res.data[0];
      if (res) this._tools.basicIcons({ header: "Este cliente tiene una venta activa!", subheader: "Esta venta sera vereficada por posible confuciones" });
    });*/

  }

  formatCantidad(){
    let txtEnd = "";
    for( let item of this.listCart ){
      txtEnd+= `{"Foto": "${ item.foto }", "Color":"${ item.Color }", "Talla": "${ item.Talla }", "Cantidad": "${ item.Cantidad }", "codigo": "${ this._tools.codigo() }", "precioAplicado": "${item.precioAplicado }"},`;
    }
    return txtEnd;
  }

  guardarVenta() {
    if( this.listCart.length === 0 ) {this.disabledButton = false; this.disabled = false; return this._tools.basic("El carrito de los Productos esta vacio");}
    this.data.ven_observacion= this.formatCantidad();
    this.data.ven_tipo =this.data.metoD !== 'casa' ? 'PAGO ADELANTADO' : 'PAGA EN CASA';
    this.data ={
      ...this.data,
      "idCiudad": ( this.listCiudad.find( row => row.name === this.data.ven_ciudad ) ).id || '',
      "departamento": ( this.listDepartament.find( row => row.id === this.data.departamento ) ).name || '',
      "departament": this.data.departamento,
      "ven_imagen_producto": "",
      "ven_imagen_conversacion": this.data.metoD,
      ven_indicativo_cliente: this.data.ven_indicativo_cliente,
      foto: this.listCart[0].Foto,
      usu_clave_int: this.dataUser.id
    }
    this._ventas.create(this.data).subscribe((res: any) => {
      //this.OrderWhatsapp(res);
      res = res.result;
      this.crearNotificacion(res);
      this.disabledButton = false;
      this.disabled = false;
      this._tools.presentToast("Exitoso Estare en Modo Pendiente");
      this.dialogRef.close( 'creo' );
    }, (error) => { this._tools.presentToast("Error al crear la venta"); this.disabledButton = false; this.dialog.closeAll(); });

  }

  OrderWhatsapp( res:any ) {
    let cerialNumero:any = ''; 
    let cabeza:any = this.dataUser.cabeza || {};
    let numeroSplit = _.split( cabeza.usu_telefono, "+57", 2);
    if( numeroSplit[1] ) cabeza.usu_telefono = numeroSplit[1];
    if( cabeza.usu_perfil == 3 ) cerialNumero = ( cabeza.usu_indicativo || '57' ) + ( cabeza.usu_telefono || '3104820804' );
    else cerialNumero = "573104820804";
    let mensaje: string = `https://wa.me/${ cerialNumero }?text=info del cliente ${res.ven_nombre_cliente} telefono ${res.ven_telefono_cliente || ''} direccion ${res.ven_direccion_cliente} fecha del pedido ${res.ven_fecha_venta} Hola Servicio al cliente, 
    como esta, cordial saludo. Sería tan amable despachar este pedido a continuación datos de la venta:� producto: `;
    if (res.ven_tipo == 'whatsapp') {
      mensaje += `${ ( res.nombreProducto ) } imagen: ${res.ven_imagen_producto} talla: ${res.ven_tallas}`
    } else {
      mensaje += `${res.pro_clave_int.pro_nombre} imagen: ${res.pro_clave_int.foto} codigo: ${res.pro_clave_int.pro_codigo} talla: ${res.ven_tallas} `
    }
    window.open(mensaje);
  }

  validarNumero(){
    if( this.aumentarPrecio ) return "573104820804"
    else return "573144600019";
  }

  OrdenValidadWhatsapp( res:any ){
    let cerialNumero:any = `${ res.usu_clave_int.usu_indicativo }${ res.usu_clave_int.usu_telefono }`; 
    this.mensajeWhat = `info del cliente ${res.ven_nombre_cliente} telefono ${res.ven_telefono_cliente || ''} fecha del pedido ${res.ven_fecha_venta} Hola Vendedor, 
    como esta, cordial saludo. su pedido ya fue despachado numero guia ${ res.ven_numero_guia } Foto de guia ${ res.ven_imagen_guia }`;
    let mensaje: string = `https://wa.me/${ cerialNumero }?text=${ this.mensajeWhat }`;
    // console.log( mensaje , res);
    window.open(mensaje);
    this.copiarLink();
    // cerialNumero = `57${ res.ven_telefono_cliente }`; 
    // mensaje = `https://wa.me/${ cerialNumero }?text=info del cliente ${res.ven_nombre_cliente} telefono ${res.ven_telefono_cliente || ''} fecha del pedido ${res.ven_fecha_venta} Hola Vendedor, 
    // como esta, cordial saludo. su pedido ya fue despachado numero guia ${ res.ven_numero_guia } Foto de guia ${ res.ven_imagen_guia }`;
    // window.open(mensaje);
  }

  copiarLink(){
    const selBox = document.createElement('textarea');
    selBox.style.position = 'fixed';
    selBox.style.left = '0';
    selBox.style.top = '0';
    selBox.style.opacity = '0';
    selBox.value = this.mensajeWhat;
    document.body.appendChild(selBox);
    selBox.focus();
    selBox.select();
    document.execCommand('copy');
    document.body.removeChild(selBox);
    this._tools.openSnack('Copiado:' + ' ' + this.mensajeWhat, 'completado', false);
  }

  async updates() {
    try {
      this.data.usu_clave_int = this.data.usu_clave_int.id || this.data.usu_clave_int;
    } catch (error) { }
    //this.data = _.omit(this.data, ['usu_clave_int']);
    this.data = _.omitBy( this.data, _.isNull);
    this.updateVenta( this.data );  
  }

  updateVenta( dataV ){
    return new Promise( resolve =>{
      this._ventas.update( dataV ).subscribe((res: any) => {
        this._tools.presentToast("Actualizado");
        this.disabledButton = false;
        this.disabled = false;
        resolve( true );
        //if( res.ven_estado == 3 ) this.OrdenValidadWhatsapp( res );
      }, (error) => { resolve( false ); console.error(error); this._tools.presentToast("Error de servidor"); this.disabledButton = false; this.disabled = false; });
    });
  }

  crearNotificacion(valuesToSet: any) {
    console.log("****12", valuesToSet)
    let data = {
      titulo: "Nueva venta de " + valuesToSet.ven_nombre_cliente,
      descripcion: "Nueva venta de " + valuesToSet.ven_nombre_cliente,
      venta: valuesToSet.id,
      user: valuesToSet.usu_clave_int?.id || valuesToSet.usu_clave_int
    };
    this._notificacion.create(data).subscribe(() => {}, (error) => this._tools.presentToast("Error de servidor"));
  }

  onSelectGuias(event: any) {
    //console.log(event, this.files);
    this.filesGuias = [event.addedFiles[0]]
  }

  onRemoveGuias(event) {
    //console.log(event);
    this.filesGuias.splice(this.filesGuias.indexOf(event), 1);
  }

  subirFileGuias() {
    this.disabled = true;
    let form: any = new FormData();
    form.append('file', this.filesGuias[0]);
    this._tools.ProcessTime({});
    this._archivos.create(form).subscribe((res: any) => {
      this.data.ven_imagen_guia = res.files;
      //this._tools.presentToast("Exitoso");
      this.disabled = false;
      this.submit();
    }, (error) => { console.error(error); this._tools.presentToast("Error de servidor al subir una imagen") });

  }

  handleEnviarGuiaWhatsapp(cliente){
    this._ventas.enviarGuiaWhatsapp({
      "tiendaId": "Tienda-"+this.ShopConfig.id,
      "numeroCliente": cliente.ven_telefono_cliente,
      "url": cliente.ven_imagen_guia,
      "nombreArchivo": "Tu numero de guia "+cliente.ven_numero_guia,
      "tipo": "pdf",
      "mensaje": this.ShopConfig.txtEnvioGuia || "Tu Pedido fue despachado este es tu numero de guia# "+ cliente.ven_numero_guia
    }).subscribe( async(res) =>{
      console.log("**73", res );
      this._tools.basic("Guia enviada al cliente")
      await this.updateVenta( { id:cliente.id, guideEnviado: 1 } );
    });
  }



}