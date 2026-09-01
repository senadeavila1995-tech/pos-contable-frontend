import { useEffect, useState } from "react";
import {
  getCategories,
  createCategory,
  updateCategory,
  deleteCategory,
} from "./category.service";
import type { Category } from "../../shared/types/Category";
import { CategoryForm } from "./CategoryForm";

export const CategoriesPage = () => {
  const [categories, setCategories] = useState<Category[]>([]);
  const [selected, setSelected] = useState<Category | null>(null);
  const [showForm, setShowForm] = useState(false);

  const fetchCategories = async () => {
    try {
      const res = await getCategories();
      setCategories(res.data);
    } catch (error) {
      console.error("Error al cargar categorías", error);
    }
  };

useEffect(() => {
  const loadCategories = async () => {
    try {
      const res = await getCategories();
      setCategories(res.data);
    } catch (error) {
      console.error("Error al cargar categorías", error);
    }
  };

  loadCategories();
}, []);


  const handleSave = async (nombre: string) => {
    try {
      if (selected) {
        await updateCategory(selected.id, { nombre });
      } else {
        await createCategory({ nombre });
      }

      setShowForm(false);
      setSelected(null);
      fetchCategories();
    } catch (error) {
      console.error("Error al guardar categoría", error);
    }
  };

  const handleDelete = async (id: number) => {
    if (!confirm("¿Eliminar categoría?")) return;

    try {
      await deleteCategory(id);
      fetchCategories();
    } catch (error) {
      console.error("Error al eliminar categoría", error);
    }
  };

  return (
    <div className="container py-4">
      {/* Header */}
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h2 className="fw-bold mb-0">Categorías</h2>
        <button
          className="btn btn-dark"
          onClick={() => {
            setSelected(null);
            setShowForm(true);
          }}
        >
          + Nueva categoría
        </button>
      </div>

      {/* Formulario */}
      {showForm && (
        <div className="mb-4">
          <CategoryForm
            category={selected}
            onSave={handleSave}
            onClose={() => {
              setShowForm(false);
              setSelected(null);
            }}
          />
        </div>
      )}

      {/* Tabla */}
      <div className="table-responsive">
        <table className="table table-bordered table-hover align-middle">
          <thead className="table-light">
            <tr>
              <th>Nombre</th>
              <th className="text-center">Estado</th>
              <th className="text-center">Creado</th>
              <th className="text-center">Actualizado</th>
              <th className="text-center" style={{ width: 160 }}>
                Acciones
              </th>
            </tr>
          </thead>

          <tbody>
            {categories.length === 0 ? (
              <tr>
                <td colSpan={5} className="text-center text-muted py-4">
                  No hay categorías registradas
                </td>
              </tr>
            ) : (
              categories.map((cat) => (
                <tr key={cat.id}>
                  <td>{cat.nombre}</td>
                  <td className="text-center">
                    <span
                      className={`badge ${
                        cat.estado ? "bg-dark" : "bg-secondary"
                      }`}
                    >
                      {cat.estado ? "Activa" : "Inactiva"}
                    </span>
                  </td>
                  <td className="text-center">
                    {new Date(cat.creado_en).toLocaleDateString()}
                  </td>
                  <td className="text-center">
                    {new Date(cat.actualizado_en).toLocaleDateString()}
                  </td>
                  <td className="text-center">
                    <div className="btn-group btn-group-sm">
                      <button
                        className="btn btn-outline-dark"
                        onClick={() => {
                          setSelected(cat);
                          setShowForm(true);
                        }}
                      >
                        Editar
                      </button>
                      <button
                        className="btn btn-outline-danger"
                        onClick={() => handleDelete(cat.id)}
                      >
                        Eliminar
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};
