import api from "../../shared/api/axios";
import type { CreateSale, Sale } from "../../shared/types/Sale";

export const listarVentas = () =>
  api.get<Sale[]>("/ventas");

export const getVentaDetalle = (id: number) =>
  api.get<Sale>(`/ventas/${id}`);

export const crearVenta = (data: CreateSale) =>
  api.post("/ventas", data);

export const anularVenta = (id: number) =>
  api.put(`/ventas/${id}/anular`);

export const ventasPorDia = () =>
  api.get("/ventas/dashboard/ventas-dia");
