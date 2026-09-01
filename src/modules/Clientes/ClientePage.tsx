import { useEffect, useState } from "react";
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

  /* ===============================
     CARGAR CLIENTES
     =============================== */
  const fetchClientes = async () => {
    try {
      const res = await getClientes();
      setClientes(res.data);
    } catch (error) {
      console.error("Error al cargar clientes", error);
    }
  };

  useEffect(() => {
    const loadClientes = async () => {
      await fetchClientes();
    };
    loadClientes();
  }, []);

  /* ===============================
     GUARDAR (CREAR / EDITAR)
     =============================== */
 const handleSave = async (
  data: Omit<Cliente, "id" | "creado_en">
) => {
  try {
    if (selected) {
      await updateCliente(selected.id, data);
    } else {
      await createCliente(data);
    }

    setShowForm(false);
    setSelected(null);
    await fetchClientes();
  } catch (error) {
    console.error("Error al guardar cliente", error);
  }
};

  /* ===============================
     ELIMINAR
     =============================== */

  return (
    <div className="container py-4">
      {/* Header */}
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h2 className="fw-bold mb-0">Clientes</h2>

        <button
          className="btn btn-dark"
          onClick={() => {
            setSelected(null);
            setShowForm(true);
          }}
        >
          + Nuevo cliente
        </button>
      </div>

      {/* Formulario */}
      {showForm && (
        <div className="mb-4">
          <ClientsForm
            client={selected}
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
              <th>Tipo persona</th>
              <th>Teléfono</th>
              <th>Email</th>
              <th className="text-center">Acciones</th>
             
            </tr>
          </thead>

          <tbody>
            {clientes.length === 0 ? (
              <tr>
                <td colSpan={6} className="text-center text-muted py-4">
                  No hay clientes registrados
                </td>
              </tr>
            ) : (
              clientes.map((c) => (
                <tr key={c.id}>
                  <td>{c.nombre}</td>
                  <td>{c.numero_documento ?? c.cc ?? c.documento ?? "-"}</td>
                  <td>{c.tipo_persona ?? "-"}</td>
                  <td>{c.telefono ?? "-"}</td>
                  <td>{c.email ?? "-"}</td>
                  <td className="text-center">
                    <button
                      className="btn btn-sm btn-outline-dark"
                      onClick={() => {
                        setSelected(c);
                        setShowForm(true);
                      }}
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
    </div>
  );
};
