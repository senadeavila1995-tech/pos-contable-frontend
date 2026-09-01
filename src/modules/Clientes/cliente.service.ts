import api from "../../shared/api/axios";
import type { Cliente, ClienteDto } from "../../shared/types/Cliente";

export const getClientes = () =>
  api.get<Cliente[]>("/clientes");

export const getClienteById = (id: number) =>
  api.get<Cliente>(`/clientes/${id}`);

export const getClienteByDocumento = (documento: string) =>
  api.get<Cliente>(`/clientes/documento/${encodeURIComponent(documento)}`);

export const createCliente = (data: ClienteDto) =>
  api.post<Cliente>("/clientes", data);

export const updateCliente = (
  id: number,
  data: Partial<ClienteDto>
) =>
  api.put<Cliente>(`/clientes/${id}`, data);
