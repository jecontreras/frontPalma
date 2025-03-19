import { Component, OnInit } from '@angular/core';
import { Store } from '@ngrx/store';
import { CART } from 'src/app/interfaces/sotarage';

@Component({
  selector: 'app-terminos',
  templateUrl: './terminos.component.html',
  styleUrls: ['./terminos.component.scss']
})
export class TerminosComponent implements OnInit {
  
  dataConfig:any = {};

  constructor(
    private _store: Store<CART>,
  ) { 
    this._store.subscribe((store: any) => {
      //console.log(store);
      store = store.name;
      if(!store) return false;
      this.dataConfig = store.configuracion || {};
    });
  }

  ngOnInit(): void {
  }

}
