export interface ExamenFonasa {
  examenCorr:        number;
  codigo:            string;
  glosa:             string;
  codigoConcatenado: string;
  grupo:             number;
}

export interface ExamenFonasaRequest {
  tipo:     string;
  detalles: Detalle[];
}

export interface Detalle {
  codigo:   string;
  nombre:   string;
  utilidad: string;
}
