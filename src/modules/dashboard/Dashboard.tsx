import { useEffect, useMemo, useState } from "react";
import { listarVentas } from "../ventas/ventas.service";
import { getCompras } from "../compras/compras.service";
import { getCajaActual, abrirCaja } from "../caja/caja.service"; // <-- importamos

import {
  BarChart,
  Bar,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";

import type { Sale } from "../../shared/types/Sale";
import type { Compra } from "../../shared/types/Compra";

interface FlujoDiario {
  fecha: string;
  ingresos: number;
  egresos: number;
  balance: number;
}

const Dashboard: React.FC = () => {
  const [flujo, setFlujo] = useState<FlujoDiario[]>([]);
  const [loading, setLoading] = useState(true);

  const [cajaAbierta, setCajaAbierta] = useState(false);
  const [abriendo, setAbriendo] = useState(false);

  useEffect(() => {
    const cargarDashboard = async () => {
      try {
        // ⚡ Revisar si hay caja abierta
        const cajaResp = await getCajaActual();
        setCajaAbierta(Boolean(cajaResp.data?.id));

        const [ventasResp, comprasResp] = await Promise.all([
          listarVentas(),
          getCompras(),
        ]);

        const ventas: Sale[] = ventasResp.data ?? [];
        const compras: Compra[] = comprasResp.data ?? [];

        const flujoMap: Record<string, FlujoDiario> = {};

        ventas.forEach((v) => {
          if (!v.creado_en) return;
          const fecha = v.creado_en.split("T")[0];

          flujoMap[fecha] ??= { fecha, ingresos: 0, egresos: 0, balance: 0 };
          flujoMap[fecha].ingresos += Number(v.total ?? 0);
        });

        compras.forEach((c) => {
          if (!c.fecha_compra) return;
          const fecha = c.fecha_compra.split("T")[0];

          flujoMap[fecha] ??= { fecha, ingresos: 0, egresos: 0, balance: 0 };
          flujoMap[fecha].egresos += Number(c.total ?? 0);
        });

        const resultado = Object.values(flujoMap)
          .map((f) => ({ ...f, balance: f.ingresos - f.egresos }))
          .sort(
            (a, b) =>
              new Date(a.fecha).getTime() - new Date(b.fecha).getTime()
          );

        setFlujo(resultado);
      } catch (error) {
        console.error("Error cargando dashboard", error);
      } finally {
        setLoading(false);
      }
    };

    cargarDashboard();
  }, []);

  // ====================== KPIs ======================
  const resumen = useMemo(() => {
    return flujo.reduce(
      (acc, f) => {
        acc.ingresos += f.ingresos;
        acc.egresos += f.egresos;
        acc.balance += f.balance;
        return acc;
      },
      { ingresos: 0, egresos: 0, balance: 0 }
    );
  }, [flujo]);

  // ====================== ABRIR CAJA ======================
  const handleAbrirCaja = async () => {
    try {
      setAbriendo(true);
      await abrirCaja({ monto_inicial: 0 }); // ⚡ no asignamos a "resp"
      setCajaAbierta(true);
      alert("Caja abierta correctamente ✅");
    } catch (error: any) {
      console.error(error);
      alert(error.response?.data?.message || error.message);
    } finally {
      setAbriendo(false);
    }
  };


  if (loading) {
    return (
      <div className="container mt-4">
        <p>Cargando dashboard...</p>
      </div>
    );
  }

  return (
    <div className="container mt-4">
      <h2 className="mb-4">Dashboard Contable</h2>

      {/* ================= BOTÓN ABRIR CAJA ================= */}
      {!cajaAbierta && (
        <div className="mb-4">
          <button
            className="btn btn-primary"
            onClick={handleAbrirCaja}
            disabled={abriendo}
          >
            {abriendo ? "Abriendo..." : "Abrir Caja"}
          </button>
        </div>
      )}

      {/* ================= KPIs ================= */}
      <div className="row mb-4">
        <div className="col-md-4">
          <div className="card text-bg-success">
            <div className="card-body">
              <h6>Total Ventas</h6>
              <h4>${resumen.ingresos.toFixed(2)}</h4>
            </div>
          </div>
        </div>

        <div className="col-md-4">
          <div className="card text-bg-danger">
            <div className="card-body">
              <h6>Total Compras</h6>
              <h4>${resumen.egresos.toFixed(2)}</h4>
            </div>
          </div>
        </div>

        <div className="col-md-4">
          <div className="card text-bg-dark">
            <div className="card-body">
              <h6>Balance Neto</h6>
              <h4>${resumen.balance.toFixed(2)}</h4>
            </div>
          </div>
        </div>
      </div>

      {/* ================= BAR CHART ================= */}
      <div className="card mb-4">
        <div className="card-body">
          <h5>Ingresos vs Egresos</h5>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={flujo}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="fecha" />
              <YAxis />
              <Tooltip />
              <Bar dataKey="ingresos" />
              <Bar dataKey="egresos" />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* ================= LINE CHART ================= */}
      <div className="card mb-4">
        <div className="card-body">
          <h5>Evolución del Balance</h5>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={flujo}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="fecha" />
              <YAxis />
              <Tooltip />
              <Line type="monotone" dataKey="balance" />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* ================= TABLE ================= */}
      <table className="table table-bordered table-striped">
        <thead>
          <tr>
            <th>Fecha</th>
            <th>Ingresos</th>
            <th>Egresos</th>
            <th>Balance</th>
          </tr>
        </thead>
        <tbody>
          {flujo.map((f) => (
            <tr key={f.fecha}>
              <td>{f.fecha}</td>
              <td>${f.ingresos.toFixed(2)}</td>
              <td>${f.egresos.toFixed(2)}</td>
              <td
                style={{
                  color: f.balance >= 0 ? "green" : "red",
                  fontWeight: "bold",
                }}
              >
                ${f.balance.toFixed(2)}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default Dashboard;
