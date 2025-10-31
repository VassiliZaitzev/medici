import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule } from '@angular/forms'; // <- IMPORTANTE
import { ContactoRoutingModule } from './contacto-routing.module';
import { ContactoLayoutComponent } from './layouts/contacto-layout/contacto-layout.component';
// import { ContactoComponent } from './components/contacto/contacto.component';
import { SharedModule } from '../shared/shared.module';
import { ContactoComponent } from './componens/contacto/contacto.component';

@NgModule({
  declarations: [
    ContactoLayoutComponent,
    ContactoComponent
  ],
  imports: [
    CommonModule,
    ReactiveFormsModule, // <- Asegúrate de agregarlo aquí
    ContactoRoutingModule,
    SharedModule,
  ]
})
export class ContactoModule { }
