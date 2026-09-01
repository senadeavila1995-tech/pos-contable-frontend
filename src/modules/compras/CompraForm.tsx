import { useState, useEffect } from "react";
import type { CompraDetalle, Compra, CompraCreate } from "../../shared/types/Compra";
import { createCompra } from "./compras.service";
import { getProveedores } from "../proveedores/proveedores.service";
import type { Proveedor } from "../../shared/types/Proveedor";
import { getProducts } from "../productos/Product.service";
import type { Product } from "../../shared/types/Product";

interface Props {
  compra: Compra | null;
  onSave: () => Promise<void>;
  onClose: () => void;
}

// Porcentajes válidos de IVA en Colombia
const IVA_COLOMBIA = [0, 5, 19];

export const CompraForm = ({ compra, onSave, onClose }: Props) => {
  const [proveedores, setProveedores] = useState<Proveedor[]>([]);
  const [productos, setProductos] = useState<Product[]>([]);
  const [error, setError] = useState<string>("");
  const [impuestoPorcentaje, setImpuestoPorcentaje] = useState<number>(19); // IVA seleccionado

  const [form, setForm] = useState<CompraCreate>({
    proveedor_id: compra?.proveedor_id ?? 0,
    numero_factura: compra?.numero_factura ?? "",
    fecha_compra: compra?.fecha_compra ?? new Date().toISOString().slice(0, 10),
    subtotal: compra?.subtotal ?? 0,
    impuestos: compra?.impuestos ?? 0,
    total: compra?.total ?? 0,
    estado: compra?.estado ?? "REGISTRADA",
    caja_id: compra?.caja_id ?? null,
    detalles: compra?.detalles ?? [],
  });

  // ------------------------------------------------
  // Función para recalcular subtotal, impuestos y total
  function recalcTotales(detalles: CompraDetalle[], porcentaje: number) {
    const subtotal = detalles.reduce((sum, d) => sum + d.subtotal, 0);
    const impuestos = Math.round(subtotal * porcentaje / 100 * 100) / 100;
    const total = subtotal + impuestos;
    return { subtotal, impuestos, total };
  }
  // ------------------------------------------------

  // Cargar proveedores y productos
  useEffect(() => {
    const loadData = async () => {
      try {
        const provRes = await getProveedores();
        setProveedores(provRes.data || []);

        const prodRes = await getProducts();
        setProductos(prodRes.data || []);

        if (form.detalles?.length) {
          const totals = recalcTotales(form.detalles, impuestoPorcentaje);
          setForm(prev => ({ ...prev, ...totals }));
        }
      } catch (err) {
        console.error("Error cargando proveedores/productos", err);
      }
    };
    loadData();
  }, []);

  // Cambios de inputs
  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    const numericFields = ["proveedor_id"];
    setForm(prev => ({
      ...prev,
      [name]: numericFields.includes(name) ? Number(value) : value,
    }));
  };

  // Agregar nuevo detalle
  const addDetalle = () => {
    const newDetalles = [
      ...(form.detalles ?? []),
      { producto_id: 0, cantidad: 1, costo_unitario: 0, subtotal: 0 },
    ];
    const totals = recalcTotales(newDetalles, impuestoPorcentaje);
    setForm(prev => ({ ...prev, detalles: newDetalles, ...totals }));
  };

  // Actualizar detalle y recalcular totales
  const updateDetalle = (index: number, field: keyof CompraDetalle, value: number) => {
    const newDetalles = [...(form.detalles ?? [])];
    newDetalles[index] = { ...newDetalles[index], [field]: value };
    newDetalles[index].subtotal = newDetalles[index].cantidad * newDetalles[index].costo_unitario;

    const totals = recalcTotales(newDetalles, impuestoPorcentaje);
    setForm(prev => ({ ...prev, detalles: newDetalles, ...totals }));
  };

  // Validación
  const validateForm = (): boolean => {
    if (!form.proveedor_id || form.proveedor_id === 0) {
      setError("Seleccione un proveedor válido");
      return false;
    }
    if (!form.fecha_compra) {
      setError("Ingrese una fecha de compra");
      return false;
    }
    if (!form.detalles || form.detalles.length === 0) {
      setError("Agregue al menos un producto");
      return false;
    }
    for (const d of form.detalles) {
      if (!d.producto_id || d.producto_id === 0) {
        setError("Seleccione un producto válido en todos los detalles");
        return false;
      }
      if (d.cantidad <= 0) {
        setError("La cantidad debe ser mayor a 0");
        return false;
      }
      if (d.costo_unitario < 0) {
        setError("El costo unitario no puede ser negativo");
        return false;
      }
    }
    setError("");
    return true;
  };

  // Enviar formulario
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateForm()) return;

    try {

      const payload: CompraCreate = {
        ...form,
        numero_factura: form.numero_factura || null,
        detalles: form.detalles ?? [],
      };

      await createCompra(payload);
      await onSave();
      onClose();
    } catch (err) {
      console.error("Error guardando compra", err);
      setError("Ocurrió un error al guardar la compra. Revise los datos e intente de nuevo.");
    }
  };

  return (
    <form onSubmit={handleSubmit} className="container p-4 border rounded bg-white" style={{ maxWidth: 900 }}>
      <h5 className="mb-4 text-center fw-bold">{compra ? "Editar Compra" : "Nueva Compra"}</h5>

      {error && <div className="alert alert-danger">{error}</div>}

      {/* Proveedor */}
      <div className="mb-3">
        <label htmlFor="proveedor_id" className="form-label">Proveedor</label>
        <select
          id="proveedor_id"
          name="proveedor_id"
          className="form-select"
          value={form.proveedor_id}
          onChange={handleChange}
          required
        >
          <option value={0}>Seleccione proveedor</option>
          {proveedores.map(p => (
            <option key={p.id} value={p.id}>{p.nombre}</option>
          ))}
        </select>
      </div>

      {/* Número de factura */}
      <div className="mb-3">
        <label htmlFor="numero_factura" className="form-label">Número factura</label>
        <input
          id="numero_factura"
          className="form-control"
          name="numero_factura"
          value={form.numero_factura ?? ""}
          onChange={handleChange}
        />
      </div>

      {/* Fecha de compra */}
      <div className="mb-3">
        <label htmlFor="fecha_compra" className="form-label">Fecha de compra</label>
        <input
          id="fecha_compra"
          type="date"
          className="form-control"
          name="fecha_compra"
          value={form.fecha_compra}
          onChange={handleChange}
          required
        />
      </div>

      {/* Detalles */}
      <h6>Detalles de compra</h6>
      <button type="button" className="btn btn-outline-dark btn-sm mb-2" onClick={addDetalle}>+ Agregar producto</button>

      {form.detalles?.map((d, i) => (
        <div key={i} className="row mb-2 g-2 align-items-center">
          <div className="col">
            <label htmlFor="">Productos</label>
            <select
              className="form-select"
              value={d.producto_id}
              onChange={e => updateDetalle(i, "producto_id", Number(e.target.value))}
              required
            >
              <option value={0}>Seleccione producto</option>
              {productos.map(p => (
                <option key={p.id} value={p.id}>{p.nombre}</option>
              ))}
            </select>
          </div>
          <div className="col">
            <label htmlFor="">Cantidad</label>
            <input
              type="number"
              className="form-control"
              min={1}
              value={d.cantidad}
              onChange={e => updateDetalle(i, "cantidad", Number(e.target.value))}
              required
            />
          </div>
          <div className="col">
            <label htmlFor="">costo_unitario</label>
            <input
              type="number"
              className="form-control"
              min={0}
              step={0.01}
              value={d.costo_unitario}
              onChange={e => updateDetalle(i, "costo_unitario", Number(e.target.value))}
              required
            />
          </div>
          <div className="col">
            <label htmlFor="">subtotal</label>
            <input
              type="number"
              className="form-control"
              value={d.subtotal}
              readOnly
            />
          </div>
        </div>
      ))}

      {/* Totales */}
      <div className="row mt-3">
        
        <div className="col-md-3">
          <label className="form-label">IVA (%)</label>
          <select
            className="form-select"
            value={impuestoPorcentaje}
            onChange={e => {
              const porcentaje = Number(e.target.value);
              setImpuestoPorcentaje(porcentaje);
              const totals = recalcTotales(form.detalles ?? [], porcentaje);
              setForm(prev => ({ ...prev, ...totals }));
            }}
          >
            {IVA_COLOMBIA.map(p => (
              <option key={p} value={p}>{p}%</option>
            ))}
          </select>
        </div>
        <div className="col-md-3">
          <label className="form-label">Impuestos</label>
          <input type="number" className="form-control" value={form.impuestos} readOnly />
        </div>
        <div className="col-md-3">
          <label className="form-label">Total</label>
          <input type="number" className="form-control" value={form.total} readOnly />
        </div>
      </div>

      {/* Botones */}
      <div className="d-flex justify-content-end gap-2 mt-4">
        <button type="button" className="btn btn-outline-dark" onClick={onClose}>Cancelar</button>
        <button type="submit" className="btn btn-dark">Guardar</button>
      </div>
    </form>
  );
};
