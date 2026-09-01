import { useEffect, useState } from "react";
import CajaForm from "./CajaForm";
import {
  abrirCaja,
  cerrarCaja,
  getCajaActual,
} from "./caja.service";
import type { Caja, CierreCajaResponse } from "../../shared/types/Caja";

const money = (value: number | string | null | undefined) =>
  Number(value ?? 0).toLocaleString("es-CO", {
    style: "currency",
    currency: "COP",
  });

const CajaPage = () => {
  const [caja, setCaja] = useState<Caja | null>(null);
  const [ultimoCierre, setUltimoCierre] = useState<CierreCajaResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const cargarCaja = async () => {
    try {
      setError("");
      const res = await getCajaActual();
      setCaja(res.data);
    } catch (err) {
      console.error(err);
      setCaja(null);
      setError("No se pudo obtener la caja actual");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    cargarCaja();
  }, []);

  const handleAbrir = async (data: { monto_inicial?: number }) => {
    try {
      setError("");
      await abrirCaja({ monto_inicial: Number(data.monto_inicial ?? 0) });
      await cargarCaja();
    } catch (err: any) {
      setError(err.response?.data?.message ?? "No se pudo abrir la caja");
    }
  };

  const handleCerrar = async (data: { monto_final_real?: number }) => {
    if (!caja) return;

    try {
      setError("");

      const res = await cerrarCaja({
        caja_id: caja.id,
        monto_final_real: Number(data.monto_final_real ?? 0),
      });

      setUltimoCierre(res.data.caja);
      setCaja(null);
      await cargarCaja();
    } catch (err: any) {
      setError(err.response?.data?.message ?? "No se pudo cerrar la caja");
    }
  };

  if (loading) {
    return <div className="container py-4">Cargando caja...</div>;
  }

  return (
    <div className="container py-4">
      <h2 className="fw-bold mb-4">Caja</h2>

      {error && <div className="alert alert-danger">{error}</div>}

      {caja ? (
        <div className="card shadow-sm">
          <div className="card-body">
            <h5 className="mb-3">Caja #{caja.id}</h5>

            <p className="mb-2">
              <strong>Estado:</strong>{" "}
              <span className="badge bg-success">ABIERTA</span>
            </p>

            <p className="mb-4">
              <strong>Monto inicial:</strong>{" "}
              {money(caja.monto_inicial)}
            </p>

            <CajaForm tipo="CERRAR" onSubmit={handleCerrar} />
          </div>
        </div>
      ) : (
        <div className="card shadow-sm">
          <div className="card-body">
            <h5 className="mb-3">No hay caja abierta</h5>
            <CajaForm tipo="ABRIR" onSubmit={handleAbrir} />
          </div>
        </div>
      )}

      {ultimoCierre && (
        <div className="card shadow-sm mt-4">
          <div className="card-body">
            <h5>Último cierre</h5>

            <div className="row">
              <div className="col-md-4">
                <strong>Total ventas:</strong>
                <div>{money(ultimoCierre.total_ventas)}</div>
              </div>

              <div className="col-md-4">
                <strong>Total efectivo:</strong>
                <div>{money(ultimoCierre.total_efectivo)}</div>
              </div>

              <div className="col-md-4">
                <strong>Total compras:</strong>
                <div>{money(ultimoCierre.total_compras)}</div>
              </div>

              <div className="col-md-4 mt-3">
                <strong>Efectivo esperado:</strong>
                <div>{money(ultimoCierre.efectivo_esperado)}</div>
              </div>

              <div className="col-md-4 mt-3">
                <strong>Efectivo real:</strong>
                <div>{money(ultimoCierre.monto_final_real)}</div>
              </div>

              <div className="col-md-4 mt-3">
                <strong>Diferencia:</strong>
                <div>{money(ultimoCierre.diferencia)}</div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default CajaPage;
