import { useState } from "react";
import type { Proveedor } from "../../shared/types/Proveedor";
import { createProveedor, updateProveedor } from "./proveedores.service";

interface Props {
  proveedor: Proveedor | null;
  onSave: () => Promise<void>;
  onClose: () => void;
}

export const ProveedorForm = ({ proveedor, onSave, onClose }: Props) => {
  const [form, setForm] = useState<Omit<Proveedor, "id" | "id_empresa" | "creado_en" | "actualizado_en">>({
    nombre: proveedor?.nombre ?? "",
    documento: proveedor?.documento ?? "",
    telefono: proveedor?.telefono ?? "",
    email: proveedor?.email ?? "",
    direccion: proveedor?.direccion ?? "",
    estado: proveedor?.estado ?? 1,
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    const numericFields = ["estado"];
    setForm(prev => ({
      ...prev,
      [name]: numericFields.includes(name) ? Number(value) : value,
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (proveedor) {
        await updateProveedor(proveedor.id, form);
      } else {
        await createProveedor(form);
      }
      await onSave();
      onClose();
    } catch (error) {
      console.error("Error guardando proveedor", error);
    }
  };

  return (
    <form
      onSubmit={handleSubmit}
      className="container p-4 border rounded bg-white"
      style={{ maxWidth: 600 }}
    >
      <h5 className="mb-4 text-center fw-bold">
        {proveedor ? "Editar Proveedor" : "Nuevo Proveedor"}
      </h5>

      <div className="mb-3">
        <label className="form-label">Nombre</label>
        <input
          className="form-control"
          name="nombre"
          value={form.nombre}
          onChange={handleChange}
          required
        />
      </div>

      <div className="mb-3">
        <label className="form-label">Documento</label>
        <input
          className="form-control"
          name="documento"
          value={form.documento}
          onChange={handleChange}
        />
      </div>

      <div className="mb-3">
        <label className="form-label">Teléfono</label>
        <input
          className="form-control"
          name="telefono"
          value={form.telefono}
          onChange={handleChange}
        />
      </div>

      <div className="mb-3">
        <label className="form-label">Email</label>
        <input
          type="email"
          className="form-control"
          name="email"
          value={form.email}
          onChange={handleChange}
        />
      </div>

      <div className="mb-3">
        <label className="form-label">Dirección</label>
        <input
          className="form-control"
          name="direccion"
          value={form.direccion}
          onChange={handleChange}
        />
      </div>

      <div className="d-flex justify-content-end gap-2 mt-4">
        <button type="button" className="btn btn-outline-dark" onClick={onClose}>
          Cancelar
        </button>
        <button type="submit" className="btn btn-dark">
          Guardar
        </button>
      </div>
    </form>
  );
};
