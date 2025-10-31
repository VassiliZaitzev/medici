import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { EquipoLayoutComponent } from './layouts/equipo-layout/equipo-layout.component';
import { EquipoComponent } from './componens/equipo/equipo.component';
import { SharedModule } from '../shared/shared.module';
import { ContactoRoutingModule } from '../contacto/contacto-routing.module';
import { EquipoRoutingModule } from './equipo-routing.module';

@NgModule({
  declarations: [EquipoComponent, EquipoLayoutComponent],
  imports: [
    CommonModule,
    EquipoRoutingModule,
    SharedModule
  ],
})
export class EquipoModule {}
