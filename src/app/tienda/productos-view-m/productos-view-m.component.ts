import { Component, ElementRef, OnInit, ViewChild } from '@angular/core';
import { MatDialog } from '@angular/material';
import { ActivatedRoute, Router } from '@angular/router';
import { TRIDYCIUDAD } from 'src/app/JSON/dane-nogroup';
import { departamento } from 'src/app/JSON/departamentos';
import { Indicativo } from 'src/app/JSON/indicativo';
import { ToolsService } from 'src/app/services/tools.service';
import { ProductoService } from 'src/app/servicesComponents/producto.service';
import { UsuariosService } from 'src/app/servicesComponents/usuarios.service';
import { VentasService } from 'src/app/servicesComponents/ventas.service';
import { AlertDialogLocationComponent } from '../alert-dialog-location/alert-dialog-location.component';
import { DialogPedidoArmaComponent } from '../dialog-pedido-arma/dialog-pedido-arma.component';
import { ListGaleryLandingComponent } from '../list-galery-landing/list-galery-landing.component';
import * as _ from 'lodash';
import { CART } from 'src/app/interfaces/sotarage';
import { Store } from '@ngrx/store';
import { FormatosService } from 'src/app/services/formatos.service';
import * as moment from 'moment';
import { dataAmerica } from 'src/app/JSON/dataAmericaPhone';

@Component({
  selector: 'app-productos-view-m',
  templateUrl: './productos-view-m.component.html',
  styleUrls: ['./productos-view-m.component.scss']
})
export class ProductosViewMComponent implements OnInit {

  dataPro:any = {};
  listGaleria:any = [];
  viewPhoto:string;
  listDataAggregate:any = [];
  listCiudades:any = TRIDYCIUDAD;
  listDepartamentoFullTD:any = departamento;
  listCiudadesRSelect:any = [];
  listCiudadesF:any = [];
  keyword = 'ciudad';
  data:any = {};
  @ViewChild('nextStep', { static: false }) nextStep: ElementRef;
  currentIndex: number = 0;
  btnDisabled: boolean = false;
  codeId:string;
  view:string = "three";
  dataEnvioDetails:any = {};
  numberId:string;
  indicativoId: string;
  listIndiPais = Indicativo;
  namePais:string = "Colombia";
  finalizarBoton: boolean = false;
  contraentregaAlert: boolean = false;
  price:number = 15999;
  code:string = "COP";
  price2:number = 15999;
  price3:number = 25000;
  dataCantidadCotizada:number;
  btnFleteDisable:boolean = false;
  urlWhatsapp:string = "";
  idVendedor:number;
  idProduct:number = 148;
  tiendaInfo:any = {};
  americanCountries = dataAmerica;

  constructor(
    private _productServices: ProductoService,
    public _ToolServices: ToolsService,
    private _ventas: VentasService,
    private activate: ActivatedRoute,
    public dialog: MatDialog,
    private Router: Router,
    private _user: UsuariosService,
    private _store: Store<CART>,
    public _formato: FormatosService
  ) { 
    this._store.subscribe((store: any) => {
      store = store.name;
      if(!store) return false;
      this.tiendaInfo = store.configuracion || {};
    });
  }

  async ngOnInit() {
    this.data.ven_indicativo_cliente = this.americanCountries.find( row => row.name === 'Colombia');
    this.dataInit( true );
    //setTimeout(()=> this.checkLocationPermission(), 2000 );
  }

