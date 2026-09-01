import { Outlet } from "react-router-dom";
import Sidebar from "./Sidebar";
import "./admin-gray.css";

export default function AdminLayout() {
  return (
    <div className="admin-layout">
      <Sidebar />
      <main className="admin-content">
        <Outlet />
      </main>
    </div>
  );
}
