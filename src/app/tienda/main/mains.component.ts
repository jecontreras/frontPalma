import { Component, OnInit } from '@angular/core';
import { Store } from '@ngrx/store';
import { CART } from 'src/app/interfaces/sotarage';

@Component({
  selector: 'app-mains',
  templateUrl: './mains.component.html',
  styleUrls: ['./mains.component.scss']
})
export class MainsComponent implements OnInit {
  data:any = {};
  id:string;
  urlwhat:string;

  constructor(
    private _store: Store<CART>,
  ) {
    this._store.subscribe((store: any) => {
      store = store.name;
      if(!store) return false;
      if( store.usercabeza ) this.data = store.configuracion || {}
    });

  }

  ngOnInit() {
    this.urlwhat = `https://api.whatsapp.com/send?phone=57${ this.data.numeroCelular }&amp;text=Hola%2C%20estoy%20interesado%20en%20los%20tenis%20NIKE%2C%20gracias...`
  }
}
