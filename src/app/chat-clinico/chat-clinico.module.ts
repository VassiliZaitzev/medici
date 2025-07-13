import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { ChatClinicoRoutingModule } from './chat-clinico-routing.module';
import { ChatGptComponent } from './components/chat-gpt/chat-gpt.component';
import { ChatLayoutComponent } from './layouts/chat-layout/chat-layout.component';
import { SharedModule } from '../shared/shared.module';
import { BrowserModule } from '@angular/platform-browser';
import { FormsModule } from '@angular/forms';
import { HttpClientModule } from '@angular/common/http';

@NgModule({
  declarations: [ChatGptComponent, ChatLayoutComponent],
  imports: [
    CommonModule,
    ChatClinicoRoutingModule,
    SharedModule,
    FormsModule,
    HttpClientModule,
  ],
})
export class ChatClinicoModule {}
