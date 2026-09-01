import { useState } from "react";
import type { Category } from "../../shared/types/Category";

interface Props {
  onSave: (nombre: string) => Promise<void>;
  onClose: () => void;
  category?: Category | null;
}

export const CategoryForm = ({ onSave, onClose, category }: Props) => {
  const [nombre, setNombre] = useState(
    category?.nombre ?? ""
  );

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!nombre.trim()) return;

    await onSave(nombre.trim());
    setNombre("");
  };

  return (
    <form className="card shadow-sm" onSubmit={handleSubmit}>
      <div className="card-body">
        <h5 className="fw-bold mb-3">
          {category ? "Editar categoría" : "Nueva categoría"}
        </h5>

        <div className="mb-3">
          <label className="form-label">Nombre</label>
          <input
            className="form-control"
            value={nombre}
            onChange={(e) => setNombre(e.target.value)}
            autoFocus
          />
        </div>

        <div className="d-flex justify-content-end gap-2">
          <button
            type="button"
            className="btn btn-outline-dark"
            onClick={onClose}
          >
            Cancelar
          </button>

          <button type="submit" className="btn btn-dark">
            {category ? "Actualizar" : "Guardar"}
          </button>
        </div>
      </div>
    </form>
  );
};
