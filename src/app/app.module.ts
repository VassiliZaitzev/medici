import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';

import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { CommonModule } from '@angular/common';
import { HttpClientModule, provideHttpClient } from '@angular/common/http';
import localeEs from '@angular/common/locales/es';
import { registerLocaleData } from '@angular/common';
import { PagosComponent } from './pagos/pagos.component';
import { SuccessComponent } from './pagos/success/success.component';
import { FailureComponent } from './pagos/failure/failure.component';


registerLocaleData(localeEs);
@NgModule({
  declarations: [AppComponent, PagosComponent, SuccessComponent, FailureComponent],
  imports: [BrowserModule, AppRoutingModule, CommonModule, HttpClientModule],
  providers: [provideHttpClient()],
  bootstrap: [AppComponent],
})
export class AppModule {}