  async dataInit( off = true ){
    this.codeId = this.activate.snapshot.paramMap.get('code');
    let formatN = this.activate.snapshot.paramMap.get('number');
    let formatIp = this.activate.snapshot.paramMap.get('idP');
    console.log("**********48", this.activate.snapshot.paramMap, formatIp)
    try {
      this.numberId = ( formatN.split("&") )[1];
      this.indicativoId = ( formatN.split("&") )[0];
      this.idProduct = Number( formatIp );
    } catch (error) {
      this.numberId = "3108131582";
      this.indicativoId = "COL";
      this.price = this.dataPro.pro_vendedor;
      this.idProduct = 1456;
    }
    let userIdCode:any = await this.getIdNumberUser();
    console.log("********93", userIdCode, off)
    this.idVendedor = userIdCode.id;
    if( off ) this.dataPro = await this.getProduct( this.idVendedor );
    //console.log("articulos", this.dataPro)
    this.viewPhoto = this.dataPro.foto;
    try {
      let filterNamePais = this.listIndiPais.find( row => row.iso3 === this.indicativoId );
      if( filterNamePais ) this.namePais = filterNamePais.name;
      try {
        this.price = ( this.dataPro.listPrecios.find( row => row.cantidad <= 1 ) ).precios;
      } catch (error) {
        this.price = this.dataPro.pro_vendedor;
      }
      this.code = "COP";
      this.price2 = this.dataPro.pro_vendedor;
      this.price3 = this.dataPro.pro_uni_venta;
      console.log("***100", this.price2)
    } catch (error) {
      console.log("****ERROR CONTROLADO", error)
      this.numberId = "3108131582";
      this.indicativoId = "COL";
      this.price = this.dataPro.pro_vendedor;
    }
    this.getCiudades();
    let res:any = await this.getVentaCode();
    this.data.id = res.id;
    this.data.code = res.code;

    if( !this.data.id ){
      /*let alert = await this._ToolServices.confirm({title:"Crear Pedido", detalle:"Deseas Crear un nuevo Pedido", confir:"Si Crear"});
      if( !alert.value ) return false;      */
      this.HandleOpenNewBuy();
    }
    this.view = "three";
    this.data.sumAmount = 0;
    this.data.priceTotal = 0;
    if( this.data.id ) { this.listDataAggregate = this.data.listProduct || []; this.suma(); }

    try {
      for( let row of this.dataPro.listColor ){
        row.detailsP = {};
        row.tallaSelect = row.tallaSelect.filter( item => item.check === true );
        this.listGaleria.push( ...row.galeriaList );
      }
      this.listGaleria.sort(() => this.getRandomNumber());
    } catch (error) { }
    this.urlWhatsapp = `https://wa.me/57${ this.numberId }?text=Hola Servicio al cliente`
    //console.log("****", this.dataPro, this.listGaleria)
    //console.log("list ciudades", this.listCiudades)
  }

  getIdNumberUser(){
    return new Promise( resolve =>{
      this._user.get( { where: { usu_telefono: this.numberId } } ).subscribe( res =>{
        resolve( res.data[0] || { id: 1 } );
      } );
    } );
  }

  checkLocationPermission() {
    navigator.permissions.query({ name: 'geolocation' }).then((result) => {
      if (result.state === 'granted') {
        this.getLocation();
      } else if (result.state === 'prompt') {
        this.requestLocationPermission();
      } else {
        console.log('Location permission denied');
        this.requestLocationPermission();
      }
    });
  }

