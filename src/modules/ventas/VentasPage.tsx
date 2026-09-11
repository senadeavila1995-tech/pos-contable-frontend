import { useEffect, useState } from "react";
import axios from "axios";
import { jwtDecode } from "jwt-decode";

import { listarVentas, getVentaDetalle, crearVenta } from "./ventas.service";
import { getProductById } from "../productos/Product.service";
import { getClienteByDocumento } from "../Clientes/cliente.service";
import { getCajaActual } from "../caja/caja.service";

import type {
  Sale,
  SaleDetail,
  CreateSale
} from "../../shared/types/Sale";
import type { Product } from "../../shared/types/Product";
import type { Cliente } from "../../shared/types/Cliente";


// --- Tipo para la respuesta de crearVenta ---
interface CrearVentaResponse {
  message: string;
  venta_id: number;
  total: number;
};
interface CartItem {
  producto_id: number;
  nombre: string;
  precio_unitario: number;
  cantidad: number;
  subtotal: number;
}





const VentasPage = () => {
  /* ===============================
     ESTADOS
  =============================== */
  const [ventas, setVentas] = useState<Sale[]>([]);
  const [detalleVenta, setDetalleVenta] = useState<SaleDetail[]>([]);
  const [ventaSeleccionada, setVentaSeleccionada] = useState<number | null>(null);

  const [carrito, setCarrito] = useState<CartItem[]>([]);
  const [metodoPago, setMetodoPago] = useState<CreateSale["metodo_pago"]>("EFECTIVO");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [productoId, setProductoId] = useState("");
  const [documento, setDocumento] = useState("");

  const [clienteEncontrado, setClienteEncontrado] = useState<Cliente | null>(null);
  const [mostrarFormularioCliente, setMostrarFormularioCliente] = useState(false);

  /* ===============================
     USUARIO Y EMPRESA DESDE JWT
  =============================== */
  const [usuarioId, setUsuarioId] = useState<number | null>(null);
  const [empresaId, setEmpresaId] = useState<number | null>(null);
  const [cajaId, setCajaId] = useState<number | null>(null);

  /* ===============================
     BÚSQUEDA Y PAGINACIÓN
  =============================== */
  const [busqueda, setBusqueda] = useState("");
  const [pagina, setPagina] = useState(1);

  const registrosPorPagina = 10;

  const ventasFiltradas = ventas.filter((venta) => {
    const texto = [
      venta.id,
      venta.cliente_nombre || "",
      venta.metodo_pago,
      venta.estado,
      venta.total,
    ]
      .join(" ")
      .toLowerCase();

    return texto.includes(busqueda.toLowerCase());
  });

  const totalPaginas = Math.max(
    1,
    Math.ceil(ventasFiltradas.length / registrosPorPagina)
  );

  const ventasPaginadas = ventasFiltradas.slice(
    (pagina - 1) * registrosPorPagina,
    pagina * registrosPorPagina
  );

  const indiceInicio =
    ventasFiltradas.length === 0
      ? 0
      : (pagina - 1) * registrosPorPagina + 1;

  const indiceFin = Math.min(
    pagina * registrosPorPagina,
    ventasFiltradas.length
  );

  const cambiarBusqueda = (valor: string) => {
    setBusqueda(valor);
    setPagina(1);
  };

  useEffect(() => {
    const cargarDatosIniciales = async () => {
      const token = localStorage.getItem("token");

      if (!token) {
        setError("No hay sesión activa");
        return;
      }

      try {
        const decoded = jwtDecode<any>(token);

        if (!decoded.id || !decoded.empresa_id) {
          setError("Token inválido: falta usuario o empresa");
          return;
        }

        setUsuarioId(decoded.id);
        setEmpresaId(decoded.empresa_id);

        // La venta debe quedar asociada a una caja abierta.
        try {
          const cajaRes = await getCajaActual();

          if (cajaRes.data?.id) {
            setCajaId(cajaRes.data.id);
          } else {
            setCajaId(null);
            setError("No hay una caja abierta. Abra la caja antes de registrar ventas.");
          }
        } catch (cajaError) {
          console.error("Error obteniendo caja actual:", cajaError);
          setCajaId(null);
          setError("No se pudo obtener la caja actual. Verifique que exista una caja abierta.");
        }

        await cargarVentas();
      } catch (error) {
        console.error("Error decodificando JWT:", error);
        setError("Sesión inválida, vuelva a iniciar sesión");
      }
    };

    cargarDatosIniciales();
  }, []);


  const aumentarCantidad = (productoId: number) => {
    setCarrito(prev =>
      prev.map(item => {
        const precio = Number(item.precio_unitario);
        const cantidad = Number(item.cantidad) + 1;

        return item.producto_id === productoId
          ? {
            ...item,
            cantidad,
            precio_unitario: precio,
            subtotal: cantidad * precio
          }
          : item;
      })
    );
  };

  const disminuirCantidad = (productoId: number) => {
    setCarrito(prev =>
      prev
        .map(item => {
          const precio = Number(item.precio_unitario);
          const cantidad = Number(item.cantidad) - 1;

          return item.producto_id === productoId
            ? {
              ...item,
              cantidad,
              precio_unitario: precio,
              subtotal: cantidad * precio
            }
            : item;
        })
        .filter(item => item.cantidad > 0)
    );
  };


  /* ===============================
     CARGAR VENTAS
  =============================== */
  const cargarVentas = async () => {
    try {
      const res = await listarVentas();
      setVentas(res.data);
      setPagina(1);
    } catch {
      setError("Error al cargar ventas");
    }
  };

  /* ===============================
     BUSCAR PRODUCTO
  =============================== */
  const buscarProductoPorId = async () => {
    if (!productoId) return;

    try {
      const res = await getProductById(Number(productoId));
      agregarAlCarrito(res.data);
      setProductoId("");
      setError(null);
    } catch {
      setError("Producto no encontrado");
    }
  };

  /* ===============================
     BUSCAR CLIENTE
  =============================== */
  const buscarCliente = async () => {
    if (!documento) {
      setError("Ingrese un documento");
      return;
    }

    try {
      const res = await getClienteByDocumento(documento);
      setClienteEncontrado(res.data);
      setMostrarFormularioCliente(false);
      setError(null);
    } catch (err: any) {
      if (axios.isAxiosError(err) && err.response?.status === 404) {
        setClienteEncontrado(null);
        setMostrarFormularioCliente(true);
        setError(null);
        return;
      }
      setError("Error al buscar cliente");
    }
  };

  /* ===============================
     CARRITO
  =============================== */
  const agregarAlCarrito = (producto: Product) => {
    setCarrito(prev => {
      const existente = prev.find(
        item => item.producto_id === producto.id
      );

      if (existente) {
        const nuevaCantidad = existente.cantidad + 1;
        const precio = Number(existente.precio_unitario);

        return prev.map(item =>
          item.producto_id === producto.id
            ? {
              ...item,
              cantidad: nuevaCantidad,
              precio_unitario: precio,
              subtotal: nuevaCantidad * precio
            }
            : item
        );
      }

      const precio = Number(producto.precio);

      return [
        ...prev,
        {
          producto_id: producto.id,
          nombre: producto.nombre,
          cantidad: 1,
          precio_unitario: precio,
          subtotal: precio
        }
      ];
    });
  };


  const total = carrito.reduce(
    (acc, item) => acc + Number(item.subtotal),
    0
  );


  /* ===============================
     CONFIRMAR VENTA
  =============================== */
  const confirmarVenta = async () => {
    if (usuarioId === null || empresaId === null) {
      setError("Usuario o empresa no cargados aún. Intente nuevamente.");
      return;
    }

    if (cajaId === null) {
      setError("No hay una caja abierta. Abra la caja antes de registrar la venta.");
      return;
    }

    if (!clienteEncontrado?.id) {
      setError("Debe seleccionar o registrar un cliente");
      return;
    }

    if (carrito.length === 0) {
      setError("El carrito está vacío");
      return;
    }

    const payload: CreateSale = {
      cliente_id: clienteEncontrado.id,
      metodo_pago: metodoPago,
      forma_pago: "CONTADO",
      medio_pago: metodoPago,
      moneda: "COP",
      detalles: carrito.map((item) => ({
        producto_id: item.producto_id,
        cantidad: Number(item.cantidad),
        precio_unitario: Number(item.precio_unitario),
        descuento: 0,
      })),
    };


    try {
      setLoading(true);

      const res = await crearVenta(payload) as { data: CrearVentaResponse };
      const ventaId = res.data.venta_id;

      console.log("VENTA CREADA:", res.data);

      // La facturación se gestiona desde el módulo de Facturación.
      setCarrito([]);
      setClienteEncontrado(null);
      await cargarVentas();

      alert(`Venta #${ventaId} registrada correctamente`);

    } catch (err: any) {
      console.error("Error creando venta:", err);
      if (err.response?.data?.message) setError(err.response.data.message);
      else setError("Error al registrar la venta");
    } finally {
      setLoading(false);
    }
  };



  /* ===============================
     VER DETALLE DE VENTA
  =============================== */
  const verDetalle = async (ventaId: number) => {
    try {
      const res = await getVentaDetalle(ventaId);

      const detalle = Array.isArray(res.data.detalles)
        ? res.data.detalles
        : [];

      setDetalleVenta(detalle);
      setVentaSeleccionada(ventaId);

      console.log("RESPUESTA DETALLE VENTA:", res.data);
    } catch (error) {
      console.error(error);
      setDetalleVenta([]);
      setError("Error al cargar detalle de venta");
    }
  };



  /* ===============================
     RENDER
  =============================== */
  return (
    <div className="container-fluid py-2">

      {/* ENCABEZADO */}
      <div className="d-flex flex-column flex-lg-row justify-content-between align-items-lg-center gap-3 mb-4">
        <div>
          <h1 className="page-title h3 mb-1">Punto de Venta</h1>
          <p className="page-subtitle mb-0">
            Registro y gestión de ventas de la empresa.
          </p>
        </div>

        <div className="d-flex flex-wrap gap-2">
          <div className="stat-card d-flex align-items-center gap-3">
            <div className="fs-4">🏢</div>
            <div>
              <div className="stat-label">Empresa</div>
              <div className="stat-value">
                #{empresaId ?? "—"}
              </div>
            </div>
          </div>

          <div className="stat-card d-flex align-items-center gap-3">
            <div className="fs-4">💵</div>
            <div>
              <div className="stat-label">Caja</div>
              <div className="stat-value">
                {cajaId ? (
                  <span className="text-success">Abierta #{cajaId}</span>
                ) : (
                  <span className="text-danger">Sin abrir</span>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* ALERTA */}
      {error && (
        <div className="alert alert-warning d-flex justify-content-between align-items-center mb-4">
          <span>
            <strong>Atención:</strong> {error}
          </span>

          <button
            type="button"
            className="btn-close"
            aria-label="Cerrar"
            onClick={() => setError("")}
          />
        </div>
      )}

      {/* OPERACIÓN */}
      <div className="row g-4 mb-4">

        {/* PRODUCTO */}
        <div className="col-12 col-xl-4">
          <section className="section-card h-100">
            <div className="section-card-header">
              <div className="d-flex align-items-center gap-2">
                <span className="fs-5">📦</span>
                <div>
                  <h2 className="h6 fw-bold mb-1">Agregar producto</h2>
                  <small className="text-muted">
                    Buscar por ID de producto
                  </small>
                </div>
              </div>
            </div>

            <div className="section-card-body">
              <label className="form-label fw-semibold">
                ID del producto
              </label>

              <div className="input-group">
                <input
                  type="number"
                  className="form-control"
                  placeholder="Ej. 15"
                  value={productoId}
                  onChange={(e) => setProductoId(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") {
                      buscarProductoPorId();
                    }
                  }}
                />

                <button
                  type="button"
                  className="btn btn-dark"
                  onClick={buscarProductoPorId}
                  disabled={loading}
                >
                  {loading ? "..." : "Agregar"}
                </button>
              </div>

              <div className="form-text">
                Presione Enter para agregar rápidamente.
              </div>
            </div>
          </section>
        </div>

        {/* CLIENTE */}
        <div className="col-12 col-xl-4">
          <section className="section-card h-100">
            <div className="section-card-header">
              <div className="d-flex align-items-center gap-2">
                <span className="fs-5">👤</span>
                <div>
                  <h2 className="h6 fw-bold mb-1">Cliente</h2>
                  <small className="text-muted">
                    Identificación del comprador
                  </small>
                </div>
              </div>
            </div>

            <div className="section-card-body">
              <label className="form-label fw-semibold">
                Documento
              </label>

              <div className="input-group">
                <input
                  type="text"
                  className="form-control"
                  placeholder="Cédula / NIT"
                  value={documento}
                  onChange={(e) => setDocumento(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") {
                      buscarCliente();
                    }
                  }}
                />

                <button
                  type="button"
                  className="btn btn-outline-dark"
                  onClick={buscarCliente}
                  disabled={loading}
                >
                  Buscar
                </button>
              </div>

              {clienteEncontrado && (
                <div className="alert alert-success mt-3 mb-0 py-2">
                  <div className="fw-semibold">
                    ✓ Cliente encontrado
                  </div>
                  <small>
                    {clienteEncontrado.nombre}
                  </small>
                </div>
              )}

              {mostrarFormularioCliente && (
                <div className="alert alert-warning mt-3 mb-0 py-2">
                  <small>
                    Cliente no encontrado. Regístrelo antes de realizar la venta.
                  </small>
                </div>
              )}
            </div>
          </section>
        </div>

        {/* RESUMEN */}
        <div className="col-12 col-xl-4">
          <section className="section-card h-100">
            <div className="section-card-header">
              <div className="d-flex align-items-center gap-2">
                <span className="fs-5">🛒</span>
                <div>
                  <h2 className="h6 fw-bold mb-1">Resumen de venta</h2>
                  <small className="text-muted">
                    Total y método de pago
                  </small>
                </div>
              </div>
            </div>

            <div className="section-card-body">
              <div className="pos-total mb-3">
                <div className="pos-total-label">
                  Total a pagar
                </div>

                <div className="pos-total-value">
                  ${Number(total).toLocaleString("es-CO")}
                </div>
              </div>

              <label className="form-label fw-semibold">
                Método de pago
              </label>

              <select
                className="form-select mb-3"
                value={metodoPago}
                onChange={(e) =>
                  setMetodoPago(e.target.value as CreateSale["metodo_pago"])
                }
                disabled={loading}
              >
                <option value="EFECTIVO">Efectivo</option>
                <option value="TARJETA">Tarjeta</option>
                <option value="TRANSFERENCIA">Transferencia</option>
                <option value="NEQUI">Nequi</option>
                <option value="DAVIPLATA">Daviplata</option>
              </select>

              <button
                type="button"
                className="btn btn-success w-100 py-2 fw-semibold"
                onClick={confirmarVenta}
                disabled={loading || carrito.length === 0}
              >
                {loading ? "Procesando..." : "✓ Confirmar venta"}
              </button>
            </div>
          </section>
        </div>
      </div>

      {/* CARRITO */}
      <section className="section-card mb-4">
        <div className="section-card-header d-flex justify-content-between align-items-center">
          <div>
            <h2 className="h6 fw-bold mb-1">Carrito de venta</h2>
            <small className="text-muted">
              Productos seleccionados para la operación actual.
            </small>
          </div>

          <span className="badge badge-soft">
            {carrito.length} referencia{carrito.length === 1 ? "" : "s"}
          </span>
        </div>

        <div className="section-card-body p-0">
          {carrito.length === 0 ? (
            <div className="empty-state">
              <div className="fs-1 mb-2">🛒</div>
              <div className="fw-semibold">El carrito está vacío</div>
              <div className="small">
                Agregue productos para comenzar una venta.
              </div>
            </div>
          ) : (
            <div className="table-responsive">
              <table className="table table-hover align-middle">
                <thead className="table-light">
                  <tr>
                    <th className="ps-4">Producto</th>
                    <th>Precio</th>
                    <th>Cantidad</th>
                    <th>Subtotal</th>
                  </tr>
                </thead>

                <tbody>
                  {carrito.map((item) => (
                    <tr key={item.producto_id}>
                      <td className="ps-4">
                        <div className="fw-semibold">
                          {item.nombre}
                        </div>
                        <small className="text-muted">
                          ID #{item.producto_id}
                        </small>
                      </td>

                      <td>
                        ${Number(item.precio_unitario).toLocaleString("es-CO")}
                      </td>

                      <td>
                        <div className="d-flex align-items-center gap-2">
                          <button
                            type="button"
                            className="btn btn-sm btn-outline-secondary"
                            onClick={() =>
                              disminuirCantidad(item.producto_id)
                            }
                          >
                            −
                          </button>

                          <span
                            className="fw-bold text-center"
                            style={{ minWidth: "28px" }}
                          >
                            {item.cantidad}
                          </span>

                          <button
                            type="button"
                            className="btn btn-sm btn-outline-secondary"
                            onClick={() =>
                              aumentarCantidad(item.producto_id)
                            }
                          >
                            +
                          </button>
                        </div>
                      </td>

                      <td className="fw-semibold">
                        ${Number(item.subtotal).toLocaleString("es-CO")}
                      </td>
                    </tr>
                  ))}
                </tbody>

                <tfoot className="table-light">
                  <tr>
                    <td colSpan={3} className="text-end fw-bold">
                      TOTAL
                    </td>

                    <td className="fw-bold fs-5">
                      ${Number(total).toLocaleString("es-CO")}
                    </td>
                  </tr>
                </tfoot>
              </table>
            </div>
          )}
        </div>
      </section>

      {/* HISTORIAL */}
      <section className="section-card mb-4">
        <div className="section-card-header d-flex justify-content-between align-items-center">
          <div>
            <h2 className="h6 fw-bold mb-1">Historial de ventas</h2>
            <small className="text-muted">
              Ventas registradas en la empresa actual.
            </small>
          </div>

          <span className="badge badge-soft">
            {ventas.length} venta{ventas.length === 1 ? "" : "s"}
          </span>
        </div>

        <div className="section-card-body">

          {/* BÚSQUEDA */}
          <div className="row g-3 align-items-end mb-4">
            <div className="col-12 col-md-8">
              <label className="form-label fw-semibold">
                Buscar venta
              </label>

              <div className="input-group">
                <span className="input-group-text">
                  🔎
                </span>

                <input
                  type="text"
                  className="form-control"
                  placeholder="ID, cliente, método de pago, estado o total..."
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
                <strong>{ventasFiltradas.length}</strong>
              </div>
            </div>
          </div>

          {/* TABLA */}
          {ventasFiltradas.length === 0 ? (
            <div className="empty-state">
              <div className="fs-1 mb-2">📊</div>

              <div className="fw-semibold">
                {ventas.length === 0
                  ? "No hay ventas registradas"
                  : "No se encontraron resultados"}
              </div>

              {ventas.length > 0 && (
                <div className="small mt-1">
                  Intente con otro término de búsqueda.
                </div>
              )}
            </div>
          ) : (
            <>
              <div className="table-responsive">
                <table className="table table-hover align-middle">
                  <thead className="table-light">
                    <tr>
                      <th className="ps-4">ID</th>
                      <th>Cliente</th>
                      <th>Total</th>
                      <th>Método</th>
                      <th>Estado</th>
                      <th className="text-end pe-4">Acción</th>
                    </tr>
                  </thead>

                  <tbody>
                    {ventasPaginadas.map((v) => (
                      <tr key={v.id}>
                        <td className="ps-4 fw-semibold">
                          #{v.id}
                        </td>

                        <td>
                          {v.cliente_nombre || (
                            <span className="text-muted">
                              Sin cliente
                            </span>
                          )}
                        </td>

                        <td className="fw-semibold">
                          ${Number(v.total).toLocaleString("es-CO")}
                        </td>

                        <td>
                          <span className="badge badge-soft">
                            {v.metodo_pago}
                          </span>
                        </td>

                        <td>
                          <span
                            className={`badge ${
                              v.estado === "ANULADA"
                                ? "bg-danger"
                                : v.estado === "PAGADA"
                                ? "bg-success"
                                : "bg-secondary"
                            }`}
                          >
                            {v.estado}
                          </span>
                        </td>

                        <td className="text-end pe-4">
                          <button
                            type="button"
                            className="btn btn-sm btn-outline-dark"
                            onClick={() => verDetalle(v.id)}
                            disabled={loading}
                          >
                            Ver detalle
                          </button>
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

                  <nav aria-label="Paginación de ventas">
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
      </section>

      {/* DETALLE */}
      {ventaSeleccionada && (
        <section className="section-card mb-4">
          <div className="section-card-header d-flex justify-content-between align-items-center">
            <div>
              <h2 className="h6 fw-bold mb-1">
                Detalle de venta #{ventaSeleccionada}
              </h2>

              <small className="text-muted">
                Productos asociados a la venta.
              </small>
            </div>

            <button
              type="button"
              className="btn btn-sm btn-outline-secondary"
              onClick={() => {
                setVentaSeleccionada(null);
                setDetalleVenta([]);
              }}
            >
              Cerrar
            </button>
          </div>

          <div className="section-card-body p-0">
            <div className="table-responsive">
              <table className="table table-hover align-middle">
                <thead className="table-light">
                  <tr>
                    <th className="ps-4">Producto</th>
                    <th>Cantidad</th>
                    <th>Precio</th>
                    <th>Subtotal</th>
                  </tr>
                </thead>

                <tbody>
                  {Array.isArray(detalleVenta) &&
                  detalleVenta.length > 0 ? (
                    detalleVenta.map((d) => (
                      <tr key={d.id}>
                        <td className="ps-4">
                          {d.descripcion}
                        </td>

                        <td>{d.cantidad}</td>

                        <td>
                          ${Number(d.precio_unitario).toLocaleString("es-CO")}
                        </td>

                        <td className="fw-semibold">
                          ${Number(d.subtotal).toLocaleString("es-CO")}
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td
                        colSpan={4}
                        className="text-center text-muted py-4"
                      >
                        No hay detalles para esta venta.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </section>
      )}
    </div>
  );
};

export default VentasPage;
