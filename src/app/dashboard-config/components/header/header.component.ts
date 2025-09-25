import { Component, OnDestroy, ChangeDetectorRef, OnInit, VERSION, ViewChild, HostListener } from '@angular/core';
import { MediaMatcher } from '@angular/cdk/layout';
import { Router, ActivatedRoute } from '@angular/router';
import { MatDialog, MatSidenav } from '@angular/material';
import { LoginComponent } from '../../../components/login/login.component';
import { RegistroComponent } from '../../../components/registro/registro.component';
import { ServiciosService } from 'src/app/services/servicios.service';
import { Store } from '@ngrx/store';
import { CART } from 'src/app/interfaces/sotarage';
import { CartAction, ConfiguracionAction, UserAction } from 'src/app/redux/app.actions';
import { UsuariosService } from 'src/app/servicesComponents/usuarios.service';
import * as _ from 'lodash';
import { environment } from 'src/environments/environment';
import { ToolsService } from 'src/app/services/tools.service';
import { VentasService } from 'src/app/servicesComponents/ventas.service';
import { NotificacionesService } from 'src/app/servicesComponents/notificaciones.service';
import { FormventasComponent } from 'src/app/dashboard-config/form/formventas/formventas.component';
import { AlertDialogComponent } from '../alert-dialog/alert-dialog.component';
import { EmpresaService } from 'src/app/servicesComponents/empresa.service';
import { SuscripcionService } from 'src/app/servicesComponents/suscripcion.service';

const URLFRON = environment.urlFront;

@Component({
  selector: 'app-header',
  templateUrl: './header.component.html',
  styleUrls: ['./header.component.scss']
})
export class HeaderComponent implements OnInit {
  showFiller = false;
  public mobileQuery: any;
  breakpoint: number;
  private _mobileQueryListener: () => void;
  menus:any = [];
  menus2:any = [];
  dataUser:any = {};
  rolUser:any = {};
  data:any = {
    total: 0
  };
  listCart: any = [];

  shouldRun = [/(^|\.)plnkr\.co$/, /(^|\.)stackblitz\.io$/].some(h => h.test(window.location.host));
  events: string[] = [];
  urlwhat:string;
  userId:any;
  opened:boolean;
  dataInfo:any = {};
  isHandset$:any;
  urlRegistro:string = `${ URLFRON }/registro/`;
  notificando:number = 0;
  opcionoView:string = 'carro';
  listNotificaciones:any =[];
  tiendaInfo:any = {};
  textColor: string = '#000000'; // Color inicial del texto (negro por defecto)
  @ViewChild('sidenav') sidenav!: MatSidenav;
  isDesktop: boolean = true;

  
  constructor(
    public changeDetectorRef: ChangeDetectorRef,
    public media: MediaMatcher, private router: Router,
    public dialog: MatDialog,
    private _store: Store<CART>,
    private _user: UsuariosService,
    private _tools: ToolsService,
    private _notificaciones: NotificacionesService,
    private _venta: VentasService,
    private tiendaService: EmpresaService,
    private suscripcionService: SuscripcionService

  ) { 
    this._store.subscribe((store: any) => {
      //console.log(store);
      store = store.name;
      if(!store) return false;
      this.listCart = store.cart || [];
      this.userId = store.usercabeza || {};
      this.dataUser = store.user || {};
      this.tiendaInfo = store.configuracion || {};
      this.submitChat();
          // Actualizar el color de fondo y texto cuando cambia
      if (this.dataUser.usu_color) {
        this.tiendaInfo.colorTienda = this.dataUser.usu_color;
        this.updateTextColor(this.dataUser.usu_color);
      }
    });
    //this.getVentas();
    this.mobileQuery = media.matchMedia('(max-width: 290px)');
    this._mobileQueryListener = () => changeDetectorRef.detectChanges();
    this.mobileQuery.addListener(this._mobileQueryListener);
    // tslint:disable-next-line:no-unused-expression
    this.mobileQuery.ds;

  }

  ngOnInit() {
    this.checkScreen();
    this.breakpoint = (window.innerWidth <= 400) ? 1 : 6;
    this.onResize(null);
    if(Object.keys(this.dataUser).length > 0 ) {
      this.rolUser = this.dataUser.usu_perfil.prf_descripcion;
      this.urlRegistro+=this.dataUser.id;
      this.getInfoUser();
    }
    else this.rolUser = 'visitante';
    this.listMenus();
    this.verificarLimites();
    //if(this.rolUser === 'administrador') this.getCarrito();
  }

