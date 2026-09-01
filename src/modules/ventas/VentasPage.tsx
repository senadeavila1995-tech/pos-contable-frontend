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
    <div className="container py-4">
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h2 className="fw-bold mb-0">Módulo de Ventas</h2>
      </div>

      {error && <div className="alert alert-danger">{error}</div>}

      <div className="row g-4 mb-4">
        {/* Producto */}
        <div className="col-md-4">
          <div className="card shadow-sm">
            <div className="card-body">
              <h5 className="card-title">Producto</h5>
              <input
                type="number"
                className="form-control mb-2"
                placeholder="ID del producto"
                value={productoId}
                onChange={(e) => setProductoId(e.target.value)}
              />
              <button className="btn btn-dark w-100" onClick={buscarProductoPorId}>
                Agregar
              </button>
            </div>
          </div>
        </div>

        {/* Cliente */}
        <div className="col-md-4">
          <div className="card shadow-sm">
            <div className="card-body">
              <h5 className="card-title">Cliente</h5>
              <input
                type="text"
                className="form-control mb-2"
                placeholder="Documento"
                value={documento}
                onChange={(e) => setDocumento(e.target.value)}
              />
              {mostrarFormularioCliente && (
                <div className="text-warning small mb-2">
                  Cliente no encontrado. Regístrelo.
                </div>
              )}
              {clienteEncontrado && (
                <div className="text-success small mb-2">
                  Cliente encontrado.
                </div>
              )}
              <button className="btn btn-outline-dark w-100" onClick={buscarCliente}>
                Buscar cliente
              </button>
            </div>
          </div>
        </div>

        {/* Carrito */}
        <div className="col-md-4">
          <div className="card shadow-sm">
            <div className="card-body">
              <h5 className="card-title">Carrito</h5>

              <table className="table table-sm">
                <thead>
                  <tr>
                    <th>Producto</th>
                    <th>Cant</th>
                    <th>Subtotal</th>
                  </tr>
                </thead>
                <tbody>
                  {carrito.map((item) => (
                    <tr key={item.producto_id}>
                      <td>{item.nombre}</td>

                      <td className="text-center">
                        <button
                          className="btn btn-sm btn-outline-secondary"
                          onClick={() => disminuirCantidad(item.producto_id)}
                        >
                          −
                        </button>

                        <span className="mx-2 fw-bold">{item.cantidad}</span>

                        <button
                          className="btn btn-sm btn-outline-primary"
                          onClick={() => aumentarCantidad(item.producto_id)}
                        >
                          +
                        </button>
                      </td>

                      <td>${Number(item.subtotal).toFixed(2)}</td>

                    </tr>
                  ))}
                </tbody>

              </table>

              <h6 className="fw-bold">Total: ${total}</h6>

              <div className="mb-3">
                <label className="form-label fw-bold">
                  Método de pago
                </label>

                <select
                  className="form-select"
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
              </div>

              <button
                className="btn btn-success w-100"
                onClick={confirmarVenta}
                disabled={loading}
              >
                {loading ? "Procesando..." : "Confirmar venta"}
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* LISTA DE VENTAS */}
      <div className="table-responsive">
        <table className="table table-bordered table-hover align-middle">
          <thead className="table-light">
            <tr>
              <th>ID</th>
              <th>Total</th>
              <th>Método</th>
              <th>Estado</th>
              <th className="text-center">Acciones</th>
            </tr>
          </thead>
          <tbody>
            {ventas.map((v) => (
              <tr key={v.id}>
                <td>{v.id}</td>
                <td>${v.total}</td>
                <td>{v.metodo_pago}</td>
                <td>
                  <span className="badge bg-dark">{v.estado}</span>
                </td>
                <td className="text-center">
                  <button
                    className="btn btn-sm btn-outline-dark"
                    onClick={() => verDetalle(v.id)}
                  >
                    Ver detalle
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* DETALLE DE VENTA */}
      {ventaSeleccionada && (
        <>
          <hr />
          <h5 className="fw-bold">Detalle de venta #{ventaSeleccionada}</h5>

          <table className="table table-bordered">
            <thead className="table-light">
              <tr>
                <th>Producto</th>
                <th>Cantidad</th>
                <th>Precio</th>
                <th>Subtotal</th>
              </tr>
            </thead>
            <tbody>
              {Array.isArray(detalleVenta) && detalleVenta.length > 0 ? (
                detalleVenta.map((d) => (
                  <tr key={d.id}>
                    <td>{d.descripcion}</td>
                    <td>{d.cantidad}</td>
                    <td>${Number(d.precio_unitario).toFixed(2)}</td>
                    <td>${Number(d.subtotal).toFixed(2)}</td>

                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={4} className="text-center text-muted">
                    No hay detalles para esta venta
                  </td>
                </tr>
              )}
            </tbody>

          </table>
        </>
      )}
    </div>
  );
};

export default VentasPage;
