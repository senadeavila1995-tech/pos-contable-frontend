import { useEffect, useMemo, useState } from "react";
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
  const [search, setSearch] = useState("");
  const [currentPage, setCurrentPage] = useState(1);

  const itemsPerPage = 8;

  const fetchCategories = async () => {
    try {
      const res = await getCategories();
      setCategories(res.data);
    } catch (error) {
      console.error("Error al cargar categorías", error);
    }
  };

  useEffect(() => {
    fetchCategories();
  }, []);

  const filteredCategories = useMemo(() => {
    const term = search.toLowerCase().trim();

    if (!term) return categories;

    return categories.filter((category) =>
      category.nombre?.toLowerCase().includes(term)
    );
  }, [categories, search]);

  const totalPages = Math.ceil(
    filteredCategories.length / itemsPerPage
  );

  const paginatedCategories = filteredCategories.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  const handleSearch = (value: string) => {
    setSearch(value);
    setCurrentPage(1);
  };

  const handleSave = async (nombre: string) => {
    try {
      if (selected) {
        await updateCategory(selected.id, { nombre });
      } else {
        await createCategory({ nombre });
      }

      await fetchCategories();
      setShowForm(false);
      setSelected(null);
    } catch (error) {
      console.error("Error al guardar categoría", error);
    }
  };

  const handleDelete = async (id: number) => {
    if (!confirm("¿Eliminar categoría?")) return;

    try {
      await deleteCategory(id);
      await fetchCategories();

      if (
        currentPage > 1 &&
        paginatedCategories.length === 1
      ) {
        setCurrentPage((page) => Math.max(1, page - 1));
      }
    } catch (error) {
      console.error("Error al eliminar categoría", error);
    }
  };

  const openNew = () => {
    setSelected(null);
    setShowForm(true);
  };

  const openEdit = (category: Category) => {
    setSelected(category);
    setShowForm(true);
  };

  const closeForm = () => {
    setShowForm(false);
    setSelected(null);
  };

  return (
    <div className="container py-4">

      <div className="d-flex justify-content-between align-items-center mb-4">
        <div>
          <h2 className="fw-bold mb-1">Categorías</h2>
          <p className="text-muted mb-0">
            Administra las categorías de productos
          </p>
        </div>

        <button
          className="btn btn-dark"
          onClick={openNew}
        >
          + Nueva categoría
        </button>
      </div>

      <div className="card border-0 shadow-sm mb-4">
        <div className="card-body">

          <div className="input-group">

            <span className="input-group-text bg-white">
              🔎
            </span>

            <input
              type="text"
              className="form-control"
              placeholder="Buscar categoría..."
              value={search}
              onChange={(e) =>
                handleSearch(e.target.value)
              }
            />

            {search && (
              <button
                type="button"
                className="btn btn-outline-secondary"
                onClick={() => handleSearch("")}
              >
                Limpiar
              </button>
            )}

          </div>

        </div>
      </div>

      <div className="card border-0 shadow-sm">

        <div className="card-body p-0">

          <div className="table-responsive">

            <table className="table table-hover align-middle mb-0">

              <thead className="table-light">

                <tr>
                  <th className="ps-4">Nombre</th>
                  <th className="text-center">Estado</th>
                  <th className="text-center">Creado</th>
                  <th className="text-center">Actualizado</th>
                  <th
                    className="text-center pe-4"
                    style={{ width: 180 }}
                  >
                    Acciones
                  </th>
                </tr>

              </thead>

              <tbody>

                {paginatedCategories.length === 0 ? (

                  <tr>
                    <td
                      colSpan={5}
                      className="text-center text-muted py-5"
                    >
                      {search
                        ? "No se encontraron categorías."
                        : "No hay categorías registradas."}
                    </td>
                  </tr>

                ) : (

                  paginatedCategories.map((cat) => (

                    <tr key={cat.id}>

                      <td className="ps-4 fw-semibold">
                        {cat.nombre}
                      </td>

                      <td className="text-center">

                        <span
                          className={`badge ${
                            cat.estado
                              ? "bg-dark"
                              : "bg-secondary"
                          }`}
                        >
                          {cat.estado
                            ? "Activa"
                            : "Inactiva"}
                        </span>

                      </td>

                      <td className="text-center">
                        {new Date(
                          cat.creado_en
                        ).toLocaleDateString()}
                      </td>

                      <td className="text-center">
                        {new Date(
                          cat.actualizado_en
                        ).toLocaleDateString()}
                      </td>

                      <td className="text-center pe-4">

                        <div className="btn-group btn-group-sm">

                          <button
                            className="btn btn-outline-dark"
                            onClick={() =>
                              openEdit(cat)
                            }
                          >
                            Editar
                          </button>

                          <button
                            className="btn btn-outline-danger"
                            onClick={() =>
                              handleDelete(cat.id)
                            }
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

          {filteredCategories.length > 0 && (

            <div className="d-flex justify-content-between align-items-center p-3 border-top">

              <small className="text-muted">

                Mostrando{" "}
                {Math.min(
                  (currentPage - 1) *
                    itemsPerPage +
                    1,
                  filteredCategories.length
                )}{" "}
                -{" "}
                {Math.min(
                  currentPage * itemsPerPage,
                  filteredCategories.length
                )}{" "}
                de {filteredCategories.length} categorías

              </small>

              {totalPages > 1 && (

                <nav>

                  <ul className="pagination pagination-sm mb-0">

                    <li
                      className={`page-item ${
                        currentPage === 1
                          ? "disabled"
                          : ""
                      }`}
                    >

                      <button
                        className="page-link"
                        onClick={() =>
                          setCurrentPage((page) =>
                            Math.max(1, page - 1)
                          )
                        }
                      >
                        Anterior
                      </button>

                    </li>

                    {Array.from(
                      { length: totalPages },
                      (_, index) => index + 1
                    ).map((page) => (

                      <li
                        key={page}
                        className={`page-item ${
                          currentPage === page
                            ? "active"
                            : ""
                        }`}
                      >

                        <button
                          className="page-link"
                          onClick={() =>
                            setCurrentPage(page)
                          }
                        >
                          {page}
                        </button>

                      </li>

                    ))}

                    <li
                      className={`page-item ${
                        currentPage === totalPages
                          ? "disabled"
                          : ""
                      }`}
                    >

                      <button
                        className="page-link"
                        onClick={() =>
                          setCurrentPage((page) =>
                            Math.min(
                              totalPages,
                              page + 1
                            )
                          )
                        }
                      >
                        Siguiente
                      </button>

                    </li>

                  </ul>

                </nav>

              )}

            </div>

          )}

        </div>

      </div>

      {showForm && (

        <div
          className="modal d-block"
          tabIndex={-1}
          role="dialog"
          style={{
            backgroundColor:
              "rgba(0, 0, 0, 0.55)",
          }}
        >

          <div
            className="modal-dialog modal-dialog-centered"
            role="document"
          >

            <div className="modal-content border-0 shadow">

              <div className="modal-header">

                <h5 className="modal-title fw-bold">
                  {selected
                    ? "Editar categoría"
                    : "Nueva categoría"}
                </h5>

                <button
                  type="button"
                  className="btn-close"
                  onClick={closeForm}
                  aria-label="Cerrar"
                />

              </div>

              <div className="modal-body">

                <CategoryForm
                  key={selected?.id ?? "nuevo"}
                  category={selected}
                  onSave={handleSave}
                  onClose={closeForm}
                />

              </div>

            </div>

          </div>

        </div>

      )}

    </div>
  );
};
