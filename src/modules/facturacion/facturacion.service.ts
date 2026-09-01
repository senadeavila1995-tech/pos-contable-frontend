import api from "../../shared/api/axios";

export const facturarVenta = (ventaId: number) =>
  api.post(`/facturacion/${ventaId}`);

export const obtenerFacturaPDF = (ventaId: number) =>
  api.get(`/facturacion/${ventaId}/pdf`, {
    responseType: "blob",
  });

export const obtenerFacturaXML = (ventaId: number) =>
  api.get(`/facturacion/${ventaId}/xml`, {
    responseType: "blob",
  });