  verificarLimites() {
     this.suscripcionService.getReporte().subscribe((res: any[]) => {
      const miSuscripcion = res[0]; // 👉 asumiendo que traes solo la suscripción activa de la empresa

      if (miSuscripcion.estado === 'Vencido' || miSuscripcion.estado === 'Por vencer') {
        this.dialog.open(AlertDialogComponent, {
          width: '400px',
          data: miSuscripcion
        });
      }
    });
    /*
     this.suscripcionService.getEstado(this.tiendaInfo.id).subscribe((res: any) => {
      console.log("**114", res )
      if (res.estado === 'vencido' || res.estado === 'sin_suscripcion' || res.diasRestantes <= 5) {
        const dialogRef = this.dialog.open(AlertDialogComponent, {
          width: '400px',
          data: res
        });

        dialogRef.afterClosed().subscribe(result => {
          if (result === 'paquetes') {
            // redirigir al módulo de paquetes
          }
        });
      }
    });*/
    /*
    this.tiendaService.get({ where: { id: this.tiendaInfo.id } }).subscribe(res => {
      res = res.data[0];
      let accion = new ConfiguracionAction( res, 'post');
      this._store.dispatch( accion );
      if (res.superoLimite) {
          this.dialog.open(AlertDialogComponent, {
            width: '400px',
            data: {
              titulo: 'Límite alcanzado 🚨',
              mensaje: 'Has llegado al límite de tu paquete. Actualiza tu plan para continuar.'
            }
          });
        } else {

        }
    });
    */
  }

  // Detecta cambio de tamaño de pantalla
  @HostListener('window:resize')
  checkScreen() {
    this.isDesktop = window.innerWidth > 768;
  }

  toggleSidenav() {
    this.sidenav.toggle();
  }
  
  updateTextColor(color: string) {
    // Convertir HEX a RGB para calcular la luminosidad
    let rgb = this.hexToRgb(color);
    if (!rgb) return;
    
    let brightness = (rgb.r * 299 + rgb.g * 587 + rgb.b * 114) / 1000;
    
    // Si el color es oscuro, el texto será blanco; si es claro, será negro
    this.textColor = brightness < 128 ? '#FFFFFF' : '#000000';
    console.log("**ENTRA", this.textColor, this.tiendaInfo.colorTienda)
  }
  
  // Función para convertir HEX a RGB
  hexToRgb(hex: string): { r: number; g: number; b: number } | null {
    let shorthandRegex = /^#?([a-f\d])([a-f\d])([a-f\d])$/i;
    hex = hex.replace(shorthandRegex, (_, r, g, b) => r + r + g + g + b + b);
  
    let result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
    return result
      ? {
          r: parseInt(result[1], 16),
          g: parseInt(result[2], 16),
          b: parseInt(result[3], 16)
        }
      : null;
  }

  getVentas(){
    //console.log("***")
    let data:any = { where:{ view:0 },limit: 100 }
    //if(this.dataUser.usu_perfil.prf_descripcion != 'administrador') data.where.user=this.dataUser.id,
    this._notificaciones.get( data ).subscribe((res:any)=>{
      //console.log(res);
      if(res.data.length > this.notificando) this.audioNotificando('./assets/sonidos/notificando.mp3');
      this.notificando = res.data.length;
      this.listNotificaciones = res.data;
    },(error)=>this._tools.presentToast("error de servidor"));
  }

  audioNotificando(obj:string){
    let sonido = new Audio();
    sonido.src = './assets/sonidos/notificando.mp3';
    sonido.load();
    sonido.play();
  }

  getCarrito(){
    setInterval(()=>{ 
      this.getVentas();
    }, 5000);
  }

  clickNotificando( obj:any ){
    console.log(obj);
    this.estadoNotificaciones(obj);
    if(obj.venta){
      this._venta.get({ where:{ id: obj.venta } }).subscribe((res:any)=>{
        res = res.data[0];
        if(!res) return this._tools.presentToast("No se encontro la venta!");
        const dialogRef = this.dialog.open(FormventasComponent,{
          data: {datos: res }
        });
        dialogRef.afterClosed().subscribe(result => {
          console.log(`Dialog result: ${result}`);
        });
      });
    }
  }

  estadoNotificaciones(obj:any){
    let data:any ={
      id: obj.id,
      view: 1
    };
    this._notificaciones.update(data).subscribe((res:any)=>{});
  }

  deleteCart(idx:any, item:any){
    this.listCart.splice(idx, 1);
    let accion = new CartAction(item, 'delete');
    this._store.dispatch(accion);
  }

