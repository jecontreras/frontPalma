import { Injectable } from '@angular/core';
import { ServiciosService } from '../services/servicios.service';

@Injectable({
  providedIn: 'root'
})
export class EstadoDespachoService {

  constructor(
    private _model: ServiciosService
  ) { }

  get(query:any){
    return this._model.querys('estadoDespacho/listar',query, 'post');
  }
  create(query:any){
    return this._model.querys('estadoDespacho/createEstado',query, 'post');
  }
}