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
  public fechaActual = new Date();
  private messageQueue: string[] = [];
  private isProcessing = false;

  public chatgptService = inject(ChatService);

  public fase: number = 0;

  sendMessage() {
    if (this.loading || !this.inputText.trim()) return;

    const userMessage = this.inputText.trim();
    this.messages.push({ text: userMessage, from: 'user' });

    this.messageQueue.push(userMessage);
    this.inputText = '';

    this.processQueue();
  }

  private processQueue() {
    if (this.isProcessing || this.messageQueue.length === 0) return;

    this.isProcessing = true;
    this.loading = true;

    const nextMessage = this.messageQueue.shift();

    this.chatgptService.sendMessage(nextMessage!).subscribe({
      next: (res) => {
        const reply = res.choices[0].message.content;
        this.messages.push({ text: reply, from: 'bot' });
      },
      error: (err) => {
        if (err.status === 429) {
          this.messages.push({
            text: '⚠️ Has hecho demasiadas solicitudes. Espera unos segundos e intenta nuevamente.',
            from: 'bot',
          });
        } else {
          this.messages.push({
            text: '❌ Error al conectar con ChatGPT.',
            from: 'bot',
          });
        }
      },
      complete: () => {
        this.isProcessing = false;
        this.loading = false;

        // Esperar 1.5 segundos antes de procesar el siguiente para evitar 429
        setTimeout(() => {
          this.processQueue();
        }, 1500);
      },
    });
  }

  listarChat() {
    this.chatgptService.listarChat('AC1').subscribe((res) => {
      console.log(res);
    });
  }
}
