import { Injectable } from '@angular/core';
import { ServiciosService } from '../services/servicios.service';

@Injectable({
  providedIn: 'root'
})
export class ProductoService {

  constructor(
    private _model: ServiciosService
  ) { }

  getSimply(query:any){
    return this._model.querys('tblproductos/getSimply',query, 'post');
  }

  get(query:any){
    return this._model.querys('tblproductos/querys',query, 'post');
  }

  getStore(query:any){
    return this._model.querys('tblproductos/filtroStore',query, 'post');
  }
  
  create(query:any){
    return this._model.querys('tblproductos',query, 'post');
  }
  update(query:any){
    return this._model.querys('tblproductos/'+query.id, query, 'put');
  }

  updateVideoToken(query:any){ console.log("prod.serv updateVideoToken")
    return this._model.querys('tblproductos/'+query.id, query, 'delete');
  }
  delete(query:any){
    return this._model.querys('tblproductos/'+query.id, query, 'delete');
  }
  createTestimonio(query:any){
    return this._model.querys('tbltestimonio',query, 'post');
  }
  createPrice( query:any ){
    return this._model.querys('priceArticle',query, 'post');
  }
  getPrice( query:any ){
    return this._model.querys('priceArticle/querys',query, 'post');
  }
  getPriceArticle( query:any ){
    return this._model.querys('priceArticle/querysProducts',query, 'post');
  }
  updatePriceArticle( query:any ){
    return this._model.querys('priceArticle/'+query.id,query, 'put');
  }
  createPriceArticleFull( query:any ){
    return this._model.querys('priceArticle/createTotalProduct',query, 'post');
  }
}
