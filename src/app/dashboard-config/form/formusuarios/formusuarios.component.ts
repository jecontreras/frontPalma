import { Component, OnInit, Inject } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA, MatDialog } from '@angular/material';
import { Store } from '@ngrx/store';
import * as _ from 'lodash';

import { UsuariosService } from 'src/app/servicesComponents/usuarios.service';
import { PerfilService } from 'src/app/servicesComponents/perfil.service';
import { ToolsService } from 'src/app/services/tools.service';
import { STORAGES } from 'src/app/interfaces/sotarage';

@Component({
  selector: 'app-formusuarios',
  templateUrl: './formusuarios.component.html',
  styleUrls: ['./formusuarios.component.scss']
})
export class FormusuariosComponent implements OnInit {

  data: any = {};
  id: string = '';
  titulo: string = 'Crear';

  files: File[] = [];
  listPerfil: any[] = [];
  ShopConfig: any = {};
  dataUser:any = {};

  restaure: { passNew?: string } = {};

  constructor(
    public dialog: MatDialog,
    private usuariosService: UsuariosService,
    private perfilService: PerfilService,
    private tools: ToolsService,
    public dialogRef: MatDialogRef<FormusuariosComponent>,
    @Inject(MAT_DIALOG_DATA) public datas: any,
    private store: Store<STORAGES>,
  ) {
    this.store.subscribe((storeData: any) => {
      const state = storeData.name;
      this.ShopConfig = state.configuracion || {};
      this.dataUser = state.user || {};
    });
  }

  ngOnInit() {
    console.log("***46", this.datas)
    this.data = _.clone(this.datas.datos);
    if (this.datas?.datos.id && Object.keys(this.datas.datos).length > 0) {
      this.id = this.data.id || '';
      this.titulo = 'Actualizar';
      this.data.cat_activo = this.data.cat_activo === 0;
      this.data.usu_perfil = this.data.usu_perfil?.id;
    }else{
      this.data.usu_empresa = this.data.usu_empresa;
      this.data.usu_imagen = "./assets/avatar.png";
      this.data.cabeza = this.dataUser.id;
      this.data.usu_indicativo = "57";
    }

    this.getPerfiles();
  }

  onSelect(event: any) {
    this.files = [event.addedFiles[0]];
  }

  onRemove(event: File) {
    this.files.splice(this.files.indexOf(event), 1);
  }

  getPerfiles() {
    let quers = { where: { est_clave_int:0 } };
    this.perfilService.get( quers).subscribe((res: any) => {
      this.listPerfil = res.data;
      if( this.dataUser.usu_perfil.prf_descripcion !== 'administrador' ) this.listPerfil = this.listPerfil.filter( row => row.prf_descripcion !== 'administrador' );
    });
  }

  submit() {
    this.data.cat_activo = this.data.cat_activo ? 0 : 1;

    this.id ? this.updateUser() : this.createUser();
  }

  private createUser() {
    if( !this.data.usu_empresa ) this.data.usu_empresa = this.ShopConfig.id;

    this.usuariosService.create(this.data).subscribe(
      (res: any) => {
        this.tools.presentToast('Usuario creado exitosamente');
        this.dialogRef.close('creo');
      },
      () => this.tools.presentToast('Error al crear usuario')
    );
  }

  private updateUser() {
    this.data = _.omitBy(this.data, _.isNull);
    this.data = _.omit(this.data, ['cabeza', 'nivel', 'createdAt', 'updatedAt']);

    this.usuariosService.update(this.data).subscribe(
      () => this.tools.presentToast('Usuario actualizado correctamente'),
      (error) => {
        console.error(error);
        this.tools.presentToast('Error al actualizar usuario');
      }
    );
  }

  cambiarPassword() {
    if (!this.restaure.passNew || !this.data.id) return;

    this.usuariosService.cambioPass({ id: this.data.id, password: this.restaure.passNew })
      .subscribe(
        () => {
          this.restaure = {};
          this.tools.presentToast('Contraseña actualizada');
        },
        (error) => {
          console.error(error);
          this.tools.presentToast('Error al actualizar la contraseña');
        }
      );
  }

}
