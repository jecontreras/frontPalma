import { Component, OnInit } from '@angular/core';
import { SuscripcionService } from 'src/app/servicesComponents/suscripcion.service';
import * as XLSX from 'xlsx';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';

@Component({
  selector: 'app-reporte-suscripciones',
  templateUrl: './reporte-suscripciones.component.html',
  styleUrls: ['./reporte-suscripciones.component.scss']
})
export class ReporteSuscripcionesComponent implements OnInit {
   displayedColumns: string[] = [
    'empresa', 'paquete', 'fecha_inicio', 'fecha_fin', 'dias_restantes', 'estado', 'valor'
  ];
  dataSource: any[] = [];
  loading = false;
  filtroEstado: string = '';

  constructor(private suscripcionService: SuscripcionService) {}

  ngOnInit(): void {
    this.cargarReporte();
  }

  cargarReporte() {
    this.loading = true;
    this.suscripcionService.getReporte(this.filtroEstado).subscribe({
      next: (data:any) => {
        this.dataSource = data;
        this.loading = false;
      },
      error: () => (this.loading = false)
    });
  }

  aplicarFiltro(estado: string) {
    this.filtroEstado = estado;
    this.cargarReporte();
  }

  getEstadoClass(estado: string) {
    switch (estado) {
      case 'Activo': return 'estado-activo';
      case 'Por vencer': return 'estado-warning';
      case 'Vencido': return 'estado-error';
      default: return '';
    }
  }

  exportExcel() {
    const ws: XLSX.WorkSheet = XLSX.utils.json_to_sheet(this.dataSource);
    const wb: XLSX.WorkBook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Suscripciones');
    XLSX.writeFile(wb, 'Reporte_Suscripciones.xlsx');
  }

  exportPDF() {
    const doc = new jsPDF();
    doc.text('Reporte de Suscripciones', 14, 10);
    autoTable(doc, {
      head: [this.displayedColumns],
      body: this.dataSource.map(r => [
        r.empresa,
        r.paquete,
        new Date(r.fecha_inicio).toLocaleDateString(),
        new Date(r.fecha_fin).toLocaleDateString(),
        r.dias_restantes,
        r.estado,
        `$${r.valor}`
      ])
    });
    doc.save('Reporte_Suscripciones.pdf');
  }
}