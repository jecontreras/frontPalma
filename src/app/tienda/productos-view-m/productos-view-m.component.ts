import { Component, ElementRef, Input, OnInit, ViewChild } from '@angular/core';
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
import { departamentDrop } from 'src/app/JSON/departmentDrop';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
interface Combo {
  tipo: string;
  rango: string;
  precio: number;
  moneda: string;
  subtext: string;
  color: string; // color para la etiqueta
}

interface FAQ {
  pregunta: string;
  respuesta: string;
}
interface Pedido {
  referencia: string;
  talla: string;
  color: string;
  cantidad: number;
  foto: string;
}

@Component({
  selector: 'app-productos-view-m',
  templateUrl: './productos-view-m.component.html',
  styleUrls: ['./productos-view-m.component.scss']
})
export class ProductosViewMComponent implements OnInit {

   dias: number = 0;
  horas: number = 0;
  minutos: number = 0;
  segundos: number = 0;
  private fechaFinal = new Date();

  stats = [
    { valor: '+07', texto: 'Años en el mercado' },
    { valor: '+135', texto: 'Imágenes en catálogo' },
    { valor: '+720', texto: 'Clientas activas' },
    { valor: '+100K', texto: 'Sandalias vendidas' }
  ];

  referencias = [
    { id: 10 }, { id: 20 }, { id: 30 }, { id: 40 },
    { id: 50 }, { id: 60 }, { id: 70 }, { id: 80 }
  ];

  form: FormGroup;
  departamentos = ['Cundinamarca', 'Antioquia', 'Valle del Cauca'];
  ciudades = ['Bogotá', 'Medellín', 'Cali'];

  tiendaInfo:any = {};

  // 🔹 Datos simulados del pedido
  resumen = {
    cantidadPares: 8,
    precioPar: 15500,
    subtotal: 124000,
    precioEnvio: 22500,
    total: 146500
  };

  imagenes = [
    'assets/productos/prod1.jpg',
    'assets/productos/prod2.jpg',
    'assets/productos/prod3.jpg'
  ];

  combos: Combo[] = [
    {
      tipo: 'BENEFICIO',
      rango: 'Lleva de 1 a 5 pares',
      precio: 25500,
      moneda: 'COP',
      subtext: 'El Valor x par',
      color: '#ff007a'
    },
    {
      tipo: 'EMPRENDEDORA',
      rango: 'Lleva de 6 en adelante',
      precio: 15500,
      moneda: 'COP',
      subtext: 'El Valor x par',
      color: '#e60073'
    }
  ];

  faqs: FAQ[] = [
    {
      pregunta: '¿Dónde están ubicados?',
      respuesta: 'Estamos ubicados en Bogotá, Colombia. Enviamos a todo el país.'
    },
    {
      pregunta: '¿Es pago contra entrega?',
      respuesta: 'Sí, manejamos pago contra entrega en la mayoría de ciudades.'
    },
    {
      pregunta: '¿Tienen más diseños?',
      respuesta: 'Sí, contamos con una amplia variedad de diseños actualizados constantemente.'
    },
    {
      pregunta: '¿Tienen Garantía?',
      respuesta: 'Nuestras sandalias tienen garantía por imperfectos de fábrica como costura y pegante.'
    }
  ];

  @Input() pedidos: Pedido[] = [
    {
      referencia: '101',
      talla: '37',
      color: 'Vinotinto',
      cantidad: 2,
      foto: 'assets/img/sandalia-roja.png'
    },
    {
      referencia: '101',
      talla: '37',
      color: 'Vinotinto',
      cantidad: 2,
      foto: 'assets/img/sandalia-azul.png'
    },
    {
      referencia: '101',
      talla: '37',
      color: 'Vinotinto',
      cantidad: 2,
      foto: 'assets/img/sandalia-vino.png'
    },
    {
      referencia: '101',
      talla: '37',
      color: 'Vinotinto',
      cantidad: 2,
      foto: 'assets/img/sandalia-naranja.png'
    }
  ];

  dataPro:any = {};
  listGaleria:any = [];
  viewPhoto:string;
  listDataAggregate:any = [];
  listCiudades:any = departamentDrop;
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
  price:number = 0;
  code:string = "COP";
  price2:number = 0;
  price3:number = 0;
  dataCantidadCotizada:number;
  btnFleteDisable:boolean = false;
  urlWhatsapp:string = "";
  idVendedor:number;
  idProduct:number = 148;
  americanCountries = dataAmerica;
  // Las tallas vendrán desde la consulta del producto
  tallasDisponibles: string[] = [];

