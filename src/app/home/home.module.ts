import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { HomeRoutingModule } from './home-routing.module';
import { IndexComponent } from './components/index/index.component';
import { HomeLayoutComponent } from './layouts/home-layout/home-layout.component';
import { SharedModule } from '../shared/shared.module';

@NgModule({
  declarations: [IndexComponent, HomeLayoutComponent],
  imports: [CommonModule, HomeRoutingModule, SharedModule],
})
export class HomeModule {}
