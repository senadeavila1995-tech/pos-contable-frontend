import api from "../../shared/api/axios";

export interface LoginDTO {
  email: string;
  password: string;
}

export interface LoginResponse {
  token: string;
}

export interface RegisterDTO {
  nombre: string;
  email: string;
  password: string;
  rol_id: number;
  empresa_id: number;
}

export interface EmpresaRegistro {
  id: number;
  nombre: string;
  razon_social: string | null;
  nombre_comercial: string | null;
}

export const loginRequest = async (
  data: LoginDTO
): Promise<LoginResponse> => {
  const response = await api.post<LoginResponse>(
    "/auth/login",
    data
  );

  return response.data;
};

export const getEmpresasRegistro = async (): Promise<EmpresaRegistro[]> => {
  const response = await api.get<EmpresaRegistro[]>(
    "/auth/empresas"
  );

  return response.data;
};

export const registerRequest = async (
  data: RegisterDTO
): Promise<void> => {
  await api.post("/auth/register", data);
};

export const logout = (): void => {
  localStorage.removeItem("token");
};
