import { Component, OnInit } from '@angular/core';
import { environment } from 'src/environments/environment';
import { ToolsService } from 'src/app/services/tools.service';
import { ArchivosService } from 'src/app/servicesComponents/archivos.service';
import { STORAGES } from 'src/app/interfaces/sotarage';
import { Store } from '@ngrx/store';
import { ConfiguracionAction } from 'src/app/redux/app.actions';
import * as _ from 'lodash';
import { ConfiguracionService } from 'src/app/servicesComponents/configuracion.service';
import { MatDialog } from '@angular/material';
import { FormConfigWebComponent } from '../../form/form-config-web/form-config-web.component';
import { FormBuilder, FormGroup } from '@angular/forms';
import { ChatService } from 'src/app/servicesComponents/chat.service';

const URLFRON = environment.urlFront;

@Component({
  selector: 'app-config',
  templateUrl: './config.component.html',
  styleUrls: ['./config.component.scss']
})
export class ConfigComponent implements OnInit {

  data:any = {};
  files: File[] = [];
  list_files: any = [];
  disableRestaure:boolean = false;
  plantillas = [
    {
      id: 'plantilla1',
      nombre: 'Minimalista',
      imagen: 'https://cdn.shopify.com/s/files/1/0840/8370/3830/files/1608218265-8.png',
      descripcion: 'Diseño limpio con enfoque en los productos.'
    }
  ];
  config:any = {
    colorFondo: '#ffffff',
    colorTexto: '#000000',
    tipografia: 'Arial',
    colorFondoWeb: "#000000",
    colorTextoWeb: "#000000",
    colorBotonCompra: "#000000",
    colorBotonCarrito: "#000000",
    txtCompra: "CLIC PARA COMPRAR",
    txtComprauna: "COMPRAR DE UNA",
    txtagregarCarrito: "AGREGAR AL CARRITO Y COMPRAR MAS",
    listComent: [],
    where: {}
  };
  configForm!: FormGroup;
  qrCodeDownloadLink = '';
  flagWhatsapp = false;

  constructor(
    private _tools: ToolsService,
    private _archivos: ArchivosService,
    private _store: Store<STORAGES>,
    public dialog: MatDialog,
    private _configuracion: ConfiguracionService,
    private fb: FormBuilder,
    private chatService: ChatService
  ) { 

    this._store.subscribe((store: any) => {
      console.log(store);
      store = store.name;
      this.data = store.configuracion || {};
      this.config = this.data.configuracion;
    });
    let time = 0;
    this.validateStatuswhatsapp();
    setInterval(async ()=>{
      if( time === 25 ) await this.validateStatuswhatsapp();    
      time++;
    }, 8000 );
  }

  validateStatuswhatsapp(){
    return new Promise( async ( resolve ) =>{
        this.chatService.validarBootActivoEmit();
        this.chatService.validarBootActivoOn().subscribe(data => {
          console.log("**102", data);
          this.flagWhatsapp = data;
          if( data === true ) this.qrCodeDownloadLink = "";
          resolve( this.flagWhatsapp );
        });
      })
  }

  ngOnInit(): void {
    // Crear el formulario reactivo
    this.configForm = this.fb.group({
      urlSocket: [''],
      urlBackend: [''],
      urlBackendFile: [''],
      userDropi: [''],
      claveDropi: [''],
      rolDropi: [''],
      txtCompra: [''],
      urlBackendSocial: ['']
    });
    this.configForm.patchValue(this.data);
    this.chatService.initBootWhatsappOn().subscribe( data =>{
      console.log("**87", data)
      this.qrCodeDownloadLink = data;
    });
    // Obtener QR y estado de WhatsApp
    this.chatService.qrWhatsapp().subscribe(data => {
      this.qrCodeDownloadLink = data;
    });

    this.chatService.statusWhatsapp().subscribe(data => {
      if ( "Tienda-"+this.data.id === data.company.id ) {
        this.flagWhatsapp = data.status;
      }
    });
  }

  onSelect(event:any, opt) {
    //console.log(event, this.files);
    if(!opt) this.files = [event.addedFiles[0]]
    else this.files = event.addedFiles;
  }
  
  onRemove(event) {
    //console.log(event);
    this.files.splice(this.files.indexOf(event), 1);
  }

  async subirFile(opt:string){

    for(let row of this.files){
      return new Promise( resolve =>{
        let form:any = new FormData();
        form.append('file', row);
        this._tools.ProcessTime({});
        this._archivos.create(form).subscribe((res:any)=>{
          console.log(res);
          if( opt == 'foto1' || opt == 'foto2') { if(!this.data[opt]) this.data[opt] = []; this.data[opt].push( { foto: res.files }); }
          else this.data[opt] = res.files; //URL+`/${res}`;
          this._tools.presentToast("Exitoso");
          resolve( true );
        },(error)=>{console.error(error); this._tools.presentToast("Error de servidor"); resolve( false); });
      });
    }
    this.files = [];

  }

  handleCacheStorage( res ){
    let accion = new ConfiguracionAction(res, 'put');
    this._store.dispatch(accion);
  }

  handleSubmit(): void {
    if (this.configForm.valid) {
      this.data = { ...this.data, ...this.configForm.value };

      this.Actualizar();

      // Cerrar el diálogo y recargar la página después de actualizar
      setTimeout(() => location.reload(), 2000);
    }
  }

  Actualizar(){
    this.data = _.omit(this.data, ['createdAt', 'updatedAt', 'paquete']);
    this.data = _.omitBy( this.data, _.isNull);
    if( !this.data.textTransfer ) this.data.textTransfer = " ";
    this._configuracion.update(this.data).subscribe((res:any)=>{
      console.log(res);
      this._tools.presentToast("Actualizado");
      this.handleCacheStorage( res );
      
    },(error)=>{console.error(error); this._tools.presentToast("Error de Servidor")})
  }

  // Método para guardar la plantilla seleccionada en la base de datos
  guardarPlantilla() {
    let data = this.data;
    data.plantilla = this.data.plantilla;
    this._configuracion.update( data ).subscribe((res:any)=>{
      this._tools.presentToast('Plantilla guardada con éxito.');
      this.handleCacheStorage( res );
    });
  }

  // Método para abrir el diálogo de configuración
abrirConfiguracion() {
  console.log("**131", this.config)
  const dialogRef = this.dialog.open(FormConfigWebComponent, {
    width: '100%',
    maxWidth: '100%',
    data: this.config
  });

  dialogRef.afterClosed().subscribe(result => {
    if (result) {
      this.config = result;
      this.data.configuracion = this.config;
      console.log("**135", result)
      this.guardarConfiguracion();
    }
  });
}

// Método para guardar configuración en la base de datos
guardarConfiguracion() {
  let data = this.data;
  //data.configuracion = this.config;
  console.log("***189", data)
  this._configuracion.update( data ).subscribe((res:any)=>{
    this._tools.presentToast('Configuración guardada con éxito.');
    this.handleCacheStorage( res );
  });
}

reiniciarBot() {
    this._configuracion.botReiniciar( this.data.urlSocket + '/api/reiniciar-bot', {
      tiendaId: `Tienda-${this.config.id}`
    }).subscribe({
      next: (res: any) => {
        this._tools.basic('✅ Bot reiniciado correctamente');
      },
      error: err => {
        console.error('❌ Error reiniciando bot', err);
        this._tools.basic('❌ No se pudo reiniciar el bot');
      }
    });
  }


}
