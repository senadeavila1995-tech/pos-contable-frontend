import { useState } from "react";
import type { Category } from "../../shared/types/Category";

interface Props {
  onSave: (nombre: string) => Promise<void>;
  onClose: () => void;
  category?: Category | null;
}

export const CategoryForm = ({
  onSave,
  onClose,
  category,
}: Props) => {
  const [nombre, setNombre] = useState(
    category?.nombre ?? ""
  );

  const handleSubmit = async (
    e: React.FormEvent
  ) => {
    e.preventDefault();

    if (!nombre.trim()) {
      return;
    }

    await onSave(nombre.trim());
  };

  return (
    <form onSubmit={handleSubmit}>

      <div className="mb-3">

        <label className="form-label fw-semibold">
          Nombre
        </label>

        <input
          className="form-control"
          value={nombre}
          onChange={(e) =>
            setNombre(e.target.value)
          }
          autoFocus
          required
        />

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
          {category
            ? "Actualizar"
            : "Guardar"}
        </button>

      </div>

    </form>
  );
};
