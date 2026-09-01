import { NavLink, useNavigate } from "react-router-dom";
import { useState } from "react";
import {
  FaBars,
  FaUsers,
  FaShoppingCart,
  FaCashRegister,
} from "react-icons/fa";

export default function Sidebar() {
  const navigate = useNavigate();
  const [collapsed, setCollapsed] = useState(false);

  const handleLogout = () => {
    sessionStorage.clear();
    localStorage.clear();
    navigate("/login");
  };

  return (
    <aside className={`sidebar ${collapsed ? "collapsed" : ""}`}>
      <div className="sidebar-header d-flex align-items-center justify-content-between p-2">
        {!collapsed && <h3 className="sidebar-title">Panel Admin</h3>}
        <button
          className="btn btn-sm btn-outline-light"
          onClick={() => setCollapsed(!collapsed)}
        >
          <FaBars />
        </button>
      </div>

      <nav className="sidebar-nav">

        {/* ===== CAJA ===== */}
        <NavLink
          to="/caja"
          className={({ isActive }) =>
            `sidebar-link ${isActive ? "active" : ""}`
          }
          title={collapsed ? "Caja" : ""}
        >
          <FaCashRegister className="me-1" /> {!collapsed && "Caja"}
        </NavLink>
        <NavLink
          to="/dashboard"
          className={({ isActive }) =>
            `sidebar-link ${isActive ? "active" : ""}`
          }
          title={collapsed ? "Dashboard" : ""}
        >
          🏠 {!collapsed && "Dashboard"}
        </NavLink>

        <NavLink
          to="/categorias"
          className={({ isActive }) =>
            `sidebar-link ${isActive ? "active" : ""}`
          }
          title={collapsed ? "Categorías" : ""}
        >
          📂 {!collapsed && "Categorías"}
        </NavLink>

        <NavLink
          to="/clientes"
          className={({ isActive }) =>
            `sidebar-link ${isActive ? "active" : ""}`
          }
          title={collapsed ? "Clientes" : ""}
        >
          👥 {!collapsed && "Clientes"}
        </NavLink>

        <NavLink
          to="/productos"
          className={({ isActive }) =>
            `sidebar-link ${isActive ? "active" : ""}`
          }
          title={collapsed ? "Productos" : ""}
        >
          📦 {!collapsed && "Productos"}
        </NavLink>




        {/* ===== OTROS MÓDULOS ===== */}
        <NavLink
          to="/proveedores"
          className={({ isActive }) =>
            `sidebar-link ${isActive ? "active" : ""}`
          }
          title={collapsed ? "Proveedores" : ""}
        >
          <FaUsers className="me-1" /> {!collapsed && "Proveedores"}
        </NavLink>

        <NavLink
          to="/compras"
          className={({ isActive }) =>
            `sidebar-link ${isActive ? "active" : ""}`
          }
          title={collapsed ? "Compras" : ""}
        >
          <FaShoppingCart className="me-1" /> {!collapsed && "Compras"}
        </NavLink>

        <NavLink
          to="/facturacion"
          className={({ isActive }) =>
            `sidebar-link ${isActive ? "active" : ""}`
          }
          title={collapsed ? "Facturación" : ""}
        >
          🧾 {!collapsed && "Facturación"}
        </NavLink>

        <NavLink
          to="/ventas"
          className={({ isActive }) =>
            `sidebar-link ${isActive ? "active" : ""}`
          }
          title={collapsed ? "Ventas" : ""}
        >
          💰 {!collapsed && "Ventas"}
          
        </NavLink>

        <button className="sidebar-logout mt-auto" onClick={handleLogout}>
            🔒 {!collapsed && "Cerrar sesión"}
          </button>
      </nav>


    </aside>
  );
}
