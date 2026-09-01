import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { loginRequest } from "./auth.service";

export const LoginPage = () => {
  const navigate = useNavigate();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError("");

    try {
      const { token } = await loginRequest({
        email,
        password,
      });

      localStorage.setItem("token", token);

      // 🔴 IMPORTANTE: redirigir a una ruta que SÍ existe
      navigate("/categorias", { replace: true });
    } catch (err) {
      console.error(err);
      setError("Credenciales incorrectas");
    }
  };

  return (
    <div style={styles.container}>
      <div style={styles.card}>
        <form onSubmit={handleSubmit}>
          <h2 style={styles.title}>Login POS</h2>

          <input
            type="email"
            id="email"
            name="email"
            placeholder="Correo electrónico"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            autoComplete="email"
            style={styles.input}
          />

          <input
            type="password"
            id="password"
            name="password"
            placeholder="Contraseña"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            autoComplete="current-password"
            style={styles.input}
          />

          {error && <p style={styles.error}>{error}</p>}

          <button type="submit" style={styles.button}>
            Ingresar
          </button>
        </form>

        <button
          type="button"
          onClick={() => navigate("/register")}
          style={styles.secondaryButton}
        >
          Crear cuenta
        </button>
      </div>
    </div>
  );
};

const styles: Record<string, React.CSSProperties> = {
  container: {
    display: "flex",
    height: "100vh",
    justifyContent: "center",
    alignItems: "center",
    background: "#f4f6f8",
  },
  card: {
    background: "#ffffff",
    padding: "2rem",
    borderRadius: 8,
    width: 320,
    boxShadow: "0 4px 10px rgba(0,0,0,0.1)",
  },
  title: {
    textAlign: "center",
    marginBottom: "1.5rem",
  },
  input: {
    width: "100%",
    marginBottom: 12,
    padding: 10,
    borderRadius: 4,
    border: "1px solid #ccc",
  },
  button: {
    width: "100%",
    padding: 10,
    background: "#0d6efd",
    color: "#fff",
    border: "none",
    borderRadius: 4,
    cursor: "pointer",
    fontWeight: 600,
  },
  secondaryButton: {
    width: "100%",
    marginTop: "1rem",
    padding: 10,
    borderRadius: 4,
    border: "1px solid #1976d2",
    background: "transparent",
    color: "#1976d2",
    fontWeight: 600,
    cursor: "pointer",
  },
  error: {
    color: "red",
    fontSize: 14,
    marginBottom: 10,
    textAlign: "center",
  },
};
