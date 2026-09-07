import { useEffect, useMemo, useState } from "react";
import type { Proveedor } from "../../shared/types/Proveedor";
import {
  getProveedores,
  deleteProveedor,
} from "./proveedores.service";
import { ProveedorForm } from "./ProveedorForm";

export const ProveedoresPage = () => {
  const [proveedores, setProveedores] = useState<Proveedor[]>([]);
  const [selected, setSelected] = useState<Proveedor | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [search, setSearch] = useState("");
  const [currentPage, setCurrentPage] = useState(1);

  const itemsPerPage = 8;

  const fetchProveedores = async () => {
    try {
      const res = await getProveedores();
      setProveedores(res.data);
    } catch (error) {
      console.error("Error al cargar proveedores", error);
    }
  };

  useEffect(() => {
    fetchProveedores();
  }, []);

  const filteredProveedores = useMemo(() => {
    const term = search.toLowerCase().trim();

    if (!term) return proveedores;

    return proveedores.filter((proveedor) => {
      const nombre = proveedor.nombre?.toLowerCase() ?? "";
      const documento = proveedor.documento?.toLowerCase() ?? "";
      const telefono = proveedor.telefono?.toLowerCase() ?? "";
      const email = proveedor.email?.toLowerCase() ?? "";

      return (
        nombre.includes(term) ||
        documento.includes(term) ||
        telefono.includes(term) ||
        email.includes(term)
      );
    });
  }, [proveedores, search]);

  const totalPages = Math.ceil(
    filteredProveedores.length / itemsPerPage
  );

  const paginatedProveedores = filteredProveedores.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  const handleSearch = (value: string) => {
    setSearch(value);
    setCurrentPage(1);
  };

  const handleSave = async () => {
    await fetchProveedores();
    setShowForm(false);
    setSelected(null);
  };

  const handleDelete = async (id: number) => {
    if (!confirm("¿Eliminar proveedor?")) return;

    try {
      await deleteProveedor(id);
      await fetchProveedores();

      if (
        currentPage > 1 &&
        paginatedProveedores.length === 1
      ) {
        setCurrentPage((page) => Math.max(1, page - 1));
      }
    } catch (error) {
      console.error("Error al eliminar proveedor", error);
    }
  };

  const openNew = () => {
    setSelected(null);
    setShowForm(true);
  };

  const openEdit = (proveedor: Proveedor) => {
    setSelected(proveedor);
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
          <h2 className="fw-bold mb-1">Proveedores</h2>
          <p className="text-muted mb-0">
            Administra los proveedores registrados
          </p>
        </div>

        <button
          className="btn btn-dark"
          onClick={openNew}
        >
          + Nuevo proveedor
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
              placeholder="Buscar por nombre, documento, teléfono o email..."
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
                  <th>Documento</th>
                  <th>Teléfono</th>
                  <th>Email</th>
                  <th>Dirección</th>
                  <th className="text-center">Estado</th>
                  <th
                    className="text-center pe-4"
                    style={{ width: 180 }}
                  >
                    Acciones
                  </th>
                </tr>

              </thead>

              <tbody>

                {paginatedProveedores.length === 0 ? (

                  <tr>
                    <td
                      colSpan={7}
                      className="text-center text-muted py-5"
                    >
                      {search
                        ? "No se encontraron proveedores."
                        : "No hay proveedores registrados."}
                    </td>
                  </tr>

                ) : (

                  paginatedProveedores.map((p) => (

                    <tr key={p.id}>

                      <td className="ps-4 fw-semibold">
                        {p.nombre}
                      </td>

                      <td>
                        {p.documento || "-"}
                      </td>

                      <td>
                        {p.telefono || "-"}
                      </td>

                      <td>
                        {p.email || "-"}
                      </td>

                      <td>
                        {p.direccion || "-"}
                      </td>

                      <td className="text-center">

                        <span
                          className={`badge ${
                            p.estado
                              ? "bg-dark"
                              : "bg-secondary"
                          }`}
                        >
                          {p.estado
                            ? "Activo"
                            : "Inactivo"}
                        </span>

                      </td>

                      <td className="text-center pe-4">

                        <div className="btn-group btn-group-sm">

                          <button
                            className="btn btn-outline-dark"
                            onClick={() =>
                              openEdit(p)
                            }
                          >
                            Editar
                          </button>

                          <button
                            className="btn btn-outline-danger"
                            onClick={() =>
                              handleDelete(p.id)
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

          {filteredProveedores.length > 0 && (

            <div className="d-flex justify-content-between align-items-center p-3 border-top">

              <small className="text-muted">

                Mostrando{" "}
                {Math.min(
                  (currentPage - 1) *
                    itemsPerPage +
                    1,
                  filteredProveedores.length
                )}{" "}
                -{" "}
                {Math.min(
                  currentPage * itemsPerPage,
                  filteredProveedores.length
                )}{" "}
                de {filteredProveedores.length} proveedores

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
            className="modal-dialog modal-dialog-centered modal-lg modal-dialog-scrollable"
            role="document"
          >

            <div className="modal-content border-0 shadow">

              <div className="modal-header">

                <h5 className="modal-title fw-bold">
                  {selected
                    ? "Editar proveedor"
                    : "Nuevo proveedor"}
                </h5>

                <button
                  type="button"
                  className="btn-close"
                  onClick={closeForm}
                  aria-label="Cerrar"
                />

              </div>

              <div className="modal-body">

                <ProveedorForm
                  key={selected?.id ?? "nuevo"}
                  proveedor={selected}
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
