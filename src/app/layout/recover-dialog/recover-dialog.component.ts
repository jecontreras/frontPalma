import { Component, OnInit } from '@angular/core';
import { MatDialogRef, MatSnackBar } from '@angular/material';
import { AuthService } from 'src/app/services/auth.service';

@Component({
  selector: 'app-recover-dialog',
  templateUrl: './recover-dialog.component.html',
  styleUrls: ['./recover-dialog.component.scss']
})
export class RecoverDialogComponent implements OnInit {

 usuario: string = '';
  loading = false;

  constructor(
    private dialogRef: MatDialogRef<RecoverDialogComponent>,
    private auth: AuthService,
    private snack: MatSnackBar
  ) {}

  recuperar() {
    if (!this.usuario) {
      this.snack.open('Ingrese un correo o número de celular', 'Cerrar', { duration: 3000 });
      return;
    }

    this.loading = true;
    this.auth.recoverPassword({ usuario: this.usuario }).subscribe({
      next: () => {
        this.loading = false;
        this.snack.open('Se envió un mensaje a tu WhatsApp con la clave temporal', 'Cerrar', { duration: 4000 });
        this.dialogRef.close();
      },
      error: () => {
        this.loading = false;
        this.snack.open('No se encontró un usuario con esos datos', 'Cerrar', { duration: 4000 });
      }
    });
  }

  ngOnInit(): void {
  }

}
