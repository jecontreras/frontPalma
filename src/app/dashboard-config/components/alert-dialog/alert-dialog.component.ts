import { Component, Inject, OnInit } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material';
import { Router } from '@angular/router';

@Component({
  selector: 'app-alert-dialog',
  templateUrl: './alert-dialog.component.html',
  styleUrls: ['./alert-dialog.component.scss']
})
export class AlertDialogComponent implements OnInit {
  ds:any = {};
 constructor(
    public dialogRef: MatDialogRef<AlertDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: AlertDialogComponent,
     private router: Router
  ) { }

  ngOnInit(){
    console.log("**17", this.data)
    this.ds = this.data || {};

  }

  cerrar(): void {
    this.dialogRef.close();
  }

  irAUpgrade(): void {
    this.router.navigate(['/admin/paquetes']); // 👉 ruta donde tienes el PaquetesComponent
    this.dialogRef.close('upgrade');
  }
}