  constructor(
    private fb: FormBuilder,
    private _store: Store<CART>,
    private _productServices: ProductoService,
    public _ToolServices: ToolsService,
    private _ventas: VentasService,
    private activate: ActivatedRoute,
    public dialog: MatDialog,
    private Router: Router,
    private _user: UsuariosService,
    public _formato: FormatosService
  ) {
    
    this._store.subscribe((store: any) => {
      store = store.name;
      if(!store) return false;
      this.tiendaInfo = store.configuracion || {};
    });

    this.form = this.fb.group({
      nombre: ['', Validators.required],
      ven_indicativo_cliente: ['57'],
      numero: ['', [Validators.required]],
      departamento: ['', Validators.required],
      ciudades: ['', Validators.required],
      direccion: ['', Validators.required],
      barrio: ['', Validators.required],
      datosCorrectos: [false, Validators.requiredTrue]
    });
    this.fechaFinal.setDate(this.fechaFinal.getDate() + 2);
  }

  ngOnInit() {
    setInterval(() => this.actualizarTiempo(), 1000);
    this.dataInit();
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
      this.price = this.dataPro.pro_uni_venta || 0;
      this.idProduct = 1456;
    }
    let userIdCode:any = await this.getIdNumberUser();
    console.log("********93", userIdCode, off)
    this.idVendedor = userIdCode.id;
    if( off ) this.dataPro = await this.getProduct( this.idVendedor );
    console.log("articulos", this.dataPro)
    this.viewPhoto = this.dataPro.foto;
    if (this.dataPro?.listaTallas) {
    this.tallasDisponibles = _.map(this.dataPro.listaTallas, 'tal_descripcion');
  }
    try {
      let filterNamePais = this.listIndiPais.find( row => row.iso3 === this.indicativoId );
      if( filterNamePais ) this.namePais = filterNamePais.name;
      try {
        this.price = ( this.dataPro.combos.find( row => Number( row.rango ) <= 1 ) ).precios;
      } catch (error) {
        this.price = this.dataPro.pro_uni_venta;
      }
      this.code = "COP";
      this.price2 = this.dataPro.pro_uni_venta;
      this.price3 = this.dataPro.pro_uni_venta;
      console.log("***100", this.price2, this.price)
    } catch (error) {
      console.log("****ERROR CONTROLADO", error)
      this.numberId = "3108131582";
      this.indicativoId = "COL";
      this.price = this.dataPro.pro_uni_venta;
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
      this._user.get( { where: { usu_telefono: this.numberId } } ).subscribe( (res:any) =>{
        resolve( res.data[0] || { id: 1 } );
      } );
    } );
  }

  async getCiudades(){

    return new Promise( resolve => {
      this._ventas.getDepartment( "CiudadesTridy/getDepartamento", { } ).subscribe( (res:any) =>{
      //this.listCiudades = res.objects || this.listCiudades ;
      resolve( this.listCiudades );
    });
    });

  }

  getVentaCode(){
    return new Promise( resolve =>{
      this._ventas.getVentasL( { where: { code: this.codeId, stateWhatsapp: 0 } } ).subscribe( (res:any) => resolve( res.data[0] || {} ), error => resolve( error ) );
    });
  }

  getRandomNumber() {
    return Math.random() - 0.5;
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
    let precios = this.dataPro.combos;

    // Ordenamos los precios por cantidad ascendente
    let preciosOrdenados = precios.sort((a, b) => a.cantidad - b.cantidad);

    // Buscamos el precio más alto aplicable según la cantidad
    let valorOpt = preciosOrdenados.findLast(p => p.cantidad <= cantidad);

    // Si no se encontró, usamos el primero (cuando la cantidad es menor que la mínima)
    if (!valorOpt) {
      valorOpt = preciosOrdenados[0];
    }

    if( !valorOpt ) return false;
    this.data.price = ( valorOpt.precios );
    this.price = this.data.price;
    this.data.priceTotal = this.data.price * this.data.sumAmount;
    this.data.countItem = this.data.sumAmount;
    this.data.totalAPagar = this.data.priceTotal + ( this.dataPro.pagaEnvio === 'cliente' ? ( this.data.totalFlete || 0 ) : 0 ) ;
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

  getProduct( userId:number ){
    return new Promise( resolve =>{
      this._productServices.getStore( { where: { article: this.idProduct || 148 } } ).subscribe( (res:any) => resolve( res.data[0] ), error => resolve( error ) );
    })
  }

  // Formatear número con separadores de miles
  formatCurrency(valor: number, moneda: string): string {
    return new Intl.NumberFormat('es-CO').format(valor) + ' ' + moneda;
  }
  
  private actualizarTiempo() {
    const ahora = new Date().getTime();
    const tiempoRestante = this.fechaFinal.getTime() - ahora;

    if (tiempoRestante > 0) {
      this.dias = Math.floor(tiempoRestante / (1000 * 60 * 60 * 24));
      this.horas = Math.floor((tiempoRestante % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
      this.minutos = Math.floor((tiempoRestante % (1000 * 60 * 60)) / (1000 * 60));
      this.segundos = Math.floor((tiempoRestante % (1000 * 60)) / 1000);
    } else {
      this.dias = this.horas = this.minutos = this.segundos = 0;
    }
  }

  async handleOpenDialogPhoto( row ){
    console.log("**278", row)
    const dialogRef = this.dialog.open(DialogPedidoArmaComponent,{
      data: { ...this.dataPro, foto: row.foto, id: this.idProduct, row },
      width: '350px',
    });
    dialogRef.afterClosed().subscribe(selectTalla => {
      //console.log(`Dialog result:`, selectTalla);
      try {
        if( !selectTalla.talla || !selectTalla.cantidad || !row.foto ) return false;
        row.tal_descripcion = selectTalla.talla;
        row.amountAd = selectTalla.cantidad;
        row.foto = selectTalla.foto || row.foto;
  
        this.handleOpenDialogAmount( row, false );
      } catch (error) {
        console.log("***292", error )
      }
    });
  }

  async handleOpenDialogAmount( row, opt ){
    if( opt === true ) {
      let result:any = await this._ToolServices.alertInput( { input: "number", title: "Cantidad adquirir", confirme: "Aceptar" } );
      if( !result.value ) return false;
      row.cantidadAd = result.value;
    }
    this.listDataAggregate.push( { color: row.color || row.foto, ref: row.talla, foto: row.foto, amountAd: Number( row.amountAd ), talla: row.tal_descripcion, id: this._ToolServices.codigo(), price: this.price } );
    console.log("***114", this.listDataAggregate)
    this.suma();
    this._ToolServices.presentToast("Producto Agregado al Carrito");
  }

  confirmarPedido() {

  }

  realizarPedido() {
  }

  onSubmit() {
    if (this.form.valid) {
      /*console.log("✅ Pedido confirmado:", {
        datosCliente: this.form.value,
        resumen: this.resumen
      });*/
      this.pedidoConfirmar();
      alert("Pedido realizado con éxito 🚀");
    } else {
      this.form.markAllAsTouched();
    }
  }

  async pedidoConfirmar(){
    let dataEnd:any = this.form.value;
    dataEnd.listProduct = this.listDataAggregate;
    //console.log("this.data.transportadora",this.data.transportadora)
    dataEnd.transportadora = this.data.transportadora //EDU
    dataEnd.numerowsap = this.numberId
    //this.celularConfirmar(dataEnd);
    this.handleEndOrder( dataEnd );
  }

  async handleEndOrder( dataEnd ){
    if( this.btnDisabled ) return this._ToolServices.presentToast("Espera un momento que estamos consultando tu flete");
    this.btnDisabled = true;
    dataEnd = { ...this.data, ...this.form.value };
    this.view = 'one';
    //console.log("**", dataEnd );
    if( dataEnd.ciudad.ciudad_full ) {
      dataEnd.codeCiudad = dataEnd.ciudad.id_ciudad;
      dataEnd.ciudad = dataEnd.ciudad.ciudad_full;
      //console.log("*****262", dataEnd )
    }
    dataEnd.stateWhatsapp = 1;
    dataEnd.paisCreado = this.namePais;
    dataEnd.numberCreado = this.numberId;
    dataEnd.totalFlete = this.data.totalFlete;
    this.suma();
    if( this.contraentregaAlert === true || dataEnd.totalFlete === 0 ) dataEnd.contraEntrega = 1;
    else dataEnd.contraEntrega = 0;
    this.ProcessNextUpdateVentaL( dataEnd )
    //let result = await this._ToolServices.modaHtmlEnd( dataEnd, this.dataPro );
    //if( !result ) {this.btnDisabled = false; this.view = 'three'; return this._ToolServices.presentToast("Editar Tu Pedido..."); }
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
        "priceFlete": this.data.totalFlete,
        "transport": this.data.transportadora,
        "ven_indicativo_cliente": this.data.ven_indicativo_cliente ? this.data.ven_indicativo_cliente.dialCode : "57",
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
        "pagaFlete": this.dataPro.pagaEnvio === 'cliente' ? "cliente" : "vendedor"
      }
     ).subscribe( res => {

    });
  }

  
  formatCantidad(){
    let txtEnd = "";  
    //console.log("***478", this.listDataAggregate)
    for( let item of this.listDataAggregate ){
      //console.log("***478", item)
      txtEnd+= `{"Foto": "${ item.foto }", "Color":"${ item.color || item.foto }", "Talla": "${ item.talla }", "precioAplicado": ${ item.price }, "Cantidad": ${ item.amountAd }},`;
    }
    return txtEnd;
  }
  

  handleSelectDepartament(){
    let idDepartamen = this.listCiudades.find( row => row.id === Number( this.form.value.departamento ) );
    //console.log("***681", this.data, this.listCiudades)
    //console.log("****641", idDepartamen, this.form.value)
    if( !idDepartamen ) return this._ToolServices.presentToast("No encontre departamento");
    console.log("****577", idDepartamen)
    this.listCiudadesRSelect =  idDepartamen.listCity;
    this.data.departament = idDepartamen.name;
    this.data.departamentId = idDepartamen.id;
    //console.log("***520", this.data, idDepartamen )
    /*
    this._ventas.getDepartment( "CiudadesTridy/getCity", {  where: { 
      idDept: idDepartamen.id,
      rate_type: "CON RECAUDO"
    } } ).subscribe( (res:any) =>{
      this.listCiudadesRSelect = res.objects.cities || this.listCiudadesRSelect;
    });
    */

  }

  async handleProcesFlete( opt:boolean = true ){
    let filterR = this.listCiudadesRSelect.find( row => row.name == this.form.value.ciudades );
    //console.log("*¨**574", filterR, this.form.value );
    if( filterR ){
      if( opt === true ){
        this.data.ciudad = {
          ciudad_full: filterR.name,
          id_ciudad: filterR.id,
        };
      } 
      let dataF:any = {};
      let index = 0;
      if( this.listDataAggregate.length === 0 ) return true;
      this.btnDisabled = true;
      this.data = { ...this.form.value, ...this.data };
      //console.log("504",this.data)
      let r:any = await this.precioRutulo( dataF, false );
      this.btnDisabled = false;
      if( r === false ) return false;
      this.data.dataTridyCosto = r.intermedia || [];
      this.data.transportadora = r.intermedia.nombre;
      this.data.totalFlete = r.intermedia.precio;
      this.dataEnvioDetails = {
        transportadora: this.data.transportadora
      };
      this._ToolServices.presentToast("Precio del Envio "+ this._ToolServices.monedaChange( 3, 2, ( this.data.totalFlete ) ) + " Transportadora "+  this.data.transportadora );
      this.suma();
    }
  }

  async precioRutulo( ev:any, opt:boolean = true ){
    //console.log("***520", this.data )
    return new Promise( async ( resolve ) =>{
      //console.log("***EVE", ev);
      this.contraentregaAlert = false;
      let data = {
          department: this.data.departament,
          departmentId: this.data.departamentId,
          rate_type: "CON RECAUDO",
          EnvioConCobro: "CON RECAUDO",
          total_order: this.data.priceTotal,
          notes: "Enviar urgente",
          name: "Alberto",
          surname: "",
          dir: "Clle cojamelo",
          country: "COLOMBIA",
          state: this.data.departamento,
          city: this.data.ciudades,
          phone: "121544",
          client_email: "",
          payment_method_id: 1,
          quantity: this.data.sumAmount,
          productsId: "Dispensador De Agua",
      };
      console.log("***647", data)
      this.btnDisabled = true;
      try {
        let res:any = await this.getFlete( data );
        this.data.totalFlete = res.intermedia.precio;
        this.suma();
        resolve( res );
        
      } catch (error) {
        this.contraentregaAlert = true;
        this.data.totalFlete = 0;
        resolve( false );
      }
      this.btnDisabled = false;
    })
  }

  getFlete( data ){
    return new Promise( resolve =>{
      this._ventas.getFlete( data ).subscribe({
        next: (res) => {
          console.log("✅ Respuesta de flete:", res);
          resolve( res );
        },
        error: (err) => {
          console.error("❌ Error en flete:", err);
          resolve( { data:0 } );
          // aquí puedes mostrar un toast o alerta de "Se agotó el tiempo de espera"
        }
      });
    });
  }

cambiarTalla(index: number, nuevaTalla: string) {
  this.listDataAggregate[index].talla = nuevaTalla;
  console.log("✅ Talla cambiada:", this.listDataAggregate[index]);
}

cambiarCantidad(index: number, nuevaCantidad: number) {
  this.listDataAggregate[index].amountAd = nuevaCantidad > 0 ? nuevaCantidad : Number();
  console.log("📦 Cantidad actualizada:", this.listDataAggregate[index]);
  this.suma();
}

eliminarItem(index: number) {
  this.listDataAggregate.splice(index, 1);
  console.log("🗑 Producto eliminado:", this.listDataAggregate);
  this.suma();
}
handleOpenWhatsapp(){
    let mensaje: string = ``;
    mensaje = `https://wa.me/57${ this.tiendaInfo.numeroCelular }?text=${encodeURIComponent(`
      Hola Servicio al cliente, como esta, saludo cordial,
      para mas informacion del producto
      🤝Gracias por su atención y quedo pendiente para recibir por este medio la imagen de la guía de despacho`)}`;
    console.log(mensaje);
    window.open(mensaje);
}


}
