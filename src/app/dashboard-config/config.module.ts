import { NgModule } from '@angular/core';
import { MainsComponent } from './main.component';
import { MainConfigRoutingModule } from './main-routing.module';
import { HttpClientModule } from '@angular/common/http';
import { RouterModule, Routes } from '@angular/router';
import { ReactiveFormsModule,  FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { CategoriasComponent } from './components/categorias/categorias.component';
import { ProductosComponent } from './components/productos/productos.component';
import { FormcategoriasComponent } from './form/formcategorias/formcategorias.component';
import { MyOwnCustomMaterialModule } from '../app.material.module';
import { NgxDropzoneModule } from 'ngx-dropzone';
import { ProvedoresComponent } from './components/provedores/provedores.component';
import { FormprovedoresComponent } from './form/formprovedores/formprovedores.component';
import { FormproductosComponent } from './form/formproductos/formproductos.component';
import { UsuariosComponent } from './components/usuarios/usuarios.component';
import { FormusuariosComponent } from './form/formusuarios/formusuarios.component';
import { VentasComponent } from './components/ventas/ventas.component';
import { FormventasComponent } from './form/formventas/formventas.component';
import { BancosComponent } from './components/bancos/bancos.component';
import { CobrosComponent } from './components/cobros/cobros.component';
import { PerfilComponent } from './components/perfil/perfil.component';
import { FormbancosComponent } from './form/formbancos/formbancos.component';
import { FormcobrosComponent } from './form/formcobros/formcobros.component';

import { InfiniteScrollModule } from 'ngx-infinite-scroll';
import { NgxSpinnerModule } from "ngx-spinner";
import { ReferidosComponent } from './components/referidos/referidos.component';
import { FormpuntosComponent } from './form/formpuntos/formpuntos.component';

//settings
import { AngularEditorModule } from '@kolkov/angular-editor';
import { PedidosComponent } from './components/pedidos/pedidos.component';
import { ViewProductosComponent } from './form/view-productos/view-productos.component';
import { MenuLateralComponent } from './components/menu-lateral/menu-lateral.component';
import { NgxImageZoomModule } from 'ngx-image-zoom';
import { NgImageSliderModule } from 'ng-image-slider';
import { HeaderComponent } from './components/header/header.component';
import { ConfigComponent } from './components/config/config.component';
import { NgxCurrencyModule } from 'ngx-currency';
import { ImageCropperModule } from 'ngx-image-cropper';
import { TestimonioComponent } from './components/testimonio/testimonio.component';
import { FormTestimonioComponent } from './form/form-testimonio/form-testimonio.component';
import { FormConfigWebComponent } from './form/form-config-web/form-config-web.component';
import { RolesComponent } from './components/roles/roles.component';
import { FormrolesComponent } from './form/formroles/formroles.component';
import { EstadisticasComponent } from './components/estadisticas/estadisticas.component';
import { ChartsModule } from 'ng2-charts';
import { ActualizarGuiaComponent } from './dialog/actualizar-guia/actualizar-guia.component';
import { FiltroVentasPipe } from '../pipe/filtro-ventas.pipe';
import { ProductoCartComponent } from './dialog/producto-cart/producto-cart.component';
import { SafeUrlPipe } from '../pipe/safe-url.pipe';
import { EmpresaComponent } from './components/empresa/empresa.component';
import { FormEmpresaComponent } from './form/form-empresa/form-empresa.component';
import { TallajeComponent } from './components/tallaje/tallaje.component';
import { FormTipoMedidaComponent } from './form/form-tipo-medida/form-tipo-medida.component';
import { ConfigFormCompraComponent } from './components/config-form-compra/config-form-compra.component';
import { AlertDialogComponent } from './components/alert-dialog/alert-dialog.component';
import { PaquetesComponent } from './components/paquetes/paquetes.component';
import { ResponsePaymentComponent } from './components/response-payment/response-payment.component';
import { AdminPaquetesComponent } from './components/admin-paquetes/admin-paquetes.component';
import { FormAdminPaquetesComponent } from './form/form-admin-paquetes/form-admin-paquetes.component';
import { ReporteSuscripcionesComponent } from './components/reporte-suscripciones/reporte-suscripciones.component';
import { EdicionFabricaArticuloComponent } from './dialog/edicion-fabrica-articulo/edicion-fabrica-articulo.component';

@NgModule({
  entryComponents: [
    FormcategoriasComponent,
    FormprovedoresComponent,
    FormproductosComponent,
    FormusuariosComponent,
    FormventasComponent,
    FormcobrosComponent,
    FormpuntosComponent,
    ViewProductosComponent,
    FormTestimonioComponent,
    ProductoCartComponent,
    FormEmpresaComponent,
    FormTipoMedidaComponent,
    FormAdminPaquetesComponent,
    EdicionFabricaArticuloComponent
  ],
  declarations: [
    MainsComponent,
    CategoriasComponent,
    ProductosComponent,
    FormcategoriasComponent,
    ProvedoresComponent,
    FormprovedoresComponent,
    FormproductosComponent,
    UsuariosComponent,
    FormusuariosComponent,
    VentasComponent,
    FormventasComponent,
    BancosComponent,
    CobrosComponent,
    PerfilComponent,
    FormbancosComponent,
    FormcobrosComponent,
    ReferidosComponent,
    FormpuntosComponent,
    PedidosComponent,
    ViewProductosComponent,
    HeaderComponent,
    ConfigComponent,
    TestimonioComponent,
    FormTestimonioComponent,
    FormConfigWebComponent,
    RolesComponent,
    FormrolesComponent,
    EstadisticasComponent,
    ActualizarGuiaComponent,
    FiltroVentasPipe,
    ProductoCartComponent,
    SafeUrlPipe,
    EmpresaComponent,
    FormEmpresaComponent,
    TallajeComponent,
    FormTipoMedidaComponent,
    ConfigFormCompraComponent,
    AlertDialogComponent,
    PaquetesComponent,
    ResponsePaymentComponent,
    AdminPaquetesComponent,
    FormAdminPaquetesComponent,
    ReporteSuscripcionesComponent,
    EdicionFabricaArticuloComponent
  ],
  imports: [
    CommonModule,
    HttpClientModule,
    RouterModule,
    ReactiveFormsModule,
    MainConfigRoutingModule,
    MyOwnCustomMaterialModule,
    InfiniteScrollModule,
    NgxSpinnerModule,
    FormsModule,
    NgxDropzoneModule,
    AngularEditorModule,
    NgxImageZoomModule,
    NgImageSliderModule,
    NgxCurrencyModule,
    ImageCropperModule,
    ChartsModule,
  ],
  exports: [
    FormcategoriasComponent,
    FormprovedoresComponent,
    FormproductosComponent,
    FormusuariosComponent,
    FormventasComponent,
    FormcobrosComponent,
    ViewProductosComponent
  ],
  providers: [
  ],
  bootstrap: [MainsComponent]
})
export class ConfigModule { }
