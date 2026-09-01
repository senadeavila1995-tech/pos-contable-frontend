import api from "../../shared/api/axios";
import type { Compra, CompraCreate } from "../../shared/types/Compra";

export const getCompras = () =>
  api.get<Compra[]>("/compras");

export const getCompraById = (id: number) =>
  api.get<Compra>(`/compras/${id}`);

export const createCompra = (data: CompraCreate) =>
  api.post<{ message: string; id: number }>("/compras", data);

export const anularCompra = (id: number) =>
  api.put<{ message: string }>(`/compras/${id}/anular`);
