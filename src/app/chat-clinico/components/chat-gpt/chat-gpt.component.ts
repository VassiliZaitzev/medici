import { Component, inject, OnInit } from '@angular/core';
import { ChatService } from '../../services/chat.service';
import { Chat } from '../../interfaces/chat.interface';
import { DomSanitizer, SafeResourceUrl } from '@angular/platform-browser';
import { chatEnv } from '../../../../environments/environment';
import { Usuario } from '../../interfaces/usuario.interface';
import { Examen, ExamenRespuesta } from '../../interfaces/examen.interface';
import {
  ExamenFonasa,
  ExamenFonasaRequest,
} from '../../interfaces/examen.fonasa.interface';
import { ChatRequest } from '../../interfaces/chat.request.interface';
import { PagoService } from '../../services/pago.service';

@Component({
  selector: 'app-chat-gpt',
  templateUrl: './chat-gpt.component.html',
  styleUrl: './chat-gpt.component.scss',
})
export class ChatGptComponent implements OnInit {
  inputText = '';
  loading: boolean = false;
  public fechaActual = new Date();
  private messageQueue: string[] = [];
  private isProcessing = false;
  public chatgptService = inject(ChatService);
  public pagoService = inject(PagoService);
  public fase: number = 0;
  public chatRegistrado: Chat[] = [];
  private savedKey = localStorage.getItem('chatgpt_key');
  pdfBase64Safe!: SafeResourceUrl;
  constructor(private sanitizer: DomSanitizer) {}

  public etapa: number = 0;
  public pasoActual: number = 0;
  public usuario: Partial<Usuario> = {};
  public mensajeClave: string = '';

  // MEJORAS DE CHAT CLINICO
  public anamnesis: any = {
    tiempo: null,
    intensidad: null,
    ubicacion: null,
    lado: null,
    sintomasExtra: null
  };

  public preguntasPendientes: string[] = [];
  public preguntaActualIndex: number = 0;


  public examenesFonasa: ExamenFonasa[] = [];
  public listaFonasa: string[] = [];
  // public impresionVisible: boolean = false;
  public examenrepuesta: ExamenFonasaRequest[] = [];

  public pagoHabilitado: boolean = false;
  public DEV_FORCE_PAGO = false;
  public examenConfirmado: any = null;

  ngOnInit() {
    if (!this.savedKey) return;

    this.chatgptService
      .listarChat(this.savedKey.toString())
      .subscribe((res) => {
        if (res.length <= 0 || res == null) {
          const mensajeBienvenida: Chat = {
            idChat: 0,
            codigoCliente: this.savedKey || '',
            mensaje:
"¡Hola! Soy tu asistente virtual 😊. Estoy aquí para orientarte sobre los exámenes médicos que podrías necesitar. Mientras más detalles puedas entregar sobre tus síntomas o situación, mejor será la recomendación que podré darte. ¿En qué puedo ayudarte hoy?",
            idTipoMensaje: 1,
            fecha: this.fechaActual,
          };

          this.chatRegistrado.push(mensajeBienvenida);
          localStorage.setItem(
            'chatStorage',
            JSON.stringify(this.chatRegistrado),
          );
          return;
        }

        this.chatRegistrado = res;
      });

    this.chatgptService.obtenerExamenFonasa().subscribe((res) => {
      if (res.length <= 0 || res === null) return;

      this.listaFonasa = res.map((ex) => `${ex.codigo} - ${ex.glosa}`);
      this.examenesFonasa = res;

      // ✅ SOLO PARA PRUEBAS (DEV): habilitar pago sin IA
      if (this.DEV_FORCE_PAGO) {
        this.activarPagoDev();
      }
    });
  }

