import { useState } from "react";
import type { Cliente, ClienteDto } from "../../shared/types/Cliente";

interface Props {
  client?: Cliente | null;
  onSave: (data: ClienteDto) => Promise<void>;
  onClose: () => void;
}

export const ClientsForm = ({
  client,
  onSave,
  onClose,
}: Props) => {
  const [form, setForm] = useState<ClienteDto>({
    nombre: client?.nombre ?? "",
    tipo_documento: client?.tipo_documento ?? "CC",
    numero_documento:
      client?.numero_documento ??
      client?.cc ??
      "",
    digito_verificacion:
      client?.digito_verificacion ?? "",
    tipo_persona:
      client?.tipo_persona ?? "NATURAL",
    cc:
      client?.cc ??
      client?.numero_documento ??
      "",
    documento:
      client?.documento ??
      client?.numero_documento ??
      "",
    telefono: client?.telefono ?? "",
    email: client?.email ?? "",
    direccion: client?.direccion ?? "",
    municipio: client?.municipio ?? "",
    departamento: client?.departamento ?? "",
    codigo_municipio:
      client?.codigo_municipio ?? "",
    pais: client?.pais ?? "Colombia",
    codigo_pais:
      client?.codigo_pais ?? "CO",
    regimen_fiscal:
      client?.regimen_fiscal ?? "",
    responsabilidad_fiscal:
      client?.responsabilidad_fiscal ?? "",
  });

  const handleChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLSelectElement
    >
  ) => {
    const { name, value } = e.target;

    setForm((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = async (
    e: React.FormEvent
  ) => {
    e.preventDefault();

    if (!form.nombre.trim()) {
      alert("El nombre es obligatorio");
      return;
    }

    if (
      !form.numero_documento?.trim() &&
      !form.cc?.trim()
    ) {
      alert("Ingrese el documento");
      return;
    }

    await onSave(form);
  };

  return (
    <form onSubmit={handleSubmit}>

      <div className="row">

        <div className="col-md-8 mb-3">

          <label className="form-label fw-semibold">
            Nombre / Razón social
          </label>

          <input
            className="form-control"
            name="nombre"
            value={form.nombre}
            onChange={handleChange}
            required
          />

        </div>

        <div className="col-md-4 mb-3">

          <label className="form-label fw-semibold">
            Tipo de persona
          </label>

          <select
            className="form-select"
            name="tipo_persona"
            value={form.tipo_persona ?? "NATURAL"}
            onChange={handleChange}
          >

            <option value="NATURAL">
              Natural
            </option>

            <option value="JURIDICA">
              Jurídica
            </option>

          </select>

        </div>

      </div>

      <div className="row">

        <div className="col-md-4 mb-3">

          <label className="form-label fw-semibold">
            Tipo documento
          </label>

          <select
            className="form-select"
            name="tipo_documento"
            value={form.tipo_documento ?? "CC"}
            onChange={handleChange}
          >

            <option value="CC">CC</option>
            <option value="NIT">NIT</option>
            <option value="CE">CE</option>
            <option value="TI">TI</option>
            <option value="PAS">Pasaporte</option>

          </select>

        </div>

        <div className="col-md-5 mb-3">

          <label className="form-label fw-semibold">
            Número documento
          </label>

          <input
            className="form-control"
            name="numero_documento"
            value={form.numero_documento ?? ""}
            onChange={handleChange}
            required
          />

        </div>

        <div className="col-md-3 mb-3">

          <label className="form-label fw-semibold">
            DV
          </label>

          <input
            className="form-control"
            name="digito_verificacion"
            value={form.digito_verificacion ?? ""}
            onChange={handleChange}
          />

        </div>

      </div>

      <div className="row">

        <div className="col-md-4 mb-3">

          <label className="form-label fw-semibold">
            Teléfono
          </label>

          <input
            className="form-control"
            name="telefono"
            value={form.telefono ?? ""}
            onChange={handleChange}
          />

        </div>

        <div className="col-md-8 mb-3">

          <label className="form-label fw-semibold">
            Email
          </label>

          <input
            type="email"
            className="form-control"
            name="email"
            value={form.email ?? ""}
            onChange={handleChange}
          />

        </div>

      </div>

      <div className="mb-3">

        <label className="form-label fw-semibold">
          Dirección
        </label>

        <input
          className="form-control"
          name="direccion"
          value={form.direccion ?? ""}
          onChange={handleChange}
        />

      </div>

      <div className="row">

        <div className="col-md-4 mb-3">

          <label className="form-label fw-semibold">
            Municipio
          </label>

          <input
            className="form-control"
            name="municipio"
            value={form.municipio ?? ""}
            onChange={handleChange}
          />

        </div>

        <div className="col-md-4 mb-3">

          <label className="form-label fw-semibold">
            Departamento
          </label>

          <input
            className="form-control"
            name="departamento"
            value={form.departamento ?? ""}
            onChange={handleChange}
          />

        </div>

        <div className="col-md-4 mb-3">

          <label className="form-label fw-semibold">
            Código municipio
          </label>

          <input
            className="form-control"
            name="codigo_municipio"
            value={form.codigo_municipio ?? ""}
            onChange={handleChange}
          />

        </div>

      </div>

      <div className="row">

        <div className="col-md-4 mb-3">

          <label className="form-label fw-semibold">
            País
          </label>

          <input
            className="form-control"
            name="pais"
            value={form.pais ?? ""}
            onChange={handleChange}
          />

        </div>

        <div className="col-md-4 mb-3">

          <label className="form-label fw-semibold">
            Código país
          </label>

          <input
            className="form-control"
            name="codigo_pais"
            value={form.codigo_pais ?? ""}
            onChange={handleChange}
          />

        </div>

        <div className="col-md-4 mb-3">

          <label className="form-label fw-semibold">
            Régimen fiscal
          </label>

          <input
            className="form-control"
            name="regimen_fiscal"
            value={form.regimen_fiscal ?? ""}
            onChange={handleChange}
          />

        </div>

      </div>

      <div className="mb-3">

        <label className="form-label fw-semibold">
          Responsabilidad fiscal
        </label>

        <input
          className="form-control"
          name="responsabilidad_fiscal"
          value={form.responsabilidad_fiscal ?? ""}
          onChange={handleChange}
        />

      </div>

      <div className="d-flex justify-content-end gap-2 pt-3 border-top mt-3">

        <button
          type="button"
          className="btn btn-outline-secondary"
          onClick={onClose}
        >
          Cancelar
        </button>

        <button
          type="submit"
          className="btn btn-dark"
        >
          {client
            ? "Actualizar cliente"
            : "Guardar cliente"}
        </button>

      </div>

    </form>
  );
};
