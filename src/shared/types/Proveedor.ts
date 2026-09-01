export interface Proveedor {
  id: number;
  id_empresa: number;
  nombre: string;
  documento?: string;
  telefono?: string;
  email?: string;
  direccion?: string;
  estado: number;
  creado_en?: string;
  actualizado_en?: string;
}
