import { Routes, Route } from "react-router-dom";
import { LoginPage } from "../modules/auth/LoginPage";
import { RegisterPage } from "../modules/auth/RegisterPage";

import  Dashboard  from "../modules/dashboard/Dashboard";
import { PrivateRoutes } from "./PrivateRoute";

export const RoutesApp = () => {
  return (
    <Routes>
      {/* RUTAS PÚBLICAS */}
      <Route path="/login" element={<LoginPage />} />
      <Route path="/register" element={<RegisterPage />} />
      {/* RUTAS PRIVADAS */}
      <Route element={<PrivateRoutes />}>
        <Route path="/" element={<Dashboard />} />
      </Route>
    </Routes>
  );
};
