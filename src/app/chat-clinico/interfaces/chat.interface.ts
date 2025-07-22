export interface Chat {
  idChat: number;
  codigoCliente: string;
  mensaje: string;
  idTipoMensaje: number;
  fecha: Date | null;
}
