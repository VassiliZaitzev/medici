import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { EquipoLayoutComponent } from './layouts/equipo-layout/equipo-layout.component';
import { EquipoComponent } from './componens/equipo/equipo.component';

const routes: Routes = [
  {
    path: '',
    component: EquipoLayoutComponent,
    children: [
      { path: 'index', component: EquipoComponent },
      { path: '', redirectTo: 'index', pathMatch: 'full' },
      { path: '**', redirectTo: 'index' },
    ],
  },
  {
    path: '',
    redirectTo: '',
    pathMatch: 'full',
  },
  {
    path: '**',
    redirectTo: '',
  },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class EquipoRoutingModule {}
