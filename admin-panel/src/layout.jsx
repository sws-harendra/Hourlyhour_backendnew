import React, { useState } from "react";
import { Outlet } from "react-router-dom";
import Sidebar from "./components/sidebar";

export default function Layout() {
  const [collapsed, setCollapsed] = useState(false);

  return (
    <div className="flex h-screen bg-transparent  overflow-hidden">
      <Sidebar
        collapsed={collapsed}
        setCollapsed={setCollapsed}
      />

      <main
        className={`
          flex-1 h-screen overflow-y-auto transition-all duration-300
          pt-16 md:pt-0
          ${collapsed ? "md:ml-[0px]" : "md:ml-0"}
        `}
      >
        <div className=" bg-transparent">
          <Outlet />
        </div>
      </main>
    </div>
  );
}