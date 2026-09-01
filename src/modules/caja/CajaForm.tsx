import { useState } from "react";

interface Props {
  tipo: "ABRIR" | "CERRAR";
  onSubmit: (data: { monto_inicial?: number; monto_final_real?: number }) => Promise<void>;
}

const CajaForm = ({ tipo, onSubmit }: Props) => {
  const [monto, setMonto] = useState(0);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (monto < 0) return;

    if (tipo === "ABRIR") {
      await onSubmit({ monto_inicial: monto });
    } else {
      await onSubmit({ monto_final_real: monto });
    }

    setMonto(0);
  };

  return (
    <form onSubmit={handleSubmit}>
      <div className="mb-3">
        <label className="form-label">
          {tipo === "ABRIR" ? "Monto inicial" : "Monto final real"}
        </label>

        <input
          type="number"
          min={0}
          step="0.01"
          className="form-control"
          value={monto}
          onChange={(e) => setMonto(Number(e.target.value))}
          required
        />
      </div>

      <button
        type="submit"
        className={`btn ${tipo === "ABRIR" ? "btn-success" : "btn-danger"}`}
      >
        {tipo === "ABRIR" ? "Abrir caja" : "Cerrar caja"}
      </button>
    </form>
  );
};

export default CajaForm;
