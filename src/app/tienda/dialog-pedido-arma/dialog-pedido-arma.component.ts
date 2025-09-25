import { Component, Inject, OnInit } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ToolsService } from 'src/app/services/tools.service';

@Component({
  selector: 'app-dialog-pedido-arma',
  templateUrl: './dialog-pedido-arma.component.html',
  styleUrls: ['./dialog-pedido-arma.component.scss']
})
export class DialogPedidoArmaComponent implements OnInit {
  form: FormGroup;

  selectedFoto: string | null = null;
  selectedTalla: string | null = null;

  constructor(
    public dialogRef: MatDialogRef<DialogPedidoArmaComponent>,
    @Inject(MAT_DIALOG_DATA) public datas: any,
    private fb: FormBuilder,
    private _tools: ToolsService
  ) {
    this.form = this.fb.group({
      cantidad: [null, [Validators.required, Validators.min(1)]]
    });
  }

  ngOnInit(): void {
    console.log("*** datos recibidos", this.datas);

    // Selección por defecto de color
    if (this.datas.row.galeriaList?.length > 0) {
      this.selectedFoto = this.datas.row.galeriaList[0].foto;
    }

    // Talla única
    if (this.datas.pro_sw_tallas === 5) {
      this.selectedTalla = 'Única';
    }
  }

  selectColor(galeria: any) {
    this.selectedFoto = galeria.foto;
  }

  handleSelectT(talla: any) {
    this.selectedTalla = talla.tal_descripcion;
  }

  isFormValid(): boolean {
    const cantidadValida = this.form.valid;
    const tallaValida = this.datas.pro_sw_tallas === 5 || this.selectedTalla !== null;
    const colorValido = this.selectedFoto !== null;
    return cantidadValida && tallaValida && colorValido;
  }

  finalizando() {
    const result = {
      talla: this.selectedTalla,
      cantidad: this.form.value.cantidad,
      foto: this.selectedFoto
    };

    this.dialogRef.close(result);
  }
}
