import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { SuccessComponent } from './pagos/success/success.component';
import { FailureComponent } from './pagos/failure/failure.component';

const routes: Routes = [
  {
    path: 'home',
    loadChildren: () =>
      import('./home/home.module').then(m => m.HomeModule)
  },
  {
    path: 'chat',
    loadChildren: () =>
      import('./chat-clinico/chat-clinico.module').then(m => m.ChatClinicoModule)
  },
  {
    path: 'equipo',
    loadChildren: () =>
      import('./equipo/equipo.module').then(m => m.EquipoModule)
  },
  {
    path: 'contacto',
    loadChildren: () =>
      import('./contacto/contacto.module').then(m => m.ContactoModule)
  },
  { path: 'pagos/success', component: SuccessComponent },
  { path: 'pagos/failure', component: FailureComponent },
  {
    path: '',
    redirectTo: 'home',
    pathMatch: 'full'
  },
  {
    path: '**',
    redirectTo: 'home'
  }
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule],
})
export class AppRoutingModule {}
