import { Component, OnInit, Inject } from '@angular/core';
import { MatDialog, MatDialogRef, MAT_DIALOG_DATA } from '@angular/material';
import { ToolsService } from 'src/app/services/tools.service';
import * as _ from 'lodash';
import { ArchivosService } from 'src/app/servicesComponents/archivos.service';
import { environment } from 'src/environments/environment';
import { RolesService } from 'src/app/servicesComponents/roles.service';

const URL = environment.url;

@Component({
  selector: 'app-formroles',
  templateUrl: './formroles.component.html',
  styleUrls: ['./formroles.component.scss']
})
export class FormrolesComponent implements OnInit {

  files: File[] = [];
    list_files: any = [];
    data:any = {};
    listCategorias:any = [];
    id:any;
    titulo:string = "Crear";
  
    constructor(
      public dialog: MatDialog,
      private _roles: RolesService,
      private _tools: ToolsService,
      public dialogRef: MatDialogRef<FormrolesComponent>,
      @Inject(MAT_DIALOG_DATA) public datas: any,
      private _archivos: ArchivosService
    ) { }
  
    ngOnInit() {
      if(Object.keys(this.datas.datos).length > 0) {
        this.data = _.clone(this.datas.datos);
        this.id = this.data.id;
        this.titulo = "Actualizar";
      }else{this.id = ""}
    }
  
    onSelect(event:any) {
      //console.log(event, this.files);
      this.files=[event.addedFiles[0]]
    }
  
    onRemove(event) {
      //console.log(event);
      this.files.splice(this.files.indexOf(event), 1);
    }
  
    subirFile(){
      let form:any = new FormData();
      form.append('file', this.files[0]);
      this._tools.ProcessTime({});
      this._archivos.create(form).subscribe((res:any)=>{
        //console.log(res);
        this.data.cat_imagen = res.files;//URL+`/${res}`;
        this._tools.presentToast("Exitoso");
        if(this.id)this.submit();
      },(error)=>{console.error(error); this._tools.presentToast("Error de servidor")});
  
    }
  
    submit(){
      console.log(this.data)
      // if(this.data.cat_activo) this.data.cat_activo = 0;
      // else this.data.cat_activo = 1;
      if(this.id) {
        this.updates();
      }
      else { this.guardar(); }
    }
  
    guardar(){
      this.data = {
        ...this.data,
        prf_usu_actualiz: "",
        est_clave_int: 0,
        prf_fec_actualiz: ""
      }
      this._roles.create(this.data).subscribe((res:any)=>{
        //console.log(res);
        this._tools.presentToast("Exitoso");
      }, (error)=>this._tools.presentToast("Error"));
      this.dialog.closeAll();
    }
  
    updates(){
      this.data = _.omit(this.data, [ 'cat_usu_actualiz' ])
      this.data = _.omitBy(this.data, _.isNull);
      this._roles.update(this.data).subscribe((res:any)=>{
        this._tools.presentToast("Actualizado");
      },(error)=>{console.error(error); this._tools.presentToast("Error de servidor")});
    }
  
  }
  