  submitChat(){
    let texto:string;
    this.data.total = 0;
    for(let row of this.listCart){
      texto+= ` productos: ${ row.titulo } codigo: ${ row.codigo } foto: ${ row.foto } cantidad: ${ row.cantidad } color ${ row.color || 'default'}`;
      this.data.total+= row.costoTotal || 0;
    }
    if(this.dataUser.id){
        this.urlwhat = `https://wa.me/${ this.dataUser.usu_indicativo || 57 }${ this.dataUser.usu_telefono || ( this.tiendaInfo.numeroCelular || 3208429429 ) }?text=Hola Servicio al cliente, como esta, saludo cordial, estoy interesad@ en comprar los siguientes ${texto}`
    }else{
      if(this.userId.id) this.urlwhat = `https://wa.me/${ this.userId.usu_indicativo || 57 }${ this.userId.usu_telefono || ( this.tiendaInfo.numeroCelular || 3208429429 ) }?text=Hola Servicio al cliente, como esta, saludo cordial, estoy interesad@ en comprar los siguientes ${texto}`
      else this.urlwhat = `https://wa.me/57${ this.tiendaInfo.numeroCelular }?text=Hola Servicio al cliente, como esta, saludo cordial, estoy interesad@ en comprar los siguientes ${texto}`
    }
  }

  ngOnDestroy(): void {
    this.mobileQuery.removeListener(this._mobileQueryListener);
  }

  getInfoUser(){
    this._user.getInfo({where:{id:this.dataUser.id}}).subscribe((res:any)=>this.dataInfo = res.data);
  }

  onResize(event:any) {
    // console.log("hey", event);
    if (event) {
      this.breakpoint = (event.target.innerWidth <= 700) ? 1 : 6;
    }
    // console.log(this.breakpoint);
    if (this.breakpoint === 1) {
      this.mobileQuery.ds = true;
    } else {
      // console.log(this.mobileQuery);
      this.mobileQuery.ds = false;
    }
  }

  EventMenus(obj:any){
    console.log(obj);
    if(obj.url == 'login()') this.login();
    if(obj.url == 'registrar()') this.registrar();
    if(obj.url == 'salir()') this.salir();
  }

  btnCarrito(){

  }
  
