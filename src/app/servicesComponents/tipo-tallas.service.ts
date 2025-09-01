import { Injectable } from '@angular/core';
import { ServiciosService } from '../services/servicios.service';

@Injectable({
  providedIn: 'root'
})
export class TipoTallasService {

  constructor(
    private _model: ServiciosService
  ) { }

  get(query:any){
    return this._model.querys('tbltipotalla/querys',query, 'post');
  }

  getTalla(query:any){
    return this._model.querys('tbltallas/querys',query, 'post');
  }

  createTalla(query:any){
    return this._model.querys('tbltallas',query, 'post');
  }

  updateTalla(query:any){
    return this._model.querys('tbltallas/'+query.id, query, 'put');
  }

  deleteTalla(query:any){
    return this._model.querys('tbltallas/'+query.id, query, 'delete');
  }

  create(query:any){
    return this._model.querys('tbltipotalla',query, 'post');
  }
  update(query:any){
    return this._model.querys('tbltipotalla/'+query.id, query, 'put');
  }
  delete(query:any){
    return this._model.querys('tbltipotalla/'+query.id, query, 'delete');
  }
}
