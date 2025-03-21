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
     {path: '**', redirectTo: 'categorias', pathMatch: 'full'}
   ]
  }
];

@NgModule({
  imports: [RouterModule.forChild(dashboardRoutes)],
  exports: [RouterModule]
})
export class MainConfigRoutingModule { }
