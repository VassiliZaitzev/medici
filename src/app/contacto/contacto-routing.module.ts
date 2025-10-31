import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { ContactoLayoutComponent } from './layouts/contacto-layout/contacto-layout.component';
import { ContactoComponent } from './componens/contacto/contacto.component';

const routes: Routes = [
  {
    path: '',
    component: ContactoLayoutComponent,
    children: [
      { path: 'index', component: ContactoComponent },
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
export class ContactoRoutingModule {}