  listMenus(){
    this.menus = [
      {
        icons: 'home',
        nombre: 'Inicio',
        disable: true,
        url: '/estadisticas',
        submenus:[]
      },
      {
        icons: 'storefront',
        nombre: 'Tienda',
        disable: true,
        url: '/tienda/productos/'+this.tiendaInfo.id,
        submenus:[]
      },
      {
         icons: 'settings',
         nombre: 'Paquetes',
         disable: ( this.rolUser == 'administrador' || this.rolUser == 'vendedor' || this.rolUser == 'subAdministrador' ),
         url: '/config/paquetes',
         submenus:[]
       },
      /*{
        icons: 'account_circle',
        nombre: 'Mi Cuenta',
        disable: this.rolUser !== 'visitante',
        url: '/config/perfil',
        submenus:[]
      },*/
      // {
      //   icons: 'menu_book',
      //   nombre: 'Productos',
      //   disable: true,
      //   url: '/config/pedidos',
      //   submenus:[]
      // },

      /*{
        icons: 'shop',
        nombre: 'Mis Bancos',
        url: '/config/bancos',
        submenus:[]
      },*/
      /*{
        icons: 'shop',
        nombre: 'Mis Cobros',
        disable: this.rolUser !== 'visitante',
        url: '/config/cobros',
        submenus:[]
      },*/
      {
        icons: 'local_grocery_store',
        nombre: 'Administracion de Ventas',
        disable: this.rolUser !== 'visitante',
        url: '/config/ventas',
        submenus:[
          {
            icons: 'home',
            nombre: 'Estadisticas',
            disable: true,
            url: '/estadisticas',
            submenus:[]
          },
          {
            icons: 'local_grocery_store',
            nombre: 'Mis Ventas',
            disable: this.rolUser !== 'visitante',
            url: '/config/ventas',
            submenus:[]
          },
        ]
      },
      /*{
        icons: 'people_alt',
        nombre: 'Mis Referidos',
        disable: this.rolUser !== 'visitante',
        url: '/config/referidos',
        submenus:[]
      },*/
      /*{
        icons: 'security',
        nombre: 'Seguridad',
        url: '.',
        submenus:[]
      },*/
      // {
      //   icons: 'settings',
      //   nombre: 'Configuración',
      //   disable: this.rolUser == 'administrador',
      //   url: '.',
      //   submenus:[]
      // },
      {
        icons: 'settings',
        nombre: 'Edicion de Articulos',
        url: '/config/categorias',
        disable: ( this.rolUser == 'administrador' || this.rolUser == 'vendedor' || this.rolUser == 'subAdministrador' ),
        submenus:[
          {
            icons: 'settings',
            nombre: 'Categorias',
            url: '/config/categorias',
            disable: (this.rolUser == 'administrador' || this.rolUser == 'subAdministrador'  ),
            submenus:[]
          },
          {
            icons: 'settings',
            nombre: 'Productos',
            url: '/config/productos',
            disable: (this.rolUser == 'administrador'  || this.rolUser == 'subAdministrador' ),
            submenus:[]
          },
          {
            icons: 'settings',
            nombre: 'Tipo Medidas Tallas',
            url: '/config/tipoMedida',
            disable: (this.rolUser == 'administrador'  || this.rolUser == 'subAdministrador' ),
            submenus:[]
          },
          {
            icons: 'settings',
            nombre: 'Testimonios',
            url: '/config/testimonios',
            disable: ( this.rolUser == 'administrador'  || this.rolUser == 'subAdministrador' ),
            submenus:[]
          }
        ]
      },
      /*{
        icons: 'settings',
        nombre: 'Usuarios',
        url: '/config/usuarios',
        disable: this.rolUser == 'administrador',
        submenus:[]
      },*/
      {
        icons: 'settings',
        nombre: 'Configuraciones',
        url: '/config/configuracion',
        disable: ( this.rolUser == 'administrador'  || this.rolUser == 'subAdministrador' ),
        submenus:[
          {
            icons: 'settings',
            nombre: 'Administrar tienda',
            url: '/config/configuracion',
            disable: ( this.rolUser == 'administrador' || this.rolUser == 'subAdministrador'),
            submenus:[]
          },
          {
            icons: 'settings',
            nombre: 'Administrar Reporte Suscripcion',
            url: '/config/reporteSuscripcion',
            disable: ( this.rolUser == 'administrador' || this.rolUser == 'subAdministrador'),
            submenus:[]
          },
          {
            icons: 'settings',
            nombre: 'Usuarios',
            url: '/config/usuarios',
            disable: ( this.rolUser == 'administrador' || this.rolUser == 'subAdministrador'),
            submenus:[]
          },
          {
            icons: 'settings',
            nombre: 'Roles',
            url: '/config/roles',
            disable: this.rolUser == 'administrador',
            submenus:[]
          },
          {
            icons: 'settings',
            nombre: 'Administrar Paquetes',
            url: '/config/adminpaquete',
            disable: this.rolUser == 'administrador',
            submenus:[]
          },
          {
            icons: 'settings',
            nombre: 'Empresas',
            url: '/config/empresa',
            disable: ( this.rolUser == 'administrador'),
            submenus:[]
          },
          {
            icons: 'settings',
            nombre: 'Configuracion de Formulario de Compra',
            url: '/config/configFormCompra',
            disable: ( this.rolUser == 'administrador'  || this.rolUser == 'subAdministrador' ),
            submenus:[]
          },
        ]
      }
      /*{
        icons: 'assessment',
        nombre: 'Informes',
        url: '.',
        submenus:[]
      },*/
    ];
    
    this.menus = _.filter(this.menus, row=>row.disable);
    
    this.menus2 = [
      /*{
        icons: 'account_circle',
        nombre: 'Iniciar Sección',
        disable: this.rolUser === 'visitante',
        url: 'login()',
        submenus:[]
      },
      {
        icons: 'supervisor_account',
        nombre: 'Vende para nosotros',
        disable: this.rolUser === 'visitante',
        url: 'registrar()',
        submenus:[]
      },
      {
        icons: 'exit_to_app',
        nombre: 'Salir',
        disable: this.dataUser.id,
        url: 'salir()',
        submenus:[]
      },
      */
    ];
    this.menus2 = _.filter(this.menus2, row=>row.disable);
  }

  copiarLinkRegistro(){
    const selBox = document.createElement('textarea');
    selBox.style.position = 'fixed';
    selBox.style.left = '0';
    selBox.style.top = '0';
    selBox.style.opacity = '0';
    selBox.value = this.urlRegistro;
    document.body.appendChild(selBox);
    selBox.focus();
    selBox.select();
    document.execCommand('copy');
    document.body.removeChild(selBox);
    this._tools.openSnack('Copiado:' + ' ' + this.urlRegistro, 'completado', false);
  }

  login(){
    const dialogRef = this.dialog.open(LoginComponent,{
      width: '461px',
      data: { datos: {} }
    });

    dialogRef.afterClosed().subscribe(result => {
      console.log(`Dialog result: ${result}`);
    });
  }

  registrar(){
    const dialogRef = this.dialog.open(RegistroComponent,{
      width: '461px',
      data: { datos: {} }
    });

    dialogRef.afterClosed().subscribe(result => {
      console.log(`Dialog result: ${result}`);
    });
  }

  salir(){
    localStorage.removeItem('user');
    let accion = new UserAction( this.dataUser, 'delete');
    this._store.dispatch(accion);
    location.reload();
  }

}
