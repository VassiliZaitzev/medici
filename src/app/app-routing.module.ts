import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { ChatClinicoModule } from './chat-clinico/chat-clinico.module';

const routes: Routes = [
  {
    path: 'home',
    loadChildren: () =>
      import('./chat-clinico/chat-clinico.module').then(
        (m) => m.ChatClinicoModule
      ),
  },
  // {
  //   path: 'home',
  //   loadChildren: () => import('./home/home.module').then((m) => m.HomeModule),
  // },
  {
    path: '',
    redirectTo: 'home',
    pathMatch: 'full',
  },
  {
    path: '**',
    redirectTo: 'home',
  },
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule],
})
export class AppRoutingModule {}
