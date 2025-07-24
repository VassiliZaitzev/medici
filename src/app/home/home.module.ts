// src/app/home/home.module.ts
import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HomeRoutingModule } from './home-routing.module';
import { SharedModule } from '../shared/shared.module';
import { ReactiveFormsModule } from '@angular/forms';
import { IndexComponent } from './components/index/index.component';
import { HomeLayoutComponent } from './layouts/home-layout/home-layout.component';

@NgModule({
  declarations: [IndexComponent, HomeLayoutComponent],
  imports: [CommonModule, HomeRoutingModule, SharedModule, ReactiveFormsModule],
})
export class HomeModule {}
