import React, { useState } from "react";
import { NavLink } from "react-router-dom";
import {
  LayoutDashboard,
  Users,
  Settings,
  LogOut,
  BellRing,
  UserCog,
  User,
  ChevronDown,
  ChevronRight,
  RectangleCircle,
  Caravan,
  PanelsRightBottomIcon,
  Settings2,
  Hammer,
  SeparatorVertical,
  Server,
  Key,
  Tag,
} from "lucide-react";

const menuItems = [
  {
    name: "Dashboard",
    icon: LayoutDashboard,
    path: "/",
  },
  {
    name: "Users",
    icon: Users,
    children: [
      { name: "All Users", path: "/users" },
      { name: "Service Providers", path: "/service-providers" },
    ],
  },
  {
    name: "Category",
    icon: SeparatorVertical,
    children: [{ name: "Category", path: "/category" }],
  },
  {
    name: "Service",
    icon: Hammer,
    children: [{ name: "Service List", path: "/service" }],
  },
  {
    name: "Bookings",
    icon: Users,
    children: [{ name: "All Bookings", path: "/bookings" }],
  },
  {
    name: "Razorpay Config",
    icon: Key,
    path: "/razorpay-config",
    children: [{ name: "Razorpay Config", path: "/razorpay-config" }],
  },
  {
    name: "Banner",
    icon: PanelsRightBottomIcon,
    path: "/banner",
    children: [{ name: "Banner", path: "/banner" }],
  },
  {
    name: "Settings",
    icon: Settings2,
    path: "/settings",
    children: [{ name: "Settings", path: "/settings" }],
  },
  {
    name: "Section Management",
    icon: Settings2,
    path: "/section-management",
    children: [{ name: "Section Management", path: "/section-management" }],
  },

  {
    name: "Service Request",
    icon: Server,
    path: "/service-request",
    children: [{ name: "Service Request", path: "/service-request" }],
  },
  {
    name: "Coupons",
    icon: Tag,
    path: "/coupons",
    children: [{ name: "Coupons", path: "/coupons" }],
  },
  // { name: "Tickets", icon: Users, path: "/tickets" },
];

export default function Sidebar() {
  const [openMenu, setOpenMenu] = useState(null);

  const toggleMenu = (name) => {
    setOpenMenu(openMenu === name ? null : name);
  };

  return (
    <div className="flex h-screen w-64 flex-col bg-linear-to-b from-slate-900 via-slate-800 to-slate-900 text-white shadow-2xl">
      {/* Header */}
      <div className="border-b border-slate-700/50 px-6 py-6">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-linear-to-b from-blue-500 to-blue-600 shadow-lg">
            <LayoutDashboard size={22} className="text-white" />
          </div>
          <div>
            <h1 className="text-xl font-bold tracking-tight">HourlyHero</h1>
            <p className="text-xs text-slate-400">Admin Dashboard</p>
          </div>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 px-4 py-6 space-y-1">
        {menuItems.map((item, idx) => {
          const Icon = item.icon;

          if (!item.children) {
            return (
              <NavLink
                key={idx}
                to={item.path}
                className={({ isActive }) =>
                  `flex items-center gap-3 rounded-xl px-4 py-3 font-medium transition-all duration-200 ${
                    isActive
                      ? "bg-blue-600 text-white shadow-lg shadow-blue-500/30"
                      : "text-slate-300 hover:bg-slate-800/50 hover:text-white"
                  }`
                }
              >
                <Icon size={20} />
                <span className="text-sm">{item.name}</span>
              </NavLink>
            );
          }

          return (
            <div key={idx}>
              {/* Parent Menu */}
              <button
                onClick={() => toggleMenu(item.name)}
                className={`w-full flex items-center justify-between px-4 py-3 rounded-xl text-left transition-all duration-200 ${
                  openMenu === item.name
                    ? "bg-slate-800 text-white"
                    : "text-slate-300 hover:bg-slate-800/50"
                }`}
              >
                <div className="flex items-center gap-3">
                  <Icon size={20} />
                  <span className="text-sm">{item.name}</span>
                </div>

                {openMenu === item.name ? (
                  <ChevronDown size={18} />
                ) : (
                  <ChevronRight size={18} />
                )}
              </button>

              {/* Child Items */}
              <div
                className={`overflow-hidden transition-all duration-300 ${
                  openMenu === item.name ? "max-h-40" : "max-h-0"
                }`}
              >
                <div className="ml-8 mt-1 space-y-1 border-l border-slate-700/40 pl-4">
                  {item.children.map((child, cIdx) => (
                    <NavLink
                      key={cIdx}
                      to={child.path}
                      className={({ isActive }) =>
                        `block rounded-lg px-3 py-2 text-sm transition-colors ${
                          isActive
                            ? "text-blue-400"
                            : "text-slate-400 hover:text-white"
                        }`
                      }
                    >
                      {child.name}
                    </NavLink>
                  ))}
                </div>
              </div>
            </div>
          );
        })}
      </nav>

      {/* Footer */}
      <div className="border-t border-slate-700/50 px-4 py-4">
        <button className="group flex w-full items-center gap-3 rounded-xl px-4 py-3 text-sm font-medium text-slate-300 transition-all duration-200 hover:bg-red-500/10 hover:text-red-400">
          <LogOut
            size={20}
            className="text-slate-400 group-hover:text-red-400 transition-colors"
          />
          <span>Logout</span>
        </button>
      </div>
    </div>
  );
}
