export interface Factura {
  factura_id: number;
  venta_id: number;
  numero: string;
  prefijo: string;
  cufe: string;
  estado_dian: string;
  pdf_url?: string;
  xml_url?: string;
}
