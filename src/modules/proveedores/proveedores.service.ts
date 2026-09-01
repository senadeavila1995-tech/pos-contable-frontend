import api from "../../shared/api/axios";
import type { Proveedor } from "../../shared/types/Proveedor";

export const getProveedores = () => api.get<Proveedor[]>("/proveedores");
export const getProveedorById = (id: number) => api.get<Proveedor>(`/proveedores/${id}`);
export const createProveedor = (data: Omit<Proveedor, "id" | "id_empresa" | "creado_en" | "actualizado_en">) =>
  api.post<Proveedor>("/proveedores", data);
export const updateProveedor = (
  id: number,
  data: Partial<Omit<Proveedor, "id" | "id_empresa" | "creado_en" | "actualizado_en">>
) => api.put<Proveedor>(`/proveedores/${id}`, data);
export const deleteProveedor = (id: number) => api.delete(`/proveedores/${id}`);
