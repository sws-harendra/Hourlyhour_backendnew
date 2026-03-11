import React from "react";
import { Outlet } from "react-router-dom";
import Sidebar from "./components/sidebar";

export default function Layout() {
  return (
    <div className="flex h-screen bg-linear-to-b from-slate-900 via-slate-800 to-slate-900">
      
      {/* Sidebar */}
      <div className="w-64">
        <Sidebar />
      </div>

      {/* Page Content */}
      <main className="flex-1 p-6 overflow-y-auto">
        <Outlet />
      </main>

    </div>
  );
}