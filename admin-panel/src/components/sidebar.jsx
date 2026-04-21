import React, { useState } from "react";
import { NavLink, useNavigate } from "react-router-dom";
import {
  LayoutDashboard,
  Users,
  Settings2,
  LogOut,
  BellRing,
  ChevronDown,
  ChevronRight,
  SeparatorVertical,
  Hammer,
  PanelsRightBottomIcon,
  Key,
  Star,
  Server,
  Menu,
  X,
  User,
  Briefcase,
  MessageSquare,
  Grid3X3,
  List,
  MapPin,
  ShieldCheck,
  CalendarCheck,
} from "lucide-react";

const menuItems = [
  { name: "Dashboard", icon: LayoutDashboard, path: "/" },
  {
    name: "Users",
    icon: Users,
    children: [
      { name: "All Users", path: "/users" },
      { name: "Service Providers", path: "/service-providers" },
      { name: "Reviews", path: "/reviews" },
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
    children: [
      { name: "Service List", path: "/service" },
      { name: "Service Area", path: "/service-area" },
      { name: "Warranty Claims", path: "/warranty/claims" },
    ],
  },
  {
    name: "Bookings",
    icon: Users,
    children: [{ name: "All Bookings", path: "/bookings" }],
  },
  { name: "Testimonial", icon: Star, path: "/testimonial" },
  { name: "Razorpay Config", icon: Key, path: "/razorpay-config" },
  { name: "Banner", icon: PanelsRightBottomIcon, path: "/banner" },
  { name: "Settings", icon: Settings2, path: "/settings" },
  { name: "Section Management", icon: Settings2, path: "/section-management" },
  { name: "Service Request", icon: Server, path: "/service-request" },
  { name: "Notifications", icon: BellRing, path: "/notifications" },
];

export default function Sidebar() {
  const [openMenu, setOpenMenu] = useState(null);
  const [collapsed, setCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

  const navigate = useNavigate();

  const toggleMenu = (name) => {
    setOpenMenu(openMenu === name ? null : name);
  };

  const closeMobile = () => setMobileOpen(false);

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    sessionStorage.clear();
    navigate("/login");
  };

  const childIcons = {
    "All Users": User,
    "Service Providers": Briefcase,
    Reviews: MessageSquare,
    Category: Grid3X3,
    "Service List": List,
    "Service Area": MapPin,
    "Warranty Claims": ShieldCheck,
    "All Bookings": CalendarCheck,
  };

  return (
    <>
      <div className="md:hidden fixed top-0 left-0 right-0 z-50 h-16 bg-slate-900 border-b border-white/10 px-4 flex items-center justify-between text-white shadow-xl">
        <h1 className="font-semibold text-lg">RepairSathi</h1>

        <button
          onClick={() => setMobileOpen(true)}
          className="h-10 w-10 flex items-center justify-center rounded-lg hover:bg-slate-800 transition"
        >
          <Menu size={24} />
        </button>
      </div>

      {mobileOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-40 md:hidden"
          onClick={closeMobile}
        />
      )}

      <aside
        className={`
          fixed md:sticky top-0 left-0 z-50
          h-screen flex flex-col overflow-hidden
          bg-gradient-to-b from-slate-900 via-slate-800 to-slate-900
          text-white border-r border-white/15 shadow-2xl
          transition-all duration-300
          ${mobileOpen ? "translate-x-0 w-64" : "-translate-x-full w-64"}
          md:translate-x-0
          ${collapsed ? "md:w-[88px]" : "md:w-64"}
          flex-shrink-0
        `}
      >
        <div className="relative min-h-[74px] border-b border-white/10 flex items-center justify-center px-4">
          {!collapsed ? (
            <>
              <div className="absolute left-4 h-10 w-10 flex items-center justify-center rounded-lg bg-white">
                <img src="/logo.png" alt="Logo" className="h-full w-full object-contain" />
              </div>

              <div className="text-center">
                <h1 className="font-bold text-lg leading-none">
                  RepairSathi
                </h1>
                <p className="text-xs text-slate-400 mt-1">
                  Admin Dashboard
                </p>
              </div>

              <button
                onClick={() => setCollapsed(true)}
                className="hidden md:flex absolute right-4 h-10 w-10 items-center justify-center rounded-lg hover:bg-slate-700 transition"
              >
                <X size={18} />
              </button>
            </>
          ) : (
            <button
              onClick={() => setCollapsed(false)}
              className="hidden md:flex h-10 w-10 items-center justify-center rounded-lg hover:bg-slate-700 transition"
            >
              <Menu size={20} />
            </button>
          )}

          <button
            onClick={closeMobile}
            className="md:hidden absolute right-4 h-10 w-10 flex items-center justify-center rounded-lg hover:bg-slate-700 transition"
          >
            <X size={18} />
          </button>
        </div>

        <nav className="flex-1 overflow-y-auto no-scrollbar px-3 py-4 space-y-2">
          {menuItems.map((item, index) => {
            const Icon = item.icon;

            if (!item.children) {
              return (
                <NavLink
                  key={index}
                  to={item.path}
                  onClick={closeMobile}
                  className={({ isActive }) =>
                    `flex items-center rounded-xl px-4 py-3 transition-all duration-200 ${collapsed ? "justify-center" : "gap-3"
                    } ${isActive
                      ? "bg-blue-600 text-white shadow-lg"
                      : "text-slate-300 hover:bg-slate-800 hover:text-white"
                    }`
                  }
                >
                  <Icon size={20} />
                  {!collapsed && (
                    <span className="text-sm font-medium">{item.name}</span>
                  )}
                </NavLink>
              );
            }

            return (
              <div key={index}>
                <button
                  onClick={() => toggleMenu(item.name)}
                  className="w-full flex items-center justify-between rounded-xl px-4 py-3 text-slate-300 hover:bg-slate-800 hover:text-white transition-all duration-200"
                >
                  <div
                    className={`flex items-center ${collapsed ? "justify-center w-full" : "gap-3"
                      }`}
                  >
                    <Icon size={20} />
                    {!collapsed && (
                      <span className="text-sm font-medium">
                        {item.name}
                      </span>
                    )}
                  </div>

                  <div className={`${collapsed ? "" : "ml-2"}`}>
                    {openMenu === item.name ? (
                      <ChevronDown size={18} />
                    ) : (
                      <ChevronRight size={18} />
                    )}
                  </div>
                </button>

                <div
                  className={`overflow-hidden transition-all duration-300 ${openMenu === item.name ? "max-h-72 mt-1" : "max-h-0"
                    }`}
                >
                  <div
                    className={`space-y-1 ${collapsed
                      ? "mt-2"
                      : "ml-8 pl-4 border-l border-white/10"
                      }`}
                  >
                    {item.children.map((child, i) => {
                      const ChildIcon =
                        childIcons[child.name] || ChevronRight;

                      return (
                        <NavLink
                          key={i}
                          to={child.path}
                          onClick={closeMobile}
                          className={({ isActive }) =>
                            `flex items-center rounded-lg px-3 py-2 text-sm transition ${collapsed
                              ? "justify-center"
                              : "gap-2"
                            } ${isActive
                              ? "text-blue-400"
                              : "text-slate-400 hover:text-white hover:bg-slate-800"
                            }`
                          }
                        >
                          <ChildIcon size={14} />
                          {!collapsed && child.name}
                        </NavLink>
                      );
                    })}
                  </div>
                </div>
              </div>
            );
          })}
        </nav>

        <div className="border-t border-white/10 p-3">
          <button
            onClick={handleLogout}
            className={`w-full flex items-center rounded-xl px-4 py-3 transition-all duration-200 hover:bg-red-500/10 hover:text-red-400 ${collapsed ? "justify-center" : "gap-3"
              }`}
          >
            <LogOut size={20} />
            {!collapsed && (
              <span className="text-sm font-medium">Logout</span>
            )}
          </button>
        </div>
      </aside>
    </>
  );
}