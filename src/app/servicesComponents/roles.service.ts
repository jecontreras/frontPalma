import { Injectable } from '@angular/core';
import { ServiciosService } from '../services/servicios.service';

@Injectable({
  providedIn: 'root'
})
export class RolesService {

  constructor(
    private _model: ServiciosService
  ) { }

  get(query:any){
    return this._model.querys('tblperfil/querys',query, 'post');
  }
  getProduct(query:any){
    return this._model.querys('tblperfil/querysProduct',query, 'post');
  }
  create(query:any){
    return this._model.querys('tblperfil',query, 'post');
  }
  update(query:any){
    return this._model.querys('tblperfil/'+query.id, query, 'put');
  }
  delete(query:any){
    return this._model.querys('tblperfil/'+query.id, query, 'delete');
  }
}
