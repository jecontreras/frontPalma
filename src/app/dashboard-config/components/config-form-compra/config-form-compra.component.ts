import { Component, OnInit } from '@angular/core';

import { MatSnackBar } from '@angular/material/snack-bar';
import { Store } from '@ngrx/store';
import { CART } from 'src/app/interfaces/sotarage';
import { CampoForm, FormularioConfig, FormularioConfigService } from 'src/app/servicesComponents/config-form.service';

@Component({
  selector: 'app-config-form-compra',
  templateUrl: './config-form-compra.component.html',
  styleUrls: ['./config-form-compra.component.scss']
})
export class ConfigFormCompraComponent implements OnInit {

  tiendaId = 1; // 👈 más adelante lo recibes dinámicamente
  config: FormularioConfig = { campos: [], boton: { tiendaId: 1, texto: '', color: '',
    descuento_activo: false,
    descuento_porcentaje: 0 
   }};
  loading = false;
  tiendaInfo:any = {};

  constructor(
    private formularioService: FormularioConfigService,
    private snack: MatSnackBar,
    private _store: Store<CART>,
  ) {
    this._store.subscribe((store: any) => {
      store = store.name;
      if(!store) return false;
      this.tiendaInfo = store.configuracion || {};
      this.tiendaId = this.tiendaInfo.id;
    });
  }

  ngOnInit() {
    this.config.boton.tiendaId = this.tiendaId;
    this.loadConfig();
  }

  /**
   * Cargar configuración desde backend
   */
  loadConfig() {
    this.loading = true;
    this.formularioService.getConfig({ tiendaId: this.tiendaInfo.id }).subscribe(res => {
      this.config = res;
      this.loading = false;
    });
  }

  /**
   * Guardar cambios de un campo
   */
  saveCampo(campo: CampoForm) {
    this.formularioService.updateCampo(campo).subscribe(() => {
      this.snack.open('Campo actualizado', 'Cerrar', { duration: 2000 });
    });
  }

  /**
   * Guardar cambios del botón
   */
  saveBoton() {
    this.formularioService.updateBoton(this.config.boton).subscribe(() => {
      this.snack.open('Botón actualizado', 'Cerrar', { duration: 2000 });
    });
  }

  /**
   * Restaurar valores por defecto
   */
  resetDefaults() {
    this.formularioService.initDefaults( { tiendaId: this.tiendaId } ).subscribe(() => {
      this.snack.open('Formulario restaurado a valores por defecto', 'Cerrar', { duration: 2000 });
      this.loadConfig();
    });
  }

}