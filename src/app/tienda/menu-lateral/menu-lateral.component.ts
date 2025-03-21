import { Component, OnInit, ViewChild } from '@angular/core';
import { STORAGES } from 'src/app/interfaces/sotarage';
import { Store } from '@ngrx/store';

@Component({
  selector: 'app-menu-lateral',
  templateUrl: './menu-lateral.component.html',
  styleUrls: ['./menu-lateral.component.scss']
})
export class MenuLateralComponent implements OnInit {
  public estado = true;
  userId:any = {};
  dataUser:any = {};
  urlFacebook:string;
  urlInstagram:string;
  urlYoutube:string;
  urlWhatsapp: string;
  whatsappContact;

  constructor(
    private _store: Store<STORAGES>,
  ) {
    this._store.subscribe((store: any) => {
      store = store.name;
      if(!store) return false;
      this.userId = store.usercabeza || {};
      this.dataUser = store.user || {};
      try {
        this.whatsappContact = store.configuracion.numeroCelular;
      } catch (error) {
        
      }
      this.rellenoRedes();
    });

  }

  ngOnInit() {
    // setInterval(()=> {
      let color:string = ( this.dataUser.usu_color || "#02a0e3" );

      if( this.userId.id ) color = this.userId.usu_color || "#02a0e3";
      try {
        /*this.color1.nativeElement.style.backgroundColor = color
        this.color2.nativeElement.style.backgroundColor = color
        this.color3.nativeElement.style.backgroundColor = color*/
        //this.color4.nativeElement.style.backgroundColor = color
      } catch (error) {

      }
    // }, 100 )
  }
  rellenoRedes(){
    this.urlWhatsapp = `https://api.whatsapp.com/send?phone=57${this.whatsappContact}&text=${encodeURIComponent(
      `¡Hola, servicio al cliente! 😊  
    
    Espero que estén teniendo un excelente día.  
    Estoy interesado en este producto y me gustaría recibir más información:  
    
    🔗 ${window.location.href}  
    
    ¡Muchas gracias por su atención! Espero su respuesta. 🙌`
    )}`;
  }

}
