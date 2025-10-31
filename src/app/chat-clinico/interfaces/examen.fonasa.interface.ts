export interface ExamenFonasa {
  examenCorr:        number;
  codigo:            string;
  glosa:             string;
  codigoConcatenado: string;
  grupo:             number;
}



export interface ExamenFonasaRespuesta {
  tipo:     string;
  detalles: Detalle[];
}

export interface Detalle {
  nombre:   string;
  utilidad: string;
}