  requestLocationPermission() {
    const dialogRef = this.dialog.open(AlertDialogLocationComponent);

    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        navigator.geolocation.getCurrentPosition(
          (position) => {
            this.getLocation();
            localStorage.setItem('locationPermission', 'granted');
          },
          (error) => {
            console.error('Error getting location: ', error);
          }
        );
      } else {
        console.log('Location permission denied');
        alert('La ubicación es obligatoria para utilizar esta aplicación. Por favor, permite el acceso a la ubicación.');
        this.requestLocationPermission();
      }
    });
  }

  getLocation() {
    this._ToolServices.getPosition().then((position) => {
      const latitude = position.coords.latitude;
      const longitude = position.coords.longitude;
      console.log("Latitude: " + latitude + " Longitude: " + longitude);
      this.data.latitude = latitude;
      this.data.longitude = longitude;
      // Aquí puedes enviar la ubicación al servidor o usarla como desees
    }).catch((error) => {
      console.error("Error getting location: ", error);
    });
  }

  getVentaCode(){
    return new Promise( resolve =>{
      this._ventas.getVentasL( { where: { code: this.codeId, stateWhatsapp: 0 } } ).subscribe( res => resolve( res.data[0] || {} ), error => resolve( error ) );
    });
  }

  getRandomNumber() {
    return Math.random() - 0.5;
  }

  scrollToNextStep() {
    console.log("*****", this.nextStep )
    if (this.nextStep) {
      this.nextStep.nativeElement.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  }

  // Función para mostrar la foto siguiente
  showNextPhoto() {
    this.currentIndex = (this.currentIndex + 1) % this.listGaleria.length;
  }

  // Función para mostrar la foto anterior
  showPreviousPhoto() {
    this.currentIndex = (this.currentIndex - 1 + this.listGaleria.length) % this.listGaleria.length;
  }

  getProduct( userId:number ){
    return new Promise( resolve =>{
      this._productServices.getStore( { where: { article: this.idProduct || 148 } } ).subscribe( res => resolve( res.data[0] ), error => resolve( error ) );
    })
  }

  async getCiudades(){

    if( this.namePais === 'Colombia'){
      return new Promise( resolve => {
        this._ventas.getCiudadesTridy( { where: { pais:'COLOMBIA' }, limit: 100000 } ).subscribe( ( res:any )=>{
          //this.listCiudades = res.data;
          this.listCiudades = res.data;
          resolve( this.listCiudades );
        });
      });
    }else{
      return new Promise( resolve =>{
        this._ventas.getCiudadesTridy( { where: { pais:'PANAMA' }, limit: 100000 } ).subscribe( ( res:any )=>{
          //this.listCiudades = res.data;
          this.listCiudades = res.data;
          resolve( this.listCiudades );
        });
      })
    }

  }

  handleOpenViewPhoto( photo:string ){
    this.viewPhoto = photo;
  }

  handleOpenViewPhotoG( photo:string, list:any ){
    list.foto = photo;
  }

  /*
  async handleOpenDialogPhoto( row, item ){
    //this._ToolServices.openFotoAlert( row.foto );
    //console.log("***ENTRO", row, item)
    item.foto = row.foto;
    const dialogRef = this.dialog.open(DialogPedidoArmaComponent,{
      data: { foto: row.foto, id: this.idProduct },
      width: '350px',
    });
    dialogRef.afterClosed().subscribe(selectTalla => {
      //console.log(`Dialog result:`, selectTalla);
      try {
        if( !selectTalla.talla || !selectTalla.cantidad || !item.foto ) return false;
        row.tal_descripcion = selectTalla.talla;
        row.amountAd = selectTalla.cantidad;
  
        this.handleOpenDialogAmount( row, item, false )
      } catch (error) {
        
      }
    });

  }

  */
  async handleOpenDialogPhoto( row ){
    console.log("**278", this.dataPro)
    const dialogRef = this.dialog.open(DialogPedidoArmaComponent,{
      data: { ...this.dataPro, foto: row.foto, id: this.idProduct },
      width: '350px',
    });
    dialogRef.afterClosed().subscribe(selectTalla => {
      //console.log(`Dialog result:`, selectTalla);
      try {
        if( !selectTalla.talla || !selectTalla.cantidad || !row.foto ) return false;
        row.tal_descripcion = selectTalla.talla;
        row.amountAd = selectTalla.cantidad;
  
        this.handleOpenDialogAmount( row, false );
      } catch (error) {
        console.log("***292", error )
      }
    });
  }

  async handleDeleteItem( item ){
    /*let alert = await this._ToolServices.confirm({title:"Eliminar", detalle:"Deseas Eliminar Item", confir:"Si Eliminar"});
    if( !alert.value ) return false;*/
    this.listDataAggregate = this.listDataAggregate.filter( row => row.id !== item.id );
    this.suma();
  }

  async handleOpenDialogAmount( row, opt ){
    if( opt === true ) {
      let result:any = await this._ToolServices.alertInput( { input: "number", title: "Cantidad adquirir", confirme: "Aceptar" } );
      if( !result.value ) return false;
      row.cantidadAd = result.value;
    }
    this.listDataAggregate.push( { color: row.color, ref: row.foto, foto: row.foto, amountAd: Number( row.amountAd ), talla: row.tal_descripcion, id: this._ToolServices.codigo(), price: this.price } );
    //console.log("***114", this.listDataAggregate)
    this.suma();
    this._ToolServices.presentToast("Producto Agregado al Carrito");
    setTimeout(()=>this.scrollToNextStep(), 1000 )
  }

  suma(){
    this.data.sumAmount = 0;
    let sumPrice = this.price;
    //console.log("****186", sumPrice, this.namePais)
    for( let row of this.listDataAggregate ) {
      row.price = this.price;
      this.data.sumAmount+= Number( row.amountAd )
      //console.log("***334", row)
    }
    let cantidad = this.data.sumAmount;
    let precios = this.dataPro.listPrecios;

    // Ordenamos los precios por cantidad ascendente
    let preciosOrdenados = precios.sort((a, b) => a.cantidad - b.cantidad);

    // Buscamos el precio más alto aplicable según la cantidad
    let valorOpt = preciosOrdenados.findLast(p => p.cantidad <= cantidad);

    // Si no se encontró, usamos el primero (cuando la cantidad es menor que la mínima)
    if (!valorOpt) {
      valorOpt = preciosOrdenados[0];
    }

    console.log("***337", valorOpt)
    if( !valorOpt ) return false;
    this.data.price = ( valorOpt.precios );
    this.price = this.data.price;
    this.data.priceTotal = this.data.price * this.data.sumAmount;
  /*
    if( this.data.sumAmount >= 6 ) {
      this.price = this.dataPro.pro_vendedor;
      this.data.priceTotal = this.price * this.data.sumAmount;
    }
    else {
        this.price = this.dataPro.pro_uni_venta;
        this.data.priceTotal = this.price * this.data.sumAmount;
    }*/
    this.data.countItem = this.data.sumAmount;
    this.data.totalAPagar = this.data.priceTotal + ( this.dataPro.cobreEnvio === 0 ? ( this.data.totalFlete || 0 ) : 0 ) ;
  }

  //edu
  async pedidoConfirmar(){
    let dataEnd:any = this.data;
    dataEnd.listProduct = this.listDataAggregate;
    //console.log("this.data.transportadora",this.data.transportadora)
    dataEnd.transportadora = this.data.transportadora //EDU
    dataEnd.numerowsap = this.numberId
    //this.celularConfirmar(dataEnd);
    this.handleEndOrder();
  }

  handleCheckContra(){
    this.contraentregaAlert = !this.contraentregaAlert;
    this.data.totalFlete = 0;
    this.suma();
  }

  async handleEndOrder(){
    if( this.btnDisabled ) return this._ToolServices.presentToast("Espera un momento que estamos consultando tu flete");
    let validate = this.validarInput();
    if( !validate ) return false;
    this.btnDisabled = true;
    let dataEnd:any = this.data;
    this.view = 'one';
    if( dataEnd.ciudad.ciudad_full ) {
      dataEnd.codeCiudad = dataEnd.ciudad.id_ciudad;
      dataEnd.ciudad = dataEnd.ciudad.ciudad_full;
      //console.log("*****262", dataEnd )
    }
    dataEnd.stateWhatsapp = 1;
    dataEnd.paisCreado = this.namePais;
    dataEnd.numberCreado = this.numberId;
    this.suma();
    if( !this.contraentregaAlert ) {
      if( this.dataCantidadCotizada !== dataEnd.priceTotal ) await this.handleProcesFlete( false );
    }
    dataEnd.totalFlete = this.data.totalFlete;
    this.suma();
    if( this.contraentregaAlert === true || dataEnd.totalFlete === 0 ) dataEnd.contraEntrega = 1;
    else dataEnd.contraEntrega = 0;
    this.ProcessNextUpdateVentaL( dataEnd )
    let result = await this._ToolServices.modaHtmlEnd( dataEnd, this.dataPro );
    if( !result ) {this.btnDisabled = false; this.view = 'three'; return this._ToolServices.presentToast("Editar Tu Pedido..."); }
    let res:any = await this.ProcessNextUpdateVentaL( dataEnd );
    //console.log("*****101", res)
    this.view = 'three';
    if( !res.id ) { this._ToolServices.presentToast("Ok, tenemos problemas con tu envío, por favor recargar tu página!"); this.btnDisabled = false; return false; };
    this.data = {...res};
    //if( this.numberId ) this.openWhatsapp( res );
    this._ToolServices.presentToast("Tu pedido ha sido enviado correctamente gracias por tu compra.!");
    this.btnDisabled = false;
    //this.data = [];
    this.handleCreateBuy( res );
    //this.listDataAggregate = [];
    this.view = 'foor';
    /*setTimeout(()=> {
    let url = "https://wa.me/573228174758?text=";
     window.open( url );
    }, 9000 );*/
    //this.pedidoGuardar(dataEnd)
  }

  ProcessNextUpdateVentaL( dataEnd ){
    return new Promise( resolve =>{
      this._ventas.updateVentasL( dataEnd ).subscribe( res => resolve( res) );
    })
  }

  handleCreateBuy( dataV ){
    this._ventas.create( 
      {
        "ven_tipo": "PAGA EN CASA",
        "usu_clave_int": 100231,
        "ven_usu_creacion": this.tiendaInfo.emailTienda || '',
        "ven_fecha_venta": moment().format("DD/MM/YYYY"),
        "ven_nombre_cliente": dataV.nombre,
        "ven_telefono_cliente": dataV.numero,
        "ven_ciudad": dataV.ciudad,
        "ven_barrio": dataV.barrio,
        "ven_direccion_cliente": dataV.direccion,
        "ven_cantidad": dataV.countItem,
        "ven_tallas": 0,
        "ven_precio": dataV.listProduct[0].price,
        "ven_total": dataV.totalAPagar,
        "ven_ganancias": 0,
        "ven_observacion": this.formatCantidad(),
        "ven_estado": 0,
        "create": moment().format("DD/MM/YYYY"),
        "idCiudad": 50,
        "departamento": dataV.departament,
        "departament": 3,
        "ven_imagen_producto": this.dataPro.foto,
        "empresa": this.tiendaInfo.id,
        "ven_imagen_conversacion": "casa",
        "ven_indicativo_cliente": this.data.ven_indicativo_cliente
      }
     ).subscribe( res => {

    });
  }

  
  formatCantidad(){
    let txtEnd = "";  
    //console.log("***478", this.listDataAggregate)
    for( let item of this.listDataAggregate ){
      //console.log("***478", item)
      txtEnd+= `{"Foto": "${ item.foto }", "Color":"${ item.color }", "Talla": "${ item.talla }", "Cantidad": "${ item.amountAd }"},`;
    }
    return txtEnd;
  }

  handleOpenWhatsapp(){
    if( !this.numberId ) {
      let url = "https://wa.me/573228174758?text=";
      window.open( url );
    }
    setTimeout(()=> window.close(), 5000 );
  }

  HandleOpenNewBuy(){
    let dats = {
      "sumAmount": 0,
      "priceTotal": 0,
      "nombre": ".",
      "ciudad": ".",
      "direccion": ".",
      "barrio": ".",
      "numero": this.data.numero || 0,
      "listProduct": [],
      "code": this._ToolServices.codigo(),
      "countItem": 0,
      "totalFlete": 0,
      "totalAPagar": 0,
      "paisCreado": this.namePais,
      "numberCreado": this.numberId,
      "user": this.idVendedor
   };
   this._ventas.createVentasL( dats ).subscribe( res =>{
    if( res ){
      //console.log("*****335", '/front/landingWhatsapp'+dats.code+this.indicativoId+this.numberId);
      this.Router.navigate(['/tienda/productosViewM', dats.code, `${ this.indicativoId }&${ this.numberId }`, this.idProduct ] );
      setTimeout(()=> this.dataInit( false ), 3000 );
      //setTimeout(()=> location.reload(), 3000 );
    }
   } );

  }

  validarCantidad(){
    let sum = 0;
    for( let row of this.listDataAggregate ) sum+=row.amountAd
    if( sum < 6 ) this._ToolServices.basicIcons( { header: "Alerta", subheader: "Recuerda que para aplicar al precio de $15.500 son despues de 6 pares en adelante de lo contrario saldran a $25.000"})
  }

  validarInput(){
    if( !this.data.nombre ) { this._ToolServices.presentToast("Falta Tu Nombre!"); return false; }
    if( !this.data.ciudad ) { this._ToolServices.presentToast("Falta Tu Ciudad!"); return false; }
    if( !this.data.direccion ) { this._ToolServices.presentToast("Falta Tu Dirección!"); return false; }
    if( !this.data.barrio ) {this._ToolServices.presentToast("Falta Tu Barrio!"); return false; }
    if( !this.data.numero ) {this._ToolServices.presentToast("Falta Tu Numero!"); return false; }
    //if( !this.data.celL ) {this._ToolServices.presentToast("Falta Tu Numero de contacto!"); return false; }
    if( this.listDataAggregate.length === 0 ) {this._ToolServices.presentToast("Falta Tu Agregar Articulos Al Carrito!"); return false; }
    return true;
  }

  openWhatsapp( data:any ){
    //console.log("*****473", data)
    let urlWhatsapp = `https://wa.me/57${ this.numberId }?text=${ encodeURIComponent(` Cod: 785
¡Gracias por tu compra, ${ data.nombre }!🤩

¡Es un honor para nosotros que hagas parte de nuestra familia! ✨

✈ Tus datos para la entrega son:

Nombre: ${ data.nombre }
WhatsApp: ${ data.numero}
Dirección: ${ data.direccion }
Ciudad: ${ data.ciudad }
Cantidad de pares: * ${ this.data.countItem } *
Valor de productos: ${ this._ToolServices.monedaChange(3,2,( ( this.data.totalAPagar -  this.data.totalFlete ) || 0 )) }
Valor de flete: ${ this.dataPro.cobreEnvio === 0 ? ( this._ToolServices.monedaChange( 3,2, ( this.data.totalFlete || 0 ) ) ) : "Envio Gratis" }
Monto a cancelar: ${ this._ToolServices.monedaChange( 3,2, ( this.data.totalAPagar || 0 ) ) } ${ this.namePais === 'Colombia' ? '¡Pagas al recibir!' : ''}

⏳ Tiempo de entrega: 2 a 8 días hábiles (depende de tu ubicación y transportadora).

🤝 Su guía será enviada apenas su pedido esté en despacho.`)}`;
    window.open( urlWhatsapp );
    this.data = {};
    //this.listDataAggregate = [];
    window.document.scrollingElement.scrollTop=0;
  }

  redondeaAlAlza(xx,r) {
    xx = Math.floor(xx/r)
    if (xx!=xx/r) {xx++}
    return (xx*r)
}

  async precioRutulo( ev:any, opt:boolean = true ){
    return new Promise( async ( resolve ) =>{
      console.log("***EVE", ev);
      this.data.transportadora = ev.transportadora;
      this.data.totalFlete = 0;
      this.data.id_ciudad = ev.id_ciudad;
      this.dataEnvioDetails = ev;
      this.contraentregaAlert = false;
      if(ev.contraentrega != "SI" || !this.data.id_ciudad ){ this.contraentregaAlert = true; this.data.totalFlete = 0;  return resolve( true ) }
      let data = {
        peso: 1 ,
        alto: 9,
        ancho: 21,
        profundo: 28,
        idDestino: ev.id_ciudad,
        valor_declarado: ( this.data.priceTotal * 50 ) / 100 ,
        valor_recaudar: this.data.priceTotal,
        transport: ev.transportadora
      };
      let sumaFlete = 0;
      if ( this.data.sumAmount > 0 )  {
        data.peso = 1;
        data.alto= 9;
        sumaFlete = 1000;
      }
      if ( this.data.sumAmount > 6 )  {
        data.peso = 2;
        data.alto= 9;
        sumaFlete = 2000;
      }
      if ( this.data.sumAmount > 12 )  {
        data.peso = 3;
        data.alto= 9;
        sumaFlete = 3000;
      }
      if ( this.data.sumAmount > 18 )  {
        data.peso = 4;
        data.alto= 9;
        sumaFlete = 4000;
      }
      if ( this.data.sumAmount > 24 )  {
        data.peso = 5;
        data.alto= 9;
        sumaFlete = 5000;
      }
      if ( this.data.sumAmount > 31 )  {
        data.peso = 6;
        data.alto= 9;
        sumaFlete = 6000;
      }
      if ( this.data.sumAmount > 37 )  {
        data.peso = 7;
        data.alto= 9;
        sumaFlete = 7000;
      }
      if ( this.data.sumAmount > 43 )  {
        data.peso = 8;
        data.alto= 9;
        sumaFlete = 8000;
      }
      if ( this.data.sumAmount > 49 )  {
        data.peso = 9;
        data.alto= 9;
        sumaFlete = 9000;
      }
      this.data.af = sumaFlete; //el AF
      this.btnDisabled = true;
      //this._ToolServices.presentToast( "Estamos consultando tu flete esperé un momento, gracias..." );
      let res:any = await this.getTridy( data );
      if( res.data === "Cannot find table 0." ) res = await this.getTridy( data );
      if( res.data === "Cannot find table 0." )  { this.btnDisabled = false; this.data.totalFlete = 0; this.contraentregaAlert = true; resolve( false ); return this._ToolServices.presentToast( "Ok Tenemos Problemas Con Las Cotizaciones de Flete lo sentimos, un asesor se comunicar contigo gracias que pena la molestia" )  }
      /*data.valor_recaudar = ( Number( ( res.data || 0 ) ) + sumaFlete ) ;
      res = await this.getTridy( data );*/
      this.data.totalFlete = Number( ( res.data || 0 ) ) ;
      this.data.totalFlete = Number(this.data.totalFlete.toFixed(2));
      this.data.totalFlete = this.redondeaAlAlza(this.data.totalFlete,0);
      //this.data.totalFlete += sumaFlete;
      if( !res.data ){
        this.data.totalFlete = 0;
      }
      //this._ToolServices.basic("Precio del Envio "+ this._ToolServices.monedaChange( 3, 2, ( this.data.totalFlete ) ) + " Transportadora "+  ev.transportadora );
      //if( opt === true ) this._ToolServices.presentToast("Precio del Envio "+ this._ToolServices.monedaChange( 3, 2, ( this.data.totalFlete ) ) + " Transportadora "+  ev.transportadora );
      this.suma();
      this.btnDisabled = false;
      resolve( this.data.totalFlete );
    })
  }

  getTridy( data ){
    return new Promise( resolve =>{
      this._ventas.getFleteValorTriidy( data ).subscribe( res =>{
        resolve( res );
      },()=>resolve({ data:0 } ) );
    });
  }
  onChangeSearch( val:any ){
    //console.log( val, this.listCiudades )
    this.contraentregaAlert = false
    if (val) {
      this.listCiudadesF = this.listCiudades.filter((ciudad) =>
        ciudad.ciudad.toLowerCase().includes(val.toLowerCase())
      );
    } else {
      this.listCiudadesF = [];
    }
  }

  handleSelect( view:string, opt:number ){
    this.view = view;
  }

  handleSelectDepartament(){
    let filterR = this.listCiudades.find( row => row.id_ciudad == this.data.departamento )
    //console.log("***566", this.data, filterR )
    if( filterR ){
      this.data.departament = filterR.departamento;
      this.listCiudadesRSelect = filterR.ciudadesList
    }
  }
  async handleProcesFlete( opt:boolean = true ){
    //console.log("*¨**574", this.data, this.listCiudadesRSelect );
    let dataFletePrice = [];
    let filterR = this.listCiudadesRSelect.find( row => row.id_ciudad == this.data.ciudades );
    if( filterR ){
      if( this.namePais === 'Colombia'){
        if( opt === true ){
          this.data.ciudad = {
            ciudad_full: filterR.ciudad_full,
            id_ciudad: filterR.id_ciudad,
          };
        }
      }
      if( this.namePais === 'Panama'){
        this.data.ciudad = filterR.ciudad_full
        this.data.codeCiudad = Number( filterR.id_ciudad )
      }
      let dataF:any = {};
      let index = 0;
      if( this.listDataAggregate.length === 0 ) return true;
      for( let row of filterR.transport ){
        if( row.contraentrega === 'SI' && row.transportadora !== "Domicilio" ){
          dataF = {
            transportadora: row.transportadora,
            id_ciudad: row.id_ciudad,
            contraentrega: String( row.contraentrega ),
          };
          let r = await this.precioRutulo( dataF, false )
          if( r === false ) continue;
          dataFletePrice.push( { ...dataF, price: r, recaudo: this.data.priceTotal, countPares: this.data.sumAmount } );
          if( index >=2 ) break; // Consulta con 3 transportadoras
          index++;
        }
      }
    }
    let valAlto = _.orderBy(dataFletePrice, ['price'], ['asc']); // ORdenar Cual es el menos Caro
    valAlto = this.cleanData( valAlto ); // elimina los undefinde y los Nan
    valAlto = valAlto.filter( valAlto => valAlto.price ) // Busca los que si tienen precio
    if( valAlto[0] ){
      this.data.dataTridyCosto = valAlto || [];
      this.data.transportadora = valAlto[0].transportadora;
      this.data.totalFlete = valAlto[0].price;
      valAlto[0].price = this.data.totalFlete;
      //this.data.totalFlete = this.redondeaAlAlza(this.data.totalFlete,1000);
      this.suma();
      this.dataCantidadCotizada = this.data.priceTotal;
      //if( this.dataPro.cobreEnvio === 0 ) this._ToolServices.presentToast("Precio del Envio "+ this._ToolServices.monedaChange( 3, 2, ( this.data.totalFlete ) ) + " Transportadora "+  this.data.transportadora );
    }else{
      this.data.totalFlete = 0;
      this.data.transportadora = '';
      this.suma();
      this.contraentregaAlert = true;
    }
    console.log("*****************650********", valAlto, this.data );
  }

  cleanData( dataArray ) {
    return dataArray.map(item => {
      let cleanedItem = {};
      for (let key in item) {
        if( key === 'transportadora') cleanedItem[key] = item[key];
        if (item.hasOwnProperty(key)) {
          let value = item[key];
          if (value !== undefined && !isNaN(value)) {
            cleanedItem[key] = value;
          }
        }
      }
      return cleanedItem;
    });
  }

  handleOpenPhoto(){
    const dialogRef = this.dialog.open(ListGaleryLandingComponent,{
      data: {data: this.dataPro.listColor, id: this.idProduct },
      width: "100%",
      height: "auto"
    });

    dialogRef.afterClosed().subscribe(result => {
      console.log(`Dialog result:`, result );
      if( !result ) return false;
      for( let row of result ){
        this.listDataAggregate.push( { ref: row.ref, foto: row.foto, amountAd: Number( row.cantidad ), talla: row.talla, id: this._ToolServices.codigo(), price: this.price } );
      }
      this.suma();
      this._ToolServices.presentToast("Producto Agregado al Carrito")
      setTimeout(()=>this.scrollToNextStep(), 1000 )
    });
  }

}
