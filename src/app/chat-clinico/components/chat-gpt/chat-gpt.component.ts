import { Component, inject } from '@angular/core';
import { ChatService } from '../../services/chat.service';
interface Message {
  text: string;
  from: 'user' | 'bot';
}
@Component({
  selector: 'app-chat-gpt',
  templateUrl: './chat-gpt.component.html',
  styleUrl: './chat-gpt.component.scss',
})
export class ChatGptComponent {
  messages: Message[] = [];
  inputText = '';
  loading = false;

  public chatgptService = inject(ChatService);

  sendMessage() {
    if (!this.inputText.trim()) return;

    this.messages.push({ text: this.inputText, from: 'user' });

    this.loading = true;
    this.chatgptService.sendMessage(this.inputText).subscribe({
      next: (res) => {
        const reply = res.choices[0].message.content;
        this.messages.push({ text: reply, from: 'bot' });
        this.loading = false;
      },
      error: (err) => {
        this.messages.push({
          text: 'Error al conectar con ChatGPT.',
          from: 'bot',
        });
        this.loading = false;
      },
    });

    this.inputText = '';
  }
}
