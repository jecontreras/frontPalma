import { Component, OnInit } from '@angular/core';
import { FormBuilder, Validators } from '@angular/forms';
import { MatSnackBar } from '@angular/material';
import { ActivatedRoute, Router } from '@angular/router';
import { AuthService } from 'src/app/services/auth.service';

@Component({
  selector: 'app-recuperar-clave',
  templateUrl: './recuperar-clave.component.html',
  styleUrls: ['./recuperar-clave.component.scss']
})
export class RecuperarClaveComponent implements OnInit {

  token: string = '';

  form = this.fb.group({
    clave: ['', [Validators.required, Validators.minLength(6)]],
    confirmar: ['', [Validators.required]]
  });

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private fb: FormBuilder,
    private auth: AuthService,
    private snack: MatSnackBar
  ) {}

  ngOnInit() {
    this.token = this.route.snapshot.paramMap.get('token') || '';
  }

  cambiarClave() {
    if (this.form.value.clave !== this.form.value.confirmar) {
      this.snack.open('Las contraseñas no coinciden', 'Cerrar', { duration: 3000 });
      return;
    }

    this.auth.cambiarClave({
      token: this.token,
      nuevaClave: this.form.value.clave
    }).subscribe({
      next: () => {
        this.snack.open('Clave cambiada con éxito', 'Cerrar', { duration: 3000 });
        this.router.navigate(['/login']);
      },
      error: () => {
        this.snack.open('Token inválido o expirado', 'Cerrar', { duration: 3000 });
      }
    });
  }
}