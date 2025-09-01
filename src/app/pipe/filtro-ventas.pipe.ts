import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'filtroVentas'
})
export class FiltroVentasPipe implements PipeTransform {
  transform(ventas: any[], filtro: string): any[] {
    if (!ventas || !filtro) return ventas;

    const texto = filtro.toLowerCase();
    return ventas.filter(v =>
      (v.ven_nombre_cliente || '').toLowerCase().includes(texto) ||
      (v.ven_telefono_cliente || '').toLowerCase().includes(texto) ||
      (v.id + '').includes(texto)
    );
  }
}
