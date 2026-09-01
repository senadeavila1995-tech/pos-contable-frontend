// src/modules/compras/ComprasPage.tsx
import { useState, useEffect } from "react";
import type { Compra } from "../../shared/types/Compra";
import { getCompras, anularCompra } from "./compras.service";
import { CompraForm } from "./CompraForm";

export const ComprasPage = () => {
  const [compras, setCompras] = useState<Compra[]>([]);
  const [showForm, setShowForm] = useState(false);

  const fetchCompras = async () => {
    try {
      const res = await getCompras();
      setCompras(res.data);
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
    <div className="container py-4">
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h2 className="fw-bold mb-0">Compras</h2>
        <button className="btn btn-dark" onClick={() => setShowForm(true)}>
          + Nueva compra
        </button>
      </div>

      {showForm && (
        <div className="mb-4">
          <CompraForm
            compra={null}
            onSave={handleSave}
            onClose={() => setShowForm(false)}
          />
        </div>
      )}

      <div className="table-responsive">
        <table className="table table-bordered table-hover align-middle">
          <thead className="table-light">
            <tr>
              <th>Proveedor</th>
              <th>Número factura</th>
              <th>Fecha</th>
              <th>Subtotal</th>
              <th>Impuestos</th>
              <th>Total</th>
              <th>Estado</th>
              <th className="text-center" style={{ width: 160 }}>Acciones</th>
            </tr>
          </thead>
          <tbody>
            {compras.length === 0 ? (
              <tr>
                <td colSpan={8} className="text-center text-muted py-4">No hay compras registradas</td>
              </tr>
            ) : (
              compras.map(c => (
                <tr key={c.id}>
                  <td>{c.proveedor ?? c.proveedor_id}</td>
                  <td>{c.numero_factura}</td>
                  <td>{c.fecha_compra}</td>
                  <td>${c.subtotal}</td>
                  <td>${c.impuestos}</td>
                  <td>${c.total}</td>
                  <td className="text-center">
                    <span className={`badge ${c.estado === "REGISTRADA" ? "bg-dark" : "bg-secondary"}`}>
                      {c.estado}
                    </span>
                  </td>
                  <td className="text-center">
                    {c.estado === "REGISTRADA" && (
                      <button
                        className="btn btn-sm btn-outline-danger"
                        onClick={() => handleAnular(c.id)}
                      >
                        Anular
                      </button>
                    )}
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