  sendMessage() {
    // if (this.loading || !this.inputText.trim()) return;
if (!this.inputText.trim()) return;
    // this.impresionVisible = false;

    const userMessage = this.inputText.trim();
    this.messageQueue.push(userMessage);
    this.inputText = '';

    let chat: Chat = {
      idChat: 0,
      codigoCliente: this.savedKey || '',
      mensaje: userMessage,
      idTipoMensaje: 0,
      fecha: new Date(),
    };

    this.chatRegistrado.push(chat);
    localStorage.setItem('chatStorage', JSON.stringify(this.chatRegistrado));

    setTimeout(() => {
      const container = document.getElementById('scrollContainer');
      if (container) {
        container.scrollTop = container.scrollHeight;
      }
    }, 100);

    this.procesarCola();
  }

private procesarCola() {
  if (this.isProcessing || this.messageQueue.length === 0) return;

  this.isProcessing = true;
  this.loading = true;

  const nextMessage = this.messageQueue.shift();

  if (!nextMessage) {
    this.isProcessing = false;
    this.loading = false;
    return;
  }

  // ETAPA 3: Confirmación de código de examen
if (this.etapa === 3) {

  this.loading = true;

  setTimeout(() => {
    this.confirmarCodigoExamen(nextMessage);

    this.loading = false;
    this.isProcessing = false;

    if (this.messageQueue.length > 0) {
      this.procesarCola();
    }

  }, 300);

  return;
}

  // ETAPA 1: Recopilación de datos del usuario
if (this.etapa === 1) {

  this.loading = true;

  setTimeout(() => {
    this.manejarFlujoUsuario(nextMessage);

    this.loading = false;
    this.isProcessing = false;

    if (this.messageQueue.length > 0) {
      this.procesarCola();
    }

  }, 300);

  return;
}  // ETAPA 0: 

      //  ETAPA 2: ANAMNESIS (PREGUNTAS CLÍNICAS)
if (this.etapa === 2) {
  this.loading = true;

  setTimeout(() => {
    this.manejarAnamnesis(nextMessage);

    this.loading = false;
    this.isProcessing = false;

    // 🔥 CLAVE: continuar flujo SOLO si hay más mensajes
    if (this.messageQueue.length > 0) {
      this.procesarCola();
    }

  }, 300);

  return;
}
  // Evaluación inicial de la IA
  this.chatgptService.sendMessage(nextMessage).subscribe({
    next: (res) => {
      let mensajeBot = '';

      // 🔥 CAPTURA ERROR DE OPENAI (quota, etc.)
      if (res?.error?.message) {
        mensajeBot = '❌ Error IA: ' + res.error.message;
      }
      // 🔥 RESPUESTA NORMAL
      else if (res?.choices && res.choices[0]?.message?.content) {
        const content = res.choices[0].message.content.trim().toLowerCase();

        if (content === 'false') {
          mensajeBot =
            'Hola, sólo puedo ayudarte con órdenes médicas y tipo de exámenes que necesitas.';
        } else if (content === 'true' && this.etapa === 0) {
          mensajeBot =
            'Perfecto, para ayudarte mejor, necesito algunos datos personales. Por favor, proporciona tu nombre completo.';

          this.etapa = 1;
          this.pasoActual = 0;
          this.mensajeClave = nextMessage;
        } else {
          mensajeBot =
            '⚠️ No pude interpretar correctamente tu solicitud. Intenta nuevamente.';
        }
      }
      // 🔥 RESPUESTA RARA
      else {
        console.log('Respuesta IA rara:', res);
        mensajeBot = '⚠️ Respuesta inesperada del servidor.';
      }

      // 🔥 SIEMPRE MOSTRAR EN CHAT
      this.chatRegistrado.push({
        idChat: 0,
        codigoCliente: this.savedKey || '',
        mensaje: mensajeBot,
        idTipoMensaje: 1,
        fecha: new Date(),
      });

      localStorage.setItem(
        'chatStorage',
        JSON.stringify(this.chatRegistrado),
      );
    },

    error: (err) => {
      console.error('Error IA:', err);

      this.chatRegistrado.push({
        idChat: 0,
        codigoCliente: this.savedKey || '',
        mensaje:
          '❌ Error de conexión con la IA. Intenta nuevamente.',
        idTipoMensaje: 1,
        fecha: new Date(),
      });

      this.etapa = 1;
      this.pasoActual = 0;
      this.mensajeClave = nextMessage;
    },

    complete: () => {
      this.isProcessing = false;
      this.loading = false;

      setTimeout(() => {
        // this.procesarCola();
      }, 500);
    },
  });
}

