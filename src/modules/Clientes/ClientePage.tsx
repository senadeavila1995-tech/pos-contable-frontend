import { useEffect, useMemo, useState } from "react";
import type { Cliente } from "../../shared/types/Cliente";
import {
  getClientes,
  createCliente,
  updateCliente,
} from "./cliente.service";
import { ClientsForm } from "./ClienteForm";

export const ClientesPage = () => {
  const [clientes, setClientes] = useState<Cliente[]>([]);
  const [selected, setSelected] = useState<Cliente | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [search, setSearch] = useState("");
  const [currentPage, setCurrentPage] = useState(1);

  const itemsPerPage = 8;

  const fetchClientes = async () => {
    try {
      const res = await getClientes();
      setClientes(res.data);
    } catch (error) {
      console.error("Error al cargar clientes", error);
    }
  };

  useEffect(() => {
    fetchClientes();
  }, []);

  const filteredClientes = useMemo(() => {
    const term = search.toLowerCase().trim();

    if (!term) return clientes;

    return clientes.filter((cliente) => {
      const nombre = cliente.nombre?.toLowerCase() ?? "";
      const documento = (
        cliente.numero_documento ??
        cliente.cc ??
        cliente.documento ??
        ""
      ).toLowerCase();

      const email = cliente.email?.toLowerCase() ?? "";

      return (
        nombre.includes(term) ||
        documento.includes(term) ||
        email.includes(term)
      );
    });
  }, [clientes, search]);

  const totalPages = Math.ceil(
    filteredClientes.length / itemsPerPage
  );

  const paginatedClientes = filteredClientes.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  const handleSearch = (value: string) => {
    setSearch(value);
    setCurrentPage(1);
  };

  const handleSave = async (
    data: Omit<Cliente, "id" | "creado_en">
  ) => {
    try {
      if (selected) {
        await updateCliente(selected.id, data);
      } else {
        await createCliente(data);
      }

      await fetchClientes();

      setShowForm(false);
      setSelected(null);
    } catch (error) {
      console.error("Error al guardar cliente", error);
    }
  };

  const openNewClient = () => {
    setSelected(null);
    setShowForm(true);
  };

  const openEditClient = (cliente: Cliente) => {
    setSelected(cliente);
    setShowForm(true);
  };

  const closeForm = () => {
    setShowForm(false);
    setSelected(null);
  };

  return (
    <div className="container py-4">

      {/* ENCABEZADO */}
      <div className="d-flex justify-content-between align-items-center mb-4">
        <div>
          <h2 className="fw-bold mb-1">Clientes</h2>
          <p className="text-muted mb-0">
            Administra los clientes registrados
          </p>
        </div>

        <button
          className="btn btn-dark"
          onClick={openNewClient}
        >
          + Nuevo cliente
        </button>
      </div>

      {/* BUSCADOR */}
      <div className="card border-0 shadow-sm mb-4">
        <div className="card-body">
          <div className="input-group">

            <span className="input-group-text bg-white">
              🔎
            </span>

            <input
              type="text"
              className="form-control"
              placeholder="Buscar por nombre, documento o email..."
              value={search}
              onChange={(e) => handleSearch(e.target.value)}
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

      {/* TABLA */}
      <div className="card border-0 shadow-sm">

        <div className="card-body p-0">

          <div className="table-responsive">

            <table className="table table-hover align-middle mb-0">

              <thead className="table-light">

                <tr>
                  <th className="ps-4">Nombre</th>
                  <th>Documento</th>
                  <th>Tipo persona</th>
                  <th>Teléfono</th>
                  <th>Email</th>
                  <th className="text-center pe-4">
                    Acciones
                  </th>
                </tr>

              </thead>

              <tbody>

                {paginatedClientes.length === 0 ? (

                  <tr>
                    <td
                      colSpan={6}
                      className="text-center text-muted py-5"
                    >
                      {search
                        ? "No se encontraron clientes."
                        : "No hay clientes registrados."}
                    </td>
                  </tr>

                ) : (

                  paginatedClientes.map((c) => (

                    <tr key={c.id}>

                      <td className="ps-4 fw-semibold">
                        {c.nombre}
                      </td>

                      <td>
                        {c.numero_documento ??
                          c.cc ??
                          c.documento ??
                          "-"}
                      </td>

                      <td>
                        {c.tipo_persona ?? "-"}
                      </td>

                      <td>
                        {c.telefono ?? "-"}
                      </td>

                      <td>
                        {c.email ?? "-"}
                      </td>

                      <td className="text-center pe-4">

                        <button
                          className="btn btn-sm btn-outline-dark"
                          onClick={() =>
                            openEditClient(c)
                          }
                        >
                          Editar
                        </button>

                      </td>

                    </tr>

                  ))

                )}

              </tbody>

            </table>

          </div>

          {/* PAGINACIÓN */}
          {filteredClientes.length > 0 && (

            <div className="d-flex justify-content-between align-items-center p-3 border-top">

              <small className="text-muted">

                Mostrando{" "}
                {Math.min(
                  (currentPage - 1) * itemsPerPage + 1,
                  filteredClientes.length
                )}{" "}
                -{" "}
                {Math.min(
                  currentPage * itemsPerPage,
                  filteredClientes.length
                )}{" "}
                de {filteredClientes.length} clientes

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

      {/* MODAL CLIENTE */}
      {showForm && (

        <div
          className="modal d-block"
          tabIndex={-1}
          role="dialog"
          style={{
            backgroundColor: "rgba(0, 0, 0, 0.55)",
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
                    ? "Editar cliente"
                    : "Nuevo cliente"}
                </h5>

                <button
                  type="button"
                  className="btn-close"
                  onClick={closeForm}
                  aria-label="Cerrar"
                />

              </div>

              <div className="modal-body">

                <ClientsForm
                  client={selected}
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
