import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import {
  registerRequest,
  getEmpresasRegistro,
} from "./auth.service";
import type { EmpresaRegistro } from "./auth.service";

export const RegisterPage = () => {
  const navigate = useNavigate();

  const [form, setForm] = useState({
    nombre: "",
    email: "",
    password: "",
    confirmPassword: "",
    rol_id: 1,
    empresa_id: 0,
  });

  const [empresas, setEmpresas] = useState<EmpresaRegistro[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [loadingEmpresas, setLoadingEmpresas] = useState(true);

  useEffect(() => {
    const cargarEmpresas = async () => {
      try {
        setLoadingEmpresas(true);

        const data = await getEmpresasRegistro();

        setEmpresas(data);

        if (data.length > 0) {
          setForm((prev) => ({
            ...prev,
            empresa_id: data[0].id,
          }));
        }
      } catch (err: unknown) {
        console.error(err);
        setError("No fue posible cargar las empresas disponibles");
      } finally {
        setLoadingEmpresas(false);
      }
    };

    cargarEmpresas();
  }, []);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;

    setForm((prev) => ({
      ...prev,
      [name]:
        name === "rol_id" || name === "empresa_id"
          ? Number(value)
          : value,
    }));
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError(null);

    if (!form.empresa_id) {
      setError("Debe seleccionar una empresa");
      return;
    }

    if (form.password !== form.confirmPassword) {
      setError("Las contraseñas no coinciden");
      return;
    }

    try {
      setLoading(true);

      await registerRequest({
        nombre: form.nombre.trim(),
        email: form.email.trim(),
        password: form.password,
        rol_id: form.rol_id,
        empresa_id: form.empresa_id,
      });

      navigate("/login", { replace: true });
    } catch (err: unknown) {
      if (axios.isAxiosError(err)) {
        setError(
          err.response?.data?.message ||
            "No fue posible registrar el usuario"
        );
      } else {
        setError("Error inesperado al registrar el usuario");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={styles.container}>
      <form style={styles.card} onSubmit={handleSubmit}>
        <h2 style={styles.title}>Crear cuenta</h2>

        {error && <p style={styles.error}>{error}</p>}

        <input
          type="text"
          name="nombre"
          placeholder="Nombre completo"
          value={form.nombre}
          onChange={handleChange}
          required
          autoComplete="name"
          style={styles.input}
        />

        <input
          type="email"
          name="email"
          placeholder="Correo electrónico"
          value={form.email}
          onChange={handleChange}
          required
          autoComplete="email"
          style={styles.input}
        />

        <select
          name="empresa_id"
          value={form.empresa_id}
          onChange={handleChange}
          required
          disabled={loadingEmpresas || empresas.length === 0}
          style={styles.input}
        >
          {loadingEmpresas ? (
            <option value={0}>Cargando empresas...</option>
          ) : empresas.length === 0 ? (
            <option value={0}>No hay empresas disponibles</option>
          ) : (
            <>
              <option value={0}>Seleccione una empresa</option>
              {empresas.map((empresa) => (
                <option key={empresa.id} value={empresa.id}>
                  {empresa.nombre_comercial || empresa.nombre}
                </option>
              ))}
            </>
          )}
        </select>

        <select
          name="rol_id"
          value={form.rol_id}
          onChange={handleChange}
          style={styles.input}
        >
          <option value={1}>Administrador</option>
          <option value={2}>Vendedor</option>
        </select>

        <input
          type="password"
          name="password"
          placeholder="Contraseña"
          value={form.password}
          onChange={handleChange}
          required
          autoComplete="new-password"
          style={styles.input}
        />

        <input
          type="password"
          name="confirmPassword"
          placeholder="Confirmar contraseña"
          value={form.confirmPassword}
          onChange={handleChange}
          required
          autoComplete="new-password"
          style={styles.input}
        />

        <button
          type="submit"
          style={{
            ...styles.button,
            ...(loading || loadingEmpresas ? styles.buttonDisabled : {}),
          }}
          disabled={loading || loadingEmpresas || empresas.length === 0}
        >
          {loading ? "Registrando..." : "Registrarse"}
        </button>

        <p style={styles.linkText}>
          ¿Ya tienes cuenta?{" "}
          <button
            type="button"
            style={styles.link}
            onClick={() => navigate("/login")}
          >
            Inicia sesión
          </button>
        </p>
      </form>
    </div>
  );
};

const styles: Record<string, React.CSSProperties> = {
  container: {
    minHeight: "100vh",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    background: "#f4f6f8",
    padding: "1rem",
  },
  card: {
    width: "100%",
    maxWidth: "380px",
    padding: "2rem",
    borderRadius: "8px",
    background: "#fff",
    boxShadow: "0 10px 25px rgba(0,0,0,0.1)",
  },
  title: {
    textAlign: "center",
    marginBottom: "1.5rem",
  },
  input: {
    width: "100%",
    boxSizing: "border-box",
    padding: "10px",
    marginBottom: "12px",
    borderRadius: "5px",
    border: "1px solid #ccc",
  },
  button: {
    width: "100%",
    padding: "10px",
    borderRadius: "5px",
    border: "none",
    background: "#1976d2",
    color: "#fff",
    fontWeight: 600,
    cursor: "pointer",
  },
  buttonDisabled: {
    opacity: 0.7,
    cursor: "not-allowed",
  },
  error: {
    color: "#dc3545",
    marginBottom: "10px",
    textAlign: "center",
  },
  linkText: {
    marginTop: "1rem",
    textAlign: "center",
    fontSize: "14px",
  },
  link: {
    border: "none",
    background: "none",
    padding: 0,
    color: "#1976d2",
    cursor: "pointer",
    fontWeight: 500,
  },
};
