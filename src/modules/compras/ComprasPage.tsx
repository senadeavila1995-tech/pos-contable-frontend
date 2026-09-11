// src/modules/compras/ComprasPage.tsx
import { useState, useEffect } from "react";
import type { Compra } from "../../shared/types/Compra";
import { getCompras, anularCompra } from "./compras.service";
import { CompraForm } from "./CompraForm";

export const ComprasPage = () => {
  const [compras, setCompras] = useState<Compra[]>([]);
  const [showForm, setShowForm] = useState(false);

  /* ===============================
     BÚSQUEDA Y PAGINACIÓN
  =============================== */
  const [busqueda, setBusqueda] = useState("");
  const [pagina, setPagina] = useState(1);

  const registrosPorPagina = 10;

  const comprasFiltradas = compras.filter((compra) => {
    const texto = [
      compra.id,
      compra.proveedor ?? "",
      compra.proveedor_id,
      compra.numero_factura ?? "",
      compra.fecha_compra,
      compra.estado,
      compra.subtotal,
      compra.impuestos,
      compra.total,
    ]
      .join(" ")
      .toLowerCase();

    return texto.includes(busqueda.toLowerCase());
  });

  const totalPaginas = Math.max(
    1,
    Math.ceil(comprasFiltradas.length / registrosPorPagina)
  );

  const comprasPaginadas = comprasFiltradas.slice(
    (pagina - 1) * registrosPorPagina,
    pagina * registrosPorPagina
  );

  const indiceInicio =
    comprasFiltradas.length === 0
      ? 0
      : (pagina - 1) * registrosPorPagina + 1;

  const indiceFin = Math.min(
    pagina * registrosPorPagina,
    comprasFiltradas.length
  );

  const cambiarBusqueda = (valor: string) => {
    setBusqueda(valor);
    setPagina(1);
  };

  const fetchCompras = async () => {
    try {
      const res = await getCompras();
      setCompras(res.data);
      setPagina(1);
    } catch (error) {
      console.error("Error al cargar compras", error);
    }
  };

  useEffect(() => {
    const load = async () => await fetchCompras();
    load();
  }, []);

  const handleSave = async () => {
    setShowForm(false);
    await fetchCompras();
  };

  const handleAnular = async (id: number) => {
    if (!confirm("¿Anular esta compra?")) return;

    try {
      await anularCompra(id);
      await fetchCompras();
    } catch (error) {
      console.error("Error al anular compra", error);
    }
  };

  return (
    <div className="container-fluid py-2">
      {/* ENCABEZADO */}
      <div className="d-flex flex-wrap justify-content-between align-items-center gap-3 mb-4">
        <div>
          <h1 className="page-title mb-1">Compras</h1>
          <p className="page-subtitle mb-0">
            Registro y gestión de compras realizadas a proveedores.
          </p>
        </div>

        <button
          className="btn btn-dark px-4"
          onClick={() => setShowForm(true)}
        >
          + Nueva compra
        </button>
      </div>

      {/* RESUMEN */}
      <div className="row g-3 mb-4">
        <div className="col-sm-6 col-lg-4">
          <div className="stat-card h-100">
            <div className="stat-label">Compras registradas</div>
            <div className="stat-value">{compras.length}</div>
          </div>
        </div>

        <div className="col-sm-6 col-lg-4">
          <div className="stat-card h-100">
            <div className="stat-label">Compras activas</div>
            <div className="stat-value">
              {compras.filter((c) => c.estado === "REGISTRADA").length}
            </div>
          </div>
        </div>

        <div className="col-sm-6 col-lg-4">
          <div className="stat-card h-100">
            <div className="stat-label">Total registrado</div>
            <div className="stat-value">
              $
              {compras
                .reduce(
                  (total, compra) => total + Number(compra.total || 0),
                  0
                )
                .toLocaleString("es-CO")}
            </div>
          </div>
        </div>
      </div>

      {/* MODAL NUEVA COMPRA */}
      {showForm && (
        <>
          <div
            className="modal d-block"
            tabIndex={-1}
            role="dialog"
            aria-modal="true"
          >
            <div className="modal-dialog modal-xl modal-dialog-centered modal-dialog-scrollable">
              <div className="modal-content border-0 shadow">
                <div className="modal-header">
                  <div>
                    <h5 className="modal-title fw-bold mb-1">
                      Nueva compra
                    </h5>
                  </div>

                  <button
                    type="button"
                    className="btn-close"
                    aria-label="Cerrar"
                    onClick={() => setShowForm(false)}
                  />
                </div>

                <div className="modal-body p-0">
                  <CompraForm
                    compra={null}
                    onSave={handleSave}
                    onClose={() => setShowForm(false)}
                  />
                </div>
              </div>
            </div>
          </div>

          <div
            className="modal-backdrop fade show"
            onClick={() => setShowForm(false)}
          />
        </>
      )}

      {/* HISTORIAL */}
      <div className="section-card">
        <div className="section-card-header d-flex flex-wrap justify-content-between align-items-center gap-2">
          <div>
            <h5 className="fw-bold mb-1">Historial de compras</h5>
            <p className="page-subtitle mb-0">
              Consulta las compras registradas y su estado actual.
            </p>
          </div>

          <span className="badge badge-soft px-3 py-2">
            {compras.length} registro{compras.length === 1 ? "" : "s"}
          </span>
        </div>

        <div className="section-card-body">

          {/* BÚSQUEDA */}
          <div className="row g-3 align-items-end mb-4">
            <div className="col-12 col-md-8">
              <label className="form-label fw-semibold">
                Buscar compra
              </label>

              <div className="input-group">
                <span className="input-group-text">
                  🔎
                </span>

                <input
                  type="text"
                  className="form-control"
                  placeholder="Proveedor, factura, estado, fecha o total..."
                  value={busqueda}
                  onChange={(e) => cambiarBusqueda(e.target.value)}
                />
              </div>
            </div>

            <div className="col-12 col-md-4">
              <div className="text-md-end small text-muted">
                Mostrando{" "}
                <strong>{indiceInicio}</strong>
                {"–"}
                <strong>{indiceFin}</strong>
                {" de "}
                <strong>{comprasFiltradas.length}</strong>
              </div>
            </div>
          </div>

          {/* TABLA */}
          {comprasFiltradas.length === 0 ? (
            <div className="empty-state">
              <div className="fs-2 mb-2">🛒</div>

              <div className="fw-semibold text-dark mb-1">
                {compras.length === 0
                  ? "No hay compras registradas"
                  : "No se encontraron resultados"}
              </div>

              {compras.length > 0 && (
                <div className="small">
                  Intenta con otro término de búsqueda.
                </div>
              )}
            </div>
          ) : (
            <>
              <div className="table-responsive">
                <table className="table table-hover align-middle">
                  <thead className="table-light">
                    <tr>
                      <th className="ps-4">Proveedor</th>
                      <th>Número factura</th>
                      <th>Fecha</th>
                      <th className="text-end">Subtotal</th>
                      <th className="text-end">Impuestos</th>
                      <th className="text-end">Total</th>
                      <th className="text-center">Estado</th>
                      <th
                        className="text-center pe-4"
                        style={{ width: 150 }}
                      >
                        Acciones
                      </th>
                    </tr>
                  </thead>

                  <tbody>
                    {comprasPaginadas.map((c) => (
                      <tr key={c.id}>
                        <td className="ps-4">
                          <div className="fw-semibold">
                            {c.proveedor ?? `Proveedor #${c.proveedor_id}`}
                          </div>

                          <div className="small text-muted">
                            Compra #{c.id}
                          </div>
                        </td>

                        <td>
                          {c.numero_factura || (
                            <span className="text-muted">
                              Sin factura
                            </span>
                          )}
                        </td>

                        <td>{c.fecha_compra}</td>

                        <td className="text-end">
                          ${Number(c.subtotal || 0).toLocaleString("es-CO")}
                        </td>

                        <td className="text-end">
                          ${Number(c.impuestos || 0).toLocaleString("es-CO")}
                        </td>

                        <td className="text-end fw-semibold">
                          ${Number(c.total || 0).toLocaleString("es-CO")}
                        </td>

                        <td className="text-center">
                          <span
                            className={`badge ${
                              c.estado === "REGISTRADA"
                                ? "bg-dark"
                                : "bg-secondary"
                            }`}
                          >
                            {c.estado}
                          </span>
                        </td>

                        <td className="text-center pe-4">
                          {c.estado === "REGISTRADA" ? (
                            <button
                              className="btn btn-sm btn-outline-danger"
                              onClick={() => handleAnular(c.id)}
                            >
                              Anular
                            </button>
                          ) : (
                            <span className="small text-muted">
                              Sin acciones
                            </span>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* PAGINACIÓN */}
              {totalPaginas > 1 && (
                <div className="d-flex flex-wrap justify-content-between align-items-center gap-3 mt-4">

                  <div className="small text-muted">
                    Página <strong>{pagina}</strong> de{" "}
                    <strong>{totalPaginas}</strong>
                  </div>

                  <nav aria-label="Paginación de compras">
                    <ul className="pagination pagination-sm mb-0">

                      <li
                        className={`page-item ${
                          pagina === 1 ? "disabled" : ""
                        }`}
                      >
                        <button
                          type="button"
                          className="page-link"
                          disabled={pagina === 1}
                          onClick={() =>
                            setPagina((actual) =>
                              Math.max(1, actual - 1)
                            )
                          }
                        >
                          Anterior
                        </button>
                      </li>

                      {Array.from(
                        { length: totalPaginas },
                        (_, index) => index + 1
                      ).map((numeroPagina) => (
                        <li
                          key={numeroPagina}
                          className={`page-item ${
                            pagina === numeroPagina ? "active" : ""
                          }`}
                        >
                          <button
                            type="button"
                            className="page-link"
                            onClick={() =>
                              setPagina(numeroPagina)
                            }
                          >
                            {numeroPagina}
                          </button>
                        </li>
                      ))}

                      <li
                        className={`page-item ${
                          pagina === totalPaginas ? "disabled" : ""
                        }`}
                      >
                        <button
                          type="button"
                          className="page-link"
                          disabled={pagina === totalPaginas}
                          onClick={() =>
                            setPagina((actual) =>
                              Math.min(
                                totalPaginas,
                                actual + 1
                              )
                            )
                          }
                        >
                          Siguiente
                        </button>
                      </li>

                    </ul>
                  </nav>
                </div>
              )}
            </>
          )}
        </div>
      </div>

    </div>
  );
};
