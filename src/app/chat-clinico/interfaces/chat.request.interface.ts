import { Usuario } from './usuario.interface';
import { ExamenFonasaRequest } from './examen.fonasa.interface';
import { Chat } from './chat.interface';

export interface ChatRequest {
  usuario: Partial<Usuario>;
  examenFonasa: ExamenFonasaRequest[];
  chat: Chat[];
}
