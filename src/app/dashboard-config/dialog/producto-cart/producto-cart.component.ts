import { Component, OnInit } from '@angular/core';
import { MatDialogRef } from '@angular/material';
import { Store } from '@ngrx/store';
import { STORAGES } from 'src/app/interfaces/sotarage';
import { ToolsService } from 'src/app/services/tools.service';
import { ProductoService } from 'src/app/servicesComponents/producto.service';

@Component({
  selector: 'app-producto-cart',
  templateUrl: './producto-cart.component.html',
  styleUrls: ['./producto-cart.component.scss']
})
export class ProductoCartComponent implements OnInit {

  productos: any[] = [];
  filtro: string = '';
  seleccionados: any[] = [];

  totalCantidad = 0;
  totalValor = 0;
  ShopConfig:any = {};
  formatoMoneda:any = {};
  disableSpinner:boolean = false;

  constructor(
    private _product: ProductoService,
    private _store: Store<STORAGES>,
    private _tools: ToolsService,
    public dialogRef: MatDialogRef<ProductoCartComponent>,
  ) {
    this._store.subscribe((store: any) => {
      store = store.name
      this.ShopConfig = store.configuracion || {};
    });
  }

  ngOnInit(): void {
    this.disableSpinner= true;
    this._product.get( { where: { empresa: this.ShopConfig.id, pro_activo: 0,pro_estado: 0 },page:0, limit: 100000 } ).subscribe((res: any) => {
      res = res.data;
      this.disableSpinner= false;
      this.formatoMoneda = this._tools.currency;
      this.productos = res.map(p => ({
        ...p,
        cantidadSeleccionada: 1,
        talla: p.listTallas[0].tal_descripcion,
        precioAplicado: p.pro_uni_venta,
        listTallas: p.listTallas.filter( row => row.check === true )
      }));
      console.log("****40", this.productos)
    });
  }

  productosFiltrados(): any[] {
    return this.productos.filter(p =>
      p.pro_nombre.toLowerCase().includes(this.filtro.toLowerCase())
    );
  }

  agregarProducto(producto: any): void {
    const cantidad = producto.cantidadSeleccionada || 1;

    // Buscar precio especial si aplica
    let precio = producto.pro_uni_venta;
    if (producto.listPrecios.length && !producto.checkPrice) {
      const especial = producto.listPrecios
        .sort((a, b) => b.cantidad - a.cantidad)
        .find(p => cantidad >= p.cantidad);
      if (especial) {
        precio = especial.precios;
      }
    }

    const subtotal = precio * cantidad;
    if( !producto.tallaSeleccionada ) return this._tools.tooast({ title: "Error no ingreso la talla del producto", icon: "Error"})
    this.seleccionados.push({
      ...producto,
      precioAplicado: precio,
      subtotal,
      Foto: producto.foto,
      Color: producto.colorSeleccionada,
      Talla: producto.tallaSeleccionada,
      ids: this._tools.codigo(),
      Cantidad: cantidad
    });
    this._tools.basic("Articulo agregado");

    this.actualizarTotales();
  }

  handleColor( producto ){
    producto.listTallas = ( producto.listColor.find( row => row.talla === producto.colorSeleccionada ) ).tallaSelect.filter( item => item.check === true );
  }

  handleDropCart( item ){
    this.seleccionados = this.seleccionados.filter( res => res.ids !== item.ids );
    this._tools.tooast({title:"Eliminado exitoso"});
  }

  actualizarTotales(): void {
    this.totalCantidad = this.seleccionados.reduce((sum, p) => sum + p.cantidadSeleccionada, 0);
    this.totalValor = this.seleccionados.reduce((sum, p) => sum + p.subtotal, 0);
  }

  handleContinue(){
    if( this.seleccionados.length === 0 ) return this._tools.basic("Error por favor ingresar Productos para continuar") ;
    this.dialogRef.close( this.seleccionados || [] );
  }
}