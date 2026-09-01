export interface Caja {
  id: number;
  usuario_id: number;
  monto_inicial: number;
  fecha_apertura: string;
  estado: "ABIERTA" | "CERRADA";
}

export interface CierreCajaResponse {
  id: number;
  estado: "CERRADA";
  monto_inicial: number;
  total_ventas: number;
  total_efectivo: number;
  total_compras: number;
  efectivo_esperado: number;
  monto_final_real: number;
  diferencia: number;
  fecha_cierre: string;
}
