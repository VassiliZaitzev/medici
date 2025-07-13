import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { SharedRoutingModule } from './shared-routing.module';
import { MenuPrincipalComponent } from './components/menu-principal/menu-principal.component';
import { FooterComponent } from './components/footer/footer.component';

@NgModule({
  declarations: [MenuPrincipalComponent, FooterComponent],
  imports: [CommonModule, SharedRoutingModule],
  exports: [MenuPrincipalComponent, FooterComponent],
})
export class SharedModule {}
