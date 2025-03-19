import { Component, Inject, OnInit } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material';

@Component({
  selector: 'app-form-config-web',
  templateUrl: './form-config-web.component.html',
  styleUrls: ['./form-config-web.component.scss']
})
export class FormConfigWebComponent implements OnInit {
  config = {
    colorFondo: '#ffffff',
    colorTexto: '#000000',
    tipografia: 'Arial',
    colorFondoWeb: "#000000",
    colorTextoWeb: "#000000",
    colorBotonCompra: "#000000",
    colorBotonCarrito: "#000000",
    txtCompra: "CLIC PARA COMPRAR",
    txtComprauna: "COMPRAR DE UNA",
    txtagregarCarrito: "AGREGAR AL CARRITO Y COMPRAR MAS"
  };
  constructor(
    public dialogRef: MatDialogRef<FormConfigWebComponent>,
    @Inject(MAT_DIALOG_DATA) public datas: any,
  ) { }

  ngOnInit(): void {
    this.config = this.datas;
  }

  guardarConfiguracion(){
    this.dialogRef.close( this.config );
  }
  

}
