import api from "../../shared/api/axios";

/* ========= INGRESOS ========= */

// Ventas por día
export const getVentasPorDia = () =>
  api.get<{ fecha: string; total_ventas: number }[]>(
    "/ventas/dashboard/ventas-dia"
  );

// Top productos vendidos
export const getTopProductosVentas = () =>
  api.get<{
    id: number;
    nombre: string;
    total_vendido: number;
    total_ingresos: number;
  }[]>(
    "/ventas/dashboard/top-productos"
  );

/* ========= EGRESOS ========= */

// Compras por día
export const getComprasPorDia = (
  mes?: number,
  anio?: number
) => {
  const params = new URLSearchParams();

  if (mes !== undefined) {
    params.set("mes", String(mes));
  }

  if (anio !== undefined) {
    params.set("anio", String(anio));
  }

  const query = params.toString();

  return api.get<{ dia: string; total_dia: number }[]>(
    `/compras/dashboard/por-dia${query ? `?${query}` : ""}`
  );
};

// Listar compras
export const getCompras = () =>
  api.get("/compras");
