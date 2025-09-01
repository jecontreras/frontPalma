import { Component, OnInit, ViewChild } from '@angular/core';
import { MatPaginator, MatTableDataSource, MatSort } from '@angular/material';
import { Store } from '@ngrx/store';
import { ChartOptions } from 'chart.js';
import { STORAGES } from 'src/app/interfaces/sotarage';
import { EstadistService } from 'src/app/servicesComponents/estadist.service';

@Component({
  selector: 'app-estadisticas',
  templateUrl: './estadisticas.component.html',
  styleUrls: ['./estadisticas.component.scss']
})
export class EstadisticasComponent implements OnInit {
  fechaInicio: Date | null = null;
  fechaFin: Date | null = null;

  kpiList: any[] = [];

  // Productos chart (bar)
  prodChartLabels: string[] = [];
  prodChartData: any[] = [{ data: [], label: 'Cantidad' }];
  barOptions: ChartOptions = { responsive: true };

  // Estados pie
  estadoPieLabels: string[] = [];
  estadoPieData: number[] = [];
  pieOptions: ChartOptions = { responsive: true };

  // Transportadoras
  transChartLabels: string[] = [];
  transChartData: any[] = [{ data: [], label: 'Ventas' }];

  // Tabla
  displayedColumns: string[] = ['id', 'fecha', 'cliente', 'telefono', 'estado', 'transport', 'total'];
  dataSource = new MatTableDataSource<any>([]);
  totalRecords = 0;
  @ViewChild(MatPaginator) paginator: MatPaginator;
  @ViewChild(MatSort) sort: MatSort;

  // config / user
  ShopConfig: any = {};
  estadisticas: any = {};
  dataUser:any = {};

  constructor(
    private _estadisticas: EstadistService,
    private _store: Store<STORAGES>,
  ) {
    this._store.subscribe((store: any) => {
      store = store.name;
      this.dataUser = store.user || {};
      this.ShopConfig = store.configuracion || {};
    });
  }

  ngOnInit() {
    // If you have ShopConfig from store, set here
    // this.ShopConfig = ...

    // Load initial (today)
    const hoy = new Date();
    this.fechaInicio = new Date(hoy.getFullYear(), hoy.getMonth(), 1); // inicio mes
    this.fechaFin = hoy;
    this.filtrar();
  }

  // map estado code to label
  mapEstado(code: number) {
    const map = {
      0: 'Pendiente',
      1: 'Venta exitosa',
      2: 'Rechazada',
      3: 'Despachado',
      5: 'Imprimida',
      6: 'Devolución'
    };
    return map[code] || String(code);
  }

  // Convert Date to YYYY-MM-DD
  formatDate(d: Date) {
    if (!d) return null;
    const y = d.getFullYear();
    const m = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    return `${y}-${m}-${day}`;
  }
  getEstadisticas() {
    return new Promise( resolve=>{
      const query: any = {
        empresa: this.ShopConfig.id
      };
  
      query.fechaInicio = this.formatDate(this.fechaInicio);
      query.fechaFin = this.formatDate(this.fechaFin);
  
      this._estadisticas.getEstadisticas(query).subscribe(res => {
        this.estadisticas = res;
        resolve( this.estadisticas );
      },()=>resolve([]) );
    })
  }

  async filtrar() {
    const empresaId = this.ShopConfig.id || null;
    const fi = this.formatDate(this.fechaInicio);
    const ff = this.formatDate(this.fechaFin);

    let res = await this.getEstadisticas();
     if (!res) return;

      const payload:any = res;
      console.log("**113", payload)
      // KPIs
      this.kpiList = [
        { titulo: 'Total Ventas', valor: payload.meta.totalVentas, color: '#2196f3' },
        { titulo: 'Ingresos (COP)', valor: (payload.meta.ingresos || 0).toLocaleString('es-CO', { style: 'currency', currency: 'COP' }), color: '#4caf50' },
        { titulo: 'Ventas Pendientes', valor: payload.porEstado[0] || 0, color: '#ff9800' },
        { titulo: 'Ventas Devueltas', valor: payload.porEstado[6] || 0, color: '#f44336' }
      ];

      // Productos mas vendidos
      this.prodChartLabels = payload.productosMasVendidos.map(p => p.producto);
      this.prodChartData = [{ data: payload.productosMasVendidos.map(p => p.cantidad), label: 'Cantidad' }];

      // Estados pie
      this.estadoPieLabels = Object.keys(payload.porEstado).map(k => this.mapEstado(Number(k)));
      this.estadoPieData = Object.keys(payload.porEstado).map(k => payload.porEstado[k]);

      // Transportadoras
      const transKeys = Object.keys(payload.porTransportadora);
      this.transChartLabels = transKeys;
      this.transChartData = [{ data: transKeys.map(k => payload.porTransportadora[k]), label: 'Ventas' }];

      // Tabla
      const ventas = payload.ventas || [];
      this.dataSource = new MatTableDataSource<any>(ventas);
      this.dataSource.paginator = this.paginator;
      this.dataSource.sort = this.sort;
      this.totalRecords = ventas.length;
  }

  resetFiltro() {
    this.fechaInicio = null;
    this.fechaFin = null;
    this.filtrar();
  }

  onFechaChange() {
    // opcional: auto filtrar al elegir fecha
    // this.filtrar();
  }

  pageChange(event) {
    // si quieres paginar en backend, aquí llamarías otra API con page params
  }
}
