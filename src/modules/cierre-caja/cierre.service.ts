// src/modules/cierre-caja/cierre.service.ts (frontend)
import axios from "../../shared/api/axios";

export const cerrarCaja = (data: {
  caja_id: number;
  monto_final_real: number;
  observaciones?: string;
}) => {
  return axios.post("/cierre-caja", data);
};
