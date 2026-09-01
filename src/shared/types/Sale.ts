export interface CartItem {
  producto_id: number;
  nombre: string;
  cantidad: number;
  precio_unitario: number;
  descuento: number;
  subtotal: number;
  porcentaje_iva: number;
}

export interface SaleDetail {
  id: number;
  venta_id?: number;
  producto_id: number;
  descripcion: string;
  cantidad: number;
  precio_unitario: number;
  descuento: number;
  base_imponible: number | null;
  porcentaje_iva: number;
  valor_iva: number;
  total_linea: number | null;
  subtotal: number;
}

export interface CreateSale {
  cliente_id: number;
  metodo_pago:
    | "EFECTIVO"
    | "TARJETA"
    | "TRANSFERENCIA"
    | "NEQUI"
    | "DAVIPLATA";
  forma_pago?: string;
  medio_pago?: string;
  plazo_pago?: number | null;
  moneda?: string;
  detalles: {
    producto_id: number;
    cantidad: number;
    precio_unitario: number;
    descuento?: number;
  }[];
}

export interface Sale {
  id: number;
  usuario_id: number;
  empresa_id: number;
  caja_id: number | null;
  cliente_id: number | null;
  cliente_nombre?: string | null;
  total: number;
  moneda: string;
  forma_pago: string | null;
  medio_pago: string | null;
  plazo_pago: number | null;
  metodo_pago:
    | "EFECTIVO"
    | "TARJETA"
    | "TRANSFERENCIA"
    | "NEQUI"
    | "DAVIPLATA";
  estado: "PENDIENTE" | "PAGADA" | "ANULADA";
  creado_en: string;
  detalles?: SaleDetail[];
}
