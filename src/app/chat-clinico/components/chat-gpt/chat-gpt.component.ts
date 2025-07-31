import { Component, inject, OnInit } from '@angular/core';
import { ChatService } from '../../services/chat.service';
import { Chat } from '../../interfaces/chat.interface';
import { DomSanitizer, SafeResourceUrl } from '@angular/platform-browser';

@Component({
  selector: 'app-chat-gpt',
  templateUrl: './chat-gpt.component.html',
  styleUrl: './chat-gpt.component.scss',
})
export class ChatGptComponent implements OnInit {
  inputText = '';
  loading = false;
  public fechaActual = new Date();
  private messageQueue: string[] = [];
  private isProcessing = false;

  public chatgptService = inject(ChatService);

  public fase: number = 0;
  public chatRegistrado: Chat[] = [];
  private savedKey = localStorage.getItem('chatgpt_key');

  pdfBase64Safe!: SafeResourceUrl;

  constructor(private sanitizer: DomSanitizer) {}

  ngOnInit() {
    if (!this.savedKey) return;
    this.chatgptService
      .listarChat(this.savedKey.toString())
      .subscribe((res) => {
        this.chatRegistrado = res;
      });
  }

  sendMessage() {
    if (this.loading || !this.inputText.trim()) return;

    const userMessage = this.inputText.trim();

    this.messageQueue.push(userMessage);
    this.inputText = '';

    let chat: Chat = {
      idChat: 0,
      codigoCliente: this.savedKey || '',
      mensaje: userMessage,
      idTipoMensaje: 0,
      fecha: this.fechaActual,
    };

    this.chatRegistrado.push(chat);
    this.processQueue();
  }

  private processQueue() {
    if (this.isProcessing || this.messageQueue.length === 0) return;

    this.isProcessing = true;
    this.loading = true;

    const nextMessage = this.messageQueue.shift();
    let condicion =
      'RESPONDE EXCLUSIVAMENTE CON TRUE O FALSE. El siguiente mensaje debe analizarse para saber si indica explícitamente que la persona quiere realizarse exámenes médicos o clínicos, o que quiere pedir exámenes en una clínica. NO respondas con explicaciones. SOLO responde TRUE si el mensaje pide de forma clara exámenes médicos. En cualquier otro caso, responde FALSE. Mensaje: ';
    this.chatgptService.sendMessage(condicion + nextMessage!).subscribe({
      next: (res) => {
        console.log(res);
        const reply = res.choices[0].message.content;

        let chat: Chat = {
          idChat: 0,
          codigoCliente: this.savedKey || '',
          mensaje: reply,
          idTipoMensaje: 1,
          fecha: this.fechaActual,
        };

        this.chatRegistrado.push(chat);
        localStorage.setItem(
          'chatStorage',
          JSON.stringify(this.chatRegistrado)
        );
      },
      error: (err) => {},
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

  obtenerDocumento() {
    this.chatgptService.obtenerDocumento().subscribe({
      next: (res) => {
        console.log(res);
        console.log('res');
        const rawBase64 = res;
        const cleaned = rawBase64.replace(/\s/g, '');

        const byteCharacters = atob(cleaned);
        const byteNumbers = Array.from(byteCharacters, (c) => c.charCodeAt(0));
        const byteArray = new Uint8Array(byteNumbers);

        const blob = new Blob([byteArray], { type: 'application/pdf' });
        const blobUrl = URL.createObjectURL(blob); // ✅ más confiable que base64 en src

        this.pdfBase64Safe =
          this.sanitizer.bypassSecurityTrustResourceUrl(blobUrl);
      },
      error: (err) => {
        console.error('Error al obtener el documento:', err);
      },
    });
  }
}
