import { useState } from "react";
import type { Proveedor } from "../../shared/types/Proveedor";
import {
  createProveedor,
  updateProveedor,
} from "./proveedores.service";

interface Props {
  proveedor: Proveedor | null;
  onSave: () => Promise<void>;
  onClose: () => void;
}

export const ProveedorForm = ({
  proveedor,
  onSave,
  onClose,
}: Props) => {
  const [form, setForm] = useState<
    Omit<
      Proveedor,
      "id" | "id_empresa" | "creado_en" | "actualizado_en"
    >
  >({
    nombre: proveedor?.nombre ?? "",
    documento: proveedor?.documento ?? "",
    telefono: proveedor?.telefono ?? "",
    email: proveedor?.email ?? "",
    direccion: proveedor?.direccion ?? "",
    estado: proveedor?.estado ?? 1,
  });

  const handleChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLSelectElement
    >
  ) => {
    const { name, value } = e.target;

    const numericFields = ["estado"];

    setForm((prev) => ({
      ...prev,
      [name]: numericFields.includes(name)
        ? Number(value)
        : value,
    }));
  };

  const handleSubmit = async (
    e: React.FormEvent
  ) => {
    e.preventDefault();

    try {
      if (proveedor) {
        await updateProveedor(proveedor.id, form);
      } else {
        await createProveedor(form);
      }

      await onSave();
    } catch (error) {
      console.error(
        "Error guardando proveedor",
        error
      );
    }
  };

  return (
    <form onSubmit={handleSubmit}>

      <div className="mb-3">

        <label className="form-label fw-semibold">
          Nombre
        </label>

        <input
          className="form-control"
          name="nombre"
          value={form.nombre}
          onChange={handleChange}
          required
        />

      </div>

      <div className="mb-3">

        <label className="form-label fw-semibold">
          Documento
        </label>

        <input
          className="form-control"
          name="documento"
          value={form.documento}
          onChange={handleChange}
        />

      </div>

      <div className="mb-3">

        <label className="form-label fw-semibold">
          Teléfono
        </label>

        <input
          className="form-control"
          name="telefono"
          value={form.telefono}
          onChange={handleChange}
        />

      </div>

      <div className="mb-3">

        <label className="form-label fw-semibold">
          Email
        </label>

        <input
          type="email"
          className="form-control"
          name="email"
          value={form.email}
          onChange={handleChange}
        />

      </div>

      <div className="mb-3">

        <label className="form-label fw-semibold">
          Dirección
        </label>

        <input
          className="form-control"
          name="direccion"
          value={form.direccion}
          onChange={handleChange}
        />

      </div>

      <div className="mb-3">

        <label className="form-label fw-semibold">
          Estado
        </label>

        <select
          className="form-select"
          name="estado"
          value={form.estado}
          onChange={handleChange}
        >
          <option value={1}>Activo</option>
          <option value={0}>Inactivo</option>
        </select>

      </div>

      <div className="d-flex justify-content-end gap-2 pt-3 border-top mt-3">

        <button
          type="button"
          className="btn btn-outline-secondary"
          onClick={onClose}
        >
          Cancelar
        </button>

        <button
          type="submit"
          className="btn btn-dark"
        >
          {proveedor
            ? "Actualizar proveedor"
            : "Guardar proveedor"}
        </button>

      </div>

    </form>
  );
};
