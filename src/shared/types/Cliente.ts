export interface Cliente {
  id: number;
  nombre: string;
  tipo_documento: string | null;
  numero_documento: string | null;
  digito_verificacion: string | null;
  tipo_persona: "NATURAL" | "JURIDICA" | null;
  cc: string | null;
  documento: string | null;
  telefono: string | null;
  email: string | null;
  direccion: string | null;
  municipio: string | null;
  departamento: string | null;
  codigo_municipio: string | null;
  pais: string | null;
  codigo_pais: string | null;
  regimen_fiscal: string | null;
  responsabilidad_fiscal: string | null;
  creado_en: string;
}

export type ClienteDto = Omit<Cliente, "id" | "creado_en">;
