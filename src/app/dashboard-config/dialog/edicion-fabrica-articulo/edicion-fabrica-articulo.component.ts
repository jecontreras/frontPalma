import { Component, Inject, OnInit } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material';
import { ToolsService } from 'src/app/services/tools.service';
import { ArchivosService } from 'src/app/servicesComponents/archivos.service';

@Component({
  selector: 'app-edicion-fabrica-articulo',
  templateUrl: './edicion-fabrica-articulo.component.html',
  styleUrls: ['./edicion-fabrica-articulo.component.scss']
})
export class EdicionFabricaArticuloComponent implements OnInit {

 imagenes: any[] = this.data.imagenes || [];
  combos: any[] = this.data.combos || [];
  faqs: any[] = this.data.faqs || [];
  localStats: any[] = [];
  pagaEnvio:string = "cliente";
  saving = false;

  constructor(
    private dialogRef: MatDialogRef<EdicionFabricaArticuloComponent>,
    @Inject(MAT_DIALOG_DATA) public data: any,
    private _archivos: ArchivosService,
    private _tools: ToolsService
  ) {
    this.imagenes = this.data.imagenes || [];
    this.combos = this.data.combos || [];
    this.faqs = this.data.faqs || [];
    this.localStats = this.data.localStats || [];
    this.pagaEnvio = this.data.pagaEnvio;
  }

  ngOnInit(): void {
  }

// 📷 Subir imágenes
subirImagen(event: any): void {
  const file = event.target.files[0];
  if (!file) return;

  // Máximo 3 imágenes
  if (this.imagenes.length >= 3) {
    this._tools.presentToast("Solo puedes subir un máximo de 3 imágenes");
    return;
  }

  // Previsualización inmediata
  const reader = new FileReader();
  reader.onload = (e: any) => {
    const preview = e.target.result;
    this.imagenes.push({url: preview});
  };
  reader.readAsDataURL(file);

  // Preparar formData para enviar al backend
  const formData = new FormData();
  formData.append('file', file);

  // Subida al servidor
  this._archivos.create(formData).subscribe({
    next: (res: any) => {
      const url = res.files; // Aquí llega la URL real del servidor
      // Reemplazar la preview por la URL real
      this.imagenes[this.imagenes.length - 1].url = url;

      this._tools.presentToast("Imagen subida con éxito ✅");
      console.log("📷 Imagen subida:", url);
    },
    error: (err) => {
      console.error("❌ Error al subir imagen:", err);
      this._tools.presentToast("Error de servidor al subir imagen");
      // Quitar la preview fallida
      this.imagenes.pop();
    }
  });
}


  eliminarImagen(index: number) {
    this.imagenes.splice(index, 1);
  }

  // 🎯 Combos
  agregarCombo() {
    this.combos.push({ tipo: '', rango: '', precios: 0, subtext: '', cantidad: 0 });
  }

  eliminarCombo(index: number) {
    this.combos.splice(index, 1);
  }

  // ❓ FAQs
  agregarFaq() {
    this.faqs.push({ pregunta: '', respuesta: '' });
  }

  eliminarFaq(index: number) {
    this.faqs.splice(index, 1);
  }

   add() {
    this.localStats.push({ valor: 0, texto: 'Nuevo', bg: '#ffffff' });
  }

  remove(i: number) {
    this.localStats.splice(i, 1);
  }

  cancel() {
    this.dialogRef.close();
  }

  // ✅ Guardar / Cancelar
  onSave() {
    this.dialogRef.close({
      imagenes: this.imagenes,
      combos: this.combos,
      stats: this.localStats,
      faqs: this.faqs,
      pagaEnvio: this.pagaEnvio
    });
  }

  onCancel() {
    this.dialogRef.close();
  }
  

}
