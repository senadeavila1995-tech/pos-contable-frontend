import { useEffect, useState } from "react";
import type { Sale } from "../../shared/types/Sale";
import { listarVentas } from "../ventas/ventas.service";
import {
  facturarVenta,
  obtenerFacturaPDF,
  obtenerFacturaXML,
} from "./facturacion.service";
import type { Factura } from "../../shared/types/Factura";

export default function FacturacionPage() {
  const [ventas, setVentas] = useState<Sale[]>([]);
  const [facturas, setFacturas] = useState<Record<number, Factura>>({});
  const [ventaFacturando, setVentaFacturando] = useState<number | null>(null);
  const [ventaPDF, setVentaPDF] = useState<number | null>(null);
  const [ventaXML, setVentaXML] = useState<number | null>(null);
  const [error, setError] = useState("");

  const cargarVentas = async () => {
    try {
      setError("");

      const res = await listarVentas();
      setVentas(res.data);
    } catch (err: any) {
      console.error("Error cargando ventas:", err);

      setError(
        err.response?.data?.message ||
          "No se pudieron cargar las ventas."
      );
    }
  };

  useEffect(() => {
    cargarVentas();
  }, []);

  const generarFactura = async (ventaId: number) => {
    try {
      setVentaFacturando(ventaId);
      setError("");

      const res = await facturarVenta(ventaId);
      const factura = res.data as Factura;

      setFacturas((prev) => ({
        ...prev,
        [ventaId]: factura,
      }));
    } catch (err: any) {
      console.error("Error generando factura:", err);

      setError(
        err.response?.data?.message ||
          "No se pudo generar la factura."
      );
    } finally {
      setVentaFacturando(null);
    }
  };

  const abrirPDF = async (ventaId: number) => {
    try {
      setVentaPDF(ventaId);
      setError("");

      const res = await obtenerFacturaPDF(ventaId);

      const url = URL.createObjectURL(
        new Blob([res.data], {
          type: "application/pdf",
        })
      );

      window.open(url, "_blank");

      setTimeout(() => {
        URL.revokeObjectURL(url);
      }, 10000);
    } catch (err: any) {
      console.error("Error obteniendo PDF:", err);

      setError(
        err.response?.data?.message ||
          "No se pudo obtener el PDF."
      );
    } finally {
      setVentaPDF(null);
    }
  };

  const descargarXML = async (ventaId: number) => {
    try {
      setVentaXML(ventaId);
      setError("");

      const res = await obtenerFacturaXML(ventaId);

      const url = URL.createObjectURL(
        new Blob([res.data], {
          type: "application/xml",
        })
      );

      const link = document.createElement("a");

      link.href = url;
      link.download = `factura_${ventaId}.xml`;

      document.body.appendChild(link);
      link.click();
      link.remove();

      setTimeout(() => {
        URL.revokeObjectURL(url);
      }, 1000);
    } catch (err: any) {
      console.error("Error obteniendo XML:", err);

      setError(
        err.response?.data?.message ||
          "No se pudo obtener el XML."
      );
    } finally {
      setVentaXML(null);
    }
  };

  return (
    <div className="container py-4">

      {/* ==============================
          ENCABEZADO
      ============================== */}

      <div className="d-flex justify-content-between align-items-center mb-4">
        <div>
          <h2 className="fw-bold mb-1">
            Facturación electrónica
          </h2>

          <p className="text-muted mb-0">
            Gestión de facturas generadas a partir de las ventas.
          </p>
        </div>

        <button
          className="btn btn-outline-dark"
          onClick={cargarVentas}
        >
          Actualizar
        </button>
      </div>

      {/* ==============================
          ERROR
      ============================== */}

      {error && (
        <div className="alert alert-danger">
          {error}
        </div>
      )}

      {/* ==============================
          INFORMACIÓN
      ============================== */}

      <div className="alert alert-light border mb-4">
        <strong>Modo de pruebas:</strong>{" "}
        las facturas se generan mediante el flujo actual del sistema.
        La integración real de transmisión a DIAN se mantiene separada.
      </div>

      {/* ==============================
          TABLA
      ============================== */}

      <div className="card shadow-sm">
        <div className="card-body">

          <div className="table-responsive">

            <table className="table table-bordered table-hover align-middle mb-0">

              <thead className="table-light">
                <tr>
                  <th>Venta</th>
                  <th>Cliente</th>
                  <th>Total</th>
                  <th>Estado venta</th>
                  <th>Factura</th>
                  <th>CUFE</th>
                  <th>Estado DIAN</th>
                  <th className="text-center">
                    Acciones
                  </th>
                </tr>
              </thead>

              <tbody>

                {ventas.map((venta) => {

                  const factura = facturas[venta.id];

                  const facturando =
                    ventaFacturando === venta.id;

                  const generandoPDF =
                    ventaPDF === venta.id;

                  const generandoXML =
                    ventaXML === venta.id;

                  return (
                    <tr key={venta.id}>

                      {/* Venta */}

                      <td>
                        <strong>
                          #{venta.id}
                        </strong>
                      </td>

                      {/* Cliente */}

                      <td>
                        {venta.cliente_nombre ||
                          "Sin cliente"}
                      </td>

                      {/* Total */}

                      <td>
                        $
                        {Number(
                          venta.total
                        ).toLocaleString("es-CO")}
                      </td>

                      {/* Estado venta */}

                      <td>

                        <span
                          className={`badge ${
                            venta.estado === "PAGADA"
                              ? "bg-success"
                              : venta.estado === "ANULADA"
                              ? "bg-danger"
                              : "bg-secondary"
                          }`}
                        >
                          {venta.estado}
                        </span>

                      </td>

                      {/* Factura */}

                      <td>

                        {factura ? (
                          <div>
                            <strong>
                              {factura.numero}
                            </strong>

                            {factura.prefijo && (
                              <div className="small text-muted">
                                Prefijo: {factura.prefijo}
                              </div>
                            )}
                          </div>
                        ) : (
                          <span className="text-muted">
                            Sin facturar
                          </span>
                        )}

                      </td>

                      {/* CUFE */}

                      <td>

                        {factura?.cufe ? (
                          <span
                            className="small"
                            title={factura.cufe}
                          >
                            {factura.cufe.length > 24
                              ? `${factura.cufe.substring(
                                  0,
                                  24
                                )}...`
                              : factura.cufe}
                          </span>
                        ) : (
                          <span className="text-muted">
                            —
                          </span>
                        )}

                      </td>

                      {/* Estado DIAN */}

                      <td>

                        {factura ? (
                          <span
                            className={`badge ${
                              factura.estado_dian ===
                              "ACEPTADA"
                                ? "bg-success"
                                : factura.estado_dian ===
                                  "RECHAZADA"
                                ? "bg-danger"
                                : "bg-warning text-dark"
                            }`}
                          >
                            {factura.estado_dian}
                          </span>
                        ) : (
                          <span className="text-muted">
                            —
                          </span>
                        )}

                      </td>

                      {/* Acciones */}

                      <td>

                        {!factura ? (

                          <button
                            className="btn btn-primary btn-sm"
                            disabled={facturando}
                            onClick={() =>
                              generarFactura(
                                venta.id
                              )
                            }
                          >
                            {facturando
                              ? "Facturando..."
                              : "Generar factura"}
                          </button>

                        ) : (

                          <div className="d-flex gap-2 justify-content-center">

                            <button
                              className="btn btn-danger btn-sm"
                              disabled={generandoPDF}
                              onClick={() =>
                                abrirPDF(
                                  venta.id
                                )
                              }
                            >
                              {generandoPDF
                                ? "Abriendo..."
                                : "PDF"}
                            </button>

                            <button
                              className="btn btn-outline-secondary btn-sm"
                              disabled={generandoXML}
                              onClick={() =>
                                descargarXML(
                                  venta.id
                                )
                              }
                            >
                              {generandoXML
                                ? "Descargando..."
                                : "XML"}
                            </button>

                          </div>

                        )}

                      </td>

                    </tr>
                  );
                })}

                {/* Sin ventas */}

                {ventas.length === 0 && (

                  <tr>

                    <td
                      colSpan={8}
                      className="text-center text-muted py-5"
                    >
                      No hay ventas disponibles.
                    </td>

                  </tr>

                )}

              </tbody>

            </table>

          </div>

        </div>
      </div>

    </div>
  );
}
