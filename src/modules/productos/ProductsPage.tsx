import { useEffect, useMemo, useState } from "react";
import type { Product } from "../../shared/types/Product";
import {
  getProducts,
  createProduct,
  updateProduct,
  deleteProduct,
} from "./Product.service";
import { ProductsForm } from "./ProductsForm";

export const ProductsPage = () => {
  const [products, setProducts] = useState<Product[]>([]);
  const [selected, setSelected] = useState<Product | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [search, setSearch] = useState("");
  const [currentPage, setCurrentPage] = useState(1);

  const itemsPerPage = 8;

  const fetchProducts = async () => {
    try {
      const res = await getProducts();
      setProducts(res.data);
    } catch (error) {
      console.error("Error al cargar productos", error);
    }
  };

  useEffect(() => {
    fetchProducts();
  }, []);

  const filteredProducts = useMemo(() => {
    const term = search.toLowerCase().trim();

    if (!term) return products;

    return products.filter(
      (product) =>
        product.nombre.toLowerCase().includes(term) ||
        product.codigo?.toLowerCase().includes(term)
    );
  }, [products, search]);

  const totalPages = Math.ceil(filteredProducts.length / itemsPerPage);

  const paginatedProducts = filteredProducts.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  const handleSearch = (value: string) => {
    setSearch(value);
    setCurrentPage(1);
  };

  const handleSave = async (
    data: Omit<Product, "id" | "creado_en" | "actualizado_en">
  ) => {
    try {
      if (selected) {
        await updateProduct(selected.id, data);
      } else {
        await createProduct(data);
      }

      await fetchProducts();
      setShowForm(false);
      setSelected(null);
    } catch (error) {
      console.error("Error al guardar producto", error);
    }
  };

  const handleDelete = async (id: number) => {
    if (!confirm("¿Eliminar producto?")) return;

    try {
      await deleteProduct(id);
      await fetchProducts();
    } catch (error) {
      console.error("Error al eliminar producto", error);
    }
  };

  const openNewProduct = () => {
    setSelected(null);
    setShowForm(true);
  };

  const openEditProduct = (product: Product) => {
    setSelected(product);
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
          <h2 className="fw-bold mb-1">Productos</h2>
          <p className="text-muted mb-0">
            Administra el inventario de productos
          </p>
        </div>

        <button className="btn btn-dark" onClick={openNewProduct}>
          + Nuevo producto
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
              placeholder="Buscar por nombre o código..."
              value={search}
              onChange={(e) => handleSearch(e.target.value)}
            />

            {search && (
              <button
                className="btn btn-outline-secondary"
                type="button"
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
                  <th>Código</th>
                  <th className="text-end">Precio</th>
                  <th className="text-center">Stock</th>
                  <th className="text-center">Estado</th>
                  <th className="text-center pe-4">Acciones</th>
                </tr>
              </thead>

              <tbody>
                {paginatedProducts.length === 0 ? (
                  <tr>
                    <td
                      colSpan={6}
                      className="text-center text-muted py-5"
                    >
                      {search
                        ? "No se encontraron productos."
                        : "No hay productos registrados."}
                    </td>
                  </tr>
                ) : (
                  paginatedProducts.map((p) => (
                    <tr key={p.id}>
                      <td className="ps-4 fw-semibold">
                        {p.nombre}
                      </td>

                      <td>
                        {p.codigo || (
                          <span className="text-muted">
                            Sin código
                          </span>
                        )}
                      </td>

                      <td className="text-end">
                        ${Number(p.precio).toLocaleString("es-CO")}
                      </td>

                      <td className="text-center">
                        {p.stock_unidades}
                      </td>

                      <td className="text-center">
                        <span
                          className={`badge ${
                            p.estado
                              ? "bg-dark"
                              : "bg-secondary"
                          }`}
                        >
                          {p.estado ? "Activo" : "Inactivo"}
                        </span>
                      </td>

                      <td className="text-center pe-4">
                        <div className="btn-group btn-group-sm">

                          <button
                            className="btn btn-outline-dark"
                            onClick={() => openEditProduct(p)}
                          >
                            Editar
                          </button>

                          <button
                            className="btn btn-outline-danger"
                            onClick={() => handleDelete(p.id)}
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

          {filteredProducts.length > 0 && (
            <div className="d-flex justify-content-between align-items-center p-3 border-top">

              <small className="text-muted">
                Mostrando{" "}
                {Math.min(
                  (currentPage - 1) * itemsPerPage + 1,
                  filteredProducts.length
                )}{" "}
                -{" "}
                {Math.min(
                  currentPage * itemsPerPage,
                  filteredProducts.length
                )}{" "}
                de {filteredProducts.length} productos
              </small>

              {totalPages > 1 && (
                <nav>
                  <ul className="pagination pagination-sm mb-0">

                    <li
                      className={`page-item ${
                        currentPage === 1 ? "disabled" : ""
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
                          currentPage === page ? "active" : ""
                        }`}
                      >
                        <button
                          className="page-link"
                          onClick={() => setCurrentPage(page)}
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
                            Math.min(totalPages, page + 1)
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
                    ? "Editar producto"
                    : "Nuevo producto"}
                </h5>

                <button
                  type="button"
                  className="btn-close"
                  onClick={closeForm}
                  aria-label="Cerrar"
                />
              </div>

              <div className="modal-body">
                <ProductsForm
                  product={selected}
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
