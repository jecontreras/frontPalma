import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { MainsComponent } from './main.component';
import { AuthService } from '../services/auth.service';
import { CategoriasComponent } from './components/categorias/categorias.component';
import { ProvedoresComponent } from './components/provedores/provedores.component';
import { ProductosComponent } from './components/productos/productos.component';
import { UsuariosComponent } from './components/usuarios/usuarios.component';
import { VentasComponent } from './components/ventas/ventas.component';
import { CobrosComponent } from './components/cobros/cobros.component';
import { BancosComponent } from './components/bancos/bancos.component';
import { PerfilComponent } from './components/perfil/perfil.component';
import { ReferidosComponent } from './components/referidos/referidos.component';
import { PedidosComponent } from './components/pedidos/pedidos.component';
import { ConfigComponent } from './components/config/config.component';
import { TestimonioComponent } from './components/testimonio/testimonio.component';
import { RolesComponent } from './components/roles/roles.component';
import { EstadisticasComponent } from './components/estadisticas/estadisticas.component';
import { EmpresaComponent } from './components/empresa/empresa.component';
import { TallajeComponent } from './components/tallaje/tallaje.component';
import { ConfigFormCompraComponent } from './components/config-form-compra/config-form-compra.component';
import { PaquetesComponent } from './components/paquetes/paquetes.component';
import { ResponsePaymentComponent } from './components/response-payment/response-payment.component';
import { AdminPaquetesComponent } from './components/admin-paquetes/admin-paquetes.component';

const dashboardRoutes: Routes = [
 {
   path: '',
   component: MainsComponent,
   canActivate: [AuthService],
   children: [
     {path: '', redirectTo: 'productos', pathMatch: 'full'},
     {path: 'categorias', component: CategoriasComponent},
     {path: 'provedores', component: ProvedoresComponent},
     {path: 'productos', component: ProductosComponent},
     {path: 'usuarios', component: UsuariosComponent},
     {path: 'ventas', component: VentasComponent},
     {path: 'testimonios', component: TestimonioComponent},
     {path: 'pedidos', component: PedidosComponent },
     {path: 'cobros', component: CobrosComponent},
     {path: 'bancos', component: BancosComponent},
     {path: 'perfil', component: PerfilComponent},
     {path: 'referidos', component: ReferidosComponent},
     {path: 'configuracion', component: ConfigComponent},
     {path: 'roles', component: RolesComponent},
     {path: 'estadisticas', component: EstadisticasComponent},
     {path: 'empresa', component: EmpresaComponent},
     {path: 'tipoMedida', component: TallajeComponent},
     {path: 'configFormCompra', component: ConfigFormCompraComponent},
     {path: 'paquetes', component: PaquetesComponent},
      { path: 'response', component: ResponsePaymentComponent },
      { path: 'adminpaquete', component: AdminPaquetesComponent },
     {path: '**', redirectTo: 'categorias', pathMatch: 'full'}
   ]
  }
];

@NgModule({
  imports: [RouterModule.forChild(dashboardRoutes)],
  exports: [RouterModule]
})
export class MainConfigRoutingModule { }
