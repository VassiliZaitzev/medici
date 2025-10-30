import { Component, inject, OnInit } from '@angular/core';
import { ChatService } from '../../services/chat.service';
import { Chat } from '../../interfaces/chat.interface';
import { DomSanitizer, SafeResourceUrl } from '@angular/platform-browser';
import { chatEnv } from '../../../../environments/environment';
import { Usuario } from '../../interfaces/usuario.interface';
import { Examen, ExamenRespuesta } from '../../interfaces/examen.interface';

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
  public pasoActual: number = 0;  // Paso dentro del flujo de datos personales
  public usuario: Partial<Usuario> = {};
  public mensajeClave:string = "";
  public examenes : Examen [] = [];
  public lista:string[] = [];
  ngOnInit() {
    if (!this.savedKey) return;
    this.chatgptService.listarChat(this.savedKey.toString()).subscribe((res) => {
      console.log('res ', res);
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


    this.chatgptService.obtenerExamen().subscribe((res) => {
      console.log('examenes obtenidos', res);
      if( res.length <= 0  || res === null ) return;

      this.lista = res.map(ex => ex.descripcion);
      // console.log('lista', lista);

      this.examenes = res;
    })
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
    console.log("chat", chat);
    this.chatRegistrado.push(chat);
    this.procesarCola();
  }

  private procesarCola() {
    if (this.isProcessing || this.messageQueue.length === 0) return;
    console.log("firstfirstfirst")
    this.isProcessing = true;
    this.loading = true;

    const nextMessage = this.messageQueue.shift();

    if (this.etapa === 1) {
      this.manejarFlujoUsuario(nextMessage!);
      this.isProcessing = false;
      this.loading = false;
      return;
    }

    if(this.etapa === 2) {
      // Flujo normal después de recopilar datos del usuario
      console.log("2222222")
    }

    this.chatgptService.sendMessage(chatEnv.condicion + nextMessage!).subscribe({
      next: (res) => {
        console.log("nextMessage", nextMessage)
        var chat: Chat = {
          idChat: 0,
          codigoCliente: this.savedKey || '',
          mensaje: '',
          idTipoMensaje: 1,
          fecha: this.fechaActual,
        };
        console.log(res);
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
        chat.mensaje = 'Perfecto. ¿Cuál es tu edad?';
        this.pasoActual++;
        break;

      case 2:
        this.usuario.edad = Number(respuesta);
        chat.mensaje = 'Por último, necesito tu RUT:';
        this.pasoActual++;
        break;

      case 3:
        this.usuario.rut = respuesta;
        chat.mensaje = '✅ Datos recibidos correctamente. ¡Gracias! \n Ahora, procederé a analizar tu solicitud.';
        console.log('Usuario registrado:', this.usuario);
        this.etapa = 2; // vuelves al flujo normal
        this.pasoActual = 0;
        //hola, me duele la cabeza, necesito un examen medico
        const jsonEjemplo:ExamenRespuesta[] =  [
          {
            "nombre":"",
            "utilidad": ""
          }
        ];

        var messahe: string = `Cual de estos examenes me sirven para esto: "${this.mensajeClave}" \n ${this.lista} si el paciente tiene ${this.usuario.edad} años \n Responde estrictamente en formato JSON con los campos "nombre" y "utilidad". No incluyas marcas de código (sin los símbolos \`\`\`json\`), solo el contenido JSON. Ejemplo: ${JSON.stringify(jsonEjemplo)}`;

        console.log(messahe);
        this.chatgptService.sendMessage(messahe).subscribe({
          next: (res) => {

            const rawResponse = res.choices[0].message.content;
            const cleanedResponse = rawResponse.replace(/```json/g, '').replace(/```/g, '').trim();
            var examenrepuesta:ExamenRespuesta[] = JSON.parse(cleanedResponse);

            if (examenrepuesta.length === 0) {
              chat.mensaje = 'No se encontraron exámenes adecuados para tu solicitud.';
            } else {
              chat.mensaje = 'Basado en tu solicitud, te recomiendo los siguientes exámenes:\n' +
              examenrepuesta.map(ex => `● Nombre: ${ex.nombre}\n● Descripción: ${ex.utilidad}`).join('\n\n');
              chat.mensaje = chat.mensaje.replace(/\n/g, '<br />');
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
        console.error('Error al obtener el documento:', err);
      }
    });
  }
}



