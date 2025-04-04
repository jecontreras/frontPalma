import { Component, OnInit } from '@angular/core';
import { ServiciosService } from 'src/app/services/servicios.service';
import { UsuariosService } from 'src/app/servicesComponents/usuarios.service';
import { ToolsService } from 'src/app/services/tools.service';
import * as moment from  'moment';
import * as _ from 'lodash';
import { ArchivosService } from 'src/app/servicesComponents/archivos.service';
import { environment } from 'src/environments/environment';
import { STORAGES } from 'src/app/interfaces/sotarage';
import { Store } from '@ngrx/store';
import { UserAction } from 'src/app/redux/app.actions';
import { departamento } from 'src/app/JSON/departamentos';

const URL = environment.url;
const URLFRON = environment.urlFront;

@Component({
  selector: 'app-perfil',
  templateUrl: './perfil.component.html',
  styleUrls: ['./perfil.component.scss']
})
export class PerfilComponent implements OnInit {

  data:any = {};
  files: File[] = [];
  list_files: any = [];
  urlTienda:string = `${ window.location.origin }/pedidos/`;
  urlRegistro:string = `${ URLFRON }/registro/`;
  restaure:any = {};
  disableRestaure:boolean = false;

  listDepartamento:any = departamento;
  listCiudad:any = [];

  constructor(
    private _model: ServiciosService,
    private _user: UsuariosService,
    private _tools: ToolsService,
    private _archivos: ArchivosService,
    private _store: Store<STORAGES>,
  ) { 
    this._store.subscribe((store: any) => {
      console.log(store);
      store = store.name;
      this.data = store.user;
    });
  }

  ngOnInit() {
    //this.data = this._model.dataUser || {};
    if(this.data.usu_fec_nacimiento) this.data.usu_fec_nacimiento = moment(this.data.usu_fec_nacimiento).format('DD/MM/YYYY');
    this.urlTienda+=this.data.id;
    this.urlRegistro+=this.data.id;
    this.selectDepartamento();
  }

  onSelect(event:any) {
    //console.log(event, this.files);
    this.files=[event.addedFiles[0]]
  }
  
  onRemove(event) {
    //console.log(event);
    this.files.splice(this.files.indexOf(event), 1);
  }

  subirFile(opt:string){
    let form:any = new FormData();
    form.append('file', this.files[0]);
    this._tools.ProcessTime({});
    this._archivos.create(form).subscribe((res:any)=>{
      console.log(res);
      this.data[opt] = res.files; //URL+`/${res}`;
      this._tools.presentToast("Exitoso");
      this.files = [];
      this.Actualizar();
    },(error)=>{console.error(error); this._tools.presentToast("Error de servidor")});

  }
  
  selectDepartamento( ){
    console.log("hola", this.data.usu_pais);
    let filtro:any = this.listDepartamento.find((row:any)=> row.departamento == this.data.usu_pais );
    if( !filtro ) return false;
    this.listCiudad = filtro.ciudades;
  }

  CambiarPassword(){
    this._user.cambioPass({ id: this.data.id, password: this.restaure.passNew })
    .subscribe( (res:any)=>{ this.disableRestaure = false; this.restaure = {}; this._tools.presentToast("Actualizado Password"); },
    (error)=> { console.error(error); this._tools.presentToast("Error Servidor"); } );
  }

  Actualizar(){
    this.data = _.omit(this.data, ['usu_perfil', 'cabeza', 'nivel']);
    this.data = _.omitBy( this.data, _.isNull);
    this._user.update(this.data).subscribe((res:any)=>{
      //console.log(res);
      this._tools.presentToast("Actualizado");
      let accion = new UserAction(res, 'put');
      this._store.dispatch(accion);
    },(error)=>{console.error(error); this._tools.presentToast("Error de Servidor")})
  }
  
  abrrirTienda(){
    window.open(this.urlTienda);
  }

  copiarLink(){
    const selBox = document.createElement('textarea');
    selBox.style.position = 'fixed';
    selBox.style.left = '0';
    selBox.style.top = '0';
    selBox.style.opacity = '0';
    selBox.value = this.urlTienda;
    document.body.appendChild(selBox);
    selBox.focus();
    selBox.select();
    document.execCommand('copy');
    document.body.removeChild(selBox);
    this._tools.openSnack('Copiado:' + ' ' + this.urlTienda, 'completado', false);
  }

  copiarLinkRegistro(){
    const selBox = document.createElement('textarea');
    selBox.style.position = 'fixed';
    selBox.style.left = '0';
    selBox.style.top = '0';
    selBox.style.opacity = '0';
    selBox.value = this.urlRegistro;
    document.body.appendChild(selBox);
    selBox.focus();
    selBox.select();
    document.execCommand('copy');
    document.body.removeChild(selBox);
    this._tools.openSnack('Copiado:' + ' ' + this.urlRegistro, 'completado', false);
  }

}
