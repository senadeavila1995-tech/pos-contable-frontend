export interface CompraDetalle {
  id?: number;
  compra_id?: number;
  producto_id: number;
  cantidad: number;
  costo_unitario: number;
  subtotal: number;
  nombre?: string;
}

export interface Compra {
  id: number;
  id_empresa: number;
  proveedor_id: number;
  usuario_id: number;
  total: number;
  fecha_compra: string;
  numero_factura: string | null;
  subtotal: number;
  impuestos: number;
  estado: "REGISTRADA" | "ANULADA";
  caja_id: number | null;
  proveedor?: string;
  detalles?: CompraDetalle[];
}

export type CompraCreate = Omit<
  Compra,
  "id" | "id_empresa" | "usuario_id" | "proveedor" | "detalles"
> & {
  detalles: CompraDetalle[];
};

