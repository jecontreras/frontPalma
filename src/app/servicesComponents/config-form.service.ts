import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { ServiciosService } from '../services/servicios.service';

/**
 * Modelo de cada campo del formulario dinámico
 */
export interface CampoForm {
  id?: number;
  tiendaId: number;
  campo: string;
  label: string;
  placeholder?: string;
  mensajeError?: string;
  tipo?: string;       // text, number, select, checkbox
  requerido?: boolean;
  orden?: number;
  icon?: string;
}

/**
 * Modelo del botón del formulario dinámico
 */
export interface BotonForm {
  id?: number;
  tiendaId: number;
  texto: string;
  color: string;
  descuento_activo?: boolean;
  descuento_porcentaje?: number;
}

/**
 * Respuesta del backend para GET /api/formulario/:tiendaId
 */
export interface FormularioConfig {
  campos: CampoForm[];
  boton: BotonForm;
}

@Injectable({
  providedIn: 'root'
})
export class FormularioConfigService {

  constructor(private _model: ServiciosService) {}

  /**
   * Obtener configuración del formulario de una tienda
   */
  getConfig(tiendaId: any): Observable<FormularioConfig> {
    return this._model.querys('tblconfigform/getConfig', tiendaId, 'post');
  }

  /**
   * Inicializar formulario con valores por defecto
   */
  initDefaults(tiendaId: any): Observable<any> {
    return this._model.querys('tblconfigform/initDefaults', tiendaId, 'post');
  }

  /**
   * Actualizar un campo del formulario
   */
  updateCampo(campo: CampoForm): Observable<CampoForm> {
    return this._model.querys('tblconfigform/'+campo.id, campo, 'put');
  }

  /**
   * Actualizar el botón del formulario
   */
  updateBoton(boton: BotonForm): Observable<BotonForm> {
    return this._model.querys('Tblformulariobotones/'+boton.id, boton, 'put');
  }
}
