import { Injectable } from '@angular/core';
import { ServiciosService } from '../services/servicios.service';

@Injectable({
  providedIn: 'root'
})
export class PaqueteService {


  constructor(
    private _model: ServiciosService
  ) { }

  get(query:any){
    return this._model.querys('Tblpaquetes/querys',query, 'post');
  }
  create(query:any){
    return this._model.querys('Tblpaquetes',query, 'post');
  }
  update(query:any){
    return this._model.querys('Tblpaquetes/'+query.id, query, 'put');
  }
  delete(query:any){
    return this._model.querys('Tblpaquetes/'+query.id, query, 'delete');
  }
}
