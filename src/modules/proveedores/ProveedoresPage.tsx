import { useState, useEffect } from "react";
import type { Proveedor } from "../../shared/types/Proveedor";
import {
  getProveedores,
  deleteProveedor
} from "./proveedores.service";
import { ProveedorForm } from "./ProveedorForm";

export const ProveedoresPage = () => {
  const [proveedores, setProveedores] = useState<Proveedor[]>([]);
  const [selected, setSelected] = useState<Proveedor | null>(null);
  const [showForm, setShowForm] = useState(false);

  // Función para cargar proveedores
  const fetchProveedores = async () => {
    try {
      const res = await getProveedores();
      setProveedores(res.data);
    } catch (error) {
      console.error("Error al cargar proveedores", error);
    }
  };

  // useEffect corregido: función asíncrona interna
  useEffect(() => {
    const load = async () => {
      await fetchProveedores();
    };
    load();
  }, []);

  // Después de guardar, refresca la lista y cierra form
  const handleSave = async () => {
    setShowForm(false);
    setSelected(null);
    await fetchProveedores();
  };

  const handleDelete = async (id: number) => {
    if (!confirm("¿Eliminar proveedor?")) return;
    try {
      await deleteProveedor(id);
      await fetchProveedores();
    } catch (error) {
      console.error("Error al eliminar proveedor", error);
    }
  };

  return (
    <div className="container py-4">
      {/* Header */}
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h2 className="fw-bold mb-0">Proveedores</h2>
        <button
          className="btn btn-dark"
          onClick={() => {
            setSelected(null);
            setShowForm(true);
          }}
        >
          + Nuevo proveedor
        </button>
      </div>

      {/* Formulario */}
      {showForm && (
        <div className="mb-4">
          <ProveedorForm
            key={selected?.id ?? "nuevo"} // clave para reiniciar estado sin usar useEffect
            proveedor={selected}
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
              <th>Documento</th>
              <th>Teléfono</th>
              <th>Email</th>
              <th>Dirección</th>
              <th className="text-center">Estado</th>
              <th className="text-center" style={{ width: 160 }}>
                Acciones
              </th>
            </tr>
          </thead>
          <tbody>
            {proveedores.length === 0 ? (
              <tr>
                <td colSpan={7} className="text-center text-muted py-4">
                  No hay proveedores registrados
                </td>
              </tr>
            ) : (
              proveedores.map(p => (
                <tr key={p.id}>
                  <td>{p.nombre}</td>
                  <td>{p.documento}</td>
                  <td>{p.telefono}</td>
                  <td>{p.email}</td>
                  <td>{p.direccion}</td>
                  <td className="text-center">
                    <span className={`badge ${p.estado ? "bg-dark" : "bg-secondary"}`}>
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