  private manejarFlujoUsuario(respuesta: string) {
    let chat: Chat = {
      idChat: 0,
      codigoCliente: this.savedKey || '',
      mensaje: '',
      idTipoMensaje: 1,
      fecha: new Date(),
    };

    const input = respuesta.trim();

    switch (this.pasoActual) {
      case 0:
        const nombreRegex =
          /^[A-Za-zÁÉÍÓÚáéíóúÑñ]{2,}(?:\s[A-Za-zÁÉÍÓÚáéíóúÑñ]{2,})+$/;

        if (!nombreRegex.test(input)) {
          chat.mensaje =
            'Por favor ingresa tu nombre completo (nombre y apellido, solo letras y mínimo 2 caracteres cada uno). Ej: Juan Pérez';
          this.chatRegistrado.push(chat);
          return;
        }

        this.usuario.nombre = input;

        chat.mensaje = `Mucho gusto, ${input}. Ahora, por favor indícame tu correo electrónico:`;
        this.pasoActual++;
        break;

      case 1:
        const emailRegex =
          /^[a-zA-Z0-9._%+-]{3,}@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;

        const email = input.toLowerCase();

        if (!emailRegex.test(email)) {
          chat.mensaje =
            'El formato del correo electrónico no es válido. Ejemplo correcto: usuario@gmail.com';
          this.chatRegistrado.push(chat);
          return;
        }

        const partes = email.split('@');
        const dominio = partes[1];

        if (!dominio || dominio.length < 5 || dominio.split('.').length < 2) {
          chat.mensaje =
            'El dominio del correo no parece válido. Ejemplo correcto: usuario@gmail.com';
          this.chatRegistrado.push(chat);
          return;
        }

        this.usuario.email = email;

        chat.mensaje =
          'Gracias. ¿Cuál es tu género? (Masculino, Femenino u Otro)';
        this.pasoActual++;
        break;

      case 2:
        const gen = input.toLowerCase();
        const opciones = ['masculino', 'femenino', 'otro', 'hombre', 'mujer'];

        if (!opciones.some((op) => gen.includes(op))) {
          chat.mensaje =
            'Por favor, especifica un género válido: Masculino, Femenino u Otro.';
          this.chatRegistrado.push(chat);
          return;
        }

        this.usuario.genero = gen;
        chat.mensaje = 'Entendido. ¿Qué edad tienes?';
        this.pasoActual++;
        break;

      case 3:
        const edadNum = parseInt(input);

        if (isNaN(edadNum) || edadNum <= 0 || edadNum > 115) {
          chat.mensaje =
            'Por favor, ingresa una edad válida (entre 1 y 115 años).';
          this.chatRegistrado.push(chat);
          return;
        }

        this.usuario.edad = edadNum;
        chat.mensaje =
          'Casi terminamos. Necesito tu RUT para concluir (ej: 12345678-9):';
        this.pasoActual++;
        break;

      case 4:
        if (!this.validarRutChileno(input)) {
          chat.mensaje =
            'El RUT ingresado no es válido o no tiene el formato correcto (ej: 12345678-9).';
          this.chatRegistrado.push(chat);
          return;
        }

        this.usuario.rut = input;
        this.usuario.chatGptKey = this.savedKey || '';

        chat.mensaje =
          '✅ Datos validados con éxito. Analizaré tu caso ahora...';

        this.etapa = 2;
        this.pasoActual = 0;

        this.chatRegistrado.push(chat);

        // 🔥 NUEVO FLUJO
        this.iniciarEvaluacionClinica();
        // this.procesarExamenesIA();
        return;
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
        this.pdfBase64Safe =
          this.sanitizer.bypassSecurityTrustResourceUrl(blobUrl);
      },
      error: (err) => {
        window.alert('Error al obtener el documento.');
      },
    });
  }

  generarPDF() {
    const chatRequest: ChatRequest = {
      usuario: this.usuario,
      examenFonasa: this.examenrepuesta,
      chat: this.chatRegistrado,
    };

    console.log(chatRequest);
  }

  pagar() {
    // ✅ Armamos el request que el backend espera: ChatRequestEN
    const request = {
      usuario: this.usuario,
      examenFonasa: this.examenrepuesta,
      chat: this.chatRegistrado,
    };

    // ✅ Guardamos en localStorage para que la pantalla success lo use
    localStorage.setItem(
      'ordenMedica',
      JSON.stringify({
        paciente: this.usuario,
        examenes: this.examenrepuesta,
        fecha: new Date(),
      }),
    );

    // 🔥 LLAMADA REAL A MERCADO PAGO (backend)
    this.pagoService.crearPagoConPdf(request).subscribe({
      next: (resp) => {
        // resp.url viene del backend, redirecciona a MP
        window.location.href = resp.url;
      },
      error: (err) => {
        console.error('Error al crear pago:', err);

        // 🧪 Si quieres forzar redirección a success aunque falle:
        if (this.DEV_FORCE_PAGO) {
          window.location.href =
            'http://medicyst:4200/pagos/success?payment_id=999999999&status=approved';
        } else {
          window.alert('No se pudo crear el pago.');
        }
      },
    });
  }

  private procesarExamenesIA() {
    const formato = [
      {
        tipo: 'RADIOGRAFIA',
        detalles: [
          {
            codigo: 'CODIGO',
            nombre: 'NOMBRE DEL EXAMEN',
            utilidad: 'Explicación breve de para qué sirve este examen',
          },
        ],
      },
    ];

    var messaheFonasa: string = `
  Eres un asistente médico virtual que responde SOLO en JSON.
  Paciente ${this.usuario.genero} de ${this.usuario.edad} años.

  // Requerimiento: "${this.mensajeClave}"
  Requerimiento: "${this.mensajeClave}"

  Información adicional:
  - Tiempo: ${this.anamnesis.tiempo || 'No especificado'}
  - Intensidad: ${this.anamnesis.intensidad || 'No especificado'}
  - Lado: ${this.anamnesis.lado || 'No aplica'}
  - Observaciones: ${this.anamnesis.sintomasExtra || 'No especificado'}

  INSTRUCCIÓN TÉCNICA CRÍTICA:
  1. Responde estrictamente en JSON.
  2. No incluyas \`\`\`json.
  3. No inventes códigos, usa los de la lista.
  4. Si no encuentras exámenes relacionados, devuelve [].

  Formato esperado:
  ${JSON.stringify(formato)}

  Lista:
  ${this.listaFonasa.join('\n')}
  `;

    this.loading = true;
    this.isProcessing = true;

    this.chatgptService.sendBigMessage(messaheFonasa).subscribe({
      next: (res) => {
        let chat: Chat = {
          idChat: 0,
          codigoCliente: this.savedKey || '',
          mensaje: '',
          idTipoMensaje: 1,
          fecha: new Date(),
        };

        try {
          const rawResponse =
            res?.choices?.[0]?.message?.content || res?.mensaje || res;

          if (!rawResponse) {
            throw new Error('Respuesta vacía');
          }

          let cleanedResponse = rawResponse
            .replace(/```json/gi, '')
            .replace(/```/g, '')
            .trim();

          const jsonMatch = cleanedResponse.match(/\[[\s\S]*\]/);

          if (jsonMatch) {
            cleanedResponse = jsonMatch[0];
          }

          this.examenrepuesta = JSON.parse(cleanedResponse);

          if (!Array.isArray(this.examenrepuesta)) {
            this.examenrepuesta = [this.examenrepuesta];
          }

          if (this.examenrepuesta.length === 0) {
            chat.mensaje =
              'No se encontraron exámenes relacionados con tu requerimiento.';

            this.pagoHabilitado = false;
            this.etapa = 0;

            // Si no hay exámenes, hacemos el push normal
            this.chatRegistrado.push(chat);
            localStorage.setItem(
              'chatStorage',
              JSON.stringify(this.chatRegistrado),
            );
          } else {
            let htmlMsg =
              'Basado en tu solicitud, he identificado los siguientes exámenes:<br>';

            this.examenrepuesta.forEach((ex) => {
              htmlMsg += `<br><b style="color: #2c3e50;">${ex.tipo}</b><br>`;

              ex.detalles?.forEach((det) => {
                htmlMsg += `&nbsp;&nbsp;• <b>${det.codigo}</b> - ${det.nombre}<br>`;
                htmlMsg += `&nbsp;&nbsp;&nbsp;&nbsp;<small><i>Utilidad: ${det.utilidad}</i></small><br>`;
              });
            });

            chat.mensaje = htmlMsg;

            // Pushear el primer mensaje con los exámenes
            this.chatRegistrado.push(chat);

            // Crear y pushear el segundo mensaje de cierre
            let chatCierre: Chat = {
              idChat: 0,
              codigoCliente: this.savedKey || '',
              mensaje:
                '✅ <b>Diagnóstico completado.</b> <br><br> Por favor, utilice el botón de abajo para realizar el pago de su solicitud de examen.',
              idTipoMensaje: 1,
              fecha: new Date(),
            };
            this.chatRegistrado.push(chatCierre);

            this.pagoHabilitado = true;
            this.etapa = 4;

            localStorage.setItem(
              'chatStorage',
              JSON.stringify(this.chatRegistrado),
            );
          }
        } catch (e) {
          console.error('Error al procesar la respuesta de la IA:', e);

          chat.mensaje =
            'Hubo un inconveniente al procesar la lista. Por favor intenta de nuevo.';

          this.pagoHabilitado = false;
          this.etapa = 0;

          this.chatRegistrado.push(chat);
          localStorage.setItem(
            'chatStorage',
            JSON.stringify(this.chatRegistrado),
          );
        }

        this.loading = false;
        this.isProcessing = false;

        setTimeout(() => {
          const container = document.getElementById('scrollContainer');
          if (container) container.scrollTop = container.scrollHeight;
        }, 100);
      },

      error: (err) => {
        console.error('Error en el servicio de IA:', err);

        this.loading = false;
        this.isProcessing = false;

        this.chatRegistrado.push({
          idChat: 0,
          codigoCliente: '',
          idTipoMensaje: 1,
          fecha: new Date(),
          mensaje: 'Ocurrió un error de conexión. Intenta nuevamente.',
        });

        this.pagoHabilitado = false;
      },
    });
  }

  private validarRutChileno(rut: string): boolean {
    if (!/^[0-9]+[-|‐]{1}[0-9kK]{1}$/.test(rut)) return false;
    const tmp = rut.split('-');
    let digv = tmp[1].toLowerCase();
    const cuerpo = tmp[0];

    let suma = 0;
    let multiplo = 2;
    for (let i = cuerpo.length - 1; i >= 0; i--) {
      suma = suma + Number(cuerpo.charAt(i)) * multiplo;
      if (multiplo < 7) {
        multiplo = multiplo + 1;
      } else {
        multiplo = 2;
      }
    }

    const res = 11 - (suma % 11);
    let dvr = '0';
    if (res == 10) dvr = 'k';
    else if (res == 11) dvr = '0';
    else dvr = res.toString();

    return dvr === digv;
  }
  confirmarSeleccion() {
    this.pagoHabilitado = true;

    const mensajeConfirmacion: Chat = {
      idChat: 0,
      codigoCliente: this.savedKey || '',
      mensaje:
        '✅ <b>Selección confirmada.</b> El botón de pago ahora está habilitado debajo para que puedas obtener su examen.',
      idTipoMensaje: 1,
      fecha: new Date(),
    };

    this.chatRegistrado.push(mensajeConfirmacion);
    localStorage.setItem('chatStorage', JSON.stringify(this.chatRegistrado));

    setTimeout(() => {
      const container = document.getElementById('scrollContainer');
      if (container) container.scrollTop = container.scrollHeight;
    }, 100);
  }
  private confirmarCodigoExamen(codigoIngresado: string) {
    const codigo = codigoIngresado.trim();
    let examenSeleccionado: any = null;

    this.examenrepuesta.forEach((ex) => {
      ex.detalles?.forEach((det) => {
        if (det.codigo === codigo) {
          examenSeleccionado = det;
        }
      });
    });

    let chat: Chat = {
      idChat: 0,
      codigoCliente: this.savedKey || '',
      mensaje: '',
      idTipoMensaje: 1,
      fecha: new Date(),
    };

    if (!examenSeleccionado) {
      chat.mensaje =
        '⚠️ El código ingresado no corresponde a los exámenes listados. Por favor intenta nuevamente.';

      this.chatRegistrado.push(chat);
      localStorage.setItem('chatStorage', JSON.stringify(this.chatRegistrado));
      return;
    }

    this.examenConfirmado = examenSeleccionado;

    chat.mensaje = `✅ Examen confirmado: <b>${examenSeleccionado.codigo}</b> - ${examenSeleccionado.nombre}.
    <br><br>Ahora puedes generar tu solictud de examen y proceder al pago.`;

    this.pagoHabilitado = true;
    this.etapa = 4;

    this.chatRegistrado.push(chat);
    localStorage.setItem('chatStorage', JSON.stringify(this.chatRegistrado));
  }

  private activarPagoDev() {
    this.usuario = {
      nombre: this.usuario.nombre || 'Manolo Pérez',
      email: this.usuario.email || 'ni.fuentemavida@duocuc.cl',
      genero: this.usuario.genero || 'masculino',
      edad: this.usuario.edad || 25,
      rut: this.usuario.rut || '11111111-1',
      chatGptKey: this.savedKey || 'DEV-KEY',
    };

    this.examenrepuesta = [
      {
        tipo: 'RADIOGRAFIA',
        detalles: [
          {
            codigo: '0403001',
            nombre:
              'TOMOGRAFIA COMPUTARIZADA DE CRANEO ENCEFALICA SIN CONTRASTE',
            utilidad:
              'Evaluar hemorragia, masas, edema o causas de cefalea persistente.',
          },
          {
            codigo: '0405001',
            nombre:
              'RESONANCIA MAGNETICA CRANEO ENCEFALICA SIN MEDIO DE CONTRASTE',
            utilidad:
              'Detectar patología intracraneal no visible en TAC (tumores, infartos, etc.).',
          },
        ],
      },
    ];

    this.examenConfirmado = this.examenrepuesta[0].detalles?.[0] || null;

    this.pagoHabilitado = true;
    this.etapa = 4;

    this.chatRegistrado.push({
      idChat: 0,
      codigoCliente: this.savedKey || '',
      idTipoMensaje: 1,
      fecha: new Date(),
      mensaje:
        '🧪 <b>MODO PRUEBA:</b> Pago habilitado y exámenes cargados. Puedes presionar el botón de pago.',
    });

    localStorage.setItem('chatStorage', JSON.stringify(this.chatRegistrado));
  }

  private iniciarEvaluacionClinica() {
  if (this.tieneInfoSuficiente(this.mensajeClave)) {
    this.procesarExamenesIA();
    return;
  }

  this.generarPreguntas();

  if (this.preguntasPendientes.length > 0) {
    this.etapa = 2;

    this.chatRegistrado.push({
      idChat: 0,
      codigoCliente: this.savedKey || '',
      mensaje: this.preguntasPendientes[0],
      idTipoMensaje: 1,
      fecha: new Date(),
    });

    localStorage.setItem('chatStorage', JSON.stringify(this.chatRegistrado));
  } else {
    this.procesarExamenesIA();
  }
}
private manejarAnamnesis(respuesta: string) {
  const input = respuesta.toLowerCase();

  // 🔥 Guardar respuestas básicas
  if (!this.anamnesis.tiempo && input.match(/\d+\s*(día|dias|semana|mes)/)) {
    this.anamnesis.tiempo = input;
  }

  if (!this.anamnesis.intensidad && input.match(/\d\/10|leve|moderado|fuerte/)) {
    this.anamnesis.intensidad = input;
  }

  if (!this.anamnesis.lado && input.match(/derecho|izquierdo/)) {
    this.anamnesis.lado = input;
  }

  if (!this.anamnesis.sintomasExtra && input.match(/inflam|hincha|rojo|dolor al mover/)) {
    this.anamnesis.sintomasExtra = input;
  }

  this.preguntaActualIndex++;

  if (this.preguntaActualIndex < this.preguntasPendientes.length) {
    this.chatRegistrado.push({
      idChat: 0,
      codigoCliente: this.savedKey || '',
      mensaje: this.preguntasPendientes[this.preguntaActualIndex],
      idTipoMensaje: 1,
      fecha: new Date(),
    });

    localStorage.setItem('chatStorage', JSON.stringify(this.chatRegistrado));
  }  else {
  // 🔥 TERMINÓ ANAMNESIS
  this.etapa = 0;

  // 🔥 liberar estado ANTES
  this.loading = false;
  this.isProcessing = false;

  // 🔥 llamar directo (SIN setTimeout ni loading)
  this.procesarExamenesIA();
}
}
private generarPreguntas() {
  const texto = this.mensajeClave.toLowerCase();
  let preguntas: string[] = [];

  // 🔹 1. TIEMPO (siempre primero)
  if (!texto.match(/\d+\s*(día|dias|semana|mes|año)/)) {
    preguntas.push('¿Desde cuándo tienes el dolor?');
  }

  // 🔹 2. INTENSIDAD
  if (!texto.match(/leve|moderado|fuerte|\d\/10/)) {
    preguntas.push('En una escala del 1 al 10, ¿qué tan fuerte es el dolor?');
  }

  // 🔹 3. DETECTAR SI ES PROBABLEMENTE MÚSCULO-ESQUELÉTICO
  const esMusculoEsqueletico = texto.match(
    /dolor|molestia|lesion|golpe|torcedura|inflamacion/
  );

  if (esMusculoEsqueletico) {

    // 👉 LADO (SIEMPRE SI HAY DOLOR FÍSICO)
    if (!texto.match(/derecho|izquierdo/)) {
      preguntas.push('¿Es en el lado derecho o izquierdo?');
    }

    // 👉 MOVIMIENTO
    preguntas.push('¿Te duele al moverlo o también en reposo?');
  }

  // 🔹 4. SÍNTOMAS EXTRA
  if (!texto.match(/inflam|hincha|rojo/)) {
    preguntas.push('¿Has notado inflamación o hinchazón?');
  }

  this.preguntasPendientes = preguntas;
  this.preguntaActualIndex = 0;
}
private tieneInfoSuficiente(texto: string): boolean {
  const t = texto.toLowerCase();

  let puntos = 0;

  if (t.match(/\d+\s*(día|dias|semana|mes)/)) puntos++;
  if (t.match(/leve|moderado|fuerte|\d\/10/)) puntos++;
  if (t.match(/inflam|hincha|rojo/)) puntos++;

  const tieneLado = t.match(/derecho|izquierdo/);

  // 🔥 REGLA INTELIGENTE:
  // si tiene buen contexto → continuar aunque no haya lado
  if (puntos >= 2) return true;

  // si no hay suficiente info → seguir preguntando
  return false;
}
}
