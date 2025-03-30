import { Component, Inject, OnInit } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material';
import { ArchivosService } from 'src/app/servicesComponents/archivos.service';

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
    txtagregarCarrito: "AGREGAR AL CARRITO Y COMPRAR MAS",
    txtbanner: "Envío Gratis - Pagos Contra Entrega",
    listComent: [
      {
        titulo: "",
        descripcion: "",
        foto: ""
      }
    ]
  };
  listaItems: any[] = [];

  constructor(
    public dialogRef: MatDialogRef<FormConfigWebComponent>,
    @Inject(MAT_DIALOG_DATA) public datas: any,
    private _archivos: ArchivosService
  ) { }

  ngOnInit(): void {
    this.listaItems = this.datas.listComent || [];
    this.config = this.datas;
  }

  guardarConfiguracion(){
    this.config.listComent = this.listaItems;
    this.dialogRef.close( this.config );
  }

    // 📌 Agregar nuevo ítem a la lista
    agregarItem() {
      this.listaItems.push({ titulo: "", descripcion: "", foto: "" });
    }
  
    // 📌 Eliminar ítem de la lista
    eliminarItem(index: number) {
      this.listaItems.splice(index, 1);
    }
  
    // 📌 Subir Imagen (usando tu lógica)
    async subirImagen(event: any, index: number) {
      const file = event.target.files[0];
      if (file) {
        let urlFoto = await this.handleFile( file );
        const reader = new FileReader();
        reader.onload = () => {
          this.listaItems[index].foto = urlFoto;
        };
        reader.readAsDataURL(file);
      }
    }

    handleFile( row ){
      return new Promise( resolve =>{
        let form: any = new FormData();
        form.append('file', row);
        this._archivos.create(form).subscribe(async (res: any) => {
          console.log("***75", res )
          resolve( res.files );
        });
      });
    }
  

}
