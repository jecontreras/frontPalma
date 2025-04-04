import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { TiendaRoutingModule } from './tienda.routing';
import { TiendaComponent } from './tienda/tienda.component';
import { ProductosComponent } from './productos/productos.component';
import { FooterComponent } from './footer/footer.component';
import { MainsComponent } from './main/mains.component';
import { MenuComponent } from './menu/menu.component';
import { InfiniteScrollModule } from 'ngx-infinite-scroll';
import { NgxSpinnerModule } from 'ngx-spinner';
import { InfoProductoComponent } from './info-producto/info-producto.component';
import { MyOwnCustomMaterialModule } from '../app.material.module';
import { FormsModule } from '@angular/forms';
import { ProductosViewComponent } from './producto-view/producto-view.component';
import { NgxImageZoomModule } from 'ngx-image-zoom';
import { ContactoComponent } from './contacto/contacto.component';
import { NgImageSliderModule } from 'ng-image-slider';
import { ChecktComponent } from './checkt/checkt.component';
import { CarritoComponent } from './carrito/carrito.component';
import { CompletarComponent } from './completar/completar.component';
import { ChecktDialogComponent } from './checkt-dialog/checkt-dialog.component';
import { DetallePedidoComponent } from './detalle-pedido/detalle-pedido.component';
import { CatalogoComponent } from './catalogo/catalogo.component';
import { AlertBannerComponent } from './alert-banner/alert-banner.component';
import { SwiperModule } from 'swiper/angular';
import { SliderComponent } from './slider/slider.component';
import { MenuLateralComponent } from './menu-lateral/menu-lateral.component';
import { ProductosTComponent } from './productos-t/productos-t.component';
import { ProductoView2Component } from './producto-view2/producto-view2.component';
import { LightboxModule } from 'ngx-lightbox';
import { DialogPagoComponent } from './dialog-pago/dialog-pago.component';

@NgModule({
  entryComponents: [ InfoProductoComponent,ChecktDialogComponent, DialogPagoComponent ],
  declarations: [MainsComponent, TiendaComponent, ProductosComponent, FooterComponent, MenuComponent, InfoProductoComponent, ProductosViewComponent, ContactoComponent, ChecktComponent, CarritoComponent, CompletarComponent, ChecktDialogComponent, DetallePedidoComponent, CatalogoComponent, AlertBannerComponent, SliderComponent, MenuLateralComponent, ProductosTComponent, ProductoView2Component, DialogPagoComponent ],
  imports: [
    TiendaRoutingModule,
    CommonModule,
    InfiniteScrollModule,
    NgxSpinnerModule,
    MyOwnCustomMaterialModule,
    FormsModule,
    NgxImageZoomModule,
    NgImageSliderModule,
    SwiperModule,
    LightboxModule
  ],
  exports: [ InfoProductoComponent, SliderComponent ]
})
export class TiendaModule { }
