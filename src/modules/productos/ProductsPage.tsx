import { useEffect, useState } from "react";
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

  const fetchProducts = async () => {
    try {
      const res = await getProducts();
      setProducts(res.data);
    } catch (error) {
      console.error("Error al cargar productos", error);
    }
  };

 useEffect(() => {
  const loadProducts = async () => {
    try {
      const res = await getProducts();
      setProducts(res.data);
    } catch (error) {
      console.error("Error al cargar productos", error);
    }
  };

  loadProducts();
}, []);


  const handleSave = async (
    data: Omit<Product, "id" | "creado_en" | "actualizado_en">
  ) => {
    try {
      if (selected) {
        await updateProduct(selected.id, data);
      } else {
        await createProduct(data);
      }

      setShowForm(false);
      setSelected(null);
      fetchProducts();
    } catch (error) {
      console.error("Error al guardar producto", error);
    }
  };

  const handleDelete = async (id: number) => {
    if (!confirm("¿Eliminar producto?")) return;

    try {
      await deleteProduct(id);
      fetchProducts();
    } catch (error) {
      console.error("Error al eliminar producto", error);
    }
  };

  return (
    <div className="container py-4">
      {/* Header */}
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h2 className="fw-bold mb-0">Productos</h2>
        <button
          className="btn btn-dark"
          onClick={() => {
            setSelected(null);
            setShowForm(true);
          }}
        >
          + Nuevo producto
        </button>
      </div>

      {/* Formulario */}
      {showForm && (
        <div className="mb-4">
          <ProductsForm
            product={selected}
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
              <th className="text-end">Precio</th>
              <th className="text-center">Stock</th>
              <th className="text-center">Estado</th>
              <th className="text-center" style={{ width: 160 }}>
                Acciones
              </th>
            </tr>
          </thead>

          <tbody>
            {products.length === 0 ? (
              <tr>
                <td colSpan={5} className="text-center text-muted py-4">
                  No hay productos registrados
                </td>
              </tr>
            ) : (
              products.map((p) => (
                <tr key={p.id}>
                  <td>{p.nombre}</td>
                  <td className="text-end">${p.precio}</td>
                  <td className="text-center">{p.stock_unidades}</td>
                  <td className="text-center">
                    <span
                      className={`badge ${
                        p.estado ? "bg-dark" : "bg-secondary"
                      }`}
                    >
                      {p.estado ? "Activo" : "Inactivo"}
                    </span>
                  </td>
                  <td className="text-center">
                    <div className="btn-group btn-group-sm">
                      <button
                        className="btn btn-outline-dark"
                        onClick={() => {
                          setSelected(p);
                          setShowForm(true);
                        }}
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
    </div>
  );
};
