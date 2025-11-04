import { Component, inject, OnInit } from '@angular/core';
import { ChatService } from '../../services/chat.service';
import { Chat } from '../../interfaces/chat.interface';
import { DomSanitizer, SafeResourceUrl } from '@angular/platform-browser';
import { chatEnv } from '../../../../environments/environment';
import { Usuario } from '../../interfaces/usuario.interface';
import { Examen, ExamenRespuesta } from '../../interfaces/examen.interface';
import { ExamenFonasa, ExamenFonasaRequest } from '../../interfaces/examen.fonasa.interface';
import { ChatRequest } from '../../interfaces/chat.request.interface';

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

  public etapa: number = 0;
  public pasoActual: number = 0;
  public usuario: Partial<Usuario> = {};
  public mensajeClave:string = "";

  public examenesFonasa: ExamenFonasa[] = [];
  public listaFonasa:string[] = [];
  public impresionVisible: boolean = false;
  public examenrepuesta: ExamenFonasaRequest[] = [];

  ngOnInit() {
    if (!this.savedKey) return;
    this.chatgptService.listarChat(this.savedKey.toString()).subscribe((res) => {
      if (res.length <= 0 || res == null) {
        const mensajeBienvenida: Chat = {
          idChat: 0,
          codigoCliente: this.savedKey || '',
          mensaje: '¡Hola! Soy tu asistente virtual. Estoy aquí para ayudarte con órdenes médicas y tipos de exámenes que necesitas. ¿En qué puedo asistirte hoy?',
          idTipoMensaje: 1,
          fecha: this.fechaActual,
        };
        this.chatRegistrado.push(mensajeBienvenida);
        localStorage.setItem('chatStorage', JSON.stringify(this.chatRegistrado));
        return;
      }
      this.chatRegistrado = res;
    });


    this.chatgptService.obtenerExamenFonasa().subscribe((res) => {
      if( res.length <= 0  || res === null ) return;
      this.listaFonasa = res.map(ex => `${ex.codigo} - ${ex.glosa}`);
      this.examenesFonasa = res;
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
    this.procesarCola();
  }

  private procesarCola() {
    if (this.isProcessing || this.messageQueue.length === 0) return;

    this.isProcessing = true;
    this.loading = true;
    const nextMessage = this.messageQueue.shift();

    if (this.etapa === 1) {
      this.manejarFlujoUsuario(nextMessage!);
      this.isProcessing = false;
      this.loading = false;
      return;
    }

    this.chatgptService.sendMessage(chatEnv.condicion + nextMessage!).subscribe({
      next: (res) => {
        var chat: Chat = {
          idChat: 0,
          codigoCliente: this.savedKey || '',
          mensaje: '',
          idTipoMensaje: 1,
          fecha: this.fechaActual,
        };

        if (res == '') {
          chat.mensaje = 'Ocurrió un error al procesar tu solicitud. Por favor, inténtalo de nuevo más tarde.';
          this.chatRegistrado.push(chat);
          return;
        }

        if (res.choices[0].message.content.trim().toString().toLowerCase() == 'false') {
          chat.mensaje = 'Sólo puedo ayudarte con órdenes médicas y tipo de exámenes que necesitas.';
          this.chatRegistrado.push(chat);
          return;
        }

        if (res.choices[0].message.content.trim().toString().toLowerCase() == 'true' && this.etapa == 0) {
          chat.mensaje = 'Perfecto, para ayudarte mejor, necesito algunos datos personales. Por favor, proporciona tu nombre completo.';
          this.etapa = 1;
          this.pasoActual = 0;
          this.chatRegistrado.push(chat);
          localStorage.setItem('chatStorage',JSON.stringify(this.chatRegistrado));
          this.mensajeClave = nextMessage!;
          return;
        }

        this.chatRegistrado.push(chat);
        localStorage.setItem('chatStorage',JSON.stringify(this.chatRegistrado));
      },
      error: (err) => {},
      complete: () => {
        this.isProcessing = false;
        this.loading = false;

        // Esperar 1.5 segundos antes de procesar el siguiente para evitar 429
        setTimeout(() => {
          this.procesarCola();
        }, 1500);
      },
    });
  }


  private manejarFlujoUsuario(respuesta: string) {
    let chat: Chat = {
      idChat: 0,
      codigoCliente: this.savedKey || '',
      mensaje: '',
      idTipoMensaje: 1,
      fecha: this.fechaActual,
    };

    switch (this.pasoActual) {
      case 0:
        this.usuario.nombre = respuesta;
        chat.mensaje = 'Genial, ahora necesito tu correo electrónico:';
        this.pasoActual++;
      break;

      case 1:
        this.usuario.email = respuesta;
        chat.mensaje = 'Indícame tu género (masculino, femenino, otro)';
        this.pasoActual++;
      break;

      case 2:
        this.usuario.genero = respuesta;
        chat.mensaje = 'Perfecto. ¿Cuál es tu edad?';
        this.pasoActual++;
      break;

      case 3:
        this.usuario.edad = Number(respuesta);
        chat.mensaje = 'Por último, necesito tu RUT: (Con guion y dígito verificador, ejemplo: 12345678-9)';
        this.pasoActual++;
      break;

      case 4:
        this.usuario.rut = respuesta;
        this.usuario.chatGptKey = this.savedKey || '';
        chat.mensaje = '✅ Datos recibidos correctamente. ¡Gracias! \n Ahora, procederé a analizar tu solicitud.';
        this.etapa = 2;
        this.pasoActual = 0;

        const formato = [
          {
            "tipo": "RADIOGRAFIA",
            "detalles": [
              {
                "codigo": "CODIGO",
                "nombre": "NOMBRE DEL EXAMEN",
                "utilidad": ""
              }
            ]
          }
        ];

        var messaheFonasa:string = `
          Eres un asistente que responde **solo en JSON**, sin explicaciones ni texto adicional.
          Filtra la siguiente lista de examenes para un **paciente ${this.usuario.genero} de ${this.usuario.edad} y necesita saber que examenes son para "${this.mensajeClave}"**. y quiero saber especificamente a menor rasgos, los examenes que necesito.
           \n Responde estrictamente en formato JSON con los campos "nombre" y "utilidad". No incluyas marcas de código (sin los símbolos \`\`\`json\`), solo el contenido JSON. Ejemplo: ${JSON.stringify(formato)}
          Formato esperado:
          ${JSON.stringify(formato)}

          Lista de examenes:
          ${this.listaFonasa.join('\n')}
        `;

        this.chatgptService.sendMessage(messaheFonasa).subscribe({
          next: (res) => {
            const rawResponse = res.choices[0].message.content;
            const cleanedResponse = rawResponse.replace(/```json/g, '').replace(/```/g, '').trim();
            this.examenrepuesta = JSON.parse(cleanedResponse);

            if (this.examenrepuesta.length === 0) {
              chat.mensaje = 'No se encontraron exámenes adecuados para tu solicitud.';
            } else {
              chat.mensaje = 'Basado en tu solicitud, te recomiendo los siguientes exámenes:<br>' +
              this.examenrepuesta.map(ex =>
                `<br><b>${ex.tipo}</b><br>` +
                ex.detalles.map(det =>
                  `&nbsp;&nbsp;● Nombre: ${det.codigo} - ${det.nombre}<br>` +
                  `&nbsp;&nbsp;● Utilidad: ${det.utilidad}<br>`
                ).join('<br>')
              ).join('<br><br>');


              this.impresionVisible = true;
            }
          }
        });

      break;
    }

    this.chatRegistrado.push(chat);
    localStorage.setItem('chatStorage', JSON.stringify(this.chatRegistrado));
  }

  obtenerDocumento() {
    this.chatgptService.obtenerDocumento().subscribe({
      next: (res) => {
        const rawBase64 = res;
        const cleaned = rawBase64.replace(/\s/g, '');
        const byteCharacters = atob(cleaned);
        const byteNumbers = Array.from(byteCharacters, (c) => c.charCodeAt(0));
        const byteArray = new Uint8Array(byteNumbers);
        const blob = new Blob([byteArray], { type: 'application/pdf' });
        const blobUrl = URL.createObjectURL(blob);
        this.pdfBase64Safe = this.sanitizer.bypassSecurityTrustResourceUrl(blobUrl);
      },
      error: (err) => {
        window.alert('Error al obtener el documento.');
      }
    });
  }


  generarPDF(){
    const chatRequest:ChatRequest = {
      usuario: this.usuario,
      examenFonasa: this.examenrepuesta,
      chat: this.chatRegistrado
    };

    console.log(chatRequest)
  }
}



