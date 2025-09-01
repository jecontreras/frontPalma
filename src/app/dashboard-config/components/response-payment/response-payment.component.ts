import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';

@Component({
  selector: 'app-response-payment',
  templateUrl: './response-payment.component.html',
  styleUrls: ['./response-payment.component.scss']
})
export class ResponsePaymentComponent implements OnInit {

  estado: string | null = null;
  referencia: string | null = null;
  mensaje: string = '';

  constructor(private route: ActivatedRoute) {}

  ngOnInit(): void {
    // ePayco devuelve parámetros en la URL (GET)
    this.route.queryParamMap.subscribe(params => {
      this.estado = params.get('x_response');
      this.referencia = params.get('x_id_invoice');

      if (this.estado === 'Aceptada') {
        this.mensaje = '✅ ¡Tu pago fue aprobado! Gracias por tu compra.';
      } else if (this.estado === 'Rechazada') {
        this.mensaje = '❌ Tu pago fue rechazado. Intenta nuevamente.';
      } else {
        this.mensaje = '⚠️ El pago está pendiente de confirmación.';
      }
    });
  }
}