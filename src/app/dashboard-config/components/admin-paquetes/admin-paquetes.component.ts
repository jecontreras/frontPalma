import { Component, OnInit } from '@angular/core';
import { MatDialog, MatSnackBar } from '@angular/material';
import { PaqueteService } from 'src/app/servicesComponents/paquete.service';
import { FormAdminPaquetesComponent } from '../../form/form-admin-paquetes/form-admin-paquetes.component';

@Component({
  selector: 'app-admin-paquetes',
  templateUrl: './admin-paquetes.component.html',
  styleUrls: ['./admin-paquetes.component.scss']
})
export class AdminPaquetesComponent implements OnInit {
 paquetes: any[] = [];
  loading = false;

  constructor(
    private paqueteService: PaqueteService,
    private dialog: MatDialog,
    private snack: MatSnackBar
  ) {}

  ngOnInit() {
    this.cargarPaquetes();
  }

  cargarPaquetes() {
    this.loading = true;
    this.paqueteService.get({ where: { }, limit: 1000 } ).subscribe({
      next: (res:any) => {
        this.paquetes = res.data;
        this.loading = false;
      },
      error: () => {
        this.loading = false;
        this.snack.open('Error al cargar paquetes', 'Cerrar', { duration: 3000 });
      }
    });
  }

  abrirDialogo(paquete: any = null) {
    const dialogRef = this.dialog.open(FormAdminPaquetesComponent, {
      width: '500px',
      data: paquete ? { ...paquete } : {}
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        this.cargarPaquetes();
      }
    });
  }

  eliminar(paquete: any) {
    if (confirm(`¿Seguro que deseas eliminar el paquete "${paquete.titulo}"?`)) {
      this.paqueteService.delete(paquete).subscribe(() => {
        this.snack.open('Paquete eliminado', 'Cerrar', { duration: 3000 });
        this.cargarPaquetes();
      });
    }
  }

  editar( paquete:any ){
    this.abrirDialogo( paquete );
  }
}