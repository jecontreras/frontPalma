import { Component, OnInit } from '@angular/core';
import { MatSnackBar } from '@angular/material';
import { Store } from '@ngrx/store';
import { CART } from 'src/app/interfaces/sotarage';
import { EmpresaService } from 'src/app/servicesComponents/empresa.service';
import { PaqueteService } from 'src/app/servicesComponents/paquete.service';
declare var ePayco: any;
@Component({
  selector: 'app-paquetes',
  templateUrl: './paquetes.component.html',
  styleUrls: ['./paquetes.component.scss']
})
export class PaquetesComponent implements OnInit {

  paquetes: any[] = [];
  miTienda: any = null;
  loading = false;
  dataUser:any = {};
  tiendaInfo:any = {};
  handler: any;

  constructor(
    private tiendaService: EmpresaService,
    private snack: MatSnackBar,
    private _store: Store<CART>,
    private _paquete: PaqueteService
  ) {
    this._store.subscribe((store: any) => {
      //console.log(store);
      store = store.name;
      if(!store) return false;
      this.dataUser = store.user || {};
      this.tiendaInfo = store.configuracion || {};
    });
    this.handler = ePayco.checkout.configure({
      key: '90506d3b72d22b822f53b54dcf22dc3a',
      test: true  // cambiar a false en producción
    });
  }

  ngOnInit(): void {
    this.getMiTienda();
    this.getPaquetes();
  }

  /** Traer mi tienda actual */
  getMiTienda() {
    this.tiendaService.get({ 
      where: { id: this.tiendaInfo.id }
    }).subscribe((res: any) => {
      if (res && res.data) {
        this.miTienda = res.data[0]; // suponiendo que siempre trae 1
      }
    });
  }

  /** Traer todos los paquetes */
  getPaquetes() {
    this._paquete.get({})
      .subscribe((res: any) => {
        this.paquetes = res.data || res;
      });
  }

  /** Cambiar paquete de la tienda */
  asignarPaquete(paquete: any) {
    if (!this.tiendaInfo) return;
    this.loading = true;
    const payload = {
      id: this.tiendaInfo.id,
      paquete_id: paquete.id
    };

    this.tiendaService.update(payload).subscribe({
      next: () => {
        this.snack.open(
          `Paquete "${paquete.nombre}" asignado correctamente`,
          'OK',
          { duration: 3000, panelClass: ['snack-success'] }
        );
        this.loading = false;
        window.location.reload(); // 🔄 recargar la página para aplicar cambios
      },
      error: () => {
        this.snack.open('Error al asignar el paquete', 'Cerrar', { duration: 3000 });
        this.loading = false;
      }
    });
  }
    pagarPaquete(paquete: any) {
     const data = {
      name: `Paquete ${paquete.nombre}`,
      description: paquete.descripcion,
      invoice: `PKG-${paquete.id}-${Date.now()}`,
      currency: "cop",
      amount: paquete.precio,
      country: "co",
      lang: "es",
      external: "false",
      response: `${window.location.origin}/response`,
      confirmation: `http://tu-dominio.com/confirmation`, // 👈 apunta a tu backend sails
      // Datos extra que recibiremos en PaymentController
      extra1: paquete.id,
      extra2: this.miTienda?.id
    };
    this.handler.open(data);
  }
}