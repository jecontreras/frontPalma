import { Injectable } from '@angular/core';
import { ServiciosService } from '../services/servicios.service';

@Injectable({
  providedIn: 'root'
})
export class SuscripcionService {

  constructor(
    private _model: ServiciosService
  ) { }

  get(query:any){
    return this._model.querys('tblsuscripciones/querys',query, 'post');
  }
  create(query:any){
    return this._model.querys('tblsuscripciones',query, 'post');
  }
  bloquearVencidas(query:any){
    return this._model.querys('tblsuscripciones/bloquear-vencidas', query, 'post');
  }
  renovar(query:any){
    return this._model.querys('tblsuscripciones/renovar', query, 'post');
  }
  reporte(empresaId:number){
    return this._model.querys(`tblsuscripciones/reporte?empresa_id=${empresaId}`, {}, 'get');
  }
  getEstado(empresa_id: number) {
    return this._model.querys('Tblsuscripciones/getEstado', { empresa_id }, 'post');
  }
  getReporte(estado?: string) {
    return this._model.querys('Tblsuscripciones/report', { estado }, 'post');
  }

}
