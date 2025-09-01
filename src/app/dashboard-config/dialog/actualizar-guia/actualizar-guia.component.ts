import { Component, Inject, OnInit } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialog, MatDialogRef } from '@angular/material/dialog';
import { HttpClient } from '@angular/common/http';
import { ArchivosService } from 'src/app/servicesComponents/archivos.service';
import { VentasService } from 'src/app/servicesComponents/ventas.service';
import { ToolsService } from 'src/app/services/tools.service';
import { STORAGES } from 'src/app/interfaces/sotarage';
import { Store } from '@ngrx/store';

@Component({
  selector: 'app-actualizar-guia',
  templateUrl: './actualizar-guia.component.html',
  styleUrls: ['./actualizar-guia.component.scss']
})
export class ActualizarGuiaComponent implements OnInit {

  formatoMoneda:any = {};
  filtro:string;
  ngOnInit() {

  }
  archivos: { [idVenta: number]: File } = {};
  ShopConfig:any = {};

  constructor(
    @Inject(MAT_DIALOG_DATA) public ventas: any[],
    private _archivos: ArchivosService,
    private ventasService: VentasService,
    private _tools: ToolsService,
    public dialog: MatDialog,
    public dialogRef: MatDialogRef<ActualizarGuiaComponent>,
    private _store: Store<STORAGES>,
  ) {
    this._store.subscribe((store: any) => {
      store = store.name;
      this.ShopConfig = store.configuracion || {};
    });
    this.formatoMoneda = this._tools.currency;
  }

  seleccionarArchivo(event: any, ventaId: number): void {
    this.archivos[ventaId] = event.target.files[0];
  }

  async guardarGuia(venta: any, index: number): Promise<void> {
    if (!venta.numeroGuia || !venta.transportadora || !venta.precioFlete || !this.archivos[venta.id]) {
      alert('Todos los campos son obligatorios');
      return;
    }

    const form = new FormData();
    form.append('file', this.archivos[venta.id]);

    this._archivos.createPdf(form).subscribe(async (res: any) => {
      const urlArchivo = res.location || res.files; // ajusta según tu respuesta
      venta.ven_estado = 3;
      let dsUpdate ={
        id: venta.id,
        ven_imagen_guia: urlArchivo,
        ven_numero_guia: venta.numeroGuia,
        transport: venta.transportadora,
        stateGuide: 'DESPACHADO',
        ven_estado: 3,
        printInt: 1,
        priceFlete: venta.precioFlete
      };
      venta = {...venta, ...dsUpdate };
      await this.handleUpdateR( dsUpdate );
      this.handleEnviarGuiaWhatsapp( dsUpdate );
      this._tools.basic("Guía actualizada correctamente");
    }, err => {
      console.error(err);
      alert('Error al subir el archivo');
    });
  }
  
  handleEnviarGuiaWhatsapp(cliente){
    this.ventasService.enviarGuiaWhatsapp({
      "tiendaId": "Tienda-"+this.ShopConfig.id,
      "numeroCliente": cliente.ven_telefono_cliente,
      "url": cliente.ven_imagen_guia,
      "nombreArchivo": "Tu numero de guia "+cliente.ven_numero_guia,
      "tipo": "pdf",
      "mensaje": this.ShopConfig.txtEnvioGuia || "Tu Pedido fue despachado este es tu numero de guia# "+ cliente.ven_numero_guia
    }).subscribe( async(res) =>{
      console.log("**73", res );
      await this.handleUpdateR( { id:cliente.id, guideEnviado: 1 } );
    });
  }

  async handleUpdateR( obj ){
    return new Promise( resolve =>{
      this.ventasService.update( obj ).subscribe((res:any)=>{
        resolve( res );
      }, ()=> resolve( false ) );
    })
  }

  closeDialog(){
    this.dialogRef.close( this.ventas );
  }
}