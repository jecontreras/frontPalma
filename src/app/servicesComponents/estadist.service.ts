import { Injectable } from '@angular/core';
import { ServiciosService } from '../services/servicios.service';

@Injectable({
  providedIn: 'root'
})
export class EstadistService {
  constructor(
    private _model: ServiciosService
  ) { }

  get(query:any){
    return this._model.querys('tblestadisticas/querys',query, 'post');
  }
  getProduct(query:any){
    return this._model.querys('tblestadisticas/obtenerEstadisticas',query, 'post');
  }
  create(query:any){
    return this._model.querys('tblestadisticas/registrarVisita',query, 'post');
  }
  update(query:any){
    return this._model.querys('tblestadisticas/'+query.id, query, 'put');
  }
  delete(query:any){
    return this._model.querys('tblestadisticas/'+query.id, query, 'delete');
  }
}