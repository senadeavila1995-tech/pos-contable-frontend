import api from "../../shared/api/axios";
import type { Caja, CierreCajaResponse } from "../../shared/types/Caja";

export const getCajaActual = () =>
  api.get<Caja | null>("/caja/actual");

export const abrirCaja = (data: { monto_inicial: number }) =>
  api.post<{ message: string; caja: Caja }>("/caja/abrir", data);

export const cerrarCaja = (data: {
  caja_id: number;
  monto_final_real: number;
}) =>
  api.post<{ message: string; caja: CierreCajaResponse }>(
    "/caja/cerrar",
    data
  );
