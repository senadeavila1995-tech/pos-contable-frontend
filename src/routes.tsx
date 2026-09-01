import { Routes, Route, Navigate } from "react-router-dom";
import AdminLayout from "./layout/AdminLayout";
import Dashboard from "./modules/dashboard/Dashboard"
import { CategoriesPage } from "./modules/categorias/CategoriesPage";
import {ComprasPage}  from "./modules/compras/ComprasPage";
import {ProveedoresPage}  from "./modules/proveedores/ProveedoresPage";
import CajaPage from "./modules/caja/CajaPage";

import { ProductsPage } from "./modules/productos/ProductsPage";
import VentasPage  from "./modules/ventas/VentasPage";
import FacturacionPage from "./modules/facturacion/FacturacionPage";
import {ClientesPage}  from "./modules/Clientes/ClientePage";


import { LoginPage } from "./modules/auth/LoginPage";
import { RegisterPage } from "./modules/auth/RegisterPage";
import type { JSX } from "react";

// Protección de rutas privadas
const PrivateRoute = ({ children }: { children: JSX.Element }) => {
  const token = localStorage.getItem("token");
  return token ? children : <Navigate to="/login" replace />;
};

export default function RoutesApp() {
  return (
    <Routes>
      {/* RUTAS PÚBLICAS */}
      <Route path="/login" element={<LoginPage />} />
      <Route path="/register" element={<RegisterPage />} />

      {/* RUTAS PRIVADAS */}
      <Route
        path="/*"
        element={
          <PrivateRoute>
            <AdminLayout />
          </PrivateRoute>
        }
      >
        <Route path="caja" element={<CajaPage />} />

        <Route path="dashboard" element={<Dashboard />} />
         <Route path="proveedores" element={<ProveedoresPage />} />
        <Route path="compras" element={<ComprasPage />} />

        <Route path="categorias" element={<CategoriesPage />} />
        <Route path="clientes" element={<ClientesPage />} />
        <Route path="productos" element={<ProductsPage />} />
        <Route path="ventas" element={<VentasPage />} />
        <Route path="facturacion" element={<FacturacionPage />} />

        {/* fallback interno */}
        <Route path="*" element={<Navigate to="/categorias" replace />} />
      </Route>
    </Routes>
  );
}
