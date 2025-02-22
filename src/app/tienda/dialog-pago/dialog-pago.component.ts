import { Component, Inject, OnInit } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material';
import { Store } from '@ngrx/store';
import { STORAGES } from 'src/app/interfaces/sotarage';
import { ToolsService } from 'src/app/services/tools.service';

@Component({
  selector: 'app-dialog-pago',
  templateUrl: './dialog-pago.component.html',
  styleUrls: ['./dialog-pago.component.scss']
})
export class DialogPagoComponent implements OnInit {
  precioR:number = 0;
  precioA:number = 0;
  metodoSeleccionado: string | null = 'casa';
  ShopConfig:any = {};

  constructor(
    public dialogRef: MatDialogRef<DialogPagoComponent>,
    @Inject(MAT_DIALOG_DATA) public data: any,
    public _tools: ToolsService,
    private _store: Store<STORAGES>,
  ) {

    this._store.subscribe((store: any) => {
      store = store.name;
      if( !store ) return false;
      this.ShopConfig = store.configuracion || {};
    });

  }

  
  
  ngOnInit(): void {
    this.precioR = ( this.data.prt - 20000 ) || 0;
    this.precioA = this.data.prt;
  }
  
 seleccionarPago(tipoPago: string) {
    this.metodoSeleccionado = tipoPago;
    setTimeout(()=> this.confirmarPago(), 2000 );
  }

  confirmarPago() {
    this.dialogRef.close(this.metodoSeleccionado);
  }

}
