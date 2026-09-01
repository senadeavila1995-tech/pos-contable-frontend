import { useEffect, useState } from "react";
import type { Product } from "../../shared/types/Product";
import type { Category } from "../../shared/types/Category";
import { getCategories } from "../categorias/category.service";

interface Props {
  product: Product | null;
  onSave: (data: Omit<Product, "id" | "creado_en" | "actualizado_en">) => Promise<void>;
  onClose: () => void;
}

type ProductFormData = Omit<
  Product,
  "id" | "creado_en" | "actualizado_en"
>;

export const ProductsForm = ({ product, onSave, onClose }: Props) => {
  const [form, setForm] = useState<ProductFormData>({
    nombre: product?.nombre ?? "",
    codigo: product?.codigo ?? "",
    descripcion: product?.descripcion ?? "",
    precio: product?.precio ?? 0,
    unidad_medida: product?.unidad_medida ?? "UND",
    tipo_impuesto: product?.tipo_impuesto ?? "IVA",
    porcentaje_iva: product?.porcentaje_iva ?? 19,
    stock_unidades: product?.stock_unidades ?? 0,
    peso_unitario: product?.peso_unitario ?? null,
    unidad_peso: product?.unidad_peso ?? null,
    talla: product?.talla ?? "",
    imagen_url: product?.imagen_url ?? "",
    estado: product?.estado ?? 1,
    categoria_id: product?.categoria_id ?? 0,
  });

  const [categories, setCategories] = useState<Category[]>([]);

  useEffect(() => {
    getCategories()
      .then((res) => setCategories(res.data))
      .catch((error) => console.error("Error cargando categorías", error));
  }, []);

  const handleChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement
    >
  ) => {
    const { name, value } = e.target;

    const numericFields = [
      "precio",
      "porcentaje_iva",
      "stock_unidades",
      "peso_unitario",
      "categoria_id",
      "estado",
    ];

    setForm((prev) => ({
      ...prev,
      [name]: numericFields.includes(name) ? Number(value) : value,
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!form.nombre.trim()) {
      alert("El nombre es obligatorio");
      return;
    }

    if (!form.categoria_id) {
      alert("Seleccione una categoría");
      return;
    }

    await onSave(form);
    onClose();
  };

  return (
    <form
      onSubmit={handleSubmit}
      className="container p-4 border rounded bg-white"
      style={{ maxWidth: 900 }}
    >
      <h5 className="mb-4 text-center fw-bold">
        {product ? "Editar producto" : "Nuevo producto"}
      </h5>

      <div className="row">
        <div className="col-md-8 mb-3">
          <label className="form-label">Nombre</label>
          <input
            className="form-control"
            name="nombre"
            value={form.nombre}
            onChange={handleChange}
            required
          />
        </div>

        <div className="col-md-4 mb-3">
          <label className="form-label">Código</label>
          <input
            className="form-control"
            name="codigo"
            value={form.codigo ?? ""}
            onChange={handleChange}
            placeholder="PROD-0001"
          />
        </div>
      </div>

      <div className="mb-3">
        <label className="form-label">Descripción</label>
        <textarea
          className="form-control"
          name="descripcion"
          value={form.descripcion ?? ""}
          onChange={handleChange}
          rows={2}
        />
      </div>

      <div className="row">
        <div className="col-md-4 mb-3">
          <label className="form-label">Precio</label>
          <input
            type="number"
            min={0}
            step="0.01"
            className="form-control"
            name="precio"
            value={form.precio}
            onChange={handleChange}
            required
          />
        </div>

        <div className="col-md-4 mb-3">
          <label className="form-label">Unidad de medida</label>
          <input
            className="form-control"
            name="unidad_medida"
            value={form.unidad_medida ?? ""}
            onChange={handleChange}
            placeholder="UND"
          />
        </div>

        <div className="col-md-4 mb-3">
          <label className="form-label">Categoría</label>
          <select
            className="form-select"
            name="categoria_id"
            value={form.categoria_id}
            onChange={handleChange}
            required
          >
            <option value={0}>Seleccione categoría</option>
            {categories
              .filter((cat) => cat.estado === 1)
              .map((cat) => (
                <option key={cat.id} value={cat.id}>
                  {cat.nombre}
                </option>
              ))}
          </select>
        </div>
      </div>

      <div className="row">
        <div className="col-md-4 mb-3">
          <label className="form-label">Tipo de impuesto</label>
          <select
            className="form-select"
            name="tipo_impuesto"
            value={form.tipo_impuesto ?? ""}
            onChange={handleChange}
          >
            <option value="">Sin impuesto</option>
            <option value="IVA">IVA</option>
            <option value="INC">INC</option>
          </select>
        </div>

        <div className="col-md-4 mb-3">
          <label className="form-label">IVA (%)</label>
          <select
            className="form-select"
            name="porcentaje_iva"
            value={form.porcentaje_iva}
            onChange={handleChange}
          >
            <option value={0}>0%</option>
            <option value={5}>5%</option>
            <option value={19}>19%</option>
          </select>
        </div>

        <div className="col-md-4 mb-3">
          <label className="form-label">Stock</label>
          <input
            type="number"
            min={0}
            className="form-control"
            name="stock_unidades"
            value={form.stock_unidades}
            onChange={handleChange}
          />
        </div>
      </div>

      <div className="row">
        <div className="col-md-4 mb-3">
          <label className="form-label">Peso unitario</label>
          <input
            type="number"
            min={0}
            step="0.01"
            className="form-control"
            name="peso_unitario"
            value={form.peso_unitario ?? ""}
            onChange={handleChange}
          />
        </div>

        <div className="col-md-4 mb-3">
          <label className="form-label">Unidad de peso</label>
          <select
            className="form-select"
            name="unidad_peso"
            value={form.unidad_peso ?? ""}
            onChange={handleChange}
          >
            <option value="">Sin unidad</option>
            <option value="g">Gramos</option>
            <option value="kg">Kilogramos</option>
            <option value="lb">Libras</option>
          </select>
        </div>

        <div className="col-md-4 mb-3">
          <label className="form-label">Talla</label>
          <input
            className="form-control"
            name="talla"
            value={form.talla ?? ""}
            onChange={handleChange}
          />
        </div>
      </div>

      <div className="mb-3">
        <label className="form-label">Imagen URL</label>
        <input
          className="form-control"
          name="imagen_url"
          value={form.imagen_url ?? ""}
          onChange={handleChange}
        />
      </div>

      <div className="d-flex justify-content-end gap-2 mt-4">
        <button
          type="button"
          className="btn btn-outline-dark"
          onClick={onClose}
        >
          Cancelar
        </button>
        <button type="submit" className="btn btn-dark">
          Guardar
        </button>
      </div>
    </form>
  );
};
