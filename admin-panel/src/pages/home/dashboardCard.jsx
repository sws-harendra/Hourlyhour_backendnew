import React from "react";
import {
  Calendar,
  Users,
  Briefcase,
  Clock,
  CheckCircle,
  DollarSign,
  TrendingUp,
} from "lucide-react";

const DashboardCards = ({ cards }) => {
  const items = [
    {
      label: "Total Bookings",
      value: cards?.totalBookings || 0,
      icon: Calendar,
      gradient: "from-blue-500 to-blue-600",
    },
    {
      label: "Total Users",
      value: cards?.totalUsers || 0,
      icon: Users,
      gradient: "from-purple-500 to-purple-600",
    },
    {
      label: "Providers",
      value: cards?.totalProviders || 0,
      icon: Briefcase,
      gradient: "from-green-500 to-green-600",
    },
    {
      label: "Pending Bookings",
      value: cards?.pendingBookings || 0,
      icon: Clock,
      gradient: "from-orange-500 to-orange-600",
    },
    {
      label: "Completed Bookings",
      value: cards?.completedBookings || 0,
      icon: CheckCircle,
      gradient: "from-teal-500 to-teal-600",
    },
    {
      label: "Gross Revenue",
      value: `₹${cards?.grossRevenue || 0}`,
      icon: DollarSign,
      gradient: "from-indigo-500 to-indigo-600",
    },
    {
      label: "Admin Commission",
      value: `₹${cards?.adminCommission || 0}`,
      icon: TrendingUp,
      gradient: "from-pink-500 to-pink-600",
    },
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
      {items.map((item, i) => {
        const Icon = item.icon;

        return (
          <div
            key={i}
            className={`relative rounded-2xl shadow-xl overflow-hidden bg-gradient-to-br ${item.gradient} text-white`}
          >
            {/* 🔷 DOT GRID PATTERN */}
            <div className="absolute inset-0 opacity-20 bg-[radial-gradient(rgba(255,255,255,0.2)_1px,transparent_1px)] bg-[size:14px_14px]"></div>

            {/* 🌊 LIGHT SOFT GLOW */}
            <div className="absolute inset-0 opacity-20 bg-[radial-gradient(circle_at_20%_20%,white,transparent_40%)]"></div>

            {/* 🔵 BIG DECORATIVE SHAPES */}
            <div className="absolute -top-16 -right-16 w-52 h-52 bg-white/10 rounded-full"></div>
            <div className="absolute -bottom-12 -left-12 w-40 h-40 bg-white/10 rounded-full blur-2xl"></div>

            {/* ✨ GLOSSY SHINE EFFECT (IMPORTANT) */}
            <div className="absolute inset-0 bg-gradient-to-tr from-white/20 via-white/5 to-transparent opacity-60"></div>

            {/* 🔥 CONTENT */}
            <div className="relative p-6 z-10">
              <div className="flex items-center justify-between mb-6">

                {/* 🎯 ICON IN GLASS CIRCLE */}
                <div className="w-12 h-12 rounded-full bg-white/20 backdrop-blur-lg flex items-center justify-center shadow-inner border border-white/30">
                  <Icon className="w-6 h-6 text-white" />
                </div>

                {/* small badge */}
                <span className="text-xs bg-white/20 backdrop-blur px-2 py-1 rounded-full border border-white/20">
                  Live
                </span>
              </div>

              {/* 📊 TEXT */}
              <div>
                <p className="text-sm text-white/80 mb-1">{item.label}</p>
                <p className="text-3xl font-bold tracking-tight">{item.value}</p>
              </div>
            </div>

            {/* ✨ BOTTOM LIGHT BAR */}
            <div className="absolute bottom-0 left-0 w-full h-[2px] bg-white/40"></div>
          </div>
        );
      })}
    </div>
  );
};

export default DashboardCards;