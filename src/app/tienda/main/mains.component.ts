import { Component, OnInit, ViewChild } from '@angular/core';
import { Store } from '@ngrx/store';
import { CART } from 'src/app/interfaces/sotarage';
import { CartAction, ConfiguracionAction } from 'src/app/redux/app.actions';
import { ConfiguracionService } from 'src/app/servicesComponents/configuracion.service';
import {MatSidenav} from '@angular/material/sidenav';
import { FormatosService } from 'src/app/services/formatos.service';
import { DialogPagoComponent } from '../dialog-pago/dialog-pago.component';
import { MatDialog } from '@angular/material';
import { ChecktDialogComponent } from '../checkt-dialog/checkt-dialog.component';

@Component({
  selector: 'app-mains',
  templateUrl: './mains.component.html',
  styleUrls: ['./mains.component.scss']
})
export class MainsComponent implements OnInit {
  data:any = {};
  id:string;
  urlwhat:string;
  empresa:any = {};
  dominio:string;
  @ViewChild('sidenav') sidenav!: MatSidenav; // Conectar el sidenav
  carrito: any[] = [];
  totalPares: number = 0;
  totalPagar: number = 0;


  constructor(
    private _store: Store<CART>,
    private _config: ConfiguracionService,
    public _formato: FormatosService,
    public dialog: MatDialog
  ) {
    this._store.subscribe((store: any) => {
      store = store.name;
      if(!store) return false;
      if( store.usercabeza ) this.data = store.configuracion || {}
      this.carrito = store.cart || [];
      this.handleEvent();
      this.calcularTotales();
    });
    this.dominio = window.location.host;
    console.log("******HOST", this.dominio)
    if( this.dominio === 'localhost:4300' ) this.dominio = "dilishoponline.com";
    this.getEmpresa();
  }

  ngOnInit() {
    this.urlwhat = `https://api.whatsapp.com/send?phone=57${ this.data.numeroCelular }&amp;text=Hola%2C%20estoy%20interesado%20en%20los%20tenis%20NIKE%2C%20gracias...`
  }

  handleEvent(){
    // Activar animación splash
    const cartButton = document.querySelector('.cart-button');
    if (cartButton) {
      cartButton.classList.add('splash-effect');
      setTimeout(() => {
        cartButton.classList.remove('splash-effect');
      }, 400);
    }
  }

  getEmpresa(){
    this._config.get({ where: { dominio: this.dominio }, limit: 1 }).subscribe(( res:any )=>{
      //console.log(res);
      res = res.data[0];
      if( !res ) return false;
      if( res.id != this.empresa.id){
        let accion = new ConfiguracionAction( res, 'post');
        this._store.dispatch( accion );
      }
    },( error:any )=> console.error( error ));
  }

  abrirCarrito() {
    console.log("**57 open")
    this.sidenav.open(); // Abre el sidenav
  }

  cerrarCarrito() {
    this.sidenav.close(); // Cierra el sidenav
  }

  // Calcular total de pares y total a pagar
  calcularTotales() {
    this.totalPares = this.carrito.reduce((total, item) => total + item.cantidad, 0);
    this.totalPagar = this.carrito.reduce((total, item) => total + item.costoTotal, 0);
  }

  eliminarDelCarrito(id: string) {
    this.carrito = this.carrito.filter(item => item.id !== id);
    this.calcularTotales();
    let accion = new CartAction({ id }, 'delete');
    this._store.dispatch(accion);
    //this._tools.presentToast("Producto eliminado 🗑️");
  }
  
  irAFormulario() {
    const dialogRef = this.dialog.open(ChecktDialogComponent, {
      maxWidth: '100%',
      data: { datos: { view: "carrito" } }
    });
  
    dialogRef.afterClosed().subscribe(result => {
      console.log(`Dialog result: ${result}`);
    });
  }

